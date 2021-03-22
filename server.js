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

// inicjalizacja globalnych obiektów
let config = JSON.parse(fs.readFileSync('config.json'))
console.log('Konfiguracja serwera:', config)
const httpServer = http.createServer()
const fileServer = new nodestatic.Server(config.frontend_dir, { cache: config.cache })

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

                // endpointy restowe
                case '/endpoint':
                    console.log('---')
                    console.log(session, env.parsedUrl.query, env.parsedPayload)
                    console.log('---')
                    common.serveError(res, 418, 'Not implemented')
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
    httpServer.listen(config.port)
    console.log('Serwer nasłuchuje na porcie', config.port)
} catch(ex) {
    console.error('Błąd inicjalizacji:', ex.message)
    process.exit(0)
}