
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




//TODO : add input or bomb effect when anwer is right (pulse...)
//TODO : make replay button working 


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

    //IF PLAYER TRY TO RELOAD AFTER HOST LEAVE THE GAME
    if(req.session.isplaying == true && req.session.joined == true && !mapgameturn.get(req.session.rid)) {
        req.session.endgame = null;
        req.session.ingame = null;
        req.session.joined = false;
        req.session.isplaying = false;
        req.session.rid = null;
    }
    

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



app.post('/confirmSetting' , function(req,res) {
    var btime = req.body.val1;
    var theme = req.body.val2;

    if(theme == 'Naruto') mapgamedata.set(req.session.rid , profile.Character.Naruto);
    if(theme == 'One Piece') mapgamedata.set(req.session.rid , profile.Character.OnePiece)
    if(theme == 'Dragon Ball') mapgamedata.set(req.session.rid , profile.Character.Dbz)
    if(theme == 'Tout') mapgamedata.set(req.session.rid , profile.Character.Tout)

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
    }

    req.session.created = null;
    req.session.rid = null;
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

        if(ctheme == 'Naruto') banktab = mapgamedata.get(ioroomid).map(chara => chara.toUpperCase());
        if(ctheme == 'One Piece') banktab = mapgamedata.get(ioroomid).map(chara => chara.toUpperCase());
        if(ctheme == 'Dragon Ball') banktab = mapgamedata.get(ioroomid).map(chara => chara.toUpperCase());
        if(ctheme == 'Tout') banktab = mapgamedata.get(ioroomid).map(chara => chara.toUpperCase());
       
        //IF ANSWER IS RIGHT
        if(banktab.includes(canswer)) {
            
            removeJsonAnswer(ctheme , canswer , ioroomid , banktab);
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
        console.log("tab name -> ", banktab[i])
        console.log("answer -> " , answer)
        console.log("tab name containsword answer -> " ,  containsWord(banktab[i] , answer))
        console.log("answer containsword tab name -> " , containsWord(answer , banktab[i]))
        console.log("------------------------------")
        if(containsWord(banktab[i] , answer))  similar.push(banktab[i]);
        if(containsWord(answer , banktab[i]))  similar.push(banktab[i]);

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

       

    }    



    console.log("similar char -> " , similar)
    similar.push(answer);

    for(var i = 0 ; i < similar.length ; i++) {
        var toRemove = similar[i];
        mapgamedata.set(rid , mapgamedata.get(rid).filter(item => item!=toRemove));
    }   

 
     



}





















server.listen(process.env.PORT || 7000 , function(err) {
    if(err) throw err;
    console.log("-------------------");
    console.log("Server on " , server.address().port);

})
