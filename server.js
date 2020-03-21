// /* eslint-disable no-console */
// const express = require('express')

// const app = express()
// app.use(express.static('docs', { dotfiles: 'allow' }))

// let port = process.env.PORT || 4000

// var listener = app.listen(port, function () {
//   console.log('listening on port ' + listener.address().port);
//   console.log('http://localhost:' + listener.address().port);
// });


const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const https = require('https')
const fs = require('fs')
const querystring = require('querystring')
const compression = require('compression')
const bodyParser = require('body-parser')

app.use(compression())
app.use(bodyParser.json())

app.listen(80)

https.createServer({
        key: fs.readFileSync("/etc/letsencrypt/live/covidsl.com/fullchain.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/covidsl.com/privkey.pem")
}, app).listen(443);