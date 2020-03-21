const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const https = require('https')
const fs = require('fs')



// app.use(compression()); // GZIP http sent files for performance
app.use(express.static('docs', { dotfiles: 'allow' }))
// app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.listen(80)

// https
//     .createServer(
//         {
//             key: fs.readFileSync(
//                 '/etc/letsencrypt/live/covidsl.com/fullchain.pem'
//             ),
//             cert: fs.readFileSync(
//                 '/etc/letsencrypt/live/covidsl.com/privkey.pem'
//             )
//         },
//         app
//     )
//     .listen(443)

https
    .createServer(
        {
            key: fs.readFileSync(
                '/etc/letsencrypt/live/covidsl.com/fullchain.pem'
            ),
            cert: fs.readFileSync(
                '/etc/letsencrypt/live/covidsl.com/privkey.pem'
            )
        },
        app
    )
    .listen(app.get('port'), function() {
        console.log('Express SSL server listening on port ' + app.get('port'))
    })