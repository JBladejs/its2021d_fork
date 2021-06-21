// moduły wbudowane
const http = require('http')
const fs = require('fs')
const url = require('url')

// moduły dodatkowe
const nodestatic = require('node-static')
const cookies = require('cookies')
const uuid = require('uuid')

// moduły własne
const common = require('./common')
const db = require('./db')
const dbrest = require('./dbrest')
const auth = require('./auth')

// inicjalizacja globalnych obiektów
common.config = JSON.parse(fs.readFileSync('config.json'))
console.log('Konfiguracja serwera:', common.config)
const httpServer = http.createServer()
const fileServer = new nodestatic.Server(common.config.frontend_dir, { cache: common.config.cache })

let persons = [
    { firstName: 'Jan', lastName: 'Kowalski' },
    { firstName: 'Wojciech', lastName: 'Nowak' },
    { firstName: 'Ewa', lastName: 'Żuk' }
]

// zdefiniowanie reakcji na request http
httpServer.on('request', function(req, res) {

    // kontrola sesji
    let appCookies = new cookies(req, res)
    let session = appCookies.get('session')
    let now = Date.now()
    if(!session || !common.sessions[session]) {
        session = uuid.v4()
        common.sessions[session] = { from: req.connection.remoteAddress, created: now, touched: now }
    } else {
        common.sessions[session].touched = now
    }
    appCookies.set('session', session, { httpOnly: false })    

    // środowisko żądania
    let env = {
        req: req,
        res: res,
        session: session
    }

    // parsowanie url
    env.parsedUrl = url.parse(req.url, true)

    // wczytywanie payloadu
    let payload = ''
    req .on('data', function(data) {
            payload += data
        })
        .on('end', function() {
            // żądanie na konsolę
            console.log(session, req.method, req.url, payload)

            env.parsedPayload = null
            if(payload) {
                try {
                    // parsowanie payloadu
                    env.parsedPayload = JSON.parse(payload)
                } catch(ex) {
                    common.serveError(res, 400, ex.message)
                    return
                }
            }

            // żądania autoryzacyjne
            if(env.parsedUrl.pathname == '/auth') {
                if(auth[req.method]) {
                    auth[req.method](env)
                } else {
                    common.serverError(res, 405, 'Method not allowed')
                }
                return
            }

            // właściwa obsługa żądania
            let params = {}

            let addSortToParams = function() {
                if(env.parsedUrl.query.sort) {
                    let sort = {}
                    sort[env.parsedUrl.query.sort] = 1
                    params.order = sort
                }
            }

            switch(env.parsedUrl.pathname) {

                // endpoint do kolekcji persons
                case '/person':
                    // tylko dla użytkowników roli 2
                    if(common.sessions[env.session].roles && common.sessions[env.session].roles.includes(2)) {
                        params = {
                            searchFields: [ 'firstName', 'lastName', 'email' ],
                            aggregation: [
                                { $lookup: { from: 'projects', localField: 'projects', foreignField: '_id', as: 'projects' } },
                                { $project: { password: false } }
                            ],
                            inputTransformation: function(payload) {
                                if(Array.isArray(payload.projects)) {
                                    payload.projects = payload.projects.map(function(el) { return db.ObjectId(el._id) })
                                }
                            }
                        }
                        addSortToParams()
                        dbrest.handle(env, db.persons, params)
                    } else {
                        common.serveError(res, 403, 'Forbidden')
                    }
                    return

                // endpoint do kolekcji projects
                case '/project':
                    params = { searchFields: [ 'shortName', 'name' ] }
                    addSortToParams()
                    dbrest.handle(env, db.projects, params)
                    return

                // endpoint do kolekcji tasks
                case '/task':
                    params = { searchFields: [ 'shortName', 'name', 'date' ] }
                    addSortToParams()
                    dbrest.handle(env, db.tasks, params)
                    return

                // serwowanie statycznej treści
                default:
                    if(req.method == 'GET') {
                        fileServer.serve(req, res)
                    } else {
                        common.serveError(res, 405, 'Method not allowed')
                    }
            }
    })
})

// uruchomienie serwera http
try {
    db.init(common.config.dbUrl, common.config.dbName, function() {
        httpServer.listen(common.config.port)
        console.log('Serwer nasłuchuje na porcie', common.config.port)    
    })
} catch(ex) {
    console.error('Błąd inicjalizacji:', ex.message)
    process.exit(0)
}