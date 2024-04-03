
const express = require('express');
const fs = require('fs');
const { createServer } = require('http');
const path  = require('path');
const { Http2ServerRequest } = require("http2");
const { Server } = require('socket.io');
const mysql = require('mysql2');
const session = require('express-session');
const { reset } = require('nodemon');
const bodyParser = require('body-parser');
var _ = require('underscore');
const { prependOnceListener } = require('process');
const { post } = require('jquery');





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


//TODO : display point after decrease to other player when someone uses a joker (citanime)



//session middleware
var tsec = 1000;
var tmin = 60000; //1 min
const sessionMiddleware = session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 30*tmin,
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
app.use(express.static(__dirname + "/icon/"));
app.use(express.static(__dirname + "/song/"));



var mapcode = new Map();
var mapcodefull = [];
var mapgametime = new Map();
var mapgametheme = new Map();
var mapgameturn = new Map();
var mapgametimer = new Map();
var mapgamewinner = new Map();
var mapgamewinnerpoint = new Map();
var mapgamedata = new Map();
var mapgamestack = new Map();
var mapgametotal = new Map();
var mapcodecopy = new Map();
var mapgamedifficulty = new Map();
var mapgamecitaturn = new Map();
var mapgameplayerpoint = new Map();
var mapgamecitation = new Map();
var mapgameitationanswer = new Map();
var mapgamecitajoker = new Map();
var current_user = [];

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




app.post('/subUsername' , function(req,res) {
    
    var nickname = req.body.val;
    var nicknameup = nickname.toUpperCase();
    var cres = checkUsername(nicknameup);

    if(cres == "good") {
        req.session.username = nickname;
        req.session.mode = 'Bombanime';
        current_user.push(nicknameup);
    }

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
    var codeUp = code.toUpperCase();

    var resnb = "non";


    for (let [key, value] of mapcode) {
        if(codeUp == value && !mapcodefull.includes(codeUp) && !mapgametheme.has(codeUp))  {
            resnb = "oui";
            req.session.rid = codeUp;
            break;
        }   
    }
    
    req.session.citadisable = false;
    res.end(resnb);
});


//HOST CLICK ON REPLAY
app.post('/replay' , function(req,res) {

    req.session.isplaying = false;
    req.session.endgame = false;
    req.session.replayed = true;

    mapgamewinner.delete(req.session.rid); 
    mapgamewinnerpoint.delete(req.session.rid); 


    res.end();
});



app.get('/mode' , function(req,res) {

    if(req.session.username) res.sendFile(__dirname + '/mode.html');
    else res.redirect('/');
    
});


app.post('/setMode' , function(req,res) {
    req.session.mode = req.body.val;

    res.end();
});


app.post('/replayPlayer' , function(req,res) {
    req.session.isplaying = null;
    req.session.endgame = null;


    res.end();
});


app.post('/checkCitaAnswer' , function(req,res) {

    var answer = req.body.val;
    var answerUp = answer.toUpperCase();
    var rid = req.session.rid;

    if(mapgameitationanswer.get(rid).includes(answerUp)) req.session.citadisable = true;
    else req.session.citadisable = false;

    res.end();
});


app.post('/resetCitaStatus' , function(req,res) {

    req.session.citadisable = false;

    res.end();
});


app.post('/resetID' , function(req,res)  {

    req.session.rid = null;
    req.session.back = null;
    res.end();
});


app.post('/game' , function(req,res) {


    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('changeGamePlayerStatusEvent' , req.session.mode);
    });  


    console.log("current players : " , mapcode)

    mapgametheme.set(req.session.rid , 'Naruto');
    mapgametime.set(req.session.rid , 5);

    req.session.ingame = true;

    res.redirect('/game');

});


app.get('/game' , function(req,res) {

    //IF PLAYER TRY TO RELOAD AFTER HOST LEAVE THE GAME
    if(req.session.isplaying == true && req.session.joined == true && !mapgameturn.get(req.session.rid)) {
        req.session.endgame = null;
        req.session.ingame = null;
        req.session.joined = false;
        req.session.isplaying = false;
        req.session.rid = null;
    }
    

    if(mapgamewinner.get(req.session.rid)!=null) req.session.endgame = true;

    if(req.session.ingame == true) {
        var modfilename = req.session.mode.toLowerCase();
        console.log("launched mode -> " , modfilename)
        res.sendFile(__dirname + '/' + modfilename + '.html');
    } else res.redirect('/');

});



app.post('/igstatus' , function(req,res) {
    req.session.ingame = true;
    req.session.mode = req.body.val;

    res.end();
});


app.post('/ipstatus' , function(req,res) {
    req.session.isplaying = true;

    res.end();
});


app.post('/useJoker' , function(req,res) {

    var ppoint = mapgameplayerpoint.get(req.session.username);

    if(req.body.val == 1 && req.session.usedJK1 != true) {
        var new_point = (ppoint - 200) >= 0 ? (ppoint - 200) : 0 ;
        mapgameplayerpoint.set(req.session.username , new_point)
        req.session.usedJK1 = true;
    }

    if(req.body.val == 2 && req.session.usedJK2 != true) {
        var new_point = (ppoint - 200) >= 0 ? (ppoint - 200) : 0 ;
        mapgameplayerpoint.set(req.session.username , new_point)
        
        req.session.usedJK2 = true;
    }

    
    res.end();
});


app.post('/resetJoker' , function(req,res) {

    req.session.usedJK1 = false;
    req.session.usedJK2 = false;

    
    res.end();
});


// GAME START AFTER CONFIRM SETTING (BOMBANIME)
app.post('/confirmSettingBombanime' , function(req,res) {
    var btime = req.body.val1;
    var theme = req.body.val2;
    if(btime < 3) btime = 3;
    if(btime > 15) btime = 15;

    if(theme == 'Naruto') mapgamedata.set(req.session.rid , profile.Character.Naruto);
    if(theme == 'One Piece') mapgamedata.set(req.session.rid , profile.Character.OnePiece);
    if(theme == 'Dragon Ball') mapgamedata.set(req.session.rid , profile.Character.Dbz);
    if(theme == 'Hunter x Hunter') mapgamedata.set(req.session.rid , profile.Character.Hxh);
    if(theme == 'Attaque des Titans') mapgamedata.set(req.session.rid , profile.Character.Snk);
    if(theme == 'Bleach') mapgamedata.set(req.session.rid , profile.Character.Bleach);
    if(theme == 'Pokemon') mapgamedata.set(req.session.rid , profile.Character.Pokemon);
    if(theme == 'Demon Slayer') mapgamedata.set(req.session.rid , profile.Character.DemonSlayer);
    if(theme == 'Kpop') mapgamedata.set(req.session.rid , profile.Character.Kpop);
    if(theme == 'Reborn') mapgamedata.set(req.session.rid , profile.Character.Reborn);
    if(theme == 'My Hero Academia') mapgamedata.set(req.session.rid , profile.Character.Mha);
    if(theme == 'Death Note') mapgamedata.set(req.session.rid , profile.Character.DeathNote);
    if(theme == 'Jojo') mapgamedata.set(req.session.rid , profile.Character.Jojo);
    if(theme == 'Fairy Tail') mapgamedata.set(req.session.rid , profile.Character.FairyTail);
    if(theme == 'Jujutsu Kaisen') mapgamedata.set(req.session.rid , profile.Character.JujutsuKaisen);

    mapgamedata.set(req.session.rid ,  mapgamedata.get(req.session.rid).map(chara => chara.toUpperCase()));

    mapgametime.set(req.session.rid , btime);
    mapgametheme.set(req.session.rid , theme);
    mapgameturn.set(req.session.rid , req.session.username);
    mapgametimer.set(req.session.rid , 1);
    mapgamestack.set(req.session.rid , []);

    
    for (let [key, value] of mapcode) {
        if(value == req.session.rid) mapcodecopy.set(key, value);
        
    }

    var total_chara = mapgamedata.get(req.session.rid).length;
    mapgametotal.set(req.session.rid , total_chara);

    req.session.isplaying = true;
    req.session.replayed = false;

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('makePlayerPlayingEvent');
    });  


    res.end();
});


// GAME START AFTER CONFIRM SETTING (CITANIME)
app.post('/confirmSettingCitanime' , function(req,res) {
    var btime = req.body.val1;
    if(btime < 5) btime = 5;
    if(btime > 20) btime = 20;

    var difficulty = req.body.val2;
    if(difficulty != "Facile" && difficulty != "Normal" && difficulty != "Difficile") difficulty = "Normal";

    var nbturn = req.body.val3;
    if(nbturn > 20) nbturn = 20;
    if(nbturn < 5) nbturn = 5;

    mapgametime.set(req.session.rid , btime++);
    mapgameturn.set(req.session.rid , req.session.username);
    mapgametimer.set(req.session.rid , 1);
    mapgamedifficulty.set(req.session.rid , difficulty);
    mapgamecitaturn.set(req.session.rid , nbturn);

    req.session.citadisable = false;

    if(difficulty == "Facile") mapgamedata.set(req.session.rid , profile.Citation.Facile);
    if(difficulty == "Normal")  mapgamedata.set(req.session.rid , profile.Citation.Normal);
    if(difficulty == "Difficile") mapgamedata.set(req.session.rid , profile.Citation.Difficile);

    generateCitation(req.session.rid);
    
    for (let [key, value] of mapcode) {
        if(value == req.session.rid) mapcodecopy.set(key, value);
        if(value == req.session.rid) mapgameplayerpoint.set(key, 500);
    }

    req.session.isplaying = true;
    req.session.replayed = false;

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('makePlayerPlayingEvent');
    });  


    res.end();
});




app.post('/playSolo' , function(req,res) {
    req.session.created = true;
    req.session.ingame = true;
    req.session.solop = true;
    
    var rid = generateRoomID(5);
    req.session.rid = rid;

    mapcode.set(req.session.username , rid);
    mapcode.set('bot[' + rid + ']', rid);
    mapgametheme.set(req.session.rid , 'Naruto');
    mapgametime.set(req.session.rid , 5)

    res.end();
});



app.post('/kickPlayer' , function(req,res) {
    req.session.rid = null;
    req.session.joined = false;
    res.end();
});


app.post('/returnBackJoin' , async function(req,res) {
    req.session.joined = false;
    req.session.solop = false;
    req.session.back = true;

    mapcode.delete(req.session.username);
    mapcodefull = mapcodefull.filter(item => item!=req.session.rid);


    res.end();
});



app.post('/returnBackCreate' , function(req,res) {

    mapcode.delete(req.session.username);
    
    req.session.created = false;
    req.session.solop = false;
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
    if(req.body.val2) mapgamewinnerpoint.set(req.session.rid , req.body.val2);
    
    mapgamewinner.set(req.session.rid , winner);

    res.end();
});


app.post('/editUsername' , function(req,res) {
    var upuser = req.session.username;
    var upuser2 = upuser.toUpperCase();
    current_user = current_user.filter(user => user != upuser2);
    req.session.destroy();

    res.end();
}); 



app.post('/exitGame' , function(req,res) {
    
    req.session.endgame = null;
    req.session.ingame = null;
    req.session.isplaying = false;
    req.session.joined = null;
    req.session.solop = null;
    req.session.citadisable = null;
    req.session.usedJK1 = null;
    req.session.usedJK2 = null;

    
    if(req.session.created) {
        
        for (let [key, value] of mapcode) {
            if(mapcode.get(key) == req.session.rid) mapcode.delete(key);
        }


        mapgameplayerpoint.delete(req.session.username);
        mapcode.delete(req.session.username);
        mapcodefull = mapcodefull.filter(item => item!=req.session.rid);
        mapgametime.delete(req.session.rid)
        mapgamecitaturn.delete(req.session.rid);
        mapgamedifficulty.delete(req.session.rid);
        mapgametheme.delete(req.session.rid);
        mapgameturn.delete(req.session.rid);
        mapgametimer.delete(req.session.rid);
        mapgamewinner.delete(req.session.rid);
        mapgamedata.delete(req.session.rid);
        mapgamestack.delete(req.session.rid);
        mapgametotal.delete(req.session.rid);
    }

    mapcode.delete(req.session.username);
    req.session.created = null;
    req.session.rid = null;
    res.redirect('/');
});



app.get('*' , function(req,res) {
    res.sendFile(__dirname + '/error.html');
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
    const ioreplay = socket.request.session.replayed;
    const iosolo = socket.request.session.solop;
    const ioback = socket.request.session.back;
    const iomode = socket.request.session.mode;
    const iocitadisable = socket.request.session.citadisable;


    socket.emit('showSettingEvent' , iousername);
    socket.emit('displayJoinDiv' , ioroomid);


    if(iousername) socket.emit('displayUsernameEvent' , iousername);

  
    //show raher username input or create/join button , and keep screen notified when there is a player 
    if(iocreate) {
        socket.join(ioroomid);
        socket.emit('displayCodeEvent' , ioroomid);
        
        var nbplayer = 0;
        for (let [key, value] of mapcode) {
            if(key!=iousername && mapcode.get(key) == ioroomid) nbplayer++;
            // if(key!=iousername && mapcode.get(key) == ioroomid) socket.emit('joinNotificationEvent' , (key));
        }

        socket.emit('joinCountNotificationEvent' , (nbplayer));   
            
    }

    
    if(iomode) {
        socket.emit('updateMode' , iomode);
    }



    //JOIN THE ROOM
    if(iojoin == true && ioroomid) {
        if(io.sockets.adapter.rooms.get(ioroomid)) {
            var roomsize = io.sockets.adapter.rooms.get(ioroomid).size;
            if(roomsize == 9) mapcodefull.push(ioroomid);
            if(roomsize<=9) {
                mapcode.set(iousername , ioroomid);
                socket.join(ioroomid);

                var nbplayer = 0;
                for (let [key, value] of mapcode) {
                    if(key!=iousername && mapcode.get(key) == ioroomid) nbplayer++;
                }

         
                socket.broadcast.to(ioroomid).emit('joinNotificationEvent' , nbplayer);
            }
        }

    }


    //DISPLAY WAIT MSG TO JOINED PLAYERS
    if(ioingame == true && iocreate!=true) {
        if(!ioplaying) socket.emit('displayWaitMsgGameEvent')
    }

    
    
    if(iocreate && ioingame == true) {
        if(!ioplaying && iomode == 'Bombanime') socket.emit('displaySetting');
        if(!ioplaying && iomode == 'Citanime') socket.emit('displaySetting');
    }



    if(iomode == "Bombanime") {

        //DISPLAY OPPONENT (BOMBANIME)
        if(ioplaying && ioingame == true) {
            var oplayer = 'SLAYERBOT';
            var playertab = [];
                for (let [key, value] of mapcode) {
                    if(mapcode.get(key) == ioroomid) playertab.push(key);
                }
            socket.emit('displayOpponents' , playertab , iousername );
        }

        //DISPLAY SKULL , TURNPIC , AND BOMB AT GAME BEGINNING AND AFTER RELOAD (BOMBANIME)
        if(ioplaying && ioendgame != true) {
            var time = mapgametime.get(ioroomid);
            var theme = mapgametheme.get(ioroomid);
            socket.emit('displayBeginning')
            socket.emit('displayPostRule' , time , theme);
            
            socket.emit('startSoundEvent');

            if(iomode == "Bombanime") socket.emit('displayStrikerEvent' , mapgamestack.get(ioroomid).length ,  mapgametotal.get(ioroomid));


            //ENABLE OR DISABLE TURN FOR THE CURRENT SOCKET ACCORDING TO MAPGAMETURN AFTER LOAD AND RELOAD
            if(mapgameturn.get(ioroomid) == iousername) socket.emit('denableTurnInput' , 0)
            else socket.emit('denableTurnInput' , 1);

            //SHOW TURNPIC TO PLAYERS
            var index_player = 0;
            for (let [key, value] of mapcode) {
                if(key == mapgameturn.get(ioroomid) && mapcode.get(key) == ioroomid) {
                    
                    break;
                } 
                if(mapcode.get(key) == ioroomid) index_player++; 
            }

            socket.emit('displayTurnPicEvent' , index_player);
            

            //SHOW SKULL TO PLAYERS
            var lostPlayer = [];
            var index_lost = 0;
            for (let [key, value] of mapcode) {
                if(mapcode.get(key) == ioroomid) {
                    if(!mapcodecopy.has(key)) lostPlayer.push(index_lost);
                } 
                if(mapcode.get(key) == ioroomid) index_lost++;
            }

            if(lostPlayer.length > 0) {
                lostPlayer.forEach(index => {
                    socket.emit('displaySkullEvent' , index);
                });
            }


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


    }


    if(iomode == "Citanime") {
        if(ioplaying && ioendgame != true) {
            //DISPLAY OPPONENT (CITANIME)
            if(ioplaying && ioingame == true) {
                var oplayer = 'SLAYERBOT';
                var playertab = [];
                var playerpoint = [];
                    for (let [key, value] of mapcode) {
                        if(mapcode.get(key) == ioroomid) playertab.push(key);
                    }
                    for (let [key, value] of mapgameplayerpoint) {
                        if(mapcode.get(key) == ioroomid) playerpoint.push(value);
                    }
                // console.log(playerpoint)
                socket.emit('displayOpponents2' , playertab , playerpoint ,  iousername );
            }

            if(iocitadisable == true) socket.emit("disableCitaInputEvent");
            else socket.emit('enableCitaInputEvent' , 0);

            socket.emit('displayPostRule2' , mapgametime.get(ioroomid) , mapgamedifficulty.get(ioroomid) , mapgamecitaturn.get(ioroomid) );
            socket.emit('displayBeginning2')
            socket.emit('displayCitationData' , mapgamecitation.get(ioroomid));
        }
    }



    if(ioendgame) {
        if(iomode == "Bombanime") {
            socket.emit('displayPostRule' , mapgametime.get(ioroomid) , mapgametheme.get(ioroomid));
            socket.emit('endGameEventAfterReload' , mapgamewinner.get(ioroomid));
        }

        if(iomode == "Citanime") {
            socket.emit('displayPostRule2' , mapgametime.get(ioroomid) , mapgamedifficulty.get(ioroomid) , mapgamecitaturn.get(ioroomid) );
            socket.emit('endGameEventAfterReload2' , mapgamewinner.get(ioroomid) , mapgamewinnerpoint.get(ioroomid));
        }
    }


    if(ioendgame && iocreate) {
        socket.emit('displayRePlay');
    }


    if(ioreplay) {
        socket.broadcast.to(ioroomid).emit('replayNotifPlayerEvent');
        socket.emit('keepSettingEvent' , mapgametheme.get(ioroomid) , mapgametime.get(ioroomid));
    }


    if(ioback) {
        socket.to(ioroomid).emit('notifHostCancelFromPlayer');
        socket.emit('resetid');
    }



    // DISPLAY TYPING (BOMBANIME)
    socket.on('showTypingEvent' , (msg) => {

        var index_player = 0;
        for (let [key, value] of mapcode) {
            if(key == mapgameturn.get(ioroomid) && mapcode.get(key) == ioroomid) {
                
                break;
            } 
            if(mapcode.get(key) == ioroomid) index_player++; 
        }
        socket.broadcast.to(ioroomid).emit('showTypingOpponentEvent' , msg  , index_player)
    });


    // CHECK ANSWER HERE (BOMBANIME)
    socket.on('sendAnswerEvent' , (answer , stat) => {


        var canswer = answer.toUpperCase();
        var ctheme = mapgametheme.get(ioroomid);
        var banktab = profile.Character.Naruto;

        if(ctheme != null) banktab = mapgamedata.get(ioroomid);
       
        //IF ANSWER IS RIGHT
        if(banktab.includes(canswer)) {
            var similarChar = removeJsonAnswer(ctheme , canswer , ioroomid , banktab);

            var given = mapgamestack.get(ioroomid);
            var givenfusion = similarChar.concat(given);
            mapgamestack.set(ioroomid , givenfusion);


            mapgametimer.set(ioroomid , 1);
            io.to(ioroomid).emit('changeBombStepEvent' , 1);
            io.to(ioroomid).emit('displayStrikerEvent' ,  mapgamestack.get(ioroomid).length  , mapgametotal.get(ioroomid));
            
            
            
            
            // CHANGE TURN
            if(stat == 0) {
                var turn_array = [];

                //FIRST LOOP TO PUSH PLAYERS TO TURNARRAY
                for (let [key, value] of mapcode) {
                    if(mapcode.get(key) == ioroomid) turn_array.push(key);
                }

                var index_player = 0;
                for (let [key, value] of mapcode) {
                    if(key == iousername && mapcode.get(key) == ioroomid) {
                        
                        break;
                    } 
                    if(mapcode.get(key) == ioroomid) index_player++; 
                }


                var next_index_player = index_player + 1;
                if(next_index_player >= turn_array.length) next_index_player = 0;
                var next_player = turn_array[next_index_player];
                
                while(!mapcodecopy.has(next_player)) {
                    next_index_player+=1
                    if(next_index_player >= turn_array.length) next_index_player = 0;
                    next_player = turn_array[next_index_player];
                }

                /////////////////////////////// JUST FOR RESETINPUT
                var index_player2 = 0;
                for (let [key, value] of mapcode) {
                    if(key == mapgameturn.get(ioroomid) && mapcode.get(key) == ioroomid) {
                        
                        break;
                    } 
                    if(mapcode.get(key) == ioroomid) index_player2++; 
                }

                socket.broadcast.to(ioroomid).emit('resetInputForOpponent' , index_player2);
                /////////////////////////////// JUST FOR RESETINPUT

                mapgameturn.set(ioroomid , next_player);
        
                
                /////RESET INPUT AND DISPLAY TURN TO CURRENT PLAYER (WHO IS THE NEXT ONE ALREADY)
                var index_player = 0;
                for (let [key, value] of mapcode) {
                    if(key == mapgameturn.get(ioroomid) && mapcode.get(key) == ioroomid) {
                        
                        break;
                    } 
                    if(mapcode.get(key) == ioroomid) index_player++; 
                }


                io.to(ioroomid).emit('displayTurnPicEvent' , index_player);
                socket.broadcast.to(ioroomid).emit('resetInputForOpponent' , index_player);
                

                //AFTER BOT ANSWER -> SET TURN TO HOST
            } else {
                mapgameturn.set(ioroomid , iousername);
                io.to(ioroomid).emit('displayTurnPicEvent' , 0);
            }



            //0 -> rightanswer by player , 1 -> rightanswer by bot
            if(stat == 0) socket.emit('playRightAudio');
            else socket.emit('playRightAudio2');


            //SET BOT ANSWER AFTER PLAYER ANSWER
            if(iosolo == true && stat != 1) {
                var rnb =  Math.floor(Math.random() * mapgamedata.get(ioroomid).length)
                var relem = mapgamedata.get(ioroomid)[rnb];

                socket.emit('setBotAnswerEvent' , relem);
            }



            // WRONG ANSWER
        } else {

            var given2 = mapgamestack.get(ioroomid);

            var index_player = 0;
            for (let [key, value] of mapcode) {
                if(key == iousername && mapcode.get(key) == ioroomid) {
                    
                    break;
                } 
                if(mapcode.get(key) == ioroomid) index_player++; 
            }
            
            
            

            //0 -> answer already given => play lock sound , else wrong answer => play error sound
            if(given2.includes(canswer)) socket.emit('answerErrorEvent' , 0 , index_player);
            else socket.emit('answerErrorEvent' , 1 , index_player );

            socket.broadcast.to(ioroomid).emit('clearAllInput');
            
            
        }

        // enable for next player and disable for current player
        if(mapgameturn.get(ioroomid) != iousername) {
            socket.emit('denableTurnInput' , 1);
            socket.broadcast.to(ioroomid).emit('denableTurnInput2' , mapgameturn.get(ioroomid));
        } else {
            //AFTER BOT RIGHT ANSWER
            socket.emit('denableTurnInput' , 0);
        }

    });


    // CHECK ANSWER HERE (CITANIME)
    socket.on('sendAnswerEvent2' , (answer) => {
        var canswer = answer.toUpperCase();
        var answers = mapgameitationanswer.get(ioroomid);

        if(iocitadisable != true) {
        
            //ANSWER RIGHT
            if(answers.includes(canswer)) {
                socket.emit('playRightAudio2');
                
                //INCREASE PLAYER POINT
                var prepoint = 500;
                prepoint = mapgameplayerpoint.get(iousername);

                mapgameplayerpoint.set(iousername , mapgameplayerpoint.get(iousername) + 500);
                var postpoint = mapgameplayerpoint.get(iousername);

                socket.emit("increasePointEvent" , prepoint,  postpoint);       

                    
                //DISPLAY NEW PLAYER POINT TO OTHER PLAYERS
                var index_player = 0;
                for (let [key, value] of mapgameplayerpoint) {
                    if(key == iousername && mapcode.get(key) == ioroomid) break;
                    if(mapcode.get(key) == ioroomid) index_player++; 
                }

                socket.broadcast.to(ioroomid).emit('increasePointForOtherEvent' , index_player , postpoint);     
                

                socket.emit('disableJokerEvent');
                socket.emit('disableCitaInputEvent');
                
                //WRONG ANSWER (CITANIME)
            } else {
                socket.emit('answerErrorEvent2');

            }
        }

        
    });


    // HANDLE TIMER (CITANIME)
    socket.on('handleTimerEvent2' , () => {
        var btimer = setInterval(() => {
            var current_time = mapgametimer.get(ioroomid);
            var game_time = mapgametime.get(ioroomid);


            if(game_time - current_time == 1) {
                io.to(ioroomid).emit('animationCitaTimerEvent');
            }


            //TIME'S UP
            if(current_time>=game_time) {
                mapgamecitaturn.set(ioroomid , mapgamecitaturn.get(ioroomid) - 1);

                if(mapgamecitaturn.get(ioroomid) > 0) {
                    mapgametimer.set(ioroomid , 0);
                    generateCitation(ioroomid);
                    io.to(ioroomid).emit('changeCitationEvent' , mapgamecitation.get(ioroomid));
                    io.to(ioroomid).emit('enableCitaInputEvent' , 1);
                    io.to(ioroomid).emit('resetJokerEvent');

                    //NO MORE TURN
                } else {
                    var winner = iousername;
                    var winnerpoint = mapgameplayerpoint.get(iousername);

                    for (let [key, value] of mapgameplayerpoint) {
                        if(mapcode.get(key) == ioroomid) {
                            if(value > winnerpoint) { winnerpoint = value; winner = key };
                        }
                    }

                    io.to(ioroomid).emit('endGameEvent2' , winner , winnerpoint , iousername + " (vous)");
                    clearInterval(btimer);
                }
                //RESET TIMER
                
                

                
               
            }
            
            
            var new_timer_value = mapgametime.get(ioroomid) - mapgametimer.get(ioroomid);
            if(mapgamecitaturn.get(ioroomid) > 0) io.to(ioroomid).emit("updateTimer" , new_timer_value);
            mapgametimer.set(ioroomid , mapgametimer.get(ioroomid)+1);
    
        }, 1000);
    });


    // HANDLE TIMER (BOMBANIME)
    socket.on('handleTimerEvent' , () => {
        var btimer = setInterval(() => {
            var current_time = mapgametimer.get(ioroomid);
            var game_time = mapgametime.get(ioroomid);
            var step2 = Math.floor(game_time/2);

            //CHANGE BOMB PIC STEP
            if((game_time-current_time) == step2 && game_time!=2 && game_time!=3) {
                io.to(ioroomid).emit('changeBombStepEvent' , 2);
            }

            if((game_time-current_time) == 1) {
                io.to(ioroomid).emit('changeBombStepEvent' , 3);
            }


            //BOMB EXPLODE (ENDGAME OR NOT)
            if(current_time>=game_time) {

                //RESET TIMER
                mapgametimer.set(ioroomid , 0);
                
                var winner;
                var player_turn = mapgameturn.get(ioroomid);
                

                var nbplayer = 0;
                for (let [key, value] of mapcodecopy) if(mapcodecopy.get(key) == ioroomid) nbplayer++;
                   

                //GAME IS OVER (2 PLAYERS LEFT BEFORE ELIMINATION)
                if(nbplayer <= 2) {
                    for (let [key, value] of mapcodecopy) {
                        if(key!=player_turn && mapcodecopy.get(key) == ioroomid) winner = key; 
                    }
                    io.to(ioroomid).emit('endGameEvent' , winner , iousername + " (vous)");
                    clearInterval(btimer);
                } else {

                    io.to(ioroomid).emit('playSlashEvent');

                    //SET TURN TO NEXT PLAYER AND THEN ELIMINATE CURRENT PLAYER
                    
                    var turn_array = [];
                    for (let [key, value] of mapcode) {
                        if(mapcode.get(key) == ioroomid) turn_array.push(key);
                    }

                    var index_player = 0;
                    for (let [key, value] of mapcode) {
                        if(key == player_turn && mapcode.get(key) == ioroomid) {
                            
                            break;
                        } 
                        if(mapcode.get(key) == ioroomid) index_player++; 
                    }


                    var next_index_player = index_player + 1;
                    if(next_index_player >= turn_array.length) next_index_player = 0;
                    var next_player = turn_array[next_index_player];

                    while(!mapcodecopy.has(next_player)) {
                        next_index_player+=1
                        if(next_index_player >= turn_array.length) next_index_player = 0;
                        next_player = turn_array[next_index_player];
                    }


                    mapgameturn.set(ioroomid , next_player)

                    mapcodecopy.delete(player_turn);

                    // console.log(mapcodecopy)

                    
                    io.to(ioroomid).emit('displaySkullEvent' , index_player);
                    io.to(ioroomid).emit('hakaiPlayerEvent' , index_player);
                    io.to(ioroomid).emit('displaySkullEvent' , index_player);
                    io.to(ioroomid).emit('denableTurnInput2' , mapgameturn.get(ioroomid));
                    io.to(ioroomid).emit('changeBombStepEvent' , 1);
                    io.to(ioroomid).emit('displayTurnPicEvent' , next_index_player);
                    socket.broadcast.to(ioroomid).emit('resetInputForOpponent' , index_player);
                }

               
                
                

                
               
            }
            
            
    
    
            mapgametimer.set(ioroomid , mapgametimer.get(ioroomid)+1);
    
        }, 1000);
    });


    // HANDLE KICK PLAYER
    socket.on('kickPlayerEvent' , () => {
        socket.emit('notifHostCancelFromPlayer');
        for (let [key, value] of mapcode) {
            if(key!=iousername && mapcode.get(key) == ioroomid) mapcode.delete(key);
            mapcodefull = mapcodefull.filter(item => item!=ioroomid);
            socket.broadcast.to(ioroomid).emit('notifKickPlayerEvent');
        }
    });


    socket.on('updateCurrentGameAfterLeavingEvent' , () => {
        socket.broadcast.to(ioroomid).emit('reloadGameForOtherPlayer');
    });



    socket.on('useJokerEvent' , (stat) => {
        var jk = mapgamecitajoker.get(ioroomid);
        var hint;
        if(stat == 1) hint = jk[0];
        if(stat == 2) hint = jk[1];

        socket.emit('displayJokerEvent' , stat , hint);

        //DISPLAY DECREASE POINT TO OTHER PLAYER
        var prepoint = mapgameplayerpoint.get(iousername);
        var postpoint = (prepoint - 200) >= 0 ? (prepoint - 200) : 0 ;

        console.log('prepoint -> ' , prepoint)
        console.log('postpoint -> ' , postpoint)

        var index_player = 0;

        for (let [key, value] of mapgameplayerpoint) {
            if(key == iousername && mapcode.get(key) == ioroomid) break;
            if(mapcode.get(key) == ioroomid) index_player++; 
        }

        socket.broadcast.to(ioroomid).emit('increasePointForOtherEvent' , index_player , postpoint)  


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
    if(username.indexOf(' ') >= 0) return "FORMAT INVALIDE";

    if (current_user.includes(username)) return "PEUDO ACTUELLEMENT INDISPONIBLE"

    return "good";
}


function containsWord(str, searchValue){
    str = str.replace(/[^a-z0-9 ]/gi, '');
    var words = str.split(/ /g);
    return words.indexOf(searchValue) > -1
  }



function removeJsonAnswer(theme , answer , rid ,  banktab) {
 
    var similar = [];
    
    for(var i = 0 ; i < banktab.length ; i++) {
        if(containsWord(banktab[i] , answer) && banktab[i]!=answer)  similar.push(banktab[i]);
        if(containsWord(answer , banktab[i]) && banktab[i]!=answer)  similar.push(banktab[i]);
        


            if(theme == 'Dragon Ball') {
        
                if(answer == "TORTUE GENIAL") { similar.push("MUTEN ROSHI"); similar.push("ROSHI"); }
                if(answer == "MUTEN ROSHI" || answer == "ROSHI")  similar.push("TORTUE GENIAL");

                if(answer == "KAKAROT")  { similar.push("GOKU"); similar.push("SON GOKU"); similar.push("SONGOKU"); similar.push("BLACK GOKU"); }
                if(answer == "GOKU" || answer == "SON GOKU" || answer == "BLACK GOKU") { similar.push("KAKAROT"); similar.push("SONGOKU"); }
                if(answer == "SONGOKU")  { similar.push("GOKU"); similar.push("SON GOKU"); similar.push("BLACK GOKU"); similar.push("KAKAROT"); }

                if(answer == "BACTERIAN")  similar.push("BACTERIE");
                if(answer == "BACTERIE")  similar.push("BACTERIAN");

                if(answer == "GINYU")  similar.push("GINYUU");
                if(answer == "GINYUU")  similar.push("GINYU");

                if(answer == "C18")  { similar.push("C 18"); similar.push("C-18"); similar.push("LAZULI");}
                if(answer == "C 18")  { similar.push("C18"); similar.push("C-18"); similar.push("LAZULI");}
                if(answer == "C-18")  { similar.push("C 18"); similar.push("C18"); similar.push("LAZULI");}
                if(answer == "LAZULI")  { similar.push("C 18"); similar.push("C18"); similar.push("C-18");}
                
                if(answer == "C17")  { similar.push("C 17"); similar.push("C-17"); similar.push("LAPIS");}
                if(answer == "C 17")  { similar.push("C17"); similar.push("C-17"); similar.push("LAPIS");}
                if(answer == "C-17")  { similar.push("C 17"); similar.push("C17"); similar.push("LAPIS");}
                if(answer == "LAPIS")  { similar.push("C 17"); similar.push("C17"); similar.push("C-17");}

                if(answer == "PUAR")  similar.push("PLUME");
                if(answer == "PLUME")  similar.push("PUAR");

                if(answer == "ZABON")  similar.push("ZARBON");
                if(answer == "ZARBON")  similar.push("ZABON");

                if(answer == "DORIA")  similar.push("DODORIA");
                if(answer == "DODORIA")  similar.push("DORIA");

                if(answer == "PIKKON")  similar.push("PAIKUHAN");
                if(answer == "PAIKUHAN")  similar.push("PIKKON");

                if(answer == "FREEZER")  similar.push("FRIEZA");
                if(answer == "FRIEZA")  similar.push("FREEZER");

                if(answer == "BUU")  similar.push("BOO");
                if(answer == "BOO")  similar.push("BUU");

                if(answer == "LANFAN")  similar.push("RANFAN");
                if(answer == "RANFAN")  similar.push("LANFAN");

                if(answer == "BARTA")  similar.push("BURTER");
                if(answer == "BURTER")  similar.push("BARTA");

                if(answer == "KAFLA")  similar.push("KEFLA");
                if(answer == "KEFLA")  similar.push("KAFLA");

                if(answer == "CAULIFLA")  similar.push("CAULIFA");
                if(answer == "CAULIFA")  similar.push("CAULIFLA");

                if(answer == "NAM")  similar.push("NAMU");
                if(answer == "NAMU")  similar.push("NAM");

                if(answer == "SONGOHAN") { similar.push("SON GOHAN"); similar.push("GOHAN");}
                if(answer == "SON GOHAN")  similar.push("SONGOHAN");
                if(answer == "GOHAN")  { similar.push("SONGOHAN"); }

                if(answer == "SONGOTEN") { similar.push("SON GOTEN"); similar.push("GOTEN");}
                if(answer == "SON GOTEN" || answer == "GOTEN") { similar.push("SONGOTEN");}

                if(answer == "C16")  { similar.push("C 16"); similar.push("C-16");}
                if(answer == "C 16")  { similar.push("C16"); similar.push("C-16");}
                if(answer == "C-16")  { similar.push("C 16"); similar.push("C16");}

                if(answer == "C19")  { similar.push("C 19"); similar.push("C-19");}
                if(answer == "C 19")  { similar.push("C19"); similar.push("C-19");}
                if(answer == "C-19")  { similar.push("C 19"); similar.push("C19");}

                if(answer == "HERCULE")  { similar.push("SATAN"); similar.push("MISTER SATAN"); similar.push("MR SATAN");}
                if(answer == "SATAN" || answer == "MISTER SATAN")  { similar.push("HERCULE"); similar.push("MR SATAN");}
                if(answer == "MR SATAN") {similar.push("HERCULE"); similar.push("MISTER SATAN"); }

                if(answer == "TAO PAI PAI")  similar.push("TAOPAIPAI");
                if(answer == "TAOPAIPAI")  similar.push("TAO PAI PAI");

                if(answer == "C8")  { similar.push("C 8"); similar.push("C-8");}
                if(answer == "C 8")  { similar.push("C8"); similar.push("C-8");}
                if(answer == "C-8")  { similar.push("C 8"); similar.push("C8");}

                if(answer == "RECOME")  similar.push("RECOOME");
                if(answer == "RECOOME")  similar.push("RECOME");

                if(answer == "BARDOCK")  similar.push("BADDACK");
                if(answer == "BADDACK")  similar.push("BARDOCK");

                if(answer == "CHI CHI")  similar.push("CHICHI");
                if(answer == "CHICHI")  similar.push("CHI CHI");

                if(answer == "SPOPOVITCH")  similar.push("SPOPOVICH");
                if(answer == "SPOPOVICH")  similar.push("SPOPOVITCH");

                if(answer == "DABRA")  similar.push("DABURA");
                if(answer == "DABURA")  similar.push("DABRA");

                if(answer == "KAIOBITO")  similar.push("KIBITOSHIN");
                if(answer == "KIBITOSHIN")  similar.push("KAIOBITO");

                if(answer == "UUB")  similar.push("OOB");
                if(answer == "OOB")  similar.push("UUB");

                if(answer == "TORI")  similar.push("TORI");
                if(answer == "TORIYAMA")  similar.push("TORIYAMA");

                if(answer == "SLUG")  similar.push("SLUGG");
                if(answer == "SLUGG")  similar.push("SLUG");

                if(answer == "THALES")  similar.push("TURLES");
                if(answer == "TURLES")  similar.push("THALES");

                if(answer == "JANEMBA")  similar.push("JANENBA");
                if(answer == "JANENBA")  similar.push("JANEMBA");

                if(answer == "JEECE")  { similar.push("JEICE"); similar.push("JEESE");}
                if(answer == "JEESE")  { similar.push("JEICE"); similar.push("JEECE");}
                if(answer == "JEICE")  { similar.push("JEESE"); similar.push("JEECE");}

                if(answer == "C21")  { similar.push("C 21"); similar.push("C-21");}
                if(answer == "C 21")  { similar.push("C21"); similar.push("C-21");}
                if(answer == "C-21")  { similar.push("C 21"); similar.push("C21");}

                if(answer == "C15")  { similar.push("C 15"); similar.push("C-15");}
                if(answer == "C 15")  { similar.push("C15"); similar.push("C-15");}
                if(answer == "C-15")  { similar.push("C 15"); similar.push("C15");}

                if(answer == "C14")  { similar.push("C 14"); similar.push("C-14");}
                if(answer == "C 14")  { similar.push("C14"); similar.push("C-14");}
                if(answer == "C-14")  { similar.push("C 14"); similar.push("C14");}

                
                if(answer == "C13")  { similar.push("C 13"); similar.push("C-13");}
                if(answer == "C 13")  { similar.push("C13"); similar.push("C-13");}
                if(answer == "C-13")  { similar.push("C 13"); similar.push("C13");}

                if(answer == "C20")  { similar.push("C 20"); similar.push("C-20"); similar.push("DR GERO"); similar.push("GERO");}
                if(answer == "C 20")  { similar.push("C20"); similar.push("C-20"); similar.push("GERO"); similar.push("DR GERO");}
                if(answer == "C-20")  { similar.push("C 20"); similar.push("C20"); similar.push("DR GERO"); similar.push("GERO")}
                if(answer == "GERO" || answer == "DR GERO")  { similar.push("C 20"); similar.push("C20"); similar.push("C-20");}


                
            }


            if(theme == 'Naruto') {
                if(answer == "JIRAYA")  { similar.push("JIRAIA"); similar.push("JIRAIYA"); }
                if(answer == "JIRAIA")  { similar.push("JIRAYA"); similar.push("JIRAIYA"); }
                if(answer == "JIRAIYA")  { similar.push("JIRAIA"); similar.push("JIRAYA"); }

                if(answer == "ICHIBI") { similar.push("SHUKAKU");}
                if(answer == "SHUKAKU") { similar.push("ICHIBI");}

                if(answer == "KILLER B") { similar.push("KILLER BEE");}
                if(answer == "KILLER BEE") { similar.push("KILLER B");}

                if(answer == "NIBI") { similar.push("MATATABI");}
                if(answer == "MATATABI") { similar.push("NIBI");}
                
                if(answer == "SANBI") { similar.push("ISOBU");}
                if(answer == "ISOBU") { similar.push("SANBI");}

                if(answer == "SON GOKU") { similar.push("YONBI");}
                if(answer == "YONBI") { similar.push("SON GOKU");}

                if(answer == "GOBI") { similar.push("KOKUO");}
                if(answer == "KOKUO") { similar.push("GOBI");}

                if(answer == "SAIKEN") { similar.push("ROKUBI");}
                if(answer == "ROKUBI") { similar.push("SAIKEN");}

                if(answer == "NANABI") { similar.push("CHOMEI");}
                if(answer == "CHOMEI") { similar.push("NANABI");}

                if(answer == "GYUKI") { similar.push("HACHIBI");}
                if(answer == "HACHIBI") { similar.push("GYUKI");}

                if(answer == "KURAMA") { similar.push("KYUBI");}
                if(answer == "KYUBI") { similar.push("KURAMA");}
            }


            if(theme == 'One Piece') {

                if(answer == "MONKEY D LUFFY")  similar.push("MONKEY D. LUFFY");  
                if(answer == "MONKEY D. LUFFY")  similar.push("MONKEY D LUFFY");  

                if(answer == "LUCKY ROO")  similar.push("LUCKY ROUX"); 
                if(answer == "LUCKY ROUX")  similar.push("LUCKY ROO"); 

                if(answer == "BEN BECKMAN")  similar.push("BENN BECKMAN"); 
                if(answer == "BENN BECKMAN")  similar.push("BEN BECKMAN"); 

                if(answer == "AOKIJI")  similar.push("KUZAN");
                if(answer == "KUZAN")  similar.push("AOKIJI");

                if(answer == "BELL MERE")  similar.push("BELLMERE");
                if(answer == "BELLMERE")  similar.push("BELL MERE");

                if(answer == "BELL MERE")  { similar.push("BELLMERE"); similar.push("BELLMERE"); }
                if(answer == "BELLMERE")  { similar.push("BELL MERE"); similar.push("BELL MERE"); }

                if(answer == "CHARLOTTE LINLIN" || answer == "LINLIN")  { similar.push("BIG MOM"); }
                if(answer == "BIG MOM")  { similar.push("CHARLOTTE LINLIN"); similar.push("LINLIN"); }

                if(answer == "BARBE NOIRE")  { similar.push("TEACH"); similar.push("MARSHALL D TEACH"); similar.push("BLACKBEARD");  }
                if(answer == "TEACH" || answer == "MARSHALL D TEACH")  { similar.push("BARBE NOIRE"); similar.push("BLACKBEARD");  }
                if(answer == "BLACKBEARD")  { similar.push("BARBE NOIRE"); similar.push("TEACH"); similar.push("MARSHALL D TEACH");}

                if(answer == "BAGGY")  { similar.push("BUGGY"); }
                if(answer == "BUGGY")  { similar.push("BAGGY"); }

                if(answer == "CAESAR CLOWN" || answer == "CAESAR" )  { similar.push("CESAR CLOWN"); similar.push("CESAR"); }
                if(answer == "CESAR" ||  answer == "CESAR CLOWN")  { similar.push("CAESAR CLOWN"); similar.push("CAESAR");  }

                if(answer == "CHOUCHOU")  { similar.push("SHUSHU"); }
                if(answer == "SHUSHU")  { similar.push("CHOUCHOU"); }

                if(answer == "ENER")  { similar.push("ENERU"); }
                if(answer == "ENERU")  { similar.push("ENER"); }

                if(answer == "ISSHO")  { similar.push("FUJITORA"); }
                if(answer == "FUJITORA")  { similar.push("ISSHO"); }

                if(answer == "ARAMAKI")  { similar.push("RYOKUGYU"); }
                if(answer == "RYOKUGYU")  { similar.push("ARAMAKI"); }

                if(answer == "JABRA")  { similar.push("JABURA"); }
                if(answer == "JABURA")  { similar.push("JABRA"); }

                if(answer == "JINBE")  { similar.push("JINBEI"); }
                if(answer == "JINBEI")  { similar.push("JINBE"); }

                if(answer == "DONQUIXOTE ROSINANTE" || answer == "ROSINANTE" )  { similar.push("CORAZON"); }
                if(answer == "CORAZON")  { similar.push("DONQUIXOTE ROSINANTE"); similar.push("ROSINANTE");  }

                if(answer == "GOLD ROGER")  { similar.push("GOL D ROGER"); similar.push("GOL D. ROGER");  }
                if(answer == "GOL D ROGER")  { similar.push("GOLD ROGER"); similar.push("GOL D. ROGER"); }
                if(answer == "GOL D. ROGER")  { similar.push("GOLD ROGER"); similar.push("GOL D ROGER");}

                if(answer == "JAGUAR D SAUL")  { similar.push("JAGUAR D. SAUL"); }
                if(answer == "JAGUAR D. SAUL")  { similar.push("JAGUAR D SAUL");}

                if(answer == "KIZARU")  { similar.push("BORSALINO"); }
                if(answer == "BORSALINO")  { similar.push("KIZARU"); }

                if(answer == "MORGE")  { similar.push("MOHJI"); }
                if(answer == "MOHJI")  { similar.push("MORGE"); }

                if(answer == "NYON")  { similar.push("GLORIOSA"); }
                if(answer == "GLORIOSA")  { similar.push("NYON"); }

                if(answer == "SHAKKY")  { similar.push("SHAKUYAKU"); }
                if(answer == "SHAKUYAKU")  { similar.push("SHAKKY"); }

                if(answer == "THATCH")  { similar.push("SATCH"); }
                if(answer == "SATCH")  { similar.push("THATCH"); }

                if(answer == "MONKEY D DRAGON")  { similar.push("MONKEY D. DRAGON");  }
                if(answer == "MONKEY D. DRAGON")  { similar.push("MONKEY D DRAGON");  }

                if(answer == "MONKEY D GARP")  { similar.push("MONKEY D. GARP");  }
                if(answer == "MONKEY D. GARP")  { similar.push("MONKEY D GARP");  }

                if(answer == "PORTGAS D ACE")  { similar.push("PORTGAS D. ACE");  }
                if(answer == "PORTGAS D. ACE")  { similar.push("PORTGAS D ACE");  }

                if(answer == "PORTGAS D ROUGE")  { similar.push("PORTGAS D. ROUGE");  }
                if(answer == "PORTGAS D. ROUGE")  { similar.push("PORTGAS D ROUGE");  }

                if(answer == "MR 1")  { similar.push("DAZ BONEZ"); similar.push("DAZ BONES");  }
                if(answer == "DAZ BONES")  { similar.push("MR 1"); similar.push("DAZ BONEZ");  }
                if(answer == "DAZ BONEZ")  { similar.push("MR 1"); similar.push("DAZ BONES");  }

                if(answer == "MR 2")  { similar.push("BON CLAY"); }
                if(answer == "BON CLAY")  { similar.push("MR 2"); }

                if(answer == "MR 3")  { similar.push("GALDINO"); }
                if(answer == "GALDINO")  { similar.push("MR 3"); }

                if(answer == "SHIRYU")  { similar.push("SHILEW"); }
                if(answer == "SHILEW")  { similar.push("SHIRYU"); }

                if(answer == "VIOLA")  { similar.push("VIOLET"); }
                if(answer == "VIOLET")  { similar.push("VIOLA"); }

                if(answer == "T BONE")  { similar.push("T-BONE");  similar.push("T. BONE");}
                if(answer == "T-BONE")  { similar.push("T BONE"); similar.push("T. BONE"); }
                if(answer == "T. BONE")  { similar.push("T BONE"); similar.push("T-BONE"); }

                if(answer == "TRAFALGAR D WATER LAW")  { similar.push("TRAFALGAR LAW");  similar.push("TRAFALGAR D. WATER LAW");}
                if(answer == "TRAFALGAR LAW")  { similar.push("TRAFALGAR D WATER LAW");  similar.push("TRAFALGAR D. WATER LAW"); }
                if(answer == "TRAFALGAR D. WATER LAW")  { similar.push("TRAFALGAR D WATER LAW");  similar.push("TRAFALGAR LAW"); }

                if(answer == "EDWARD NEWGATE" || answer == "NEWGATE")  { similar.push("BARBE BLANCHE");  similar.push("WHITEBEARD");}
                if(answer == "WHITEBEARD")  { similar.push("BARBE BLANCHE"); similar.push("EDWARD NEWGATE"); }
                if(answer == "BARBE BLANCHE")  { similar.push("WHITEBEARD"); similar.push("EDWARD NEWGATE"); }

                if(answer == "ZEPHYR")  { similar.push("Z"); }
                if(answer == "Z")  { similar.push("ZEPHYR"); }

                if(answer == "ICEBERG")  { similar.push("ICEBURG"); }
                if(answer == "ICEBURG")  { similar.push("ICEBERG"); }

                if(answer == "HATCHAN")  { similar.push("OCTO"); similar.push("HACHI"); }
                if(answer == "OCTO")  { similar.push("HATCHAN"); similar.push("HACHI"); }
                if(answer == "HACHI")  { similar.push("OCTO"); similar.push("HATCHAN");  }

                if(answer == "OARS" || answer == "OARS JR")  { similar.push("OZ"); similar.push("OZ JR");}
                if(answer == "OZ" || answer == "OZ JR")  { similar.push("OARS"); similar.push("OARS JR");}

                if(answer == "KOHZA")  { similar.push("KOZA"); }
                if(answer == "KOZA")  { similar.push("KOHZA"); }

                if(answer == "JOZU")  { similar.push("JOZ"); }
                if(answer == "JOZ")  { similar.push("JOZU"); }

                if(answer == "MARGARET")  { similar.push("MARGUERITE"); }
                if(answer == "MARGUERITE")  { similar.push("MARGARET"); }
                
                if(answer == "KAIDO")  { similar.push("KAIDOU"); }
                if(answer == "KAIDOU")  { similar.push("KAIDO"); }

                if(answer == "SQUARD")  { similar.push("SQUARDO"); }
                if(answer == "SQUARDO")  { similar.push("SQUARD"); }

                if(answer == "JACKSONBANNER")  { similar.push("JACKSON"); }
                if(answer == "JACKSON")  { similar.push("JACKSONBANNER"); }

                if(answer == "CHADROS HIGELYGES")  { similar.push("BARBE BRUNE");  similar.push("CHAHIGE");}
                if(answer == "BARBE BRUNE")  { similar.push("CHAHIGE"); similar.push("CHADROS HIGELYGES"); }
                if(answer == "CHAHIGE")  { similar.push("BARBE BRUNE"); similar.push("CHADROS HIGELYGES"); }

                if(answer == "O KIKU" || answer == "KIKU")  { similar.push("KIKUNOJO"); }
                if(answer == "KIKUNOJO")  { similar.push("KIKU"); similar.push("O KIKU");}

                if(answer == "KOZUKI HIYORI" || answer == "HIYORI")  { similar.push("KOMURASAKI"); }
                if(answer == "KOMURASAKI")  { similar.push("KOZUKI HIYORI"); similar.push("HIYORI");}

                if(answer == "ASHURA DOJI" || answer == "DOJI")  { similar.push("SHUTENMARU"); }
                if(answer == "SHUTENMARU")  { similar.push("DOJI"); similar.push("ASHURA DOJI");}

                if(answer == "HYOGORO")  { similar.push("HYOUGOROU"); similar.push("HYOGOROU");}
                if(answer == "HYOUGOROU")  { similar.push("HYOGORO"); similar.push("HYOGOROU");}
                if(answer == "HYOGOROU")  { similar.push("HYOGORO"); similar.push("HYOUGOROU");}

                if(answer == "KYOSHIRO")  { similar.push("DENJIRO"); similar.push("KYOUSHIROU");}
                if(answer == "KYOUSHIROU")  { similar.push("DENJIRO"); similar.push("KYOSHIRO");}
                if(answer == "DENJIRO")  { similar.push("KYOUSHIROU"); similar.push("KYOSHIRO");}
                
                if(answer == "KILLER")  { similar.push("KAMAZOU"); }
                if(answer == "KAMAZOU")  { similar.push("KILLER"); }
                





                
            }


            if(theme == 'Hunter x Hunter') {
                if(answer == "GON FREECS") { similar.push("GON FREECSS");}
                if(answer == "GON FREECSS") { similar.push("GON FREECS");}

                if(answer == "GING FREECS") { similar.push("GING FREECSS");}
                if(answer == "GING FREECSS") { similar.push("GING FREECS");}

                if(answer == "MITO FREECS") { similar.push("MITO FREECSS");}
                if(answer == "MITO FREECSS") { similar.push("MITO FREECS");}

                if(answer == "ABE FREECS") { similar.push("ABE FREECSS");}
                if(answer == "ABE FREECSS") { similar.push("ABE FREECS");}

                if(answer == "KILLUA ZOLDYCK") { similar.push("KIRUA ZOLDYCK"); similar.push("KIRUA ZOLDIK"); similar.push("KILLUA ZOLDIK"); similar.push("KIRUA");}
                if(answer == "KILLUA ZOLDIK") { similar.push("KILLUA ZOLDYCK"); similar.push("KIRUA ZOLDIK"); similar.push("KIRUA ZOLDYCK"); similar.push("KIRUA");}
                if(answer == "KIRUA ZOLDIK") { similar.push("KILLUA ZOLDYCK"); similar.push("KILLUA ZOLDIK"); similar.push("KIRUA ZOLDYCK"); similar.push("KILLUA");}
                if(answer == "KIRUA ZOLDYCK") { similar.push("KILLUA ZOLDYCK"); similar.push("KILLUA ZOLDIK"); similar.push("KIRUA ZOLDYCK"); similar.push("KILLUA");}

                if(answer == "KILLUA") { similar.push("KIRUA"); similar.push("KIRUA ZOLDYCK"); similar.push("KIRUA ZOLDIK");}
                if(answer == "KIRUA") { similar.push("KILLUA"); similar.push("KILLUA ZOLDYCK"); similar.push("KILLUA ZOLDIK");}

                if(answer == "MILLUKI ZOLDYCK") { similar.push("MIRUKI ZOLDYCK"); similar.push("MIRUKI ZOLDIK"); similar.push("MILLUKI ZOLDIK"); similar.push("MIRUKI");}
                if(answer == "MILLUKI ZOLDIK") { similar.push("MILLUKI ZOLDYCK"); similar.push("MIRUKI ZOLDIK"); similar.push("MIRUKI ZOLDYCK"); similar.push("MIRUKI");}
                if(answer == "MIRUKI ZOLDIK") { similar.push("MILLUKI ZOLDYCK"); similar.push("MILLUKI ZOLDIK"); similar.push("MIRUKI ZOLDYCK"); similar.push("MILLUKI");}
                if(answer == "MIRUKI ZOLDYCK") { similar.push("MILLUKI ZOLDYCK"); similar.push("MILLUKI ZOLDIK"); similar.push("MIRUKI ZOLDYCK"); similar.push("MILLUKI");}

                if(answer == "MILLUKI") { similar.push("MIRUKI"); similar.push("MIRUKI ZOLDYCK"); similar.push("MIRUKI ZOLDIK");}
                if(answer == "MIRUKI") { similar.push("MILLUKI"); similar.push("MILLUKI ZOLDYCK"); similar.push("MILLUKI ZOLDIK");}

                if(answer == "ZENO ZOLDIK") { similar.push("ZENO ZOLDYCK"); }
                if(answer == "ZENO ZOLDYCK") { similar.push("ZENO ZOLDIK"); }

                if(answer == "ALLUKA ZOLDYCK") { similar.push("ARUKA ZOLDYCK"); similar.push("ARUKA ZOLDIK"); similar.push("ALLUKA ZOLDIK"); similar.push("ARUKA");}
                if(answer == "ALLUKA ZOLDIK") { similar.push("ALLUKA ZOLDYCK"); similar.push("ARUKA ZOLDIK"); similar.push("ARUKA ZOLDYCK"); similar.push("ARUKA");}
                if(answer == "ARUKA ZOLDIK") { similar.push("ALLUKA ZOLDYCK"); similar.push("ALLUKA ZOLDIK"); similar.push("ARUKA ZOLDYCK"); similar.push("ALLUKA");}
                if(answer == "ARUKA ZOLDYCK") { similar.push("ALLUKA ZOLDYCK"); similar.push("ALLUKA ZOLDIK"); similar.push("ARUKA ZOLDYCK"); similar.push("ALLUKA");}

                if(answer == "ALLUKA") { similar.push("ARUKA"); similar.push("ARUKA ZOLDYCK"); similar.push("ARUKA ZOLDIK");}
                if(answer == "ARUKA") { similar.push("ALLUKA"); similar.push("ALLUKA ZOLDYCK"); similar.push("ALLUKA ZOLDIK");}

                if(answer == "MAHA ZOLDIK") { similar.push("MAHA ZOLDYCK"); }
                if(answer == "MAHA ZOLDYCK") { similar.push("MAHA ZOLDIK"); }

                if(answer == "KALLUTO ZOLDYCK") { similar.push("KARUTO ZOLDYCK"); similar.push("KARUTO ZOLDIK"); similar.push("KALLUTO ZOLDIK"); similar.push("KARUTO");}
                if(answer == "KALLUTO ZOLDIK") { similar.push("KALLUTO ZOLDYCK"); similar.push("KARUTO ZOLDIK"); similar.push("KARUTO ZOLDYCK"); similar.push("KARUTO");}
                if(answer == "KARUTO ZOLDIK") { similar.push("KALLUTO ZOLDYCK"); similar.push("KALLUTO ZOLDIK"); similar.push("KARUTO ZOLDYCK"); similar.push("KALLUTO");}
                if(answer == "KARUTO ZOLDYCK") { similar.push("KALLUTO ZOLDYCK"); similar.push("KALLUTO ZOLDIK"); similar.push("KARUTO ZOLDYCK"); similar.push("KALLUTO");}

                if(answer == "KALLUTO") { similar.push("KARUTO"); similar.push("KARUTO ZOLDYCK"); similar.push("KARUTO ZOLDIK");}
                if(answer == "KARUTO") { similar.push("KALLUTO"); similar.push("KALLUTO ZOLDYCK"); similar.push("KALLUTO ZOLDIK");}

                if(answer == "SILVA ZOLDIK") { similar.push("SILVA ZOLDYCK"); }
                if(answer == "SILVA ZOLDYCK") { similar.push("SILVA ZOLDIK"); }

                if(answer == "ZZIGG ZOLDIK") { similar.push("ZZIGG ZOLDYCK"); }
                if(answer == "ZZIGG ZOLDYCK") { similar.push("ZZIGG ZOLDIK"); }

                if(answer == "UVOGIN") { similar.push("UVOGUINE"); }
                if(answer == "UVOGUINE") { similar.push("UVOGIN"); }

                if(answer == "PEGGY") { similar.push("PEGUI"); }
                if(answer == "PEGUI") { similar.push("PEGGY"); }

                if(answer == "LEORIO") { similar.push("YOUPI"); similar.push("LEORIO"); similar.push("LEORIO"); }
                if(answer == "LEOLIO" || answer == "LEOLIO PARADINAITO")  similar.push("LEORIO"); 

                if(answer == "MELEOLON") { similar.push("MELEORON"); }
                if(answer == "MELEORON") { similar.push("MELEOLON"); }

                if(answer == "BUROVUTA") { similar.push("BLOSTER"); }
                if(answer == "BLOSTER") { similar.push("BUROVUTA"); }

                if(answer == "POUF") { similar.push("SHAIAPOUF"); }
                if(answer == "SHAIAPOUF") { similar.push("POUF"); }

                if(answer == "YUPI") { similar.push("YOUPI"); similar.push("MONTUTYUPI"); }
                if(answer == "YOUPI") { similar.push("YUPI"); similar.push("MONTUTYUPI"); }
                if(answer == "MONTUTYUPI") { similar.push("YUPI"); similar.push("YOUPI"); }

                if(answer == "KURORO LUCIFER" || answer == "KURORO") { similar.push("CHROLLO LUCILFER"); similar.push("CHROLLO");  }
                if(answer == "CHROLLO LUCILFER" || answer == "CHROLLO") { similar.push("KURORO LUCIFER"); similar.push("KURORO");  }

                if(answer == "CANARY") { similar.push("KANARIA"); }
                if(answer == "KANARIA") { similar.push("CANARY"); }

                if(answer == "PITOU") { similar.push("PITO");similar.push("NEFERUPITO");similar.push("NEFERPITOU");}
                if(answer == "PITO") { similar.push("PITOU");similar.push("NEFERUPITO");similar.push("NEFERPITOU");}
                if(answer == "NEFERUPITO") { similar.push("PITO");similar.push("PITOU");similar.push("NEFERPITOU");}
                if(answer == "NEFERPITOU") { similar.push("NEFERUPITO");similar.push("PITO");similar.push("PITOU");}

                if(answer == "KIKYO ZOLDIK") { similar.push("KIKYO ZOLDYCK"); }
                if(answer == "KIKYO ZOLDYCK") { similar.push("KIKYO ZOLDIK"); }

                if(answer == "ILLUMI ZOLDYCK") { similar.push("IRUMI ZOLDYCK"); similar.push("IRUMI ZOLDIK"); similar.push("ILLUMI ZOLDIK"); similar.push("IRUMI");}
                if(answer == "ILLUMI ZOLDIK") { similar.push("ILLUMI ZOLDYCK"); similar.push("IRUMI ZOLDIK"); similar.push("IRUMI ZOLDYCK"); similar.push("IRUMI");}
                if(answer == "IRUMI ZOLDIK") { similar.push("ILLUMI ZOLDYCK"); similar.push("ILLUMI ZOLDIK"); similar.push("IRUMI ZOLDYCK"); similar.push("ILLUMI");}
                if(answer == "IRUMI ZOLDYCK") { similar.push("ILLUMI ZOLDYCK"); similar.push("ILLUMI ZOLDIK"); similar.push("IRUMI ZOLDYCK"); similar.push("ILLUMI");}

                if(answer == "ILLUMI") { similar.push("IRUMI"); similar.push("IRUMI ZOLDYCK"); similar.push("IRUMI ZOLDIK");}
                if(answer == "IRUMI") { similar.push("ILLUMI"); similar.push("ILLUMI ZOLDYCK"); similar.push("ILLUMI ZOLDIK");}

                if(answer == "KNOV") { similar.push("NOVU");}
                if(answer == "NOVU") { similar.push("KNOV");}

                if(answer == "KITE") { similar.push("KAITO");}
                if(answer == "KAITO") { similar.push("KITE");}

                if(answer == "POKKLE") { similar.push("POKKURU");}
                if(answer == "POKKURU") { similar.push("POKKLE");}

                if(answer == "SHALNARK") { similar.push("SHARNALK");}
                if(answer == "SHARNALK") { similar.push("SHALNARK");}

                if(answer == "TZESUGERA") { similar.push("TSEZUGERA");}
                if(answer == "TSEZUGERA") { similar.push("TZESUGERA");}

                if(answer == "LIST") { similar.push("RIST");}
                if(answer == "RIST") { similar.push("LIST");}

                if(answer == "CLUCK") { similar.push("KURUKKU");}
                if(answer == "KURUKKU") { similar.push("CLUCK");}

                if(answer == "GEL") { similar.push("GELU");}
                if(answer == "GELU") { similar.push("GEL");}

                if(answer == "NICOLAS") { similar.push("NICOLA");}
                if(answer == "NICOLA") { similar.push("NICOLAS");}

                if(answer == "MOREL MCCARNATHY" || answer == "MOREL") { similar.push("MORAU"); similar.push("MORAU MCCARNATHY");}
                if(answer == "MORAU MCCARNATHY" || answer == "MORAU") { similar.push("MOREL"); similar.push("MOREL MCCARNATHY");}

                if(answer == "PAM SHIBERIA" || answer == "PAM") { similar.push("PAMU"); similar.push("PALM"); similar.push("PAMU SHIBERIA");}
                if(answer == "PAMU SHIBERIA" || answer == "PAMU") { similar.push("PALM"); similar.push("PAM"); similar.push("PAM SHIBERIA");}
                if(answer == "PALM") { similar.push("PAM"); similar.push("PAM SHIBERIA"); similar.push("PAMU"); similar.push("PAMU SHIBERIA");}

                if(answer == "SPIN" || answer == "SPIN CRO") { similar.push("SPINNER"); similar.push("SPINNER CLOW");}
                if(answer == "SPINNER" || answer == "SPINNER CLOW") { similar.push("SPIN"); similar.push("SPIN CRO");}


            }


            if(theme == 'Attaque des Titans') {
                if(answer == "EREN JAGER") { similar.push("EREN YEAGER"); similar.push("EREN JAEGER");}
                if(answer == "EREN YEAGER") { similar.push("EREN JAGER"); similar.push("EREN JAEGER");}
                if(answer == "EREN JAEGER") { similar.push("EREN JAGER"); similar.push("EREN YEAGER");}

                if(answer == "CARLA JAGER") { similar.push("CARLA YEAGER"); similar.push("CARLA JAEGER");}
                if(answer == "CARLA YEAGER") { similar.push("CARLA JAGER"); similar.push("CARLA JAEGER");}
                if(answer == "CARLA JAEGER") { similar.push("CARLA JAGER"); similar.push("CARLA YEAGER");}

                if(answer == "GRISHA JAGER") { similar.push("GRISHA YEAGER"); similar.push("GRISHA JAEGER");}
                if(answer == "GRISHA YEAGER") { similar.push("GRISHA JAGER"); similar.push("GRISHA JAEGER");}
                if(answer == "GRISHA JAEGER") { similar.push("GRISHA JAGER"); similar.push("GRISHA YEAGER");}

                if(answer == "ZEKE JAGER" || answer == "ZEKE") { similar.push("ZEKE YEAGER"); similar.push("ZEKE JAEGER"); similar.push("SIEG JAEGER");  similar.push("SIEG YEAGER"); similar.push("SIEG JAEGER");  similar.push("SIEG");}
                if(answer == "ZEKE YAEGER") { similar.push("ZEKE JAGER"); similar.push("ZEKE JAEGER"); similar.push("SIEG JAEGER");  similar.push("SIEG YEAGER"); similar.push("SIEG JAGER");  similar.push("SIEG");}
                if(answer == "ZEKE JAEGER") { similar.push("ZEKE JAGER"); similar.push("ZEKE YAEGER"); similar.push("SIEG JAEGER");  similar.push("SIEG YEAGER"); similar.push("SIEG JAGER");  similar.push("SIEG");}
                if(answer == "SIEG YEAGER" || answer == "SIEG") { similar.push("ZEKE YEAGER"); similar.push("ZEKE JAEGER"); similar.push("SIEG JAEGER");  similar.push("SIEG JAGER"); similar.push("ZEKE JAEGER");  similar.push("ZEKE");}
                if(answer == "SIEG JAEGER" ) { similar.push("ZEKE JAEGER"); similar.push("ZEKE YEAGER"); similar.push("ZEKE JAGER"); similar.push("SIEG YAEGER");  similar.push("SIEG JAGER");   similar.push("ZEKE");}
                if(answer == "SIEG JAGER" ) { similar.push("ZEKE JAEGER"); similar.push("ZEKE YEAGER"); similar.push("ZEKE JAGER"); similar.push("SIEG YAEGER");  similar.push("SIEG JAEGER");   similar.push("ZEKE");}

                if(answer == "ARMIN ARLELT") { similar.push("ARMIN ARLERT");}
                if(answer == "ARMIN ARLERT") { similar.push("ARMIN ARLELT");}

                if(answer == "GABY BRAUN") { similar.push("GABI BRAUN"); similar.push("GABI");}
                if(answer == "GABI BRAUN") { similar.push("GABY BRAUN"); similar.push("GABY");}

                if(answer == "PIECK FINGER" || answer == "PIECK") { similar.push("PEAK FINGER"); similar.push("PEAK");}
                if(answer == "PEAK FINGER" || answer == "PEAK") { similar.push("PIECK FINGER"); similar.push("PIECK");}

                if(answer == "FROCK" || answer == "FROCK FORSTER") { similar.push("FLOCH FORSTER"); similar.push("FLOCH");}
                if(answer == "FLOCH FORSTER" || answer == "FLOCH") { similar.push("FROCK FORSTER"); similar.push("FROCK");}

                if(answer == "FAYE JAGER") { similar.push("FAYE YEAGER"); similar.push("FAYE JAEGER");}
                if(answer == "FAYE YEAGER") { similar.push("FAYE JAGER"); similar.push("FAYE JAEGER");}
                if(answer == "FAYE JAEGER") { similar.push("FAYE YEAGER"); similar.push("FAYE JAGER");}

                if(answer == "HANGE ZOE" || answer == "HANGE") { similar.push("HANSI ZOE"); similar.push("HANJI ZOE"); similar.push("HANSI"); similar.push("HANJI");}
                if(answer == "HANSI ZOE" || answer == "HANSI") { similar.push("HANGE ZOE"); similar.push("HANJI ZOE"); similar.push("HANGE");  similar.push("HANJI");}
                if(answer == "HANJI ZOE" || answer == "HANJI") { similar.push("HANGE ZOE"); similar.push("HANSI ZOE"); similar.push("HANGE"); similar.push("HANSI");}

                if(answer == "CONNY SPRINGER" || answer == "CONNY") { similar.push("CONNIE SPRINGER"); similar.push("CONNIE");}
                if(answer == "CONNIE SPRINGER" || answer == "CONNIE") { similar.push("CONNY SPRINGER"); similar.push("CONNY");}

                if(answer == "DINA FRITZ" || answer == "DINA") { similar.push("DINAH"); similar.push("DINAH FRITZ"); similar.push("DINA"); similar.push("DINA FRITZ");}
                if(answer == "DINAH FRITZ" || answer == "DINAH") { similar.push("DINA"); similar.push("DINA FRITZ"); similar.push("DINAH");  similar.push("DINAH FRITZ");}

                if(answer == "LEVI") { similar.push("LIVAI");}
                if(answer == "LIVAI") { similar.push("LEVI");}

                if(answer == "KING FRITZ") { similar.push("ROI FRITZ");}
                if(answer == "ROI FRITZ") { similar.push("KING FRITZ");}

                if(answer == "CHRISTA LENZ" || answer == "CHRISTA") { similar.push("HISTORIA"); similar.push("HISTORIA REISS");}
                if(answer == "HISTORIA REISS" || answer == "HISTORIA") { similar.push("CHRISTA LENZ"); similar.push("CHRISTA");}

            }

            if(theme == 'Pokemon') {
                if(answer == "HO-OH")  similar.push("HO OH");
                if(answer == "HO OH")  similar.push("HO-OH");

                if(answer == "PORYGON-Z")  similar.push("PORYGON Z");
                if(answer == "PORYGON Z")  similar.push("PORYGON-Z");

                if(answer == "LANCE") similar.push('PETER');
                if(answer == "PETER") similar.push('LANCE');

                if(answer == "ASH") similar.push('SACHA');
                if(answer == "SACHA") similar.push('ASH');

            }


            if(theme == 'Bleach') {
                if(answer == "KUROSAKI ICHIGO")  similar.push("ICHIGO KUROSAKI");
                if(answer == "ICHIGO KUROSAKI")  similar.push("KUROSAKI ICHIGO");

                if(answer == "KUROSAKI ISSHIN")  similar.push("ISSHIN KUROSAKI");
                if(answer == "ISSHIN KUROSAKI")  similar.push("KUROSAKI ISSHIN");

                if(answer == "RENJI ABARAI")  similar.push("ABARAI RENJI");
                if(answer == "ABARAI RENJI")  similar.push("RENJI ABARAI");

                if(answer == "URAHARA") similar.push("KISUKE");
                if(answer == "KISUKE") similar.push("URAHARA");

                if(answer == "YAMAMOTO") similar.push("GENRYUSAI");
                if(answer == "GENRYUSAI") similar.push("YAMAMOTO");

                if(answer == "INOUE ORIHIME")  similar.push("ORIHIME INOUE");
                if(answer == "ORIHIME INOUE")  similar.push("INOUE ORIHIME");
                if(answer == "INOUE") similar.push("ORIHIME");
                if(answer == "ORIHIME") similar.push("INOUE");

                if(answer == "SADO YASUTORA" || answer == "SADO")  similar.push("CHAD");
                if(answer == "CHAD") { similar.push("SADO YASUTORA"); similar.push("SADO");  }

                if(answer == "ISHIDA URYU")  similar.push("URYU ISHIDA");
                if(answer == "URYU ISHIDA")  similar.push("ISHIDA URYU");
                if(answer == "URYU") similar.push("ISHIDA");
                if(answer == "ISHIDA") similar.push("URYU");

                if(answer == "HITSUGAYA TOSHIRO")  similar.push("TOSHIRO HITSUGAYA");
                if(answer == "TOSHIRO HITSUGAYA")  similar.push("HITSUGAYA TOSHIRO");
                if(answer == "TOSHIRO") similar.push("HITSUGAYA");
                if(answer == "HITSUGAYA") similar.push("TOSHIRO");

                if(answer == "SHINJI HIRAKO")  similar.push("HIRAKO SHINJI");
                if(answer == "HIRAKO SHINJI")  similar.push("SHINJI HIRAKO");
                if(answer == "SHINJI") similar.push("HIRAKO");
                if(answer == "HIRAKO") similar.push("SHINJI");

                if(answer == "RANGIKU MATSUMOTO")  similar.push("MATSUMOTO RANGIKU");
                if(answer == "MATSUMOTO RANGIKU")  similar.push("RANGIKU MATSUMOTO");
                if(answer == "MATSUMOTO") similar.push("RANGIKU");
                if(answer == "RANGIKU") similar.push("MATSUMOTO");

                if(answer == "UCHIDA HACHIGEN" || answer == "UCHIDA")  similar.push("HACHI");
                if(answer == "HACHI")  { similar.push("UCHIDA HACHIGEN"); similar.push("HACHIGEN"); }

                if(answer == "ICHIMARU GIN")  similar.push("GIN ICHIMARU");
                if(answer == "GIN ICHIMARU")  similar.push("ICHIMARU GIN");

                if(answer == "SHIBA KAIEN")  similar.push("KAIEN SHIBA");
                if(answer == "KAIEN SHIBA")  similar.push("SHIBA KAIEN");

                if(answer == "HISAGI")  similar.push("HISAGI");
                if(answer == "SHUHEI")  similar.push("SHUHEI");

                if(answer == "APACHE")  similar.push("APACCI");
                if(answer == "APACCI")  similar.push("APACHE");

                if(answer == "KIRINJI")  similar.push("TENJIRO");
                if(answer == "TENJIRO")  similar.push("KIRINJI");

                if(answer == "KIRIO")  similar.push("HIKIFUNE");
                if(answer == "HIKIFUNE")  similar.push("KIRIO");

                if(answer == "ULQUIORRA SCHIFFER")  similar.push("ULQUIORRA CIFER");
                if(answer == "ULQUIORRA CIFER")  similar.push("ULQUIORRA SCHIFFER");

                if(answer == "BAZZARD BLACK")  { similar.push("BAZZ B"); similar.push("BAZZ-B"); }
                if(answer == "BAZZ B")  { similar.push("BAZZ-B"); similar.push("BAZZARD BLACK"); }
                if(answer == "BAZZ-B")  { similar.push("BAZZ B"); similar.push("BAZZARD BLACK"); }
                

                if(answer == "SUNG SUN")  similar.push("SUNG-SUN");
                if(answer == "SUNG-SUN")  similar.push("SUNG SUN");

                if(answer == "ROI DES ESPRITS")  { similar.push("ROI SPIRITUEL"); similar.push("SOUL KING"); }
                if(answer == "ROI SPIRITUEL")  { similar.push("ROI DES ESPRITS"); similar.push("SOUL KING"); }
                if(answer == "SOUL KING")  { similar.push("ROI SPIRITUEL"); similar.push("ROI DES ESPRITS"); }

                if(answer == "SZAYELAPORRO GRANDZ" || answer == "SZAYELAPORRO")  similar.push("SZAYEL");
                if(answer == "SZAYEL")  { similar.push("SZAYELAPORRO"); similar.push("SZAYELAPORRO GRANDZ"); }

                if(answer == "NELLIEL TU ODELSCHWANCK" || answer == "NELLIEL")  { similar.push("NEL"); similar.push("NEL TU"); }
                if(answer == "NEL TU" || answer == "NEL") { similar.push("NELLIEL TU ODELSCHWANCK"); similar.push("NELLIEL"); }

                if(answer == "PESSHE GATIISHE")  { similar.push("PESCHE GUATICHE"); similar.push("PESCHE"); }
                if(answer == "PESCHE GUATICHE")  { similar.push("PESSHE GATIISHE"); similar.push("PESSHE"); }
                if(answer == "PESCHE") similar.push("PESSHE");
                if(answer == "PESSHE") similar.push("PESCHE");

                if(answer == "TIER HARRIBEL")  { similar.push("TIA HALLIBEL"); similar.push("HALLIBEL"); }
                if(answer == "TIA HALLIBEL")  { similar.push("TIER HARRIBEL"); similar.push("HARRIBEL"); }
                if(answer == "HALLIBEL") similar.push("HARRIBEL");
                if(answer == "HARRIBEL") similar.push("HALLIBEL");



            }


            if(theme == 'Demon Slayer') {
                if(answer == "KAMADO TANJIRO")  similar.push("TANJIRO KAMADO");
                if(answer == "TANJIRO KAMADO")  similar.push("KAMADO TANJIRO");

                if(answer == "GIYU TOMIOKA" || answer == "GIYU")  { similar.push("GIYUU TOMIOKA"); similar.push("GIYUU"); similar.push("TOMIOKA"); }
                if(answer == "GIYUU TOMIOKA" || answer == "GIYUU")  { similar.push("GIYU TOMIOKA"); similar.push("GIYU"); similar.push("TOMIOKA"); }
                if(answer == "TOMIOKA")  { similar.push("GIYU"); similar.push("GIYUU"); similar.push("GIYUU TOMIOKA"); similar.push("GIYU TOMIOKA"); }
            }


            if(theme == 'Reborn') {
                if(answer == "GIOTTO")  similar.push("VONGOLA PRIMO");
                if(answer == "VONGOLA PRIMO")  similar.push("GIOTTO");
                
                if(answer == "SIMORA")  similar.push("VONGOLA SESTO");
                if(answer == "VONGOLA SESTO")  similar.push("SIMORA");

                if(answer == "VONGOLA SETTIMO")  similar.push("FABIO");
                if(answer == "FABIO")  similar.push("VONGOLA SETTIMO");

                if(answer == "VONGOLA OTTAVO")  similar.push("DANIELA");
                if(answer == "DANIELA")  similar.push("VONGOLA OTTAVO");

                if(answer == "VONGOLA NONO")  similar.push("TIMOTEO");
                if(answer == "TIMOTEO")  similar.push("VONGOLA NONO");

                if(answer == "VONGOLA NONO")  similar.push("TIMOTEO");
                if(answer == "TIMOTEO")  similar.push("VONGOLA NONO");

                if(answer == "VONGOLA DECIMO")  { similar.push("TSUNAYOSHI SAWADA"); similar.push("TSUNA"); similar.push("SAWADA"); }
                if(answer == "TSUNAYOSHI SAWADA" || answer == "SAWADA")  { similar.push("TSUNA"); similar.push("VONGOLA DECIMO"); }
                if(answer == "TSUNA")  { similar.push("SAWADA"); similar.push("TSUNAYOSHI SAWADA"); similar.push("VONGOLA DECIMO"); }

                if(answer == "DEMON SPADE")  similar.push("DAEMON SPADE");
                if(answer == "DAEMON SPADE")  similar.push("DEMON SPADE");

                if(answer == "I PIN")  similar.push("I-PIN");
                if(answer == "I-PIN")  similar.push("I PIN");

                if(answer == "VONGOLA SETTIMO")  similar.push("FABIO");
                if(answer == "FABIO")  similar.push("VONGOLA SETTIMO");

                if(answer == "VIPER")  similar.push("MAMMON");
                if(answer == "MAMMON")  similar.push("VIPER");

                if(answer == "MM")  { similar.push("M.M"); similar.push("M M");}
                if(answer == "M.M")  { similar.push("M M"); similar.push("MM"); }
                if(answer == "M M")  { similar.push("MM"); similar.push("M.M"); }

            }

            if(theme == 'Kpop') {
                if(answer == "SUA")  similar.push("SU A");
                if(answer == "SU A")  similar.push("SUA");

                if(answer == "DO")  similar.push("D.O.");
                if(answer == "D.O.")  similar.push("DO");

                if(answer == "G DRAGON")  similar.push("G-DRAGON");
                if(answer == "G-DRAGON")  similar.push("G DRAGON");
            }

            if(theme == 'Death Note') {
                if(answer == "KIRA")  {similar.push("LIGHT"); similar.push("LIGHT YAGAMI");}
                if(answer == "LIGHT" || answer == "LIGHT YAGAMI")  similar.push("KIRA");

                if(answer == "MISA MISA")  similar.push("AMANE MISA");
                if(answer == "AMANE MISA" || answer == "MISA")  similar.push("MISA MISA");

                if(answer == "L" || answer == "L LAWLIET") similar.push("RYUSAKI"); 
                if(answer == "RYUSAKI")  {similar.push("L LAWLIET"); similar.push("L"); }

                if(answer == "NATE RIVER" || answer == "NATE") {similar.push("NEAR"); similar.push("N"); }
                if(answer == "NEAR")  {similar.push("NATE RIVER"); similar.push("NATE"); similar.push("N"); }
                if(answer == "N")  {similar.push("NATE RIVER"); similar.push("NATE"); similar.push("NEAR"); }

                if(answer == "MIHAEL KEEHL" || answer == "MIHAEL") {similar.push("M"); similar.push("MELLO"); }
                if(answer == "MELLO")  {similar.push("MIHAEL KEEHL"); similar.push("MIHAEL"); similar.push("M"); }
                if(answer == "M")  {similar.push("MIHAEL KEEHL"); similar.push("MIHAEL"); similar.push("MELLO"); }

                if(answer == "QUILLSH WAMMY" || answer == "QUILLSH") similar.push("WATARI");
                if(answer == "WATARI")  {similar.push("QUILLSH WAMMY"); similar.push("QUILLSH"); }

                if(answer == "THIERRY MORELLO" || answer == "THIERRY") similar.push("AIBER");
                if(answer == "AIBER")  {similar.push("THIERRY MORELLO"); similar.push("THIERRY"); }

                if(answer == "ROI DE LA MORT")  similar.push('KING OF DEATH')
                if(answer == "KING OF DEATH")  similar.push('ROI DE LA MORT')

                if(answer == "SHIDOH")  similar.push('SIDOH')
                if(answer == "SIDOH")  similar.push('SHIDOH')

                if(answer == "MATT")  similar.push('MAIL')
                if(answer == "MAIL")  similar.push('MATT')

                if(answer == "MERRY KENWOOD" || answer == "MERRY")  similar.push('MARY')
                if(answer == "MARY")  {similar.push("MERRY KENWOOD"); similar.push("MERRY"); }

            }


            if(theme == 'Fairy Tail') {
                if(answer == "LAXUS DREYAR" || answer == 'LAXUS')  {similar.push("LUXUS"); similar.push("LUXUS DREYAR");}
                if(answer == "LUXUS" || answer == 'LUXUS DREYAR')  {similar.push("LAXUS DREYAR"); similar.push("LAXUS");}

                if(answer == "GREY" || answer == 'GREY FULLBUSTER')  {similar.push("GRAY FULLBUSTER"); similar.push("GRAY");}
                if(answer == "GRAY" || answer == 'GRAY FULLBUSTER')  {similar.push("GREY FULLBUSTER"); similar.push("GREY");}

                if(answer == "KANNA" || answer == 'KANNA ALBERONA')  {similar.push("CANA ALBERONA"); similar.push("CANA"); similar.push("KANA ALBERONA"); similar.push("KANA");}
                if(answer == "CANA" || answer == 'CANA ALBERONA')  {similar.push("KANNA ALBERONA"); similar.push("KANNA"); similar.push("KANA ALBERONA"); similar.push("KANA");}
                if(answer == "KANA" || answer == 'KANA ALBERONA')  {similar.push("CANA ALBERONA"); similar.push("CANA"); similar.push("KANNA ALBERONA"); similar.push("KANNA");}
              
                if(answer == "SHERRIA" || answer == 'SHERRIA BLENDY')  {similar.push("CHERRYA BLENDY"); similar.push("CHERRYA"); similar.push("SHERIA");}
                if(answer == "CHERRYA" || answer == 'CHERRYA BLENDY')  {similar.push("SHERRIA BLENDY"); similar.push("SHERRIA"); similar.push("SHERIA");}
                if(answer == "SHERIA")  {similar.push("SHERRIA BLENDY"); similar.push("SHERRIA"); similar.push("CHERRYA BLENDY"); similar.push("CHERRYA");}

                if(answer == "BIXROW")  similar.push('BIXLOW')
                if(answer == "BIXLOW")  similar.push('BIXROW')

                if(answer == "CHARLES")  similar.push('CARLA')
                if(answer == "CARLA")  similar.push('CHARLES')

                if(answer == "ERIK")  similar.push('COBRA')
                if(answer == "COBRA")  similar.push('ERIK')

                if(answer == "DORANBOLT")  { similar.push('MEST');  similar.push('MEST GRYDER') }
                if(answer == "MEST"  || answer == "MEST GRYDER")  similar.push('DORANBOLT')

                if(answer == "HISUI")  { similar.push('JADE');  similar.push('JADE FIORE') }
                if(answer == "JADE"  || answer == "JADE FIORE")  similar.push('HISUI')

                if(answer == "PRECHT")  similar.push('HADES')
                if(answer == "HADES")  similar.push('PRECHT')

                if(answer == "SAWYER")  similar.push('RACER')
                if(answer == "RACER")  similar.push('SAWYER')

                if(answer == "ANGEL")  similar.push('SORANO')
                if(answer == "SORANO")  similar.push('ANGEL')

                if(answer == "MAKAROV" || answer == 'MAKAROV DREYAR')  {similar.push("MAKAROF");}
                if(answer == "MAKAROF")  {similar.push("MAKAROV DREYAR"); similar.push("MAKAROV");}

                if(answer == "LISANNA STRAUSS" || answer == 'LISANNA')  {similar.push("LISANA"); similar.push("LISANA STRAUSS");}
                if(answer == "LISANA STRAUSS" || answer == 'LISANA')  {similar.push("LISANNA"); similar.push("LISANNA STRAUSS");}

                if(answer == "EILEEN" || answer == 'EILEEN BELSERION')  {similar.push("IRENE"); similar.push("IRENE BELSERION");}
                if(answer == "IRENE" || answer == 'IRENE BELSERION')  {similar.push("EILEEN"); similar.push("EILEEN BELSERION");}

                if(answer == "LARCADE" || answer == 'LARCADE DRAGNEEL')  {similar.push("RAHKEID");}
                if(answer == "RAHKEID")  {similar.push("LARCADE"); similar.push("LARCADE DRAGNEEL");}

                if(answer == "NATSU" || answer == 'NATSU DRAGNEEL')  {similar.push("E.N.D"); similar.push("END"); answer == 'NATSU DRAGNIR'}
                if(answer == "E.N.D")  {similar.push("NATSU"); similar.push("NATSU DRAGNEEL"); similar.push("END");}
                if(answer == "END")  {similar.push("NATSU"); similar.push("NATSU DRAGNEEL"); similar.push("E.N.D");}


                



            }

            if(theme == 'Jujutsu Kaisen') {
                if(answer == "YUJI ITADORI" || answer == 'YUJI')  {similar.push("ITADORI");}
                if(answer == "ITADORI" || answer == 'ITADORI YUJI')  {similar.push("YUJI");}

                if(answer == "TOGE")  {similar.push("INUMAKI");}
                if(answer == "INUMAKI")  {similar.push("TOGE");}

                if(answer == "JUNPEI")  {similar.push("JUMPEI"); similar.push("JUMPEI YOSHINO");}
                if(answer == "JUMPEI" || answer == "JUMPEI YOSHINO")  {similar.push("JUNPEI");}

                if(answer == "KAMO NORITOSHI")  {similar.push("NORITOSHI KAMO");}
                if(answer == "NORITOSHI KAMO")  {similar.push("KAMO NORITOSHI");}

                if(answer == "TAKADA CHAN")  {similar.push("TAKADA-CHAN");}
                if(answer == "TAKADA-CHAN")  {similar.push("TAKADA CHAN");}

                if(answer == "RIKO AMANAI" || answer == 'RIKO')  {similar.push("AMANAI");}
                if(answer == "AMANAI")  {similar.push("RIKO");}
                

                



            }



            if(theme == 'My Hero Academia') {
                if(answer == "RECOVERY GIRL")  {similar.push("CHIYO SHUZENJI"); similar.push("CHIYO");}
                if(answer == "CHIYO SHUZENJI" || answer == "CHIYO")  {similar.push("RECOVERY GIRL");}

                if(answer == "THIRTEEN")  {similar.push("ANAN"); similar.push("ANAN KUROSE");}
                if(answer == "ANAN KUROSE" || answer == "ANAN")  {similar.push("THIRTEEN");}

                if(answer == "HOUND DOG")  {similar.push("RYO"); similar.push("RYO INUI");}
                if(answer == "RYO INUI" || answer == "RYO")  {similar.push("HOUND DOG");}

                if(answer == "ALL MIGHT")  {similar.push("YAGI"); similar.push("TOSHINORI YAGI");}
                if(answer == "TOSHINORI YAGI" || answer == "YAGI")  {similar.push("ALL MIGHT");}

                if(answer == "ERASED HEAD")  {similar.push("AIZAWA"); similar.push("SHOTA AIZAWA");}
                if(answer == "SHOTA AIZAWA" || answer == "AIZAWA")  {similar.push("ERASER HEAD");}


                if(answer == "PRESENT MIC")  {similar.push("HIZASHI YAMADA"); similar.push("HIZASHI");}
                if(answer == "HIZASHI YAMADA" || answer == "HIZASHI")  {similar.push("PRESENT MIC");}

                if(answer == "CEMENTOS")  {similar.push("KEN ISHIYAMA"); similar.push("KEN"); similar.push("CEMENTOSS");}
                if(answer == "KEN ISHIYAMA" || answer == "KEN")  {similar.push("CEMENTOSS"); similar.push("CEMENTOS");}
                if(answer == "CEMENTOSS")  {similar.push("KEN ISHIYAMA"); similar.push("KEN"); similar.push("CEMENTOS");}

                if(answer == "MIDNIGHT")  {similar.push("NEMURI KAYAMA"); similar.push("NEMURI");}
                if(answer == "NEMURI KAYAMA" || answer == "NEMURI")  {similar.push("MIDNIGHT");}

                if(answer == "POWER LOADER")  {similar.push("HIGARI MAIJIMA"); similar.push("HIGARI");}
                if(answer == "HIGARI" || answer == "HIGARI MAIJIMA")  {similar.push("POWER LOADER");}

                if(answer == "VLAD KING")  {similar.push("SEIKIJIRO KAN"); similar.push("SEIKIJIRO");}
                if(answer == "SEIKIJIRO KAN" || answer == "SEIKIJIRO")  {similar.push("VLAD KING");}

                if(answer == "GRAN TORINO")  {similar.push("SORAHIKO TORINO"); similar.push("SORAHIKO");}
                if(answer == "SORAHIKO TORINO" || answer == "SORAHIKO")  {similar.push("GRAN TORINO");}

                if(answer == "CAN'T STOP TWINKLING")  {similar.push("YUGA AOYAMA"); similar.push("YUGA");}
                if(answer == "YUGA" || answer == "YUGA AOYAMA")  {similar.push("CAN'T STOP TWINKLING");}

                if(answer == "PINKY")  {similar.push("MINA ASHIDO"); similar.push("MINA");}
                if(answer == "MINA ASHIDO" || answer == "MINA")  {similar.push("MINA");}

                if(answer == "FROPPY")  {similar.push("TSUYU ASUI"); similar.push("TSUYU");}
                if(answer == "TSUYU ASUI" || answer == "TSUYU")  {similar.push("FROPPY");}

                if(answer == "INGENIUM")  {similar.push("TENYA IDA"); similar.push("TENYA"); similar.push("IDA");}
                if(answer == "TENYA IDA" || answer == "TENYA" || answer == "IDA")  {similar.push("INGENIUM");}
                if(answer == "TENYA")  {similar.push("IDA"); similar.push("INGENIUM"); }
                if(answer == "IDA")  {similar.push("TENYA"); similar.push("INGENIUM");}

                if(answer == "URAVITY")  {similar.push("OCHACO URARAKA"); similar.push("OCHACO");}
                if(answer == "OCHACO URARAKA" || answer == "OCHACO")  {similar.push("URAVITY");}

                if(answer == "TAILMAN")  {similar.push("MASHIRAO OJIRO"); similar.push("MASHIRAO");}
                if(answer == "MASHIRAO OJIRO" || answer == "MASHIRAO")  {similar.push("TAILMAN");}

                if(answer == "CHARGEBOLT")  {similar.push("DENKI KAMINARI"); similar.push("DENKI");}
                if(answer == "DENKI KAMINARI" || answer == "DENKI")  {similar.push("CHARGEBOLT");}

                if(answer == "RED RIOT")  {similar.push("EIJIRO KIRISHIMA"); similar.push("EIJIRO");}
                if(answer == "EIJIRO" || answer == "EIJIRO KIRISHIMA")  {similar.push("RED RIOT");}

                if(answer == "ANIMA")  {similar.push("KOJI KODA"); similar.push("KOJI");}
                if(answer == "KOJI KODA" || answer == "KOJI")  {similar.push("ANIMA");}

                if(answer == "SUGARMAN")  {similar.push("RIKIDO SATO"); similar.push("RIKIDO");}
                if(answer == "RIKIDO SATO" || answer == "RIKIDO")  {similar.push("SUGARMAN");}

                if(answer == "TENTACOLE")  {similar.push("MEZO SHOJI"); similar.push("SHOJI");}
                if(answer == "SHOJI" || answer == "MEZO SHOJI")  {similar.push("TENTACOLE");}

                if(answer == "EARPHONE JACK")  {similar.push("KYOKA JIRO"); similar.push("KYOKA");}
                if(answer == "KYOKA" || answer == "KYOKA JIRO")  {similar.push("EARPHONE JACK");}

                if(answer == "CELLOPHANE")  {similar.push("HANTA SERO"); similar.push("HANTA");}
                if(answer == "HANTA SERO" || answer == "SERO")  {similar.push("CELLOPHANE");}

                if(answer == "TSUKUYOMI")  {similar.push("FUMIKAGE TOKOYAMI"); similar.push("FUMIKAGE");}
                if(answer == "FUMIKAGE TOKOYAMI" || answer == "FUMIKAGE")  {similar.push("TSUKUYOMI");}

                if(answer == "INVISIBLE GIRL")  {similar.push("TORU HAGAKURE"); similar.push("TORU");}
                if(answer == "TORU HAGAKURE" || answer == "TORU")  {similar.push("INVISIBLE GIRL");}

                if(answer == "DYNAMIGHT")  {similar.push("KACCHAN"); similar.push("KATSUKI"); similar.push("BAKUGO"); similar.push("KATSUKI BAKUGO");}
                if(answer == "KATSUKI BAKUGO" || answer == "KATSUKI" || answer == "BAKUGO")  {similar.push("DYNAMIGHT"); similar.push("KACCHAN"); similar.push("KATSUKI"); similar.push("BAKUGO");}
                if(answer == "KACCHAN")  {similar.push("DYNAMIGHT"); similar.push("KATSUKI"); similar.push("BAKUGO"); similar.push("KATSUKI BAKUGO");}

                if(answer == "DEKU")  {similar.push("MIDORIYA IZUKU"); similar.push("IZUKU MIDORIYA"); similar.push("MIDORIYA"); similar.push("IZUKU"); }
                if(answer == "MIDORIYA IZUKU" || answer == "MIDORIYA" || answer == "IZUKU")  {similar.push("KACCHAN"); similar.push("DEKU"); similar.push("IZUKU MIDORIYA"); similar.push("IZUKU"); similar.push("MIDORIYA");}
                if(answer == "IZUKU MIDORIYA")  {similar.push("MIDORIYA IZUKU"); similar.push("DEKU"); similar.push("IZUKU"); similar.push("MIDORIYA");}
               
                if(answer == "GRAPE JUICE")  {similar.push("MINORU MINETA"); similar.push("MINETA");}
                if(answer == "MINETA" || answer == "MINORU MINETA")  {similar.push("GRAPE JUICE");}

                if(answer == "CREATI")  {similar.push("MOMO YAOYOROZU"); similar.push("MOMO");}
                if(answer == "MOMO YAOYOROZU" || answer == "MOMO")  {similar.push("CREATI");}

                if(answer == "WELDER")  {similar.push("YOSETSU AWASE"); similar.push("YOSETSU");}
                if(answer == "YOSETSU AWASE" || answer == "YOSETSU")  {similar.push("WELDER");}

                if(answer == "SPIRAL")  {similar.push("SEN KAIBARA"); similar.push("SEN");}
                if(answer == "SEN KAIBARA" || answer == "SEN")  {similar.push("SPIRAL");}

                if(answer == "JACK MANTIS")  {similar.push("TOGARU KAMAKIRI"); similar.push("TOGARU");}
                if(answer == "TOGARU KAMAKIRI" || answer == "TOGARU")  {similar.push("JACK MANTIS");}

                if(answer == "VANTABLACK")  {similar.push("SHIHAI KUROIRO"); similar.push("SHIHAI");}
                if(answer == "SHIHAI KUROIRO" || answer == "SHIHAI")  {similar.push("VANTABLACK");}

                if(answer == "BATTLE FIST")  {similar.push("ITSUKA KENDO"); similar.push("ITSUKA");}
                if(answer == "ITSUKA KENDO" || answer == "ITSUKA")  {similar.push("BATTLE FIST");}

                if(answer == "RULE")  {similar.push("YUI KODAI"); similar.push("YUI");}
                if(answer == "YUI KODAI" || answer == "YUI")  {similar.push("RULE");}

                if(answer == "SHEMAGE")  {similar.push("KINOKO KOMORI"); similar.push("KINOKO");}
                if(answer == "KINOKO KOMORI" || answer == "KINOKO")  {similar.push("SHEMAGE");}

                if(answer == "VINE")  {similar.push("IBARA SHIOZAKI"); similar.push("MARIA"); similar.push("IBARA");}
                if(answer == "IBARA SHIOZAKI" || answer == "IBARA")  {similar.push("VINE"); similar.push("MARIA");}
                if(answer == "MARIA")  {similar.push("IBARA SHIOZAKI"); similar.push("VINE"); similar.push("IBARA");}

                if(answer == "GEVAUDAN")  {similar.push("JUROTA SHISHIDA"); similar.push("JUROTA");}
                if(answer == "JUROTA SHISHIDA" || answer == "JUROTA")  {similar.push("GEVAUDAN");}

                if(answer == "MINES")  {similar.push("NIRENGEKI SHODA"); similar.push("NIRENGEKI");}
                if(answer == "NIRENGEKI SHODA" || answer == "NIRENGEKI")  {similar.push("MINES");}

                if(answer == "ROCKETTI")  {similar.push("PONY TSUNOTORI"); similar.push("PONY");}
                if(answer == "PONY TSUNOTORI" || answer == "PONY")  {similar.push("ROCKETTI");}

                if(answer == "LONG WEIZI")  {similar.push("HIRYU"); similar.push("HIRYU");}
                if(answer == "HIRYU" || answer == "HIRYU")  {similar.push("LONG WEIZI");}

                if(answer == "EMILY")  {similar.push("REIKO YANAGI"); similar.push("REIKO");}
                if(answer == "REIKO YANAGI" || answer == "REIKO")  {similar.push("EMILY");}

                if(answer == "PAHNTOM THIEF")  {similar.push("NEITO MONOMA"); similar.push("NEITO");}
                if(answer == "NEITO MONOMA" || answer == "NEITO")  {similar.push("PHANTOM THIEF");}

                if(answer == "PLAMO")  {similar.push("KOJIRO BONDO"); similar.push("KOJIRO");}
                if(answer == "KOJIRO BONDO" || answer == "KOJIRO")  {similar.push("PLAMO");}

                if(answer == "COMICMAN")  {similar.push("MANGA FUKIDASHI"); similar.push("MANGA");}
                if(answer == "MANGA FUKIDASHI" || answer == "MANGA")  {similar.push("COMICMAN");}

                if(answer == "MUDMAN")  {similar.push("JUZO HONENUKI"); similar.push("JUZO");}
                if(answer == "JUZO HONENUKI" || answer == "JUZO")  {similar.push("MUDMAN");}

                if(answer == "LIZARDY")  {similar.push("SETSUNA TOKAGE"); similar.push("SETSUNA");}
                if(answer == "SETSUNA TOKAGE" || answer == "SETSUNA")  {similar.push("LIZARDY");}

                if(answer == "TETSUTETSU")  {similar.push("REAL STEEL"); }
                if(answer == "REAL STEEL")  {similar.push("TETSUTETSU"); similar.push("TETSUTETSU TETSUTETSU");}

                if(answer == "KOSEI")  {similar.push("TSUBURABA");}
                if(answer == "TSUBURABA")  {similar.push("KOSEI");}

                if(answer == "SHINSO")  {similar.push("HITOSHI");}
                if(answer == "HITOSHI")  {similar.push("SHINSO");}

                if(answer == "NEJIRE HADO")  {similar.push("NEJIRE CHAN"); }
                if(answer == "NEJIRE CHAN")  {similar.push("NEJIRE HADO");} 

                if(answer == "SUNEATER")  {similar.push("TAMAKI AMAJIKI"); similar.push("TAMAKI");}
                if(answer == "TAMAKI AMAJIKI" || answer == "TAMAKI")  {similar.push("SUNEATER");}

                if(answer == "LEMILLION")  {similar.push("MIRIO TOGATA"); similar.push("MIRIO");}
                if(answer == "MIRIO TOGATA" || answer == "MIRIO")  {similar.push("LEMILLION");}

                if(answer == "BEST JEANIST")  {similar.push("TSUNAGU HAKAMADA"); similar.push("TSUNAGU");}
                if(answer == "TSUNAGU HAKAMADA" || answer == "TSUNAGU")  {similar.push("BEST JEANIST");}

                if(answer == "EDGESHOT")  {similar.push("SHINYA KAMIHARA"); similar.push("SHINYA");}
                if(answer == "SHINYA KAMIHARA" || answer == "SHINYA")  {similar.push("EDGESHOT");}

                if(answer == "ENDEAVOR")  {similar.push("ENJI TODOROKI"); similar.push("ENJI");}
                if(answer == "ENJI TODOROKI" || answer == "ENJI")  {similar.push("ENDEAVOR");}

                if(answer == "LOUD CLOUD")  {similar.push("OBORO SHIRAKUMO"); similar.push("OBORO");}
                if(answer == "OBORO SHIRAKUMO" || answer == "OBORO")  {similar.push("LOUD CLOUD");}

                if(answer == "SENSOJI")  { similar.push("MISTER BLASTER");}
                if(answer == "MISTER BLASTER")  {similar.push("SENSOJI");}

                if(answer == "MS JOKE")  {similar.push("EMI FUKUKADO"); similar.push("EMI");}
                if(answer == "EMI FUKUKADO" || answer == "EMI")  {similar.push("MS JOKE");}

                if(answer == "GRAND")  {similar.push("YO SHINDO"); similar.push("SHINDO"); similar.push("YO");}
                if(answer == "YO SHINDO")  {similar.push("GRAND");}
                if(answer == "SHINDO") {similar.push("GRAND"); similar.push("YO");}
                if(answer == "YO") {similar.push("GRAND"); similar.push("SHINDO");}

                if(answer == "TURTLE NECK")  {similar.push("TATAMI NAKAGAME"); similar.push("TATAMI");}
                if(answer == "TATAMI NAKAGAME" || answer == "TATAMI")  {similar.push("TURTLE NECK");}

                if(answer == "MR SMITH")  {similar.push("SHIKKUI MAKABE"); similar.push("SHIKKUI");}
                if(answer == "SHIKKUI MAKABE" || answer == "SHIKKUI")  {similar.push("MR SMITH");}

                if(answer == "BOOMERANG MAN")  {similar.push("ITEJIRO TOTEKI"); similar.push("ITEJIRO");}
                if(answer == "ITEJIRO TOTEKI" || answer == "ITEJIRO")  {similar.push("BOOMERANG MAN");}
                
                if(answer == "GALE FORCE")  {similar.push("INASA YOARASHI"); similar.push("INASA");}
                if(answer == "INASA YOARASHI" || answer == "INASA")  {similar.push("GALE FORCE");}

                if(answer == "CHEWYEE")  {similar.push("NAGAMASA MORA"); similar.push("NAGAMASA");}
                if(answer == "NAGAMASA MORA" || answer == "NAGAMASA")  {similar.push("CHEWYEE");}

                if(answer == "SHISHIKROSS")  {similar.push("SEIJI SHISHIKURA"); similar.push("SEIJI");}
                if(answer == "SEIJI SHISHIKURA" || answer == "SEIJI")  {similar.push("SHISHIKROSS");}

                if(answer == "ILLUSTO-CAMIE")  {similar.push("CAMIE UTSUSHIMI"); similar.push("CAMIE");}
                if(answer == "CAMIE UTSUSHIMI" || answer == "CAMIE")  {similar.push("ILLUSTO-CAMIE");}

                if(answer == "LUCKY STRIKE")  {similar.push("DADAN TADAN"); similar.push("DADAN");}
                if(answer == "DADAN TADAN" || answer == "DADAN")  {similar.push("LUCKY STRIKE");}
                
                if(answer == "SENSOR GIRL")  {similar.push("KASHIKO SEKIGAI"); similar.push("KASHIKO");}
                if(answer == "KASHIKO SEKIGAI" || answer == "KASHIKO")  {similar.push("SENSOR GIRL");}

                if(answer == "HAWKS")  {similar.push("KEIGO TAKAMI"); similar.push("KEIGO");}
                if(answer == "KEIGO TAKAMI" || answer == "KEIGO")  {similar.push("HAWKS");}

                if(answer == "MIRKO")  {similar.push("RUMI USAGIYAMA"); similar.push("RUMI");}
                if(answer == "RUMI USAGIYAMA" || answer == "RUMI")  {similar.push("MIRKO");}

                if(answer == "GANG ORCA")  {similar.push("KUGO SAKAMATA"); similar.push("KUGO");}
                if(answer == "KUGO SAKAMATA" || answer == "KUGO")  {similar.push("GANG ORCA");}

                if(answer == "RYUKYU")  {similar.push("RYUKO TATSUMA"); similar.push("RYUKO");}
                if(answer == "RYUKO TATSUMA" || answer == "RYUKO")  {similar.push("RYUKYU");}

                if(answer == "WASH")  {similar.push("SUSUGU MITARAI"); similar.push("SUSUGU");}
                if(answer == "SUSUGU MITARAI" || answer == "SUSUGU")  {similar.push("WASH");}

                if(answer == "KAMUI WOODS")  {similar.push("SHINJI NISHIYA"); similar.push("SHINJI");}
                if(answer == "SHINJI NISHIYA" || answer == "SHINJI")  {similar.push("KAMUI WOODS");}

                if(answer == "PIXIE BOB")  {similar.push("PIXIE-BOB"); similar.push('RYUKO TSUCHIKAWA');}
                if(answer == "PIXIE-BOB")  {similar.push("PIXIE BOB"); similar.push('RYUKO TSUCHIKAWA');}
                if(answer == "RYUKO TSUCHIKAWA")  {similar.push("PIXIE BOB"); similar.push('PIXIE-BOB');}

                if(answer == "MANDALAY")  {similar.push("SHINO SOSAKI"); similar.push("SHINO");}
                if(answer == "SHINO SOSAKI" || answer == "SHINO")  {similar.push("MANDALAY");}

                if(answer == "MANUAL")  {similar.push("MASAKI MIZUSHIMA"); similar.push("MASAKI");}
                if(answer == "MASAKI MIZUSHIMA" || answer == "MASAKI")  {similar.push("MANUAL");}

                if(answer == "FAT GUM")  {similar.push("TAISHIRO TOYOMITSU"); similar.push("TAISHIRO");}
                if(answer == "TAISHIRO TOYOMITSU" || answer == "TAISHIRO")  {similar.push("FAT GUM");}

                if(answer == "GOGOGOGO")  {similar.push("YU TAKEYAMA"); similar.push("YU");}
                if(answer == "YU TAKEYAMA" || answer == "YU")  {similar.push("MT LADY"); similar.push("MOUNT LADY");}
                if(answer == "MT LADY")  {similar.push("YU TAKEYAMA"); similar.push("YU"); similar.push("MOUNT LADY");}
                if(answer == "MOUNT LADY")  {similar.push("YU TAKEYAMA"); similar.push("YU"); similar.push("MT LADY");}

                if(answer == "TIGER")  {similar.push("YAWARA CHATORA"); similar.push("YAWARA");}
                if(answer == "YAWARA CHATORA" || answer == "YAWARA")  {similar.push("TIGER");}

                if(answer == "JUZO MOASHI")  {similar.push("CENTIPEDER");}
                if(answer == "CENTIPEDER" )  {similar.push("JUZO MOASHI");}

                if(answer == "ROCK LOCK")  {similar.push("KEN TAKAGI");}
                if(answer == "KEN TAKAGI")  {similar.push("ROCK LOCK");}

                if(answer == "TOY TOY")  {similar.push("TOY-TOY"); }
                if(answer == "TOY-TOY")  {similar.push("TOY TOY");}

                if(answer == "CAPTAIN CELEBRITY")  {similar.push("CHRISTOPHER SKYLINE"); similar.push("CHRISTOPHER");}
                if(answer == "CHRISTOPHER SKYLINE" || answer == "CHRISTOPHER")  {similar.push("CAPTAIN CELEBRITY");}

                if(answer == "HIS PURPLE HIGHNESS")  {similar.push("TENMA NAKAOJI"); similar.push("TENMA");}
                if(answer == "TENMA NAKAOJI" || answer == "TENMA")  {similar.push("HIS PURPLE HIGHNESS");}

                if(answer == "ODD EYE")  {similar.push("ODD-EYE");}
                if(answer == "ODD-EYE")  {similar.push("ODD EYE");}

                if(answer == "RAGDOLL")  {similar.push("TOMOKO SHIRETOKO"); similar.push("TOMOKO");}
                if(answer == "TOMOKO SHIRETOKO" || answer == "TOMOKO")  {similar.push("RAGDOLL");}

                if(answer == "STAR AND STRIPE")  {similar.push("CATHLEEN BATE"); similar.push("CATHLEEN");}
                if(answer == "CATHLEEN BATE" || answer == "CATHLEEN")  {similar.push("STAR AND STRIPE");}

                if(answer == "MAJESTIC")  {similar.push("ENMA KANNAGI"); similar.push("ENMA");}
                if(answer == "ENMA KANNAGI" || answer == "ENMA")  {similar.push("MAJESTIC");}

                if(answer == "SIR NIGHTEYE")  {similar.push("MIRAI SASAKI"); similar.push("MIRAI");}
                if(answer == "MIRAI SASAKI" || answer == "MIRAI")  {similar.push("SIR NIGHTEYE");}

                if(answer == "SLINDIN GO")  {similar.push("TATSUYUKI TOKONAME"); similar.push("TATSUYUKI");}
                if(answer == "TATSUYUKI TOKONAME" || answer == "TATSUYUKI")  {similar.push("SLINDIN GO");}

                if(answer == "SNATCH")  {similar.push("SAJIN HIGAWARA"); similar.push("SAJIN");}
                if(answer == "SAJIN HIGAWARA" || answer == "SAJIN")  {similar.push("SNATCH");}

                if(answer == "NUMBER 6")  {similar.push("ROKURO NOMURA"); similar.push("ROKURO");}
                if(answer == "ROKURO NOMURA" || answer == "ROKURO")  {similar.push("NUMBER 6");}

                if(answer == "NUMBER 6")  {similar.push("HOKUTO HARIO"); similar.push("HOKUTO");}
                if(answer == "HOKUTO HARIO" || answer == "HOKUTO")  {similar.push("NUMBER 6");}

                if(answer == "MASTER")  {similar.push("IWAO OGURO"); similar.push("IWAO");}
                if(answer == "IWAO OGURO" || answer == "IWAO")  {similar.push("MASTER");}

                if(answer == "LADY NAGANT")  {similar.push("KAINA TSUTSUMI"); similar.push("KAINA");}
                if(answer == "KAINA TSUTSUMI" || answer == "KAINA")  {similar.push("LADY NAGANT");}

                if(answer == "LARIAT")  {similar.push("DAIGORO BANJO"); similar.push("DAIGORO");}
                if(answer == "DAIGORO BANJO" || answer == "DAIGORO")  {similar.push("LARIAT");}

                if(answer == "BUBBLE GIRL")  {similar.push("KAORUKO AWATA"); similar.push("KAORUKO");}
                if(answer == "KAORUKO AWATA" || answer == "KAORUKO")  {similar.push("BUBBLE GIRL");}

                if(answer == "BURNIN")  {similar.push("MOE KAMIJI"); similar.push("MOE");}
                if(answer == "MOE KAMIJI" || answer == "MOE")  {similar.push("BURNIN");}

                if(answer == "THE CRAWLER")  {similar.push("KOICHI HAIMAWARI"); similar.push("KOICHI");}
                if(answer == "KOICHI HAIMAWARI" || answer == "KOICHI")  {similar.push("THE CRAWLER");}

                if(answer == "STAIN")  {similar.push("CHIZOME AKAGURO"); similar.push("CHIZOME");}
                if(answer == "CHIZOME AKAGURO" || answer == "CHIZOME")  {similar.push("STAIN");}

                if(answer == "GENTLE CRIMINAL")  {similar.push("DANJURO TOBITA"); similar.push("DANJURO");}
                if(answer == "DANJURO TOBITA" || answer == "DANJURO")  {similar.push("GENTLE CRIMINAL");}

                if(answer == "LA BRAVA")  {similar.push("MANAMI AIBA"); similar.push("MANAMI");}
                if(answer == "MANAMI AIBA" || answer == "MANAMI")  {similar.push("LA BRAVA");}

                if(answer == "PEERLESS THIEF")  {similar.push("OJI HARIMA"); similar.push("OJI");}
                if(answer == "OJI HARIMA" || answer == "OJI")  {similar.push("PEERLESS THIEF");}

                if(answer == "MUSCULAR")  {similar.push("GOTO IMASUJI"); similar.push("GOTO");}
                if(answer == "GOTO IMASUJI" || answer == "GOTO")  {similar.push("MUSCULAR");}

                if(answer == "CHIMERA")  {similar.push("CHOJURO KON"); similar.push("CHOJURO");}
                if(answer == "CHOJURO KON" || answer == "CHOJURO")  {similar.push("CHIMERA");}

                if(answer == "MUMMY")  {similar.push("HOYO MAKIHARA"); similar.push("HOYO");}
                if(answer == "HOYO MAKIHARA" || answer == "HOYO")  {similar.push("MUMMY");}

                if(answer == "SLICE")  {similar.push("KIRUKA HASAKI"); similar.push("KIRUKA");}
                if(answer == "KIRUKA HASAKI" || answer == "KIRUKA")  {similar.push("SLICE");}

                if(answer == "VOLCANO")  {similar.push("MAGUMA IAWATA"); similar.push("MAGUMA");}
                if(answer == "MAGUMA IAWATA" || answer == "MAGUMA")  {similar.push("VOLCANO");}

                if(answer == "DUSTY ASH")  {similar.push("ONAKO HAIZONO"); similar.push("ONAKO");}
                if(answer == "ONAKO HAIZONO" || answer == "ONAKO")  {similar.push("DUSTY ASH");}

                if(answer == "GUST BOY")  {similar.push("TSUMUJI KAZETANI"); similar.push("TSUMUJI");}
                if(answer == "TSUMUJI KAZETANI" || answer == "TSUMUJI")  {similar.push("GUST BOY");}

                if(answer == "TENKO SHIMURA" || answer == "TENKO")   {similar.push("SHIGARAKI TOMURA"); similar.push("TOMURA"); similar.push("SHIGARAKI"); similar.push("TOMURA");}
                if(answer == "SHIGARAKI TOMURA" || answer == "SHIGARAKI" || answer == "TOMURA")  {similar.push("TENKO"); similar.push("TENKO SHIMURA"); similar.push("SHIGARAKI"); similar.push("TOMURA");}

                if(answer == "DR KYUDAI" || answer == "KYUDAI")   {similar.push("KYUDAI GARAKI"); similar.push("DR TSUBASA"); similar.push("DARUMA UJIKO"); similar.push("DARUMA");}
                if(answer == "DARUMA UJIKO" || answer == "DARUMA")   {similar.push("KYUDAI GARAKI"); similar.push("DR TSUBASA"); similar.push("DR KYUDAI"); similar.push("KYUDAI");}
                if(answer == "KYUDAI GARAKI")   {similar.push("DR KYUDAI"); similar.push("DR TSUBASA"); similar.push("DARUMA UJIKO"); similar.push("DARUMA");}

                if(answer == "GIRAN")  {similar.push("KAGERO OKUTA"); similar.push("KAGERO");}
                if(answer == "KAGERO OKUTA" || answer == "KAGERO")  {similar.push("GIRAN");}

                if(answer == "OXY-MAN")  {similar.push("OXY MAN");}
                if(answer == "OXY MAN")  {similar.push("OXY-MAN");}

                if(answer == "DABI")  {similar.push("TOYA TODOROKI"); similar.push("TOYA");}
                if(answer == "TOYA TODOROKI" || answer == "TOYA")  {similar.push("DABI");}

                if(answer == "TWICE")  {similar.push("JIN BUDAIGAWARA"); similar.push("JIN");}
                if(answer == "JIN BUDAIGAWARA" || answer == "JIN")  {similar.push("TWICE");}

                if(answer == "SPINNER")  {similar.push("SHUICHI IGUCHI"); similar.push("SHUICHI");}
                if(answer == "SHUICHI IGUCHI" || answer == "SHUICHI")  {similar.push("SPINNER");}

                if(answer == "MR COMPRESS")  {similar.push("ATSUHIRO SAKO"); similar.push("ATSUHIRO");}
                if(answer == "ATSUHIRO SAKO" || answer == "ATSUHIRO")  {similar.push("MR COMPRESS");}

                if(answer == "MAGNE")  {similar.push("KENJI HIKIISHI"); similar.push("KENJI");}
                if(answer == "KENJI HIKIISHI" || answer == "KENJI")  {similar.push("MAGNE");}

                if(answer == "RE-DESTRO")  {similar.push("RIKIYA YOTSUBASHI"); similar.push("RIKIYA");}
                if(answer == "RIKIYA YOTSUBASHI" || answer == "RIKIYA")  {similar.push("RE-DESTRO");}

                if(answer == "CURIOUS")  {similar.push("CHITOSE KIZUKI"); similar.push("CHITOSE");}
                if(answer == "CHITOSE KIZUKI" || answer == "CHITOSE")  {similar.push("CURIOUS");}

                if(answer == "TRUMPET")  {similar.push("KOKU HANABATA"); similar.push("KOKU");}
                if(answer == "KOKU HANABATA" || answer == "KOKU")  {similar.push("TRUMPET");}

                if(answer == "SKEPTIC")  {similar.push("TOMOYASU CHIKAZOKU"); similar.push("TOMOYASU");}
                if(answer == "TOMOYASU CHIKAZOKU" || answer == "TOMOYASU")  {similar.push("SKEPTIC");}

                if(answer == "DESTRO")  {similar.push("CHIKARA YOTSUBASHI"); similar.push("CHIKARA");}
                if(answer == "CHIKARA YOTSUBASHI" || answer == "CHIKARA")  {similar.push("DESTRO");}

                if(answer == "GETEN")  {similar.push("HIMURA"); similar.push("ICEMAN");}
                if(answer == "HIMURA")  {similar.push("ICEMAN"); similar.push("GETEN");}
                if(answer == "ICEMAN")  {similar.push("GETEN"); similar.push("HIMURA");}

                if(answer == "OVERHAUL")  {similar.push("KAI CHISAKI"); similar.push("CHISAKI");}
                if(answer == "KAI CHISAKI" || answer == "CHISAKI")  {similar.push("OVERHAUL");}

                if(answer == "BAT VILLAIN")  {similar.push("BATTO YOBAYAKAWA"); similar.push("BATTO");}
                if(answer == "BATTO YOBAYAKAWA" || answer == "BATTO")  {similar.push("BAT VILLAIN");}

                if(answer == "OCTOID")  {similar.push("IKAJIRO TAKOBE"); similar.push("IKAJIRO");}
                if(answer == "IKAJIRO TAKOBE" || answer == "IKAJIRO")  {similar.push("OCTOID");}

                if(answer == "CHRONOSTASIS")  {similar.push("HARI KURONO"); similar.push("HARI");}
                if(answer == "HARI KURONO" || answer == "HARI")  {similar.push("CHRONOSTASIS");}

                if(answer == "MIMIC")  {similar.push("JOI IRINAKA"); similar.push("JOI");}
                if(answer == "JOI IRINAKA" || answer == "JOI")  {similar.push("MIMIC");}

                if(answer == "THE RAPPER")  {similar.push("KENDO RAPPA"); similar.push("KENDO");}
                if(answer == "KENDO RAPPA" || answer == "KENDO")  {similar.push("THE RAPPER");}

                if(answer == "POP STEP")  {similar.push("KAZUHO HANEYAMA"); similar.push("KAZUHO");}
                if(answer == "KAZUHO HANEYAMA" || answer == "KAZUHO")  {similar.push("POP STEP");}

                if(answer == "TRUE MAN")  {similar.push("NAOMASA TSUKAUCHI"); similar.push("NAOMASA");}
                if(answer == "NAOMASA TSUKAUCHI" || answer == "NAOMASA")  {similar.push("TRUE MAN");}

                if(answer == "KANIKO")  {similar.push("MONIKA KANIYASHIKI"); similar.push("MONIKA");}
                if(answer == "MONIKA KANIYASHIKI" || answer == "MONIKA")  {similar.push("KANIKO");}
            }


            if(theme == 'Jojo') {
                if(answer == "WAMUU")  {similar.push("WAMU"); }
                if(answer == "WAMU")  {similar.push("WAMUU");}

                if(answer == "SOUNDMAN")  {similar.push("SANDMAN"); }
                if(answer == "SANDMAN")  {similar.push("SOUNDMAN");}

                if(answer == "D-I-S-C-O")  {similar.push("DISCO"); }
                if(answer == "DISCO")  {similar.push("D-I-S-C-O");}

                if(answer == "WAMUU")  {similar.push("WAMU"); }
                if(answer == "WAMU")  {similar.push("WAMUU");}

                if(answer == "HERMES")  {similar.push("ERMES"); similar.push("ERMES COSTELLO");}
                if(answer == "ERMES" || answer == "ERMES COSTELLO")  {similar.push("HERMES");}

                if(answer == "SPORTS MAXX")  {similar.push("SPORTS MAX"); }
                if(answer == "SPORTS MAX")  {similar.push("SPORTS MAXX");}

                if(answer == "GEORGE 2")  {similar.push("GEORGE II"); similar.push("GEORGE JOESTAR 2"); similar.push("GEORGE JOESTAR II");}
                if(answer == "GEORGE JOESTAR 2")  { similar.push("GEORGE II"); similar.push("GEORGE JOESTAR II"); similar.push("GEORGE 2");}
                if(answer == "GEORGE II")  {similar.push("GEORGE JOESTAR 2"); similar.push("GEORGE 2"); similar.push("GEORGE JOESTAR II");}
                if(answer == "GEORGE JOESTAR II")  {similar.push("GEORGE JOESTAR 2"); similar.push("GEORGE II"); similar.push("GEORGE 2");}
                
                if(answer == "GEORGE 1")  {similar.push("GEORGE I"); similar.push("GEORGE JOESTAR 1"); similar.push("GEORGE JOESTAR I");}
                if(answer == "GEORGE JOESTAR 1")  { similar.push("GEORGE I"); similar.push("GEORGE JOESTAR I"); similar.push("GEORGE 1");}
                if(answer == "GEORGE I")  {similar.push("GEORGE JOESTAR 1"); similar.push("GEORGE 1"); similar.push("GEORGE JOESTAR I");}
                if(answer == "GEORGE JOESTAR I")  {similar.push("GEORGE JOESTAR 1"); similar.push("GEORGE I"); similar.push("GEORGE 1");}
            
                if(answer == "NDOUL")  {similar.push("N DOUL"); similar.push("N'DOUL"); }
                if(answer == "N DOUL")  {similar.push("NDOUL"); similar.push("N'DOUL"); }
                if(answer == "N'DOUL")  {similar.push("NDOUL"); similar.push("N DOUL"); }

                if(answer == "FF")  {similar.push("F.F"); similar.push("FOO FIGHTERS"); }
                if(answer == "F.F")  {similar.push("FF"); similar.push("FOO FIGHTERS"); }
                if(answer == "FOO FIGHTERS")  {similar.push("FF"); similar.push("F.F"); }

                if(answer == "DARBY")  {similar.push("D ARBY"); similar.push("D'ARBY");  similar.push("DANIEL"); similar.push("DANIEL J DARBY");  }
                if(answer == "D ARBY")  {similar.push("DARBY"); similar.push("D'ARBY");  similar.push("DANIEL"); similar.push("DANIEL J DARBY"); }
                if(answer == "D'ARBY")  {similar.push("DARBY"); similar.push("D ARBY");  similar.push("DANIEL"); similar.push("DANIEL J DARBY"); }
                if(answer == "DANIEL" || answer == "DANIEL J DARBY")  {similar.push("DARBY"); similar.push("D ARBY");  similar.push("D'ARBY"); similar.push("DANIEL J DARBY");similar.push("DANIEL"); }
            
                if(answer == "SHIGECHI")  {similar.push("SHIGEKIYO"); similar.push("SHIGEKIYO YANGUAWA");}
                if(answer == "SHIGEKIYO YANGU" || answer == "SHIGEKIYO")  {similar.push("SHIGECHI");}
            
            
            
            
            
            
            
            
            
            }

    

    }    


    similar.push(answer);

    //REMOVE DOUBLONS
    var similar_u = _.uniq(similar);
    

    for(var i = 0 ; i < similar.length ; i++) {
        var toRemove = similar[i];
        mapgamedata.set(rid , mapgamedata.get(rid).filter(item => item!=toRemove));
    }   


    return similar_u;

 
     



}



function generateCitation(rid) {
    var datab = mapgamedata.get(rid);
    var totalc = Math.floor(Math.random() * datab.length);
    var toRemove = datab[totalc];
    var c_citation = datab[totalc].citation;
    var c_answer = datab[totalc].reponses;
    var c_joker = datab[totalc].joker;
    mapgamecitation.set(rid , c_citation);
    mapgameitationanswer.set(rid ,c_answer);
    mapgamecitajoker.set(rid , c_joker);

    mapgamedata.set(rid , mapgamedata.get(rid).filter(item => item!=toRemove));
}





















server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
