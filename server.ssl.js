const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const https = require('https')
const fs = require('fs')
// const querystring = require('querystring')
// const compression = require('compression')
// const bodyParser = require('body-parser')


// app.use(compression()); // GZIP http sent files for performance
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    next()
})

app.use(express.static('docs', { dotfiles: 'allow' }))
// app.use( bodyParser.json() );       // to support JSON-encoded bodies


https
    .createServer(
        {
            key: fs.readFileSync(
                '/etc/letsencrypt/live/covidsl.com/privkey.pem',
                'utf8'
            ),
            cert: fs.readFileSync(
                '/etc/letsencrypt/live/covidsl.com/fullchain.pem',
                'utf8'
            ),
            ca: fs.readFileSync('/etc/letsencrypt/live/covidsl.com/chain.pem')
        },
        app
    )
    .listen(443)


http.createServer(function(req, res) {
    res.writeHead(301, { Location: 'https://' + req.headers['host'] + req.url })
    res.end()
}).listen(80)