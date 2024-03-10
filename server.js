
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

var profile = JSON.parse(fs.readFileSync('./data.json'));



//folder handler
app.use(express.static(__dirname + "/script/"));
app.use(express.static(__dirname + "/style/"));
app.use(express.static(__dirname + "/img/"));
app.use(express.static(__dirname + "/sound/"));



var mapcode = new Map();
var mapcodefull = [];
var mapgametime = new Map();
var mapgametheme = new Map();


//path handle
app.get('/' , function(req,res) {

    
    if(req.session.ingame == true) {
        res.redirect('/game');
    } else {

        if(req.session.created) {
            res.sendFile(__dirname + "/create.html");
        } else if(req.session.joined) {
            res.sendFile(__dirname + "/join.html");
        } else res.sendFile(__dirname + "/home.html");


    }

 
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
    mapcode.set(req.session.username , roomID);
    req.session.rid = roomID;

    res.end();

});


app.post('/join' , function(req,res) {
    req.session.joined = true;
    res.end();

});


//when player try to actually join 
app.post('/codeCheck' , function(req,res) {

    var code = req.body.val;
    var resnb = "non";

    for (let [key, value] of mapcode) {
        if(code == value && !mapcodefull.includes(code))  {
            resnb = "oui";
            req.session.rid = code;
        }   
    }
    

    res.end(resnb);
});



app.post('/game' , function(req,res) {

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('changeGamePlayerStatusEvent');
    });  

    req.session.ingame = true;
    res.redirect('/game');

    
});


app.get('/game' , function(req,res) {
    if(req.session.ingame == true) {
        res.sendFile(__dirname + '/game.html');
    } else res.redirect('/');

});



app.post('/igstatus' , function(req,res) {
    req.session.ingame = true;

    res.end();
});


app.post('/ipstatus' , function(req,res) {
    req.session.isplaying = true;

    res.end();
});


app.post('/confirmSetting' , function(req,res) {
    var btime = req.body.val1;
    var theme = req.body.val2;

    mapgametime.set(req.session.rid , btime);
    mapgametheme.set(req.session.rid , theme);

    req.session.isplaying = true;

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('makePlayerPlayingEvent');
    });  

    res.end();
});


app.post('/sendAnswer' , function(req,res) {
    var answer = req.body.val;
    var theme = mapgametheme.get(req.session.rid);


    res.end();
})



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
    const ioroomid = socket.request.session.rid;
    const ioingame = socket.request.session.ingame;
    const ioplaying = socket.request.session.isplaying;


    socket.emit('showSettingEvent' , iousername);
    socket.emit('displayJoinDiv' , ioroomid);

    
    if(iousername) socket.emit('displayUsernameEvent' , iousername);

    //show raher username input or create/join button , and keep screen notified when there is a player 
    if(iocreate) {
     
        var rid = mapcode.get(iousername);
        socket.join(ioroomid);
        socket.emit('displayCodeEvent' , rid);
        if(mapcodefull.includes(ioroomid)) {
            for (let [key, value] of mapcode) {
                if(key!=iousername) socket.emit('joinNotificationEvent' , (key));
            }
            
        }
    }


    if(iojoin == true && ioroomid) {
        var roomsize = io.sockets.adapter.rooms.get(ioroomid).size;
        if(roomsize == 1) mapcodefull.push(ioroomid);
        if(roomsize<=1) {
            mapcode.set(iousername , ioroomid);
            socket.join(ioroomid);
            socket.broadcast.to(ioroomid).emit('joinNotificationEvent' , iousername);
        }

    }


    if(iocreate && ioingame == true) {
        if(!ioplaying) socket.emit('displaySetting');
    }

    if(ioingame == true) {
        var oplayer = 'undefined';
            for (let [key, value] of mapcode) {
                if(key!=iousername) oplayer = key;
            }
        socket.emit('displayOpponent' , oplayer);
    }



    if(ioingame == true && iocreate!=true) {
        if(!ioplaying) socket.emit('displayWaitMsgGameEvent')
    }


    if(ioplaying) {
        var time = mapgametime.get(ioroomid);
        var theme = mapgametheme.get(ioroomid);
        socket.emit('displayPostRule' , time , theme)
        socket.emit('enableInputEvent');
        socket.emit('startSoundEvent');
    }


    socket.on('showTypingEvent' , (msg) => {
        socket.broadcast.to(ioroomid).emit('showTypingOpponentEvent' , msg)
    })
    


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
