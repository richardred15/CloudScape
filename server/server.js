const md5 = require("md5");
var fs = require('fs');
var https = require('https');
let options = {
    key: fs.readFileSync('/etc/letsencrypt/live/richard.works/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/richard.works/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/richard.works/chain.pem')
};

var app = https.createServer(options, handler);
var io = require('socket.io')(app);

app.listen(3007);

io.on('connection', function (socket) {

});