
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
        maxAge: 5*tmin,
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
    res.sendFile(__dirname + "/home.html");

 
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


})
           













server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
