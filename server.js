// moduły wbudowane
const http = require('http')
const fs = require('fs')

// moduły dodatkowe
const static = require('node-static')

// moduły własne
const db = require('./db')

// inicjalizacja globalnych obiektów
let config = JSON.parse(fs.readFileSync('config.json'))
console.log('Server config:', config)
const httpServer = http.createServer()
const fileServer = new static.Server(config.frontend_dir)

// zdefiniowanie reakcji na request http
httpServer.on('request', function(req, res) {
    console.log(req.method, req.url)
    fileServer.serve(req, res)
})

try {
    db.init(config.dbUrl, config.dbName)
    httpServer.listen(config.port)
} catch(ex) {
    console.error('Błąd inicjalizacji:', ex.message)
    process.exit(0)
}
