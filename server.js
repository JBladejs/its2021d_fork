// moduły wbudowane
const http = require('http')

// moduły dodatkowe
const static = require('node-static')

// inicjalizacja globalnych obiektów
const httpServer = http.createServer()
const fileServer = new static.Server('./public')

// zdefiniowanie reakcji na request http
httpServer.on('request', function(req, res) {
    console.log(req.method, req.url)
    fileServer.serve(req, res)
})

httpServer.listen(8888)