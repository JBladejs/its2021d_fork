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

            // właściwa obsługa żądania
            switch(env.parsedUrl.pathname) {

                // endpoint do kolekcji persons
                case '/person':

                    dbrest.handle(env, db.persons, 
                        [ 
                            { $sort: { lastName: 1, firstName: 1 }}
                        ],
                        function(payload) {
                            if(Array.isArray(payload.projects)) {
                                payload.projects = payload.projects.map(function(el) { return db.ObjectId(el) })
                            }
                        }
                    )
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
    db.init(common.config.dbUrl, common.config.dbName)
    httpServer.listen(common.config.port)
    console.log('Serwer nasłuchuje na porcie', common.config.port)
} catch(ex) {
    console.error('Błąd inicjalizacji:', ex.message)
    process.exit(0)
}