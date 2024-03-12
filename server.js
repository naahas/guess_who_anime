
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
var mapgameturn = new Map();
var mapgametimer = new Map();
var mapgamewinner = new Map();

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
    mapgameturn.set(req.session.rid , req.session.username);
    mapgametimer.set(req.session.rid , 1);

    req.session.isplaying = true;

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('makePlayerPlayingEvent');
    });  

    res.end();
});



app.post('/returnBackJoin' , function(req,res) {
    req.session.joined = false;

    if(req.session.rid != null) {
        mapcode.delete(req.session.username);
        mapcodefull = mapcodefull.filter(item => item!=req.session.rid);
        io.once('connection' , (socket) => {
            socket.to(req.session.rid).emit('notifHostCancelFromPlayer');
        });  
    }

    res.end();
});



app.post('/returnBackCreate' , function(req,res) {
    mapcode.delete(req.session.username);
    req.session.created = false;
    var tmpid = req.session.rid;
    req.session.rid = null;

    io.once('connection' , (socket) => {
        socket.to(tmpid).emit('cancelGameExitEvent');
    });  



    res.end();
});



app.post('/cancelPreGame' , function(req,res) {
    req.session.joined = false;
    req.session.rid = null;

    res.end();
});



app.post('/endGame' , function(req,res) {
    req.session.endgame = true;

    var winner = req.body.val;
    console.log("winner : " , winner)
    mapgamewinner.set(req.session.rid , winner);

    res.end();
});



app.post('/exitGame' , function(req,res) {
    req.session.rid = null;
    req.session.endgame = null;
    req.session.ingame = null;
    req.session.isplaying = false;
    req.session.joined = null;
    req.session.created = null;

    res.redirect('/');
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
    const ioroomid = socket.request.session.rid;
    const ioingame = socket.request.session.ingame;
    const ioplaying = socket.request.session.isplaying;
    const ioendgame = socket.request.session.endgame;


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


    if(ioplaying && ioendgame != true) {
        var time = mapgametime.get(ioroomid);
        var theme = mapgametheme.get(ioroomid);
        socket.emit('displayBeginning')
        socket.emit('displayPostRule' , time , theme);
        socket.emit('startSoundEvent');

        if(mapgameturn.get(ioroomid) == iousername) socket.emit('denableTurnInput' , 0)
        else socket.emit('denableTurnInput' , 1);


        //CHANGE BOMB PIC STEP AFTER RELOAD
        var xx = mapgametimer.get(ioroomid);
        var yy = mapgametime.get(ioroomid);
        var step2 = Math.floor(yy/2);

        if((yy-xx) > step2) {
            socket.emit('changeBombStepEvent' , 1);
        }

        if((yy-xx) > 1 && (yy-xx) <= step2) {
            socket.emit('changeBombStepEvent' , 2);
        }

        if((yy-xx) <= 1) {
            socket.emit('changeBombStepEvent' , 3);
        }     


    }



    if(ioendgame) {
        socket.emit('displayPostRule' , mapgametime.get(ioroomid) , mapgametheme.get(ioroomid));
        socket.emit('endGameEventAfterReload' , mapgamewinner.get(ioroomid));
    }


    if(ioendgame && iocreate) {
        socket.emit('displayRePlay');
    }



    socket.on('showTypingEvent' , (msg) => {
        socket.broadcast.to(ioroomid).emit('showTypingOpponentEvent' , msg)
    });


    // CHECK ANSWER HERE 

    socket.on('sendAnswerEvent' , (answer) => {

        var canswer = answer.toUpperCase();
        var ctheme = mapgametheme.get(ioroomid);
        var banktab = profile.Character.Naruto;

        if(ctheme == 'Naruto') banktab = profile.Character.Naruto.map(chara => chara.toUpperCase());
        if(ctheme == 'One Piece') banktab = profile.Character.OnePiece.map(chara => chara.toUpperCase());
        if(ctheme == 'Dragon Ball') banktab = profile.Character.Dbz.map(chara => chara.toUpperCase());
        if(ctheme == 'Tout') banktab = profile.Character.Tout.map(chara => chara.toUpperCase());

        //IF ANSWER IS RIGHT
        if(banktab.includes(canswer)) {
            
            removeJsonAnswer(ctheme , canswer);
            mapgametimer.set(ioroomid , 1);
            io.to(ioroomid).emit('changeBombStepEvent' , 1);
            

            // GAME TURN IS THE OTHER PLAYER'S
            for (let [key, value] of mapcode) {
                if(key!=iousername) mapgameturn.set(ioroomid , key ); 
            }

            socket.emit('playRightAudio');

            // WRONG ANSWER
        } else {
            socket.emit('answerErrorEvent');
        }

        
        if(mapgameturn.get(ioroomid) == iousername) {
            socket.emit('denableTurnInput' , 0);
            socket.broadcast.to(ioroomid).emit('denableTurnInput' , 1);
         }else {
            socket.emit('denableTurnInput' , 1);
            socket.broadcast.to(ioroomid).emit('denableTurnInput' , 0);
         } 

    });



    socket.on('handleTimerEvent' , () => {
        var btimer = setInterval(() => {
            var x = mapgametimer.get(ioroomid);
            var y = mapgametime.get(ioroomid);
            var step2 = Math.floor(y/2);
            console.log(x);

            //CHANGE BOMB PIC STEP
            if((y-x) == step2 && y!=2 && y!=3) {
                io.to(ioroomid).emit('changeBombStepEvent' , 2);
            }

            if((y-x) == 1) {
                io.to(ioroomid).emit('changeBombStepEvent' , 3);
            }


            //GAME IS OVER
            if(x>=y) {
                console.log('BOOM')
                clearInterval(btimer);
                // mapgameturn.delete(req.session.rid);

                var winner;
                
                var player_turn = mapgameturn.get(ioroomid);
                for (let [key, value] of mapcode) {
                    if(key!=player_turn) winner = key; 
                }

                io.to(ioroomid).emit('endGameEvent' , winner , iousername + " (vous)");
               
            }
            
            
            
            // console.log("step2 : " , step2);
    
    
            mapgametimer.set(ioroomid , x+1);
    
        }, 1000);
    });
    


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


function containsWord(str, searchValue){
    str = str.replace(/[^a-z0-9 ]/gi, '');
    var words = str.split(/ /g);
    return words.indexOf(searchValue) > -1
  }


function removeJsonAnswer(theme , answer) {
    var banktab = [];
    var similar = [];
    
    if(theme == 'Naruto') {
        banktab = profile.Character.Naruto;
        for(var i = 0 ; i < banktab.length ; i++) {
            // if(banktab[i].includes(answer)) similar.push(banktab[i]);
            // if(answer.includes(banktab[i])) similar.push(banktab[i]);
            if(containsWord(banktab[i] , answer))  similar.push(banktab[i]);
            if(containsWord(answer , banktab[i]))  similar.push(banktab[i]);
        }


        console.log(similar)

        for(var i = 0 ; i < similar.length ; i++) {
            var toRemove = similar[i];
            profile.Character.Naruto = profile.Character.Naruto.filter(item => item!=toRemove);
        }
    }

    if(theme == 'One Piece') {
        banktab = profile.Character.OnePiece;
        for(var i = 0 ; i < banktab.length ; i++) {
            // if(banktab[i].includes(answer)) similar.push(banktab[i]);
            // if(answer.includes(banktab[i])) similar.push(banktab[i]);
            if(containsWord(banktab[i] , answer))  similar.push(banktab[i]);
            if(containsWord(answer , banktab[i]))  similar.push(banktab[i]);
        }

        //TO DO REMOVE SIMILAR ELEMENT IN JSON
        for(var i = 0 ; i < similar.length ; i++) {
            var toRemove = similar[i];
            profile.Character.OnePiece = profile.Character.OnePiece.filter(item => item!=toRemove);
        }
    }

    if(theme == 'Dragon Ball') {
        banktab = profile.Character.Dbz;
        for(var i = 0 ; i < banktab.length ; i++) {
            // if(banktab[i].includes(answer)) similar.push(banktab[i]);
            // if(answer.includes(banktab[i])) similar.push(banktab[i]);
            if(containsWord(banktab[i] , answer))  similar.push(banktab[i]);
            if(containsWord(answer , banktab[i]))  similar.push(banktab[i]);
        }

        //TO DO REMOVE SIMILAR ELEMENT IN JSON
        for(var i = 0 ; i < similar.length ; i++) {
            var toRemove = similar[i];
            profile.Character.Dbz = profile.Character.Dbz.filter(item => item!=toRemove);
        }
    }

    if(theme == 'Tout') {
        banktab = profile.Character.Tout;
         for(var i = 0 ; i < banktab.length ; i++) {
            // if(banktab[i].includes(answer)) similar.push(banktab[i]);
            // if(answer.includes(banktab[i])) similar.push(banktab[i]);
            if(containsWord(banktab[i] , answer))  similar.push(banktab[i]);
            if(containsWord(answer , banktab[i]))  similar.push(banktab[i]);
        }

        //TO DO REMOVE SIMILAR ELEMENT IN JSON
        for(var i = 0 ; i < similar.length ; i++) {
            var toRemove = similar[i];
            profile.Character.Tout = profile.Character.Tout.filter(item => item!=toRemove);
        }

    }




}



















server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
