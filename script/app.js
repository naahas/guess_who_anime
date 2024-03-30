
var socket = io();
socket.on('connect' , () => { console.log(socket.id)});

var app = new Vue({

    el: '#app',

    data: function() {
        return {
            testo:"pkm",
            username:'',
            usernamedisplay: '',
            roomid: '',
            opponents:'',
            bombtime:'',
            currenttheme:'',
            opponentres:'',
            canswer:'',
            gwinner: 'SLAYER',
            nbplayer: 0,
            currentmode: 'Bombanime'
            
            
        }
    },


    methods: {

        createLobby: function() {
            var body = {
                val: 'create'
            };

            var config = {
                method: 'post',
                url: '/create',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.href = "/";
             
            })
            .catch(function (err) {
                console.log(err);
            });

        },

        joinLobby: function() {
            var body = {
                val: 'join'
            };

            var config = {
                method: 'post',
                url: '/join',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.href = '/';
            })
            .catch(function (err) {
                console.log(err);
            });

        },


        playSolo: function() {
            var body = {
                val: 'solo'
            };

            var config = {
                method: 'post',
                url: '/playSolo',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                console.log(err);
            });


        },


        redirectMode: function() {
            location.href = '/mode';
        },


        submitUsername: function() {
            var body = {
                val: this.username
            };

            var config = {
                method: 'post',
                url: '/subUsername',
                data: body
            };

            axios(config)
            .then(function (res) {
                if(res.data == "good") location.reload();
                else editError(res.data);
            })
            .catch(function (err) {
                console.log(err);
            });

        },


        submitCode: function() {
            var body = {
                val: this.roomid
            };

            var config = {
                method: 'post',
                url: '/codeCheck',
                data: body
            };

            axios(config)
            .then(function (res) {
                if(res.data == "non") errorCodeInput();
                else location.reload();
            })
            .catch(function (err) {
                
            });
        },


        launchGame: function() {
            var body = {
                val: 'val'
            };

            var config = {
                method: 'post',
                url: '/game',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.href = '/game';
            })
            .catch(function (err) {
                
            });

        },

        sendGameSetting: function() {
            var bombtime = $('#rangeid').val();
            var themechoice = $('.cselect').find(":selected").val();


            var body = {
                val1: bombtime,
                val2: themechoice
            };

            var config = {
                method: 'post',
                url: '/confirmSetting',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                
            });


            socket.emit('handleTimerEvent');

        },


        editUsername: function() {
            var body = {
                val: 'edit'
            };

            var config = {
                method: 'post',
                url: '/editUsername',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                
            });
        },


        returnHome: function() {
            location.href = '/';
        },


        returnBack: function(backval) {

            if(backval == 'join')  {

                var body = {
                    val: 'val'
                };

                var config = {
                    method: 'post',
                    url: '/returnBackJoin',
                    data: body
                };

                axios(config)
                .then(function (res) {
                    location.reload();
                })
                .catch(function (err) {
                    
                });

            } else {

                var body = {
                    val: 'val'
                };

                var config = {
                    method: 'post',
                    url: '/returnBackCreate',
                    data: body
                };

                axios(config)
                .then(function (res) {
                    location.reload();
                })
                .catch(function (err) {
                    
                });

            }



        },


        checkAnswer: function(elem) {
            this.canswer = elem.value;
            elem.value = '';

            //0 -> emit by player , 1-> emit by bot
            socket.emit('sendAnswerEvent' , this.canswer , 0);
        },


        exitGame: function() {
            var body = {
                val : 'val'
            };

            var config = {
                method: 'post',
                url: '/exitGame',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                
            });
        },


        replay: function() {
            var body = {
                val : 'val'
            };

            var config = {
                method: 'post',
                url: '/replay',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                
            });
        },

        kickPlayer: function() {
            socket.emit('kickPlayerEvent');
        },

        testFunction: function() {
            alert('TESTOO');
        },


        reload: function() {
            location.reload();
        },



        selectMode: function(mode) {
            this.currentmode = mode;
            $('.modebtn').removeClass('disablemode2');
            $('.modebtn').prop("disabled", false);

            var gridbox = document.getElementById('gridboxdiv');

            for(var i = 0 ; i < gridbox.children.length ; i ++) {
                var modechild = gridbox.children[i];
                if(modechild.getAttribute('name') == mode) {
                    $('.casecontainer').removeClass('selectedclass');
                    modechild.classList.add('selectedclass');
                    break;
                }
            }

        },


        confirmMode: function() {
                var cmode = this.currentmode;

                var body = {
                    val : cmode
                };
    
                var config = {
                    method: 'post',
                    url: '/setMode',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                    location.href = '/';
                })
                .catch(function (err) {
                    
                });

        }

    },

    created:  function() {
        

    },

   
    mounted: async function() {
        
        socket.on('showSettingEvent' , (iouser) => {
            if(iouser != null) $('.cjdiv').show();
            else $('.usernamediv').show();
        });
        
        socket.on('displayUsernameEvent' , (iouser) => {
            this.usernamedisplay = iouser + " (vous)";
            this.username = iouser;
            $('.userdiv').show();
            $('.currentxt').show();
        });


        //for host
        socket.on('displayCodeEvent' , (roomid) => {
            editCode(roomid);
        });

        //for players
        socket.on('displayJoinDiv' , (roomid) => {
            if(roomid !=null) $('.waitplayerdiv').show();
            else $('.joindiv').show();
        });


        socket.on('joinNotificationEvent' , (nbplayer) => {
            // $('.waittxt').html("EN ATTENTE D'UN JOUEUR : 1/1 (" + player + ")");
            this.nbplayer = nbplayer;
            $('.kickdiv').show();
            $('.startbtn').removeClass('disablemode');
        });


        //AFTER RELOAD
        socket.on('joinCountNotificationEvent' , (nbplayer) => {
            this.nbplayer = nbplayer;
            if(nbplayer > 0) $('.startbtn').removeClass('disablemode');
            $('.kickdiv').show();
        });


        socket.on('changeGamePlayerStatusEvent' , () => {
            ingameRequest();
        });


        socket.on('makePlayerPlayingEvent' , () => {
            isplayingRequest();
        });


        socket.on('displaySetting', (nmode) => {
            $('.rdiv').show();
            if(nmode == 1) $('.navdiv').show();
        });


        socket.on('displayOpponentsM1' , (opponents , ruser) => {   
            this.opponents = opponents;

            editOpponent(opponents , ruser);
        });


        socket.on('displayWaitMsgGameEvent' , () => {
            $('.waitgametxt').show();
        });



        socket.on('displayPostRule' , (time , theme) => {
            this.bombtime = time;
            this.currenttheme = theme;
            $('.rdiv2').show();
            $('.backigbtn').show();
        });


        socket.on('startSoundEvent' , () => {
            playTimer();
        });


        socket.on('showTypingOpponentEvent' , (msg , indexp) => {
            // console.log(msg);
            $('.pindex' + indexp).val(msg);
        });


        socket.on('cancelGameExitEvent' , () => {
            cancelRequest();
        });


        socket.on('notifHostCancelFromPlayer' , () => {
            this.nbplayer = 0;
            $('.startbtn').addClass('disablemode');

        });


        socket.on('resetid' , () => {
            var body = {
                val : 'val'
            };

            var config = {
                method: 'post',
                url: '/resetID',
                data: body
            };

            axios(config)
            .then(function (res) {
                
            })
            .catch(function (err) {
                
            });
        })


        socket.on('notifKickPlayerEvent' , () => {
            handleKick();
        });


        socket.on('denableTurnInput' , (nbturn) => {

            this.opponentres = '';
            handleInput(nbturn);
        });


        socket.on('denableTurnInput2' , (turnplayer) => {
            //IF GAME'S TURN IF THIS SOCKET PLAYER
            if(this.username == turnplayer) handleInput(0)
        }); 


        socket.on('testEvent' , () => {
            // alert('WONDER');
            console.log('wshhhhh')
            
        });


        socket.on('answerErrorEvent' , (errtype  , indexp) => {
            if(errtype == 0) editAnswerError2(indexp);
            else editAnswerError1()
        });


        socket.on('playRightAudio', () => {
            var ta = document.getElementById('audio2');
            ta.volume = 0.5;
            const promise = ta.play();  
                
            let playedOnLoad;

            if (promise !== undefined) {
                promise.then(_ => {
                    playedOnLoad = true;
                }).catch(error => {
                    playedOnLoad = true;
                });
            }
            
            $('.tmpinputclass').addClass('pulseclass');
            setTimeout(() => {
                $('.tmpinputclass').removeClass('pulseclass');
            }, 500);

        });



        socket.on('changeBombStepEvent' , (step) => {
            editBombPic(step);
        });


        socket.on('endGameEvent' , (winner , host) => {
            if(this.usernamedisplay == host) displayPostToHost();
            displayWinner(winner);
        });


        socket.on('playSlashEvent' , () => {
            playSlash();
        });
        


        socket.on('endGameEventAfterReload' , (winner) => {
            displayWinner2(winner);
        });


        socket.on('displayBeginning' , () => {
            $('.p1div').show();
            $('.bombdiv').show();
        });


        socket.on('displayRePlay' , () => {
            $('.replaybtn').show();
        });


        socket.on('replayNotifPlayerEvent' , () => {
            replayRequest();
        });


        socket.on('displayStrikerEvent' , (wchara , totalchara) => {
            editStriker(wchara , totalchara);
        });


        socket.on('keepSettingEvent' , (btheme , btime) => {
            editSelect(btheme , btime);   
        });


        socket.on('setBotAnswerEvent' , (botanswer) => {
            editBotAnswer(botanswer);
        });


        socket.on('displayTurnPicEvent' , (indexp) => {
            displayTurnPic(indexp);
        });

        socket.on('displaySkullEvent' , (indexp) => {
            displaySkullPic(indexp);
        });



        socket.on('resetInputForOpponent' , (indexp) => {
            $('.pindex' + indexp).val('');
        });


        socket.on('clearAllInput' , () => {
            $('.p0input').val('');
        });

        
        socket.on('hakaiPlayerEvent' , (indexp) => {
            $('.pindex' + indexp).addClass('disablemode2');
            $('.pindex' + indexp).prop("disabled", true);
        });


        socket.on('updateMode' , (mode) => {
            this.currentmode = mode;
            editMode(mode);
        });


        socket.on('updateMode' , (mode) => {
            this.currentmode = mode;
            $('.modetxtdiv').show();
        });


        socket.on('sendLinkEvent' , (ytblink) => {
           
        })


        

    },


})




//JS AND JQUERY SECTION


$('#subbtn').on('touchend click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    app.checkAnswer();
})


$('.p0input').on('click' , function() {
    console.log('mdr')
});


$('.closeimg2').on('click' , function() {
    $('.postnavdiv').slideToggle();
});


$('.closeimg').on('click' , function() {
    $('.navdiv').slideToggle();
});


$('.rdiv').on('click' , function() {
    $('.navdiv').slideToggle();
});


$('.rdiv2').on('click' , function() {
    $('.postnavdiv').slideToggle();
});


$('.soundpic').on('click' , function() {
    var ta = document.getElementById('audio1');
    if(ta.paused == false) {
        $('.soundpic').attr("src" , "notsound.png");
        ta.pause();  
    } else {
        $('.soundpic').attr("src" , "sound.png");
        ta.volume = 0.4;
        const promise = ta.play();  
        
        let playedOnLoad;

        if (promise !== undefined) {
            promise.then(_ => {
                playedOnLoad = true;
            }).catch(error => {
                playedOnLoad = true;
            });
        }
    }
    
    
})


function handleKick() {
    var body = {
        val: 'val'
    };

    var config = {
        method: 'post',
        url: '/kickPlayer',
        data: body
    };

    axios(config)
    .then(function (res) {
        location.reload();
    })
    .catch(function (err) {
        
    });
}


function playTimer() {
    var ta = document.getElementById('audio1');
    ta.loop = true;
    ta.volume = 0.4;
    const promise = ta.play();  
        
    let playedOnLoad;

    if (promise !== undefined) {
        promise.then(_ => {
            playedOnLoad = true;
        }).catch(error => {
            playedOnLoad = true;
        });
    }
}   



function editError(error) {
    $('.errortxt').text(error);
    $('.errortxt').show();
}


function editCode(roomid) {
    $('.codetxt').html('CODE DU SALON : ' + roomid)
}


function errorCodeInput() {
    $('#inputroom').addClass('tmpshake');
    $('#inputroom').val('');
    $("#codebtn").animate({'background-color': '#e26381'}, 400);
    setTimeout(function(){
        $('#inputroom').removeClass('tmpshake');
     },300);    
     $("#inputroom").trigger('blur'); 
}


function editAnswerError1() {
    $('.tmpinputclass').addClass('tmpshake');
    $(".tmpinputclass").animate({'border-bottom-color': '#e26381'}, 400);
    setTimeout(function(){
        $('.tmpinputclass').removeClass('tmpshake');
     },300);    

     setTimeout(function(){
        $(".tmpinputclass").css('border-bottom-color' , '#e0cbcb');
     },500);  

     $(".tmpinputclass").trigger('blur'); 

     var ta = document.getElementById('audio3');
     ta.volume = 0.5;
     const promise = ta.play();  
                
     let playedOnLoad;

     if (promise !== undefined) {
         promise.then(_ => {
             playedOnLoad = true;
         }).catch(error => {
             playedOnLoad = true;
         });
     }
     
     $('.tmpinputclass').focus();

}

function editAnswerError2(indexp) {


    //SHAKE AND INPUT RED EFFECT
    $('.tmpinputclass').addClass('tmpshake');
    $(".tmpinputclass").animate({'border-bottom-color': '#e26381'}, 400);
    setTimeout(function(){
        $('.tmpinputclass').removeClass('tmpshake');
     },300);    

     setTimeout(function(){
        $(".tmpinputclass").css('border-bottom-color' , '#e0cbcb');
     },500);  

     $(".tmpinputclass").trigger('blur'); 


     //LOCK EFFECT
     $('.tmplockclass').show();
     

     setTimeout(() => {
        $('.tmplockclass').hide();
     }, 700);


     var ta = document.getElementById('audio5');
     ta.volume = 0.8;
     const promise = ta.play();  
                
     let playedOnLoad;

     if (promise !== undefined) {
         promise.then(_ => {
             playedOnLoad = true;
         }).catch(error => {
             playedOnLoad = true;
         });
     }
     
     $('.tmpinputclass').focus();

}




function ingameRequest() {
    var body = {
        val: 'val'
    };

    var config = {
        method: 'post',
        url: '/igstatus',
        data: body
    };

    axios(config)
    .then(function (res) {
        location.href = '/game';
    })
    .catch(function (err) {
        
    });
}


function isplayingRequest() {
    var body = {
        val: 'val'
    };

    var config = {
        method: 'post',
        url: '/ipstatus',
        data: body
    };

    axios(config)
    .then(function (res) {
        location.reload();
    })
    .catch(function (err) {
        
    });
}



function cancelRequest() {
    var body = {
        val: 'val'
    };

    var config = {
        method: 'post',
        url: '/cancelPreGame',
        data: body
    };

    axios(config)
    .then(function (res) {
        location.reload();
    })
    .catch(function (err) {
        
    });
}



function handleInput(nbturn) {
    if(nbturn == 0) {
        $('.tmpinputclass').removeClass('disablemode2');
        $(".tmpinputclass").removeAttr('disabled');
        $('.tmpinputclass').focus();
    } else {
        $('.tmpinputclass').addClass('disablemode2');
        $(".tmpinputclass").prop("disabled", true);
    } 

}




function editBombPic(step) {
    if(step == 1) {
        $(".bombpic").removeClass('bombpic2');
        $(".bombpic").removeClass('bombpic3');
        $(".bombpic").attr('src', "step1.png");
    } 

    if(step == 2) {
        $(".bombpic").removeClass('bombpic3');
        $(".bombpic").attr('src', "step2.png");
        $(".bombpic").addClass('bombpic2');
    }

    if(step == 3) {
        $(".bombpic").removeClass('bombpic2');
        $(".bombpic").attr('src', "step3.png");
        $(".bombpic").addClass('bombpic3');
    } 
}


function displayWinner2(winner) {
    app.gwinner = winner;


    $('.container').hide();
    $('.bombdiv').hide();
    $('.winnerdiv').show();

    var ta = document.getElementById('audio1');
    ta.pause();
}


function displayWinner(winner) {
    playExplode();

    var body = {
        val: winner
    };

    var config = {
        method: 'post',
        url: '/endGame',
        data: body
    };

    axios(config)
    .then(function (res) {
        
    })
    .catch(function (err) {
        
    });

    app.gwinner = winner;
    $('.container').hide();
    $('.bombdiv').hide();
    $('.winnerdiv').show();

    var ta = document.getElementById('audio1');
    ta.pause();


}


function replayRequest() {
    var body = {
        val: 'val'
    };

    var config = {
        method: 'post',
        url: '/replayPlayer',
        data: body
    };

    axios(config)
    .then(function (res) {
        location.reload();
    })
    .catch(function (err) {
        
    });
}


function playExplode() {
    var ta = document.getElementById('audio4');
     ta.volume = 0.3;
     const promise = ta.play();  
                
     let playedOnLoad;

     if (promise !== undefined) {
         promise.then(_ => {
             playedOnLoad = true;
         }).catch(error => {
             playedOnLoad = true;
         });
     }
}


function playSlash() {
    var ta = document.getElementById('audio6');
     ta.volume = 0.6;
     const promise = ta.play();  
                
     let playedOnLoad;

     if (promise !== undefined) {
         promise.then(_ => {
             playedOnLoad = true;
         }).catch(error => {
             playedOnLoad = true;
         });
     }
}


function displayPostToHost() {
    $('.replaybtn').show();
}


function editStriker(wchara , totalchara) {

    var stxt = document.getElementById('strikertxt');
    stxt.innerHTML = wchara + " ノ " + totalchara; 
    $('.strikerdiv').show();
}


function editSelect(btheme , btime) {
    var ss = document.getElementById('selectid');
    ss.value = btheme;

    var ii = document.getElementById('rangeid');
    ii.value = btime;

    var iitxt = document.getElementById('secvalid');
    iitxt.innerHTML = btime;


}


function hideTool() {

    var hasblur = $('#strikertxt').hasClass('blurclass');
    if(hasblur) $('#strikertxt').removeClass('blurclass');
    else $('#strikertxt').addClass('blurclass');
    
}

function displayTurnPic(indexp) {
    // console.log("passez la fleche a " , indexp)
    $('.turnpic').hide();
    $('.turnpic' + indexp).show();
}

function displaySkullPic(indexp) {
    $('.skullpic' + indexp).show();
    $('.ptxt' + indexp).addClass('lostclass');
}


function editBotAnswer(botanswer) {
    
    $('.pindex' + 1).val(botanswer);
    setTimeout(() => {
        socket.emit('sendAnswerEvent' , botanswer , 1);
        $('.pindex' + 1).val('');
    }, 700);
    
    
}



function editOpponent(players , username) {
    
    var container = document.getElementById('containerid');
    var numberOfElements = players.length;


    var angle = (2 * Math.PI) / numberOfElements;
    var radius = 240; // Rayon du cercle

    for(let i = 1 ; i <= numberOfElements ; i++) {

        var playerdiv = document.createElement('div');
        
        
        playerdiv.setAttribute('id' , 'playerdiv' + i);
        playerdiv.classList.add('playerdiv');

        
        container.appendChild(playerdiv);

    }



    
    for (var i = 0; i < numberOfElements; i++) {
        var playerdiv = document.getElementById('playerdiv' + (i + 1));
        var x = Math.cos(i * angle) * radius;
        var y = Math.sin(i * angle) * radius;
        playerdiv.style.top = container.clientHeight / 2 - playerdiv.offsetHeight / 2 + y + 'px';
        playerdiv.style.left = container.clientWidth / 2 - playerdiv.offsetWidth / 2 + x + 'px';

        var playertxt = document.createElement('p');

        playertxt.classList.add('ptxt');
        playertxt.classList.add('ptxt' + i);
        playertxt.innerHTML = players[i];

        var pinput = document.createElement('input');

        pinput.classList.add('p0input');
        pinput.classList.add('pindex' + i);
        pinput.classList.add('disablemode2');
        pinput.setAttribute('disabled' , 'true');
        pinput.type = 'text';


        var padlockpic = document.createElement('img');
        
        padlockpic.setAttribute('alt' , 'LOCKPIC');
        padlockpic.setAttribute('src' , 'padlock5.png');
        padlockpic.classList.add('lockpic');

        var turnpic = document.createElement('img');

        turnpic.classList.add('turnpic' + i);
        turnpic.setAttribute('src' , 'turnpic3.png');
        turnpic.setAttribute('alt' , 'TURNPIC');
        turnpic.classList.add('turnpic');
        
        var skullpic = document.createElement('img');

        skullpic.classList.add('skullpic' + i);
        skullpic.setAttribute('src' , 'skull1.png');
        skullpic.setAttribute('alt' , 'SKULLPIC');
        skullpic.classList.add('skullpic');


        if(players[i] == username) {
       
            playertxt.classList.add('tmptxtclass');
            pinput.classList.add('tmpinputclass');
            padlockpic.classList.add('tmplockclass');
            turnpic.classList.add('tmpturnclass');
            skullpic.classList.add('tmpskullpic');
            pinput.setAttribute('v-model' , 'canswer');

            pinput.addEventListener('keypress' , function(event) {
                if(event.key === 'Enter') {
                    app.checkAnswer(this);

                }
            });


            pinput.addEventListener("input", function(e) {
                socket.emit('showTypingEvent' , e.target.value);
            });
            
            
            
        }


        


        
        playerdiv.appendChild(turnpic);
        playerdiv.appendChild(skullpic);
        playerdiv.appendChild(playertxt)
        playerdiv.appendChild(padlockpic);
        playerdiv.appendChild(pinput);

        pinput.focus();
        
    }       
}


function editMode(mode) {
    var gridbox = document.getElementById('gridboxdiv');

    if(gridbox) {

      

    }

}





var taudio = document.getElementById('audio1');

if(taudio) {
    if(taudio.paused == true) {
        $('.soundpic').attr("src" , "notsound.png");
    } else $('.soundpic').attr("src" , "sound.png");

    $('.soundpic').show();
}




const sliderEl = document.getElementById('rangeid');
const sliderValue = document.getElementById('secvalid')

if(sliderEl) {

    sliderEl.addEventListener("input", (event) => {
    const tempSliderValue = event.target.value; 
    
    sliderValue.textContent = tempSliderValue;
    
    const progress = (tempSliderValue / sliderEl.max) * 100;
    
    sliderEl.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;
    })



}




const opening = ["Dragon Ball Z- Opening 1",
"One Piece - Opening 14",
"My Hero Academia - Opening 2",
"Vinland Saga - Opening 3",
"One Punch Man - Opening 1",
"Black Clover - Opening 3",
"Naruto Shippuden - Opening 13",
"HunterXHunter - Opening 1",
"My Hero Academia - Opening 2"];

if(btnAnswer) {

for (let i = 0; i < opening.length; i++){
    var btnAnswer = document.getElementById('choice' + (i));
    var span = btnAnswer.childNodes[0]
    span.innerHTML = opening[i];
}

const generateAnswers = () => {
    Math.random(); //[]
} 


}