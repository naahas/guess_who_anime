
const express = require('express');
const fs = require('fs');
const { createServer } = require('http');
const path  = require('path');
const { Http2ServerRequest } = require("http2");
const { Server } = require('socket.io');
const session = require('express-session');
const { reset } = require('nodemon');
const bodyParser = require('body-parser');
require('dotenv').config();


//main const
const app = express();
const server = createServer(app);
const io = new Server(server , {
    cors: {
        origin : ['*'],
        methods : ['GET' , 'POST'],
        credentials: true
    }
})



//session middleware
var tsec = 1000;
var tmin = 60000; //1 min
const sessionMiddleware = session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60*tmin,
        sameSite: 'lax'
    }
});



app.use(sessionMiddleware , function(req,res, next) {

    // if(req.session.log == true) { 
    //     if(req.session.once!=true) req.session.h = req.session.cookie.expires.getTime();
    //     req.session.once = true;
        
    // }

    
    //     console.log(">> " , req.session.h)
    //     console.log('-- ' ,  (Date.now() - 5000))
    //     if( req.session.h < new Date(Date.now())) console.log("c presque fini mgl")
    

    next();
});



//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
io.engine.use(sessionMiddleware);


//folder handler
app.use(express.static(__dirname + "/script/"));
app.use(express.static(__dirname + "/style/"));
app.use(express.static(__dirname + "/img/"));



//path handle
app.get('/' , function(req,res) {
    
    if(req.session.created) {
        res.sendFile(__dirname + "/create.html");
    } else if(req.session.joined) {
        res.sendFile(__dirname + "/join.html");
    } else res.sendFile(__dirname + "/home.html");

 
});



app.post('/launch' , function(req,res) {
    
    var nickname = req.body.val;
    var cres = checkUsername(nickname);

    if(cres == "good") req.session.username = nickname;

    res.end(cres);

});
 


app.post('/create' , function(req,res) {
    req.session.created = true;

    var roomID = generateRoomID(5);
    console.log("room => " , roomID );
    res.end();

});


app.post('/join' , function(req,res) {
    req.session.joined = true;
    res.end();

});



app.get('*' , function(req,res) {
    res.send('pikine error');
});




//sockets handle
io.on('connection' , (socket) => {

    console.log("connexion acceptée : " , socket.id);
    console.log("-------------------");

    socket.on('disconnect' , () => {
        console.log("déconnexion acceptée : " , socket.id);
        console.log("-------------------");
    })



    const iocreate = socket.request.session.created;
    const iojoin = socket.request.session.joined;
    const iousername= socket.request.session.username;


    socket.emit('showSettingEvent' , iousername);
    
    if(iousername) socket.emit('displayUsernameEvent' , iousername);

    


})
           





/// JS FUNCTIONS
function generateRoomID(code_length) {
    var res = '';
    const all_char = 'ABCDEFGHIJKLMONPQRSTUVWXYZ01234567890123456789';
    var counter = 0;

    while(counter < code_length) {
        res += all_char[Math.floor(Math.random() * all_char.length)];
        counter+=1;
    }

    return res;
}



function checkUsername(username) {
    if(username.length < 4) return "TROP COURT (4-15)";
    if(username.length > 15) return "TROP LONG (4-15)";
    // if(username.indexOf(' ') >= 0) return "FORMAT INVALIDE";

    return "good";
}












server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
