

if (window.location.hostname === 'https://guesswhoanime-fd0ebc6338b0.herokuapp.com/') {
    window.history.replaceState(null, null, 'www.youtube.com');
}




var socket = io();
socket.on('connect' , () => { console.log(socket.id)});

// Vue.component('message', {
//     props: ['username', 'content'],
//     template: `
//       <div class="chat-message">
//         <strong>{{ username }}</strong>: {{ content }}
//       </div>
//     `
//   });

  





var app = new Vue({

    el: '#app',

    data: function() {
        return {
            testo:"pkm",
            username:'',
            usernamedisplay: '',
            roomid: '',
            opponents:'',
            timer:'0',
            currenttheme:'',
            opponentres:'',
            canswer:'',
            gwinner: 'SLAYER',
            nbplayer: 1,
            maxplayer: 1,
            currentmode: 'Bombanime',
            hand: 3,
            ruletxt: '',
            ruletitle: '',
            trivia_default_mode: 'Aléatoire',
            trivia_default_theme : 'Mainstream',
            whoanime_default_perso: 24,
            whoanime_default_theme : 'Tout',
            trivia_default_trivianbq : 10
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


        goSetting: function() {
            location.href = '/setting';
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

        sendGameSetting1: function() {
            var bombtime = $('#rangeid').val();
            var themechoice = $('.cselect').find(":selected").val();


            var body = {
                val1: bombtime,
                val2: themechoice
            };

            var config = {
                method: 'post',
                url: '/confirmSettingBombanime',
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

        sendGameSetting2: function() {
            var timer = $('#rangeid').val();
            var difficulty = $('.cselect').find(":selected").val();
            var nbturn = $('.cselect2').find(":selected").val();


            var body = {
                val1: timer,
                val2: difficulty,
                val3: nbturn
            };

            var config = {
                method: 'post',
                url: '/confirmSettingCitanime',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                
            });


            socket.emit('handleTimerEvent2');

        },

        sendGameSetting3: function() {
            var nbcard = $('.cselect').find(":selected").val();

            var body = {
                val1: nbcard
            };

            var config = {
                method: 'post',
                url: '/confirmSettingCardanime',
                data: body
            };

            axios(config)
            .then(function (res) {
                location.reload();
            })
            .catch(function (err) {
                
            });


            socket.emit('firstCardTimerEvent');


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



        launchTriviaGame: function() {

            var body = {
                mode : this.trivia_default_mode,
                nbq :this.trivia_default_trivianbq,
                theme : this.trivia_default_theme
            };

            var config = {
                method: 'post',
                url: '/confirmSettingTrivianime',
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


        launchWhoGame: function() {

            var body = {
                nbq :this.whoanime_default_perso,
                theme : this.whoanime_default_theme
            };

            var config = {
                method: 'post',
                url: '/confirmSettingWhoanime',
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
                        location.reload();
                    })
                    .catch(function (err) {    
                    })
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



        setTriviaMode: function(mode) {
            this.trivia_default_mode = mode;
        },



        setTriviaNbq: function(nbq) {
            this.trivia_default_trivianbq = nbq;

            showTriviaNbqRule(nbq);

        },



        setWhoanimePerso: function(nbq) {
            this.whoanime_default_perso = nbq;


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

            socket.emit('updateCurrentGameAfterLeavingEvent');
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

        },


        goNextTriviaQuestion: function() {
            $('.trivianextbtn').addClass('completedisable');

            var config = {
                method: 'post',
                url: '/triggerNextTriviaQuestion',
                data: ''
            };

            axios(config)
            .then(function (res) {
                if(res.status == 200) socket.emit('triggerNewTQEffect');
            })
            .catch(function (err) {
                
            });
        }


        


    },

    created:  function() {
        setTimeout(() => {
            $('#usernameinput').focus();
        },99);
    },

   
    mounted: async function() {

     
        socket.on('updateMode' , (mode) => {
            this.currentmode = mode;
        })

        socket.on('reloadForHost', () => {
            socket.emit('verifyReloadForHost')
        });


        socket.on('reloadFinalHost' , () => {
            location.reload();
        });
        
        socket.on('showSettingEvent' , (iouser) => {
            if(iouser != null) $('.btndiv').show();
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
            this.roomid = roomid;
            editCode(roomid);
        });

        //for players
        socket.on('displayJoinDiv' , (roomid) => {
            if(roomid !=null) $('.waitplayerdiv').show();
            else $('.joindiv').show();
        });
  

        socket.on('joinNotificationEvent' , (nbplayer , maxplayer) => {
            // $('.waittxt').html("EN ATTENTE D'UN JOUEUR : 1/1 (" + player + ")");
            this.maxplayer = maxplayer;
            this.nbplayer = nbplayer + 1;
            $('.kickdiv').show();
            $('.startbtn').removeClass('disablemode');
        });


        //AFTER RELOAD
        socket.on('joinCountNotificationEvent' , (nbplayer , maxplayer) => {
            console.log(maxplayer)
            this.maxplayer = maxplayer;
            this.nbplayer = nbplayer;
            if(nbplayer > 1) $('.startbtn').removeClass('disablemode');
            $('.kickdiv').show();
        });


        socket.on('changeGamePlayerStatusEvent' , (imode) => {
            ingameRequest(imode);
        });


        socket.on('makePlayerPlayingEvent' , () => {
            isplayingRequest();
        });


        socket.on('displaySetting', () => {
            $('.rdiv').show();
            $('.navdiv').show();
            // if(nmode == 1) $('.navdiv').show();
            // if(nmode == 2) $('.navdiv2').show();
        });


        socket.on('displaySettingTrivia' , () => {
            $('.trivianavbar').show();
            $('.triviarule').show();
        });

        socket.on('displaySettingWhoanime' , () => {
            $('.trivianavbar').show();
            $('.triviarule').show();
        });



        socket.on('displayOpponents' , (opponents , ruser) => {   
            this.opponents = opponents;
            editOpponent(opponents , ruser);
        });

        socket.on('displayBombaBonus' , (character , auth1 , auth2 , auth3) => {   
            showBonus(character , auth1 , auth2 , auth3);
        });


        socket.on('displayWaitMsgGameEvent' , () => {
            $('.waitgametxt').show();
        });


        socket.on('displayPostRule' , (time , theme ) => {
            this.timer = time;
            this.currenttheme = theme;
            $('.rdiv2').show();
            $('.backigbtn').show();
        });


        socket.on('startSoundEvent' , () => {
            playTimer();
        });


        socket.on('showTypingOpponentEvent' , (msg , indexp) => {
            $('.pindex' + indexp).val(msg);
        });


        socket.on('cancelGameExitEvent' , () => {
            cancelRequest();
        });


        socket.on('notifHostCancelFromPlayer' , (uuu) => {
            this.nbplayer -= 1;
            if(this.nbplayer < 2 ) $('.startbtn').addClass('disablemode')
        });


        socket.on('notifHostCancelKickAllPlayer' , (uuu) => {
            this.nbplayer = 1;
            $('.startbtn').addClass('disablemode')
        });




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
            displayWinnerHost(winner);
        });


        socket.on('displayBeginning' , () => {
            $('.p1div').show();
            $('.bombdiv').show();
        });



        socket.on('displayRePlay' , () => {
            $('.replaybtn').show();


            $('.trivianextbtn').fadeOut(500);
        });


        socket.on('replayNotifPlayerEvent' , () => {
            replayRequest();
        });


        socket.on('displayStrikerEvent' , (wchara , totalchara) => {
            editStriker(wchara , totalchara);
        });


        socket.on('keepSettingEvent' , (btheme , btime) => {
            editSetting(btheme , btime);   
        });

        socket.on('keepSettingEvent2' , (bturn , bdiff , btime) => {
            editSetting2(bturn , bdiff , btime);   
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
        });


        socket.on('updateMode' , (mode) => {
            this.currentmode = mode;
            $('.modetxtdiv').show();
        });


        socket.on('reloadGameForOtherPlayer' , () => {
            location.reload();
        });


        socket.on('updateCharaEvent' , () => {
        
            var config = {
                method: 'post',
                url: '/updateForBonusCharacter',
                data: ''
            };

            axios(config)
            .then(function (res) {
                updateBombBonus(res.data.chara , res.data.auth1 , res.data.auth2 , res.data.auth3)
            })
            .catch(function (err) {
                
            });
        });



        socket.on('showTriviaNbqEvent' , (nbq) => {
            showTriviaNbqRule(nbq);
        });



        socket.on('displayTriviaDataEvent' , (data , nbq) => {
            showTriviaQR(data , nbq);
        });


        socket.on('updateTriviaTimer', (timeLeft) => {
            if(timeLeft > 0) {
                $('#countdown-container').show();

                // if(timeLeft <= 0) $('.triviasubans').addClass('triviadisableanswer');

                const progressBar = document.getElementById('progress-bar');
                const progressPercentage = 100 - timeLeft;
        
                progressBar.style.filter = `saturate(${timeLeft}%)`;
                progressBar.style.height = progressPercentage + '%';
            }
        });


        
        socket.on('endtriviatimer', () => {
            handleEndTriviaRoundAnswer();

            /* TO ENABLE NEXT TRIVIA Q FOR HOST */
            var config = {
                method: 'post',
                url: '/enableNextTriviaQBTNForHost',
                data: ''
            };

            axios(config)
            .then(function (res) {
                if(res.status == 200) {
                    $('.trivianextbtn').removeClass('completedisable');
                    $('.trivianextbtn').show();
                }
            })
            .catch(function (err) {
                
            });

        });


        socket.on('updateAnswerStatEvent' , (answer , data , stat) => {
          
            var tmp = 1;
            document.querySelectorAll('.triviasubans').forEach(el => {
                if(el.textContent == answer && stat == 1) {
                    el.classList.add('triviaselectedanswer');
                    $('.triviasubans').addClass('triviadisableanswer')
    
                    $('.triviaselectedanswer').css('background-color' , 'rgba(116, 118, 88, 0.712)')
                    $('.triviaselectedanswer').css('color' , 'white')
                } else if(stat == 0) {
                    if(tmp == data.coanswer) {
                        el.classList.add('triviagoodanswer');
                    } else {
                        if(answer == el.textContent) {
                            el.classList.add('triviawronganswer')
                        }
                    }


                    $('.triviasubans').addClass('triviadisableanswer')
                    $('.triviaselectedanswer').css('background-color' , 'rgba(116, 118, 88, 0.712)')
                    $('.triviaselectedanswer').css('color' , 'white')

                }

                tmp++;

            });
        });



        socket.on('enableTriviaNextEvent' , () => {
            $('.trivianextbtn').removeClass('completedisable');
            $('.trivianextbtn').show();
        });
        
        socket.on('displayTriviaNextEvent' , () => {
            $('.trivianextbtn').show();
        });



        socket.on('hidePreTriviaQuestionEvent' , () => {
            $('.triviaanswerdiv , .triviaheadquestiondiv').addClass("hidetriviaroundclass");
            $('.triviafastestspan').fadeOut(500);

            setTimeout(() => {
                $('#maindiv .triviaanswerdiv, #maindiv .triviaheadquestiondiv').remove();
            }, 500);

            var body = {
                val: ''
            };
        
            var config = {
                method: 'post',
                url: '/resetTriviaAnswer',
                data: body
            };
        
            axios(config)
            .then(function (res) {
              
            })
            .catch(function (err) {
                
            });
        });



        socket.on('displayTriviaOpponentEvent' , (players_tab) => {
            displayTriviaOpponent(players_tab);
        });


        socket.on('displayWhoanimeOpponentEvent' , (players_tab) => {
            displayWhoanimeOpponent(players_tab);
        });



        
        socket.on('showTriviaFastestEvent' , (fastest) => {
            if(fastest) showTriviaFastestPlayer(fastest);
        });


        socket.on('increaseTriviaPoint' , () => {

            var body = {
                val: ''
            };
        
            var config = {
                method: 'post',
                url: '/handleTriviaPoint',
                data: body
            };
        
            axios(config)
            .then(function (res) {
                IncreaseTriviaPoint(res.data.point)
            })
            .catch(function (err) {
                
            });
        });


        socket.on('endTriviaGameEvent' , (stat , delay , winner) => {
            displayTriviaWinner(delay , winner);
        
            if(stat == 0) {
                endTriviaGameRequest();
            } 
          
        });


        socket.on('displayTriviaPointEvent' , (point) => {
            displayTriviaPoint(point);
        });



        socket.on('displayWhoPlateEvent' , (characters) => {
            displayWhoanimePlate(characters);
        });



    
    },


})




//JS AND JQUERY SECTION

$('.triviatheme , .triviatitle3').on('mouseenter' , () => {
    $('.triviarule').css('opacity' , 0.2);
});

$('.triviatheme , .triviatitle3').on('mouseleave' , () => {
    $('.triviarule').css('opacity' , 1);
});

$('.triviatitle4').on('mouseenter' , () => {
    $('.triviaarrowpic').show();
    $('.triviaarrowpic2').show();
});

$('.triviatitle4').on('mouseleave' , () => {
    $('.triviaarrowpic').hide();
    $('.triviaarrowpic2').hide();
});



$('.triviacell').on('click' , function() {
    var name = $(this).attr('name');
    app.trivia_default_theme = name;
    app.whoanime_default_theme = name;
    $('.triviacell').css('filter' , 'brightness(100%)')
    $(this).css('filter' , 'brightness(50%)')

    $('.triviatheme').hide();
});

$('.triviamodelist').on('click', function() {
    $(".triviamodelist").css('filter' , 'brightness(100%)');
    $(this).css('filter' , 'brightness(50%)');
    $(this).closest('.submenu2').addClass('hidden');
  });
  


  $('.triviatitle2').on('mouseenter', function() {
    $(this).find('.submenu2').removeClass('hidden');
  });





  $('.trivianbqlist').on('click', function() {
    $(".trivianbqlist").css('filter' , 'brightness(100%)');
    $(this).css('filter' , 'brightness(50%)');
    $(this).closest('.submenu1').addClass('hidden');
  });
  
  $('.triviatitle1').on('mouseenter', function() {
    $(this).find('.submenu1').removeClass('hidden');
  });




$('.casecontainer').show();


$('#subbtn').on('touchend click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    app.checkAnswer();
})


$('.p0input').on('click' , function() {
});


$('.closeimg2').on('click' , function() {
    $('.postnavdiv').hide();
});


$('.closeimg').on('click' , function() {
    $('.navdiv').hide();
});


$('.rdiv').on('click' , function() {
    $('.navdiv').show();
});


$('.rdiv2').on('click' , function() {
    $('.postnavdiv').show();
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
    $('.codetrue').html(roomid)
    $('.codetxt').show();
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




function ingameRequest(imode) {
    var body = {
        val: imode
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
        val : ''
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


function displayWinnerHost(winner) {
    app.gwinner = winner;

    $('.container').hide();
    $('.bombdiv').hide();
    $('.bonuscontainer').hide();
    $('#containerid').hide();
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
    $('.bonuscontainer').hide();
    $('.winnerdiv').show();
    $('#containerid').hide();

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


function editSetting(btheme , btime) {
    var ss = document.getElementById('selectid');
    ss.value = btheme;

    var ii = document.getElementById('rangeid');
    ii.value = btime;

    var iitxt = document.getElementById('secvalid');
    iitxt.innerHTML = btime;
}


function editSetting2(bturn , bdiff , btime) {
    var sturn = document.getElementById('selectid2');
    sturn.value = bturn;

    var sdiff = document.getElementById('seletdiffid');
    sdiff.value = bdiff;

    var stime = document.getElementById('rangeid');
    stime.value = btime;

    var iitxt = document.getElementById('secvalid');
    iitxt.innerHTML = btime;
}


function hideTool() {
    var hasblur = $('#strikertxt').hasClass('blurclass');
    if(hasblur) $('#strikertxt').removeClass('blurclass');
    else $('#strikertxt').addClass('blurclass');
    
}

function displayTurnPic(indexp) {
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
    var numberOfPlayers = players.length;

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }


    var radius = window.innerWidth < 432 ? 120 : 220; // Adjust radius for smaller screens

    for(let i = 0 ; i < numberOfPlayers ; i++) {

        var playerdiv = document.createElement('div');  
        playerdiv.setAttribute('id' , 'playerdiv' + i);
        playerdiv.classList.add('playerdiv');

        const angle =  (360 / numberOfPlayers) * i
        const angleInRadians = angle * (Math.PI / 180);

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
        turnpic.setAttribute('src' , 'turnpic6.png');
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


            pinput.focus();
            
            
        }

        playerdiv.appendChild(turnpic);
        playerdiv.appendChild(skullpic);
        playerdiv.appendChild(playertxt)
        playerdiv.appendChild(padlockpic);
        playerdiv.appendChild(pinput);



        playerdiv.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;
        container.appendChild(playerdiv);

        $('#containerid').show();
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
if(sliderEl) {
    const sliderValue = document.getElementById('secvalid')
    sliderEl.addEventListener("input", (event) => {
    const tempSliderValue = event.target.value;    
    sliderValue.textContent = tempSliderValue;
    })
}








function editRule(stat) {
    if(stat == 1) {
        app.ruletitle = "Bombanime";
        app.ruletxt = "Très similaire à Bombparty , les joueurs s'affrontent en citant des personnages à tour de rôle.";
        
    }


    if(stat == 2) {
        app.ruletitle = "Trivianime";
        app.ruletxt = "QCM à points , les joueurs s'affrontent en répondant à une suite de questions portant sur un thème choisit.";
    }


    if(stat == 3) {
        app.ruletitle = "Whoanime";
        app.ruletxt = "Qui est-ce version Anime , le but étant de penser à un personnage affiché à l'écran et de deviner celui de l'adversaire avant que celui-ci devine le votre";
    }








    $('.ruleboxdiv').show();
    $('#maindiv').addClass('brightclass');
}


//HIDE RULEDIV WHEN CLICK OUTSIDE RULEDIV
document.addEventListener('click' , function hideRuleArea(event) {

    if(document.getElementById('ruleboxdivid')) {
        const rulebox = document.getElementById('ruleboxdivid');
        const infoareas = document.getElementsByClassName('infomodepic')

        if(!rulebox.contains(event.target)) {
            let insidearea = false;
            for(let i = 0 ; i < infoareas.length; i ++) {
                if(infoareas[i].contains(event.target)) {
                    insidearea = true;
                    break;
                }
            }

           if(!insidearea) {
            
            $('#ruleboxdivid').hide();
            $('#maindiv').removeClass('brightclass');
           }
           
          
        } 
        
    }

});



//ENABLE CASEMODE WHEN CLICK OUTSIDE NAVIDV (RULE)
document.addEventListener('click' , function hideNavDivArea(event) {

    if(document.getElementById('navdivid')) {
        const rulebox = document.getElementById('navdivid')
        const btnrulebox = document.getElementById('rdivid')
        const postnavdiv = document.getElementById('postnavdivid');
    
        if(!rulebox.contains(event.target) && !btnrulebox.contains(event.target)) {
            $("#navdivid").hide(); 
            
        }
    }

});




//ENABLE CASEMODE WHEN CLICK OUTSIDE POSTNAVIDV (RULE)
document.addEventListener('click' , function hideNavDivArea2(event) {

    if(document.getElementById('postnavdivid')) {
        const postrulebox = document.getElementById('postnavdivid')
        const postbtnrulebox = document.getElementById('postrdivid')
        const navdiv = document.getElementById('navdivid');
    
        if(!postrulebox.contains(event.target) && !postbtnrulebox.contains(event.target)) {
            $('#postnavdivid').hide(); 
        }
            
    }

});





//ENABLE CASEMODE WHEN CLICK OUTSIDE CASE
document.addEventListener('click' , function hideRuleArea(event) {

    if(document.getElementById('gridboxdiv')) {
        const casearea = document.getElementsByClassName('casemode')
    
            let insidearea = false;
            for(let i = 0 ; i < casearea.length; i ++) {
                if(casearea[i].contains(event.target)) {
                    insidearea = true;
                    break;
                }
            }
            
            //IF OUTSIDE 
           if(!insidearea) {
                $('.modebtn').addClass('disablemode2');
                $('.modebtn').prop("disabled", true);
                $('.casecontainer').removeClass('selectedclass');
           }
           
          
        
        
    }

});



//SHOW/HIDE TRIVIATHEME
if(document.getElementById('triviathemeid')) {
    var triviatitle3 = document.querySelector('.triviatitle3');
    var triviatheme = document.querySelector('.triviatheme');
  
    triviatitle3.addEventListener('mouseenter', function() {
      triviatheme.style.display = 'block';
    });
  
    triviatheme.addEventListener('mouseenter', function() {
      triviatheme.style.display = 'block';
    });
  
    triviatitle3.addEventListener('mouseleave', function(event) {
      if (!event.relatedTarget || (!event.relatedTarget.closest('.triviatheme') && !event.relatedTarget.closest('.triviatitle3'))) {
        triviatheme.style.display = 'none';
      }
    });
  
    triviatheme.addEventListener('mouseleave', function(event) {
      if (!event.relatedTarget || (!event.relatedTarget.closest('.triviatheme') && !event.relatedTarget.closest('.triviatitle3'))) {
        triviatheme.style.display = 'none';
      }
    });
    
    
}








document.addEventListener("keydown", function(event) {
    // Vérifie si la touche enfoncée est la touche "Echap"
    if (event.code === "Escape") {
        var body = {
            val: ''
        };

        var config = {
            method: 'post',
            url: '/returnByEscape',
            data: body
        };

        axios(config)
        .then(function (res) {
            if(res.data != 'no') location.reload();
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});





function activateBombBonus1() {



    var body = {
        val: 1
    };

    var config = {
        method: 'post',
        url: '/generateBombBonus',
        data: body
    };

    axios(config)
    .then(function (res) {
        showBombHint(res.data.hint , res.data.nb);
    })
    .catch(function (err) {
        console.log(err);
    });

}



function activateBombBonus2() {

    var body = {
        val: 2
    };

    var config = {
        method: 'post',
        url: '/generateBombBonus',
        data: body
    };

    axios(config)
    .then(function (res) {
        showBombHint(res.data.hint , res.data.nb);
    })
    .catch(function (err) {
        console.log(err);
    });

}



function activateBombBonus3() {

    var body = {
        val: 3
    };

    var config = {
        method: 'post',
        url: '/generateBombBonus',
        data: body
    };

    axios(config)
    .then(function (res) {
        showBombHint(res.data.hint , res.data.nb);
    })
    .catch(function (err) {
        console.log(err);
    });
    
}




function showBombHint(hint , stat) {
    var container = document.getElementById('maindiv');

    var span = document.createElement('span');
    span.id = "bombhintid" + stat;
    span.classList.add('bhintclass');
    span.innerHTML = "Indice  : " + hint;

    container.append(span)


    setTimeout(() => {
        var bobo = document.getElementById('bombhintid' + stat)
        $('#bombhintid' + stat).fadeOut();
    }, 3000);
}





function showBonus(character , auth1 , auth2 , auth3) {

    var container = document.getElementById('maindiv');

    var bonusContainer = document.createElement('div');
    bonusContainer.classList.add('bonuscontainer');

    
    function createImageWithText(pic , src, alt, text) {
        var div = document.createElement('div');
        div.classList.add('bonus-item');

        var img = document.createElement('img');
        img.classList.add('bombbonuspicclass');
        
        img.id = 'bombbonusid' + pic;
        img.setAttribute('src', src);
        img.setAttribute('alt', alt);

        var span = document.createElement('span');
        span.classList.add('bonus-text');
        span.innerHTML = text;

        div.appendChild(img);
        div.appendChild(span);

        return div;
    }


    bonusContainer.appendChild(createImageWithText(1 ,'bonus.png', 'BONUSPIC', '<i class="fa fa-user-times" aria-hidden="true"></i> 10'));
    bonusContainer.appendChild(createImageWithText(2 ,'bonus2.png', 'BONUSPIC', '<i class="fa fa-user-times" aria-hidden="true"></i> 30'));
    bonusContainer.appendChild(createImageWithText(3 , 'bonus3.png', 'BONUSPIC', '<i class="fa fa-user-times" aria-hidden="true"></i> 50'));

    container.appendChild(bonusContainer);


    $('.bombbonuspicclass').on('click', function() {
        var self = $(this);
        self.addClass('tmpshake');
        setTimeout(function() {
            self.removeClass('tmpshake');
        }, 300);  
    });


    if(character >= 10 && auth1) {
        var bonus1 = document.getElementById('bombbonusid1');
        bonus1.style.filter = 'brightness(95%)';

        $('#bombbonusid1').off('click');
        $('#bombbonusid1').addClass('bbtmpclass');
        $("#bombbonusid1").on('click', function() {
            $('.tmpinputclass').focus();

            $('#bombbonusid1').removeClass('bbtmpclass');
            bonus1.style.filter = 'brightness(40%)';
            $('#bombbonusid1').off('click');
            $('#bombbonusid1').on('click', function() {
                var self = $(this);
                self.addClass('tmpshake');
                setTimeout(function() {
                    self.removeClass('tmpshake');
                }, 300);  
            });



            activateBombBonus1()
            


        });

    }

    if(character >= 30 && auth2) {
        var bonus2 = document.getElementById('bombbonusid2');
        bonus2.style.filter = 'brightness(95%)';

        $('#bombbonusid2').off('click');
        $('#bombbonusid2').addClass('bbtmpclass');
        $("#bombbonusid2").on('click', function() {
            $('.tmpinputclass').focus();

            $('#bombbonusid2').removeClass('bbtmpclass');
            bonus2.style.filter = 'brightness(40%)';
            $('#bombbonusid2').off('click');
            $('#bombbonusid2').on('click', function() {
                var self = $(this);
                self.addClass('tmpshake');
                setTimeout(function() {
                    self.removeClass('tmpshake');
                }, 300);  
            });



            activateBombBonus2()
        });

    }

    if(character >= 50 && auth3) {
        var bonus3 = document.getElementById('bombbonusid3');
        bonus3.style.filter = 'brightness(95%)';

        $('#bombbonusid3').off('click');
        $('#bombbonusid3').addClass('bbtmpclass');
        $("#bombbonusid3").on('click', function() {
            $('.tmpinputclass').focus();

            $('#bombbonusid3').removeClass('bbtmpclass');
            bonus3.style.filter = 'brightness(40%)';
            $('#bombbonusid3').off('click');
            $('#bombbonusid3').on('click', function() {
                var self = $(this);
                self.addClass('tmpshake');
                setTimeout(function() {
                    self.removeClass('tmpshake');
                }, 300);  
            });



            activateBombBonus3()
        });

    }
    
}






function updateBombBonus(character , auth1 , auth2 , auth3) {
    
    if(character >= 10 && auth1) {
        var bonus1 = document.getElementById('bombbonusid1');
        bonus1.style.filter = 'brightness(95%)';

        $('#bombbonusid1').off('click');
        $('#bombbonusid1').addClass('bbtmpclass');
        $("#bombbonusid1").on('click', function() {
            $('.tmpinputclass').focus();

            $('#bombbonusid1').removeClass('bbtmpclass');
            bonus1.style.filter = 'brightness(40%)';
            $('#bombbonusid1').off('click');
            $('#bombbonusid1').on('click', function() {
                var self = $(this);
                self.addClass('tmpshake');
                setTimeout(function() {
                    self.removeClass('tmpshake');
                }, 300);  
            });



            activateBombBonus1()
        });

    }

    if(character >= 30 && auth2) {
        var bonus2 = document.getElementById('bombbonusid2');
        bonus2.style.filter = 'brightness(95%)';

        $('#bombbonusid2').off('click');
        $('#bombbonusid2').addClass('bbtmpclass');
        $("#bombbonusid2").on('click', function() {
            $('.tmpinputclass').focus();

            $('#bombbonusid2').removeClass('bbtmpclass');
            bonus2.style.filter = 'brightness(40%)';
            $('#bombbonusid2').off('click');
            $('#bombbonusid2').on('click', function() {
                var self = $(this);
                self.addClass('tmpshake');
                setTimeout(function() {
                    self.removeClass('tmpshake');
                }, 300);  
            });



            activateBombBonus2()
        });

    }

    if(character >= 50 && auth3) {
        var bonus3 = document.getElementById('bombbonusid3');
        bonus3.style.filter = 'brightness(95%)';

        $('#bombbonusid3').off('click');
        $('#bombbonusid3').addClass('bbtmpclass');
        $("#bombbonusid3").on('click', function() {
            $('.tmpinputclass').focus();

            $('#bombbonusid3').removeClass('bbtmpclass');
            bonus3.style.filter = 'brightness(40%)';
            $('#bombbonusid3').off('click');
            $('#bombbonusid3').on('click', function() {
                var self = $(this);
                self.addClass('tmpshake');
                setTimeout(function() {
                    self.removeClass('tmpshake');
                }, 300);  
            });



            activateBombBonus3()
        });

    }
}




function copyCode() {
    var codeText = $('.codetxt').text();
    navigator.clipboard.writeText(app.roomid).then(function() {
        $('.pastedtxt').addClass('pastedAnimclass')
        $('.pastedtxt').show();
        setTimeout(() => {
            $('.pastedtxt').hide();
            $('.pastedtxt').removeClass('pastedAnimclass')
        }, 2000);
    }).catch(function(error) {
        console.error('Erreur lors de la copie du texte : ', error);
    });

}



function showTriviaNbqRule(nbq) {
    var tt = document.getElementById('triviarulenbqid')
    tt.innerHTML = nbq;

}



function showTriviaQR(data , nbq) {
      
        const maindiv = document.getElementById('maindiv');
        
        const triviaHeadQuestionDiv = document.createElement('div');
        triviaHeadQuestionDiv.className = 'triviaheadquestiondiv';

        const img = document.createElement('img');
        img.id = 'diffimgid';
        img.className = 'diffimg';
        img.alt = 'diffpic';

        switch (data.diff_ans) {
            case 'veryeasy':
                img.src = 'veryeasy.png';
                img.title = 'Très Facile';
                break;
            case 'easy':
                img.src = 'easy.png';
                img.title = 'Facile';
                break;
            case 'medium':
                img.src = 'medium.png';
                img.title = 'Moyen';
                break;
            case 'hard':
                img.src = 'hard.png';
                img.title = 'Difficile';
                break;
            case 'veryhard':
                img.src = 'veryhard.png';
                img.title = 'Très Difficile';
                break;
            case 'extreme':
                img.src = 'extreme.png';
                img.title = 'Extrême';
                break;
            default:
                img.src = 'medium.png';
                img.title = 'Moyen';
                break;
        }

        triviaHeadQuestionDiv.appendChild(img);

        const headQuestionP = document.createElement('p');
        headQuestionP.id = 'headquestion';
        headQuestionP.innerHTML = nbq + '&nbsp; &nbsp;  - &nbsp;  <span class="spanserie"> ' + data.serie_ans + '</span>';
        triviaHeadQuestionDiv.appendChild(headQuestionP);

        const hr = document.createElement('hr');
        triviaHeadQuestionDiv.appendChild(hr);

        const mainQuestionP = document.createElement('p');
        mainQuestionP.id = 'mainquestion';
        mainQuestionP.innerText = data.question;
        triviaHeadQuestionDiv.appendChild(mainQuestionP);

        const trivialifediv = document.createElement('div');
        trivialifediv.className = "trivialifediv";

        maindiv.appendChild(trivialifediv);
        maindiv.appendChild(triviaHeadQuestionDiv);


        const triviaAnswerDiv = document.createElement('div');
        triviaAnswerDiv.className = 'triviaanswerdiv';

        const answers = [
            data.answer1 ,
            data.answer2 ,
            data.answer3 ,
            data.answer4 
        ];


        // answers = shuffleArray(answers);



        answers.forEach(answer => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'triviasubans';
            answerDiv.innerText = answer;
            triviaAnswerDiv.appendChild(answerDiv);

            answerDiv.addEventListener('click' , () => {
                answerDiv.classList.add('triviaselectedanswer');
                $('.triviasubans').addClass('triviadisableanswer')

                sendTriviaAnswer(answerDiv.textContent)
                socket.emit('sendTriviaAnswerEvent' , answerDiv.textContent)

                $('.triviaselectedanswer').css('background-color' , 'rgba(116, 118, 88, 0.712)')
                $('.triviaselectedanswer').css('color' , 'white')
              

            });

        });

        maindiv.appendChild(triviaAnswerDiv)


        // const neoshin = document.createElement('img');
        // neoshin.src = 'shinchan.png';
        // neoshin.alt = 'GO Image';
        // neoshin.className = "shinclass";

        // maindiv.appendChild(neoshin);
        
    

}



function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}





function runAnimation(time , trivia_spans, counter, finalMessage) {
        let current = 3 - time;
        
        if (current < trivia_spans.length) {
            const num = trivia_spans[current];
            num.classList.add('triviacounterin');
            
            num.addEventListener('animationend', (e) => {
                if (e.animationName === 'goIn' && current !== trivia_spans.length - 1) {
                    num.classList.remove('triviacounterin');
                    num.classList.add('triviacounterout');
                } else if (e.animationName === 'goOut' && num.nextElementSibling) {
                    num.nextElementSibling.classList.add('triviacounterin');
                } else {
                    counter.classList.add('triviaprehide');
                    finalMessage.classList.add('showtriviapretimerfinal');

                    setTimeout(() => {
                        $('#shinpicid').addClass('showshinclass');
                    }, 3000);
                }
            });
        }


}





function sendTriviaAnswer(answer) {
    var body = {
        val: answer
    };

    var config = {
        method: 'post',
        url: '/sendTriviaAnswer',
        data: body
    };

    axios(config)
    .then(function (res) {
    
    })
    .catch(function (err) {
        console.log(err);
    });
}



function handleEndTriviaRoundAnswer() {
        var body = {
            val: 'val'
        };
    
        var config = {
            method: 'post',
            url: '/handleEndTriviaRoundVisual',
            data: body
        };
    
        axios(config)
        .then(function (res) {
            finalTriviaRoundAnswerVisual(res.data[0] , res.data[1])
        })
        .catch(function (err) {
            
        });
    
}




function finalTriviaRoundAnswerVisual(data , player_answer) {

    var tmp = 1;
    document.querySelectorAll('.triviasubans').forEach(el => {   
        el.classList.add('triviadisableanswer') 
        if(tmp == data.coanswer) {
            el.classList.add('triviagoodanswer');

            $('.triviaselectedanswer').css('background-color' , 'rgba(116, 118, 88, 0.712)')
            $('.triviaselectedanswer').css('color' , 'white')
        } else {
            if(player_answer == el.textContent) {
                el.classList.add('triviawronganswer')
            } 
        }
        

        tmp++;

    });     
    
    

    $('#countdown-container').fadeOut(500);
            
}



function displayWhoanimeOpponent(players) {
    var mainarea = document.getElementById('maindiv');

    var triviaplayerdiv = document.createElement('div');
    triviaplayerdiv.classList.add('triviaopponentdiv');

    var showp = document.createElement('img');
    showp.setAttribute('src', 'eyeskill.png');
    showp.classList.add('triviauserpic');

    for (var i = 0; i < players.length; i++) {
            var spanuser = document.createElement('span');
            spanuser.classList.add('triviaopponenttxt');

            // var usertxt = document.createTextNode(players[i]);
            // spanuser.appendChild(usertxt);

            if (players[i] == app.username) { 
                spanuser.style.fontWeight = 'bold';
                spanuser.innerHTML = players[i] + ' <i class="fa fa-star" aria-hidden="true"></i>';
            } else spanuser.innerHTML = players[i]

            var pbr = document.createElement("br");
            triviaplayerdiv.appendChild(spanuser);
            triviaplayerdiv.appendChild(pbr);
    }
    

    showp.addEventListener('mouseenter', function(event) {
        triviaplayerdiv.style.display = 'unset';
    });

    showp.addEventListener('mouseleave', function(event) {
        triviaplayerdiv.style.display = 'none';
    });

    mainarea.append(showp, triviaplayerdiv);

    showp.style.display = 'unset';



}



function displayTriviaOpponent(players) {
    var mainarea = document.getElementById('maindiv');

    var triviaplayerdiv = document.createElement('div');
    triviaplayerdiv.classList.add('triviaopponentdiv');

    var showp = document.createElement('img');
    showp.setAttribute('src', 'eyeskill.png');
    showp.classList.add('triviauserpic');

    for (var i = 0; i < players.length; i++) {
            var spanuser = document.createElement('span');
            spanuser.classList.add('triviaopponenttxt');

            // var usertxt = document.createTextNode(players[i]);
            // spanuser.appendChild(usertxt);

            if (players[i] == app.username) { 
                spanuser.style.fontWeight = 'bold';
                spanuser.innerHTML = players[i] + ' <i class="fa fa-star" aria-hidden="true"></i>';
            } else spanuser.innerHTML = players[i]

            var pbr = document.createElement("br");
            triviaplayerdiv.appendChild(spanuser);
            triviaplayerdiv.appendChild(pbr);
    }
    

    showp.addEventListener('mouseenter', function(event) {
        triviaplayerdiv.style.display = 'unset';
    });

    showp.addEventListener('mouseleave', function(event) {
        triviaplayerdiv.style.display = 'none';
    });

    mainarea.append(showp, triviaplayerdiv);

    showp.style.display = 'unset';
}




function showTriviaFastestPlayer(fastest) {
    var mainarea = document.getElementById('maindiv'); 
    var pbr = document.createElement("span");

    pbr.classList.add('triviafastestspan')
    
    pbr.innerHTML = `<i class="fa fa-bolt" aria-hidden="true"></i> &nbsp;` + fastest[0] + " : " + fastest[1] + "s";

    mainarea.appendChild(pbr);
    pbr.style.display = 'unset';

    
}



function displayTriviaWinner(delay , data) {
    var mainarea = document.getElementById('maindiv'); 

    const winnerDiv = document.createElement('div');
    winnerDiv.className = 'triviawinnerdiv';

    const subWinnerDiv = document.createElement('div');
    subWinnerDiv.className = 'subwinnerdiv';

    const crownImg = document.createElement('img');
    crownImg.src = 'crown.png';
    crownImg.alt = 'CROWN';

    const title = document.createElement('h2');
    title.textContent = data.winner + ' A GAGNÉ (' + data.point + ')';

    const hr = document.createElement('hr');

    subWinnerDiv.appendChild(crownImg);
    subWinnerDiv.appendChild(title);
    subWinnerDiv.appendChild(hr);

    winnerDiv.appendChild(subWinnerDiv);

    const replayButton = document.createElement('button');
    replayButton.className = 'replaybtn';
    replayButton.textContent = 'REJOUER';

    replayButton.addEventListener('click', function() {
        app.replay();
    });


    winnerDiv.appendChild(replayButton);

    mainarea.appendChild(winnerDiv); 

    setTimeout(() => {
        winnerDiv.style.display = 'unset';
    }, delay);


}




function endTriviaGameRequest() {
    var body = {
        val: ''
    };

    var config = {
        method: 'post',
        url: '/endTriviaGame',
        data: body
    };

    axios(config)
    .then(function (res) {
    })
    .catch(function (err) {
        
    });
}



function displayTriviaPoint(point) {
    var mainarea = document.getElementById('maindiv'); 

    var player_point = document.createElement("span");
    player_point.classList.add('triviapointclass')
    player_point.innerHTML = point;


    mainarea.appendChild(player_point);

}



function IncreaseTriviaPoint(point) {
    $('.triviapointclass').html(point);
}





function displayWhoanimePlate(characters) {
    var mainarea = document.getElementById('maindiv'); 


    var plate = document.createElement('div');
    plate.classList.add('whoplateclass');


    for(let i = 0 ; i < characters.length ; i++) {
        var card = document.createElement('div');
        card.classList.add('whocardclass');


        var img = document.createElement('img');
        img.src = characters[i][1];
        img.style.width = '100%'; 
        img.style.height = '100%'; 
        img.style.objectFit = 'fill';
    
        card.appendChild(img);
        

        plate.appendChild(card);

        card.addEventListener('click', function() {
            $(this).toggleClass('whoclickedcardclass');
            $(this).find('img').toggleClass('whocardtmpborderclass');

            if ($(this).hasClass('whoclickedcardclass')) {
                $(this).css('cursor', `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='55' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>❤️‍🩹</text></svg>") 16 0,auto`);
            } else {
                $(this).css('cursor', `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='55' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>🗡️</text></svg>") 16 0,auto`);
            }
          
        });


        animateWhoCard(card, i);
    }

 



    mainarea.append(plate);
  
}




function animateWhoCard(card , i) {
    const directions = ['translateY(-100%)', 'translateY(100%)', 'translateX(-100%)', 'translateX(100%)'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    

    anime({
        targets: card,
        opacity: [0, 1],
        translateX: randomDirection.includes('X') ? [randomDirection, '0%'] : 0,
        translateY: randomDirection.includes('Y') ? [randomDirection, '0%'] : 0,
        duration: 200, 
        easing: 'easeOutQuad', 
        delay: 30 * i,  
    })


}