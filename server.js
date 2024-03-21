
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
var _ = require('underscore');


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



//TODO : striker point (count character)
//TODO : flame animation
//TODO : multiplayer (>2 player)
//TODO : RECORD CHARACTER COUNT 30s/1min
//TODO : BOT SOLO GAME
//TODO : dont reset bomb timer after replay
//TODO : JJK FAIRY TAIL MHA HAIKYUU

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
var mapgamedata = new Map();
var mapgamestack = new Map();
var mapgametotal = new Map();

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
    var codeUp = code.toUpperCase();

    var resnb = "non";


    for (let [key, value] of mapcode) {
        if(codeUp == value && !mapcodefull.includes(codeUp))  {
            resnb = "oui";
            req.session.rid = codeUp;
        }   
    }
    

    res.end(resnb);
});


//HOST CLICK ON REPLAY
app.post('/replay' , function(req,res) {

    req.session.isplaying = false;
    req.session.endgame = false;
    req.session.replayed = true;

    mapgamewinner.delete(req.session.rid); 



    res.end();
});


app.post('/replayPlayer' , function(req,res) {
    req.session.isplaying = null;
    req.session.endgame = null;

    console.log('loll')

    res.end();
});


app.post('/game' , function(req,res) {

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('changeGamePlayerStatusEvent');
    });  



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

var arr1 = [];
var arr2 = [];


// GAME START AFTER CONFIRM SETTING
app.post('/confirmSetting' , function(req,res) {
    var btime = req.body.val1;
    var theme = req.body.val2;

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
    if(theme == 'Death Note') mapgamedata.set(req.session.rid , profile.Character.DeathNote);

    mapgamedata.set(req.session.rid ,  mapgamedata.get(req.session.rid).map(chara => chara.toUpperCase()));

    mapgametime.set(req.session.rid , btime);
    mapgametheme.set(req.session.rid , theme);
    mapgameturn.set(req.session.rid , req.session.username);
    mapgametimer.set(req.session.rid , 1);
    mapgamestack.set(req.session.rid , []);

    var total_chara = mapgamedata.get(req.session.rid).length;
    mapgametotal.set(req.session.rid , total_chara);

    req.session.isplaying = true;
    req.session.replayed = false;

    io.once('connection' , (socket) => {
        socket.to(req.session.rid).emit('makePlayerPlayingEvent');
    });  

    res.end();
});


app.post('/kickPlayer' , function(req,res) {

    req.session.rid = null;
    req.session.joined = false;
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
    
    req.session.endgame = null;
    req.session.ingame = null;
    req.session.isplaying = false;
    req.session.joined = null;
    
    if(req.session.created) {
        mapcode.delete(req.session.username);
        mapcodefull = mapcodefull.filter(item => item!=req.session.rid);
        mapgametime.delete(req.session.rid)
        mapgametheme.delete(req.session.rid);
        mapgameturn.delete(req.session.rid);
        mapgametimer.delete(req.session.rid);
        mapgamewinner.delete(req.session.rid);
        mapgamedata.delete(req.session.rid);
        mapgamestack.delete(req.session.rid);
        mapgametotal.delete(req.session.rid);
    }

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
                if(key!=iousername && mapcode.get(key) == ioroomid) socket.emit('joinNotificationEvent' , (key));
            }
            
        }
    }


    if(iojoin == true && ioroomid) {
        if(io.sockets.adapter.rooms.get(ioroomid)) {
            var roomsize = io.sockets.adapter.rooms.get(ioroomid).size;
            if(roomsize == 1) mapcodefull.push(ioroomid);
            if(roomsize<=1) {
                mapcode.set(iousername , ioroomid);
                socket.join(ioroomid);
                socket.broadcast.to(ioroomid).emit('joinNotificationEvent' , iousername);
            }
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

        socket.emit('displayStrikerEvent' , mapgamestack.get(ioroomid).length ,  mapgametotal.get(ioroomid));

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


    if(ioreplay) {
        socket.broadcast.to(ioroomid).emit('replayNotifPlayerEvent');
        socket.emit('keepSettingEvent' , mapgametheme.get(ioroomid) , mapgametime.get(ioroomid));
    }



    socket.on('showTypingEvent' , (msg) => {
        socket.broadcast.to(ioroomid).emit('showTypingOpponentEvent' , msg)
    });


    // CHECK ANSWER HERE 
    socket.on('sendAnswerEvent' , (answer) => {
        
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
            for (let [key, value] of mapcode) {
                if(key!=iousername && mapcode.get(key) == ioroomid) mapgameturn.set(ioroomid , key ); 
            }

            socket.emit('playRightAudio');

            // WRONG ANSWER
        } else {

            var given2 = mapgamestack.get(ioroomid);

            //0 -> answer already given => play lock sound , else wrong answer => play error sound
            if(given2.includes(canswer)) socket.emit('answerErrorEvent' , 0);
            else socket.emit('answerErrorEvent' , 1);
            
            
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
            // console.log(x);

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


    socket.on('kickPlayerEvent' , () => {
        socket.emit('notifHostCancelFromPlayer');
        for (let [key, value] of mapcode) {
            if(key!=iousername) mapcode.delete(key);
            mapcodefull = mapcodefull.filter(item => item!=ioroomid);
            socket.broadcast.to(ioroomid).emit('notifKickPlayerEvent');
        }
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



function removeJsonAnswer(theme , answer , rid ,  banktab) {
 
    var similar = [];
    
    for(var i = 0 ; i < banktab.length ; i++) {
        if(containsWord(banktab[i] , answer) && banktab[i]!=answer)  similar.push(banktab[i]);
        if(containsWord(answer , banktab[i]) && banktab[i]!=answer)  similar.push(banktab[i]);
        


            if(theme == 'Dragon Ball') {
        
                if(answer == "TORTUE GENIAL") { similar.push("MUTEN ROSHI"); similar.push("ROSHI"); }
                if(answer == "MUTEN ROSHI" || answer == "ROSHI")  similar.push("TORTUE GENIAL");

                if(answer == "KAKAROT")  { similar.push("GOKU"); similar.push("SON GOKU"); similar.push("BLACK GOKU"); }
                if(answer == "GOKU" || answer == "SON GOKU" || answer == "BLACK GOKU")  similar.push("KAKAROT");

                if(answer == "BACTERIAN")  similar.push("BACTERIE");
                if(answer == "BACTERIE")  similar.push("BACTERIAN");

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

                if(answer == "C16")  { similar.push("C 16"); similar.push("C-16");}
                if(answer == "C 16")  { similar.push("C16"); similar.push("C-16");}
                if(answer == "C-16")  { similar.push("C 16"); similar.push("C16");}

                if(answer == "C19")  { similar.push("C 19"); similar.push("C-19");}
                if(answer == "C 19")  { similar.push("C19"); similar.push("C-19");}
                if(answer == "C-19")  { similar.push("C 19"); similar.push("C19");}

                if(answer == "HERCULE")  { similar.push("SATAN"); similar.push("MISTER SATAN");}
                if(answer == "SATAN" || answer == "MISTER SATAN")  { similar.push("HERCULE");}

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

            if(theme == 'My Hero Academia') {
                if(answer == "MIDORIYA IZUKU")  similar.push("DEKU");
                if(answer == "IZUKU")  similar.push("DEKU");
                if(answer == "DEKU")  { similar.push("IZUKU"); similar.push("MIDORIYA IZUKU");  }

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

                if(answer == "VONGOLA SETTIMO")  similar.push("FABIO");
                if(answer == "FABIO")  similar.push("VONGOLA SETTIMO");

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
                if(answer == "GREY" || answer == 'GREY FULLBUSTER')  {similar.push("GRAY FULLBUSTER"); similar.push("GRAY");}
                if(answer == "GRAY" || answer == 'GRAY FULLBUSTER')  {similar.push("GREY FULLBUSTER"); similar.push("GREY");}

                if(answer == "KANNA" || answer == 'KANNA ALBERONA')  {similar.push("CANA ALBERONA"); similar.push("CANA"); similar.push("KANA ALBERONA"); similar.push("KANA");}
                if(answer == "CANA" || answer == 'CANA ALBERONA')  {similar.push("KANNA ALBERONA"); similar.push("KANNA"); similar.push("KANA ALBERONA"); similar.push("KANA");}
                if(answer == "KANA" || answer == 'KANA ALBERONA')  {similar.push("CANA ALBERONA"); similar.push("CANA"); similar.push("KANNA ALBERONA"); similar.push("KANNA");}
              
                if(answer == "SHERRIA" || answer == 'KANNA ALBERONA')  {similar.push("CANA ALBERONA"); similar.push("CANA"); similar.push("KANA ALBERONA"); similar.push("KANA");}
                if(answer == "CANA" || answer == 'CANA ALBERONA')  {similar.push("KANNA ALBERONA"); similar.push("KANNA"); similar.push("KANA ALBERONA"); similar.push("KANA");}
                if(answer == "KANA" || answer == 'KANA ALBERONA')  {similar.push("CANA ALBERONA"); similar.push("CANA"); similar.push("KANNA ALBERONA"); similar.push("KANNA");}

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





















server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
