
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
            timer:'0',
            currenttheme:'',
            opponentres:'',
            canswer:'',
            gwinner: 'SLAYER',
            nbplayer: 0,
            currentmode: 'Bombanime',
            difficulty: 'Normal',
            playerpoint: 1242,
            nbturn: 5,
            citation: '',
            hand: 3,
            ruletxt: '',
            ruletitle: '',
            winnerpoint: 0,
            current_stat: 'ATTAQUE',
            current_stat_display : '⚔️ATTAQUE⚔️'
            
            
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


        sendCitaAnswer: function() {
            var citanswer = $('.citaput').val();
            $('.citaput').val('');

            var body = {
                val : citanswer
            };

            var config = {
                method: 'post',
                url: '/checkCitaAnswer',
                data: body
            };

            axios(config)
            .then(function (res) {
                
            })
            .catch(function (err) {
                
            });

            socket.emit('sendAnswerEvent2' , citanswer)
            
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


        useJoker: function(stat) {
                var body = {
                    val : stat
                };
    
                var config = {
                    method: 'post',
                    url: '/useJoker',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                })
                .catch(function (err) {
                    
                });

                socket.emit('useJokerEvent' , stat);
            
        },


        displayRule: function(stat) {
            editRule(stat);
        },


        drawCard: function() {
            playDrawkSound();

            var body = {
                val : "val"
            };

            var config = {
                method: 'post',
                url: '/drawCard',
                data: body
            };

            axios(config)
            .then(function (res) {
               var stat = res.data[1];
               var stat_ready = res.data[3];
               firstCardsDisplay(res.data[0] , stat);
               displayCardLife(res.data[2]);
               if(stat_ready == 0) socket.emit('everyPlayerDrawedEvent');
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


        socket.on('displayOpponents' , (opponents , ruser) => {   
            this.opponents = opponents;
            editOpponent(opponents , ruser);
        });

        socket.on('displayOpponents2' , (opponents , oppoint ,  ruser) => {   
            this.opponents = opponents;
            editOpponent2(opponents , oppoint,  ruser);
            $('.selfcitapointdiv').show();
        });

        socket.on('displayOpponents3' , (opponents , ruser) => {   
            this.opponents = opponents;
            editOpponent3(opponents,  ruser);
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

        socket.on('displayPostRule2' , (time, difficulty , nbturn) => {
            this.difficulty = difficulty;
            this.timer = time;
            this.nbturn = nbturn;
            $('.rdiv2').show();
            $('.backigbtn').show();
        });


        socket.on('displayPostRule3' , (hand) => {
            this.hand = hand;
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


        socket.on('playRightAudio2', () => {
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
            
            $('.citaput').addClass('pulseclass');
            setTimeout(() => {
                $('.citaput').removeClass('pulseclass');
            }, 500);

        });


        socket.on('changeBombStepEvent' , (step) => {
            editBombPic(step);
        });


        socket.on('endGameEvent' , (winner , host) => {
            if(this.usernamedisplay == host) displayPostToHost();
            displayWinner(winner);
        });

        socket.on('endGameEvent2' , (winner , winnerpoint ,  host) => {
            console.log("current user -> " , this.usernamedisplay)
            console.log("host -> " , host);
            console.log('winner ->' , winner)
            if(this.usernamedisplay == host) displayPostToHost();
            displayWinner2(winner , winnerpoint);
        });


        socket.on('playSlashEvent' , () => {
            playSlash();
        });
        


        socket.on('endGameEventAfterReload' , (winner) => {
            displayWinnerHost(winner);
        });

        socket.on('endGameEventAfterReload2' , (winner , winnerpoint) => {
            displayWinnerHost2(winner , winnerpoint);
        });


        socket.on('displayBeginning' , () => {
            $('.p1div').show();
            $('.bombdiv').show();
        });

        socket.on('displayBeginning2' , () => {
            $('.citadiv').show();
            $('.citainputdiv').show();
            $('.citaopponentdiv').show();
        });

        socket.on('displayBeginning3' , () => {
            editDeck();
            var card_delay = 3000;
            if(this.hand == 1) card_delay = 1900;
            if(this.hand == 3) card_delay = 3300;
            if(this.hand == 5) card_delay = 3900;

         
        });


        socket.on('displayPlayerCard' , (player_cards , stat , life , used_cards , used_cards_tmp , game_time) => {
            displayCardLife(life);
            displayCards(player_cards , stat , used_cards , used_cards_tmp , game_time);
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



        socket.on('displayCitationData' , (nbturn , citation) => {
            this.citation = nbturn + ". " + citation;
        });
      
        socket.on('answerErrorEvent2', () => {
            editAnswerError3();
        });


        socket.on('increasePointEvent' , (prepoint , postpoint) => {
            // this.incNbr(prepoint , postpoint , 0);
            var elt = document.getElementById("spanpointid");
            elt.innerHTML = postpoint;
        });


        socket.on('increasePointForOtherEvent' , (indexp , postpoint) => {
            console.log('XD')
            $('.spanpoint' + indexp).text(postpoint);
        });


        socket.on('updateTimer' , (newtimer) => {
            
            $('.citimerspan').text(newtimer);
            $('#citimer').show();
            
        });


        socket.on('enableCitaInputEvent' , (stat) => {
            $('.citaput').removeClass('disablemode2')
            $('.citaput').removeAttr('disabled');
            $('.citaput').focus();

            if(stat == 1) {
                var body = {
                    val : 'val'
                };
    
                var config = {
                    method: 'post',
                    url: '/resetCitaStatus',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                    
                })
                .catch(function (err) {
                    
                });
            }
        });


        socket.on('disableCitaInputEvent' , () => {
            $('.citaput').addClass('disablemode2')
            $(".citaput").attr("disabled", "disabled");
        });


        socket.on('changeCitationEvent' , (nbturn , new_citation) => {
            this.citation = nbturn + ". " + new_citation;
        });


        socket.on('resetJokerEvent' , () => {
            var body = {
                val : 'val'
            };

            var config = {
                method: 'post',
                url: '/resetJoker',
                data: body
            };

            axios(config)
            .then(function (res) {
                
            })
            .catch(function (err) {
                
            });

            $('.hintdiv').hide();
            $('#hintspan1').hide();
            $('#hintspan2').hide();
            $('.joker1').removeClass('jokerble');
            $('.joker2').removeClass('jokerble');
        });



        socket.on('displayJokerEvent' , (stat , hint) => {
            if(stat == 1) {
                $('.joker1').addClass('jokerble');
                $('#hintspan1').html('<strong> &nbsp; ' + hint + '&nbsp; </strong>');
                $('.hintdiv').show();
                $('#hintspan1').show();
            }

            if(stat == 2) {
                $('.joker2').addClass('jokerble');
                $('#hintspan2').html('<strong> &nbsp; ' + hint + '&nbsp; </strong>');
                $('.hintdiv').show();
                $('#hintspan2').show();
            }

            var valpt = $('#spanpointid').text();
            var parsept = parseInt(valpt , 10); ;
            var potpp = parsept - 50;
            var postpoint = potpp >= 0 ? potpp : 0;
            // this.incNbr(parsept , postpoint , 1)
            var elt = document.getElementById("spanpointid");
            elt.innerHTML = postpoint;

            
        });



        socket.on('disableJokerEvent' , () => {
            $('.joker1').addClass('jokerble');
            $('.joker2').addClass('jokerble');
        });


        socket.on('displayDeck' , () => {
            $('.centered-deckwrap').show();
        });
        

        socket.on('hideCardWaitEvent' , () => {
            $('.waitcarddiv').hide();
            $('.headstatdiv').addClass("headstatanimation");
            $('.headstatdiv').show();
            setTimeout(() => {
                $('.headstatdiv').removeClass("headstatanimation");
            }, 1500);
            
        });
        

        socket.on('displayCardWaitEvent' , () => {
            $('.waitcarddiv').css('display' , 'flex');
        });



        socket.on('playRound' , (stat) => {

            this.current_stat = stat[0];
            this.current_stat_display = stat[0] + " (" + stat[2] + ")"; 
            //RESET CLASSES BEFORE PLAY ROUND
            document.getElementById('mainstattxt').classList.remove('endstatclass');
            $('.headstatdiv').show();
            $('.playedcard').removeClass('hideplateclass')
            ////

          
            //DISPLAY MAIN STAT AND THEN HIDE MAIN STAT
            editRandomStat(stat[1]);
            setTimeout(() => {
                $('.headstatdiv').hide();
            }, 5000);


            socket.emit('startRoundDelai')

            
        });


        socket.on('sendRoundDelai' , () => {
            $('.cardtimertxt').removeClass('timerhideclass');
            $('.cardtimertxt').show();

            $('.stt').removeClass('hidecardtimerclass');
            $('.cardtimertxt').text(20);
            $('.stt').show();
            socket.emit('startCardRoundTimer');
        });


        socket.on('enableCardsEvent' , () => {
            $('.card').removeClass('disablemode3');
        });

        socket.on('disableCardsEvent' , () => {
            $('.card').addClass('disablemode3');
        });

        socket.on('displayMainStatEvent' , (stat) => {
            this.current_stat = stat[0];
            this.current_stat_display = stat[0] + " (" + stat[2] + ")"; 
            $('.stt').show();
        });


        socket.on('updatePlateEvent' , (card_info) => {
            addToPlate(card_info)
        });

        socket.on('displayPlateEvent' , (plate) => {
            editPlate(plate);
        });


        socket.on('playBackCardanimeAudioEvent' , () => {
            playCardBackAudio();
        });


        socket.on('updateCardTimerEvent' , (time) => {


            if(time < 0) time = 0;
            this.timer = time;
            $('.cardtimertxt').text(time);
            $('.cardtimertxt').addClass('timerpopclass');
            $('.cardtimertxt').show();
            setTimeout(() => {
                $('.cardtimertxt').removeClass('timerpopclass'); 
            }, 600);
            if(time == 0) {
                setTimeout(() => {
                    $('.cardtimertxt').addClass('timerhideclass');
                }, 700);
                
            }   
     
        });


        socket.on('revealCardEvent', (winnerc) => {
            revealCard(winnerc);
        });


        socket.on('displayCardTime' , (time) => {
            if(time < 0) time = 0;
            this.timer = time;
            $('.cardtimertxt').html(time);
            $('.cardtimertxt').show();
        });
        

        socket.on('clearPlateEvent' , () => {
            $('.stt').addClass('hidecardtimerclass');
            clearPlate();
        });


        socket.on('displayEndRoundAnimationEvent' , (author) => {
            if(author == this.username) editRoundMessage(0)
            else editRoundMessage(1);

            var body = {
                val : author
            };

            var config = {
                method: 'post',
                url: '/updateCardLife',
                data: body
            };

            axios(config)
            .then(function (res) {
                if(res.status == 202) removeCardLife(); 
                socket.emit('removeLoserCardEvent');
            })
            .catch(function (err) {
                
            });


        }); 



        socket.on('enableEndRound' , (tmp_cards) => {
            var body = {
                val : tmp_cards
            };

            var config = {
                method: 'post',
                url: '/checkEnableAuth',
                data: body
            };

            axios(config)
            .then(function (res) {
                enableRound(res.data);
            })
            .catch(function (err) {
                
            });
            
        });


        socket.on('replaceCardEvent' , (chara_remove , new_character) => {
            replaceHandCard(chara_remove , new_character);
        });


        socket.on('endCardGameEvent' , (winner) => {
            var body = {
                val : winner
            };

            var config = {
                method: 'post',
                url: '/endCardGame',
                data: body
            };

            axios(config)
            .then(function (res) {
                var data = res.data;
                displayCardWinner(data);
            })
            .catch(function (err) {
                
            });
           
            
        });

        socket.on('displayPostWinner' , (data) => {
            displayCardWinner(data);
        });


    
    },


})




//JS AND JQUERY SECTION

$('.casecontainer').show();


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


function editAnswerError3() {
    $('.citaput').addClass('tmpshake');
    $(".citaput").animate({'border-bottom-color': '#e26381'}, 400);
    setTimeout(function(){
        $('.citaput').removeClass('tmpshake');
     },300);    

     setTimeout(function(){
        $(".citaput").css('border-bottom-color' , '#e0cbcb');
     },500);  

     $(".citaput").trigger('blur'); 

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
     
     $('.citaput').focus();

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


function displayWinnerHost(winner) {
    app.gwinner = winner;

    $('.container').hide();
    $('.bombdiv').hide();
    $('.winnerdiv').show();

    var ta = document.getElementById('audio1');
    ta.pause();
}

function displayWinnerHost2(winner , winnerpoint) {
    app.gwinner = winner;
    app.winnerpoint = winnerpoint;

    $('.winnerdiv').show();

  
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

function displayWinner2(winner , winnerpoint) {

    var body = {
        val: winner,
        val2: winnerpoint
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
    app.winnerpoint = winnerpoint;

    $('#citaopponentdivid').hide();
    $('#citimer').hide();
    $('.hintdiv').hide();
    $('#selfcitapointdivid').hide();
    $('.citainputdiv').hide();
    $('.citadiv').hide();

    $('.winnerdiv').show();


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
        var x = - Math.cos(i * angle) * radius;
        var y = - Math.sin(i * angle) * radius;
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





function editOpponent2(players , ppoint ,  username) {
    
    var playerdiv = document.getElementById('citaopponentdivid');
    var selfplayerdiv = document.getElementById('selfcitapointdivid');
    var pbr = document.createElement("br");
   
    for(var i = 0; i < players.length ; i++) {
        if(players[i] != username) {
            var spanuser = document.createElement('span');
            spanuser.classList.add('citatxtfoe');
        
            var spanpoint =  document.createElement('span');
            spanpoint.innerHTML = ppoint[i];
            spanpoint.classList.add('spanpoint' + i)
            spanpoint.classList.add('citapoint');

            var gojoplayerpic = document.createElement('img');
            gojoplayerpic.setAttribute('alt' , 'GP');
            gojoplayerpic.setAttribute('src' , 'gojo' + (i+1) + '.png');
            gojoplayerpic.classList.add('citatxtfoepic'); 

            var usertxt = document.createTextNode(players[i]);
            var pbr = document.createElement("br");

            spanuser.appendChild(gojoplayerpic);
            spanuser.appendChild(usertxt);
            playerdiv.appendChild(spanuser);
            playerdiv.appendChild(spanpoint);
            playerdiv.appendChild(pbr);
        
        } else {
            app.playerpoint = ppoint[i];

            var gojoplayerpic = document.createElement('img');
            gojoplayerpic.setAttribute('alt' , 'GP');
            gojoplayerpic.setAttribute('src' , 'gojo' + (i+1) + '.png');
            gojoplayerpic.classList.add('selfcitatxtfoepic'); 

            var spanpoint =  document.createElement('span');
            spanpoint.id = "spanpointid";
            spanpoint.classList.add('citatmppoint');
            spanpoint.innerHTML = ppoint[i];
            selfplayerdiv.appendChild(gojoplayerpic)
            selfplayerdiv.appendChild(spanpoint)
        }
    }

        
}


function editOpponent3(players ,  username) {
    var mainarea = document.getElementById('maindiv');

    var playerdiv = document.createElement('div');
    playerdiv.classList.add('cardopponentdiv');

    var showp = document.createElement('img');
    showp.setAttribute('src' , 'eyeskill.png');
    showp.classList.add('carduserpic');
    
    for(var i = 0; i < players.length ; i++) {
        if(players[i] != username) {
            var spanuser = document.createElement('span');
            spanuser.classList.add('cardtxtfoe');
        
            // var spanpoint =  document.createElement('span');
            // spanpoint.innerHTML = 0;
            // spanpoint.classList.add('spanpoint' + i)
            // spanpoint.classList.add('citapoint');

            var usertxt = document.createTextNode(players[i]);
            var pbr = document.createElement("br");

            spanuser.appendChild(usertxt);
            playerdiv.appendChild(spanuser);
            // playerdiv.appendChild(spanpoint);
            playerdiv.appendChild(pbr);
        
            //SELF POINT
        } else {
            app.playerpoint = 0;


        }
    }



    showp.addEventListener('mouseenter' , function(event) {
        playerdiv.style.display = 'unset';
    });

    showp.addEventListener('mouseleave' , function(event) {
        playerdiv.style.display = 'none';
    });

    mainarea.append(showp , playerdiv);
 
    showp.style.display = 'unset';

        
}



function editRule(stat) {
    if(stat == 1) {
        app.ruletitle = "Bombanime";
        app.ruletxt = "Très similaire à Bombparty , les joueurs s'affrontent en citant des personnages à tour de rôle. Chaque personne dispose d'un temps donné pour envoyer leur réponse. Le dernier joueur en vie remporte la partie.";
        
    }

    if(stat == 2) {
        app.ruletitle = "Citanime";
        app.ruletxt = "Chaque joueur doivent trouver les citations affichées à l'écran. 2 indices sont mis à disposition des joueurs mais ceux-ci perdent des points à chaque utilisation. Le joueur avec le plus de points remporte  la partie.";
    }

    if(stat == 3) {
        app.ruletitle = "Cardanime";
        app.ruletxt = "Chaque joueur pioche des cartes pour composer leur main. Une statistique apparaît par la suite au milieu de l'écran , chaque joueur tente alors de proposer une carte de leur main dont la statistique correspond à celle de l'écran.";
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


function autoeditDeck() {
    $('#deckwrapid').addClass('showdeckclass');
    $('#deckwrapid').show();

    var deckel = document.getElementById('deckid');
    var deckwrapel = document.getElementById('deckwrapid');
    
    //SHOW DECK BY ADDING SHOWCLASS AND THEN REMOVE THE SHOWCLASS RIGHT AWAY
    deckwrapel.classList.add('showdeckclass');
    setTimeout(() => {
        deckwrapel.classList.remove('showdeckclass');
    }, 550);
    
    $('#deckwrapid').prop("disabled", true);
        $('#deckwrapid').addClass('disablemode2');

        if(app.hand == 3) {
            deckel.classList.add('drawclass2');
            $('#deckwrapid').addClass('hidedeckclass2');
            setTimeout(() => {
                $('#deckwrapid').hide();
            }, 1550);
        }

        if(app.hand == 4) {
            deckel.classList.add('drawclass4');
            $('#deckwrapid').addClass('hidedeckclass4');
            setTimeout(() => {
                $('#deckwrapid').hide();
            }, 2800);
        }

        if(app.hand == 5) {
            deckel.classList.add('drawclass3');
            $('#deckwrapid').addClass('hidedeckclass3');
            playDrawkSound();
            setTimeout(() => {
                $('#deckwrapid').hide();
            }, 2500);
        }    

        
}

function editDeck() {
    $('#deckwrapid').addClass('showdeckclass');
    $('#deckwrapid').show();

    var deckel = document.getElementById('deckid');
    var deckwrapel = document.getElementById('deckwrapid');
    var tzaeza =  document.getElementById('tete');
    
    //SHOW DECK BY ADDING SHOWCLASS AND THEN REMOVE THE SHOWCLASS RIGHT AWAY
    deckwrapel.classList.add('showdeckclass');
    setTimeout(() => {
        deckwrapel.classList.remove('showdeckclass');
    }, 550);
    
    deckwrapel.addEventListener('click' , function() {
        $('#deckwrapid').prop("disabled", true);
        $('#deckwrapid').addClass('disablemode2');

        if(app.hand == 3) {
            deckel.classList.add('drawclass2');
            $('#deckwrapid').addClass('hidedeckclass2');
            setTimeout(() => {
                $('#deckwrapid').hide();
            }, 1550);
        }

        if(app.hand == 4) {
            deckel.classList.add('drawclass4');
            $('#deckwrapid').addClass('hidedeckclass4');
            setTimeout(() => {
                $('#deckwrapid').hide();
            }, 2800);
        }

        if(app.hand == 5) {
            deckel.classList.add('drawclass3');
            $('#deckwrapid').addClass('hidedeckclass3');
            playDrawkSound();
            setTimeout(() => {
                $('#deckwrapid').hide();
            }, 2500);
        }

        
    });
}



function playDrawkSound() {
    var ta = document.getElementById('audio7');
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
}



function firstCardsDisplay(cards , stat) {
    if(cards.length == 1) {
        setTimeout(() => {
            displayCards(cards , stat , [] , [] , 20);
        }, 1500);
    }

    if(cards.length == 3) {
        setTimeout(() => {
            displayCards(cards , stat , [] , [] , 20);
        }, 2500);
    }

    if(cards.length == 4) {
        setTimeout(() => {
            displayCards(cards , stat , [] , [] , 20);
        }, 2800);
    }

    if(cards.length == 5) {
        setTimeout(() => {
            displayCards(cards , stat , [] , [] , 20);
        }, 3500);
    }

    
}


function displayCardLife(life) {
    var mainarea = document.getElementById('maindiv');
    var lifearea = document.createElement('div');
    lifearea.id = "lifecardareaid";
    lifearea.classList.add('cardlifediv');

    for(let i = 0; i < life ; i ++) {
        var life_pic = document.createElement('img');
        life_pic.setAttribute('src' , 'life2.png');
        life_pic.classList.add('lifepic');
        lifearea.appendChild(life_pic)
    }

    mainarea.appendChild(lifearea);
}



function displayCards(cards , stat , used_cards , used_cards_tmp , game_time) {

    var bonus_tab = checkBonus(cards);
    //SHOW BONUS ANIME ANIMATION
    // setTimeout(() => {
    //     editBonusAnimation(bonus_tab);
    // }, 1500);
  

    var cardname;
    var cardanime;
    var cardpath;
    var cardstat;

    var statarray = ['⚔️ ATK ' , '🛡️ DEF ' , ' 💡 INT ' , '❤️ END ' , '⚡ VIT ' , '🤸🏼 AGI ' , '🎯 TECH ' , '🍀 LUCK '];
    var statarray2 = ['ATTAQUE' , 'DEFENSE' , 'INTELLIGENCE ' , 'ENDURANCE ' , 'VITESSE ' , 'AGILITÉ ' , 'TECHNIQUE ' , 'CHANCE '];
    var mainarea = document.getElementById('maindiv');

    var scene = document.getElementById('sceneid');
    var statdiv = document.createElement('div');
    var statdivout = document.createElement('div');
    statdivout.id = "statdivoutid";
   
    for(let i = 0 ; i < cards.length ; i++) {
        cardname = cards[i].Character;
        cardanime = cards[i].Anime;
        cardpath = cards[i].path;
        cardstat = cards[i].stat;

        var cardiv = document.createElement('div');
        cardiv.classList.add('card');
        cardiv.classList.add('cardpopclass');
        if(bonus_tab.includes(cardanime)) cardiv.classList.add(getBonusClasse(cardanime));
        else cardiv.classList.remove(getBonusClasse(cardanime));

        //DISABLE IF EVERYONE DIDNT DRAW YET (STAT)
        if(stat != true || used_cards.includes(cardname) || used_cards_tmp.includes(cardname) || game_time <= 0 || game_time == null) cardiv.classList.add('disablemode3')

        cardiv.id = "cardid" + i;

        //WHEN CARD HOVER
        cardiv.addEventListener('mouseenter' , function(event) {
            if(!statdivout.classList.contains('statdivout')) statdivout.classList.add('statdivout');
            

            for(let j = 0 ; j< 8 ; j ++) {
                var pstat = document.createElement('p');
                var span = document.createElement('span');
                pstat.classList.add('skilltxtout');
                pstat.textContent = statarray[j];

                span.classList.add('skilltextoutspan');
                span.textContent = cards[i].stat[j];

                pstat.appendChild(span);
                statdivout.appendChild(pstat);
            }
            mainarea.appendChild(statdivout);
        });


        //MOUSE LEAVE CARD
        cardiv.addEventListener('mouseleave' , function(event) {
            var sdiv = document.getElementById('statdivoutid');
            while (sdiv.firstChild) {
                sdiv.removeChild(sdiv.firstChild);
            }

        });


    
        var charapic = document.createElement('img');
        charapic.setAttribute('src' , cardpath);
        charapic.classList.add('cardpicclass');

        var charname = document.createElement('span');
        charname.innerHTML = cardname;
        charname.classList.add('cardtxt');

        var charanime = document.createElement('span');
        charanime.innerHTML = cardanime;
        charanime.classList.add('cardanimeclass');
       

        cardiv.appendChild(charapic);
        cardiv.appendChild(charname);
        cardiv.appendChild(charanime);

        //IF THE CARD HAS BEEN CHOOSED
        if(used_cards.includes(cardname)) {
            var spanused = document.createElement('span');
            spanused.classList.add('usedspan');

            var spanpic = document.createElement('img');
            spanpic.setAttribute('src' , 'finger3.png');
            spanpic.classList.add('fingerpic');

            spanused.appendChild(spanpic);
            cardiv.appendChild(spanused);
        }


        scene.appendChild(cardiv);


        
    }
}


//ADD FINGER AFTER HOVER CARD
$(document).on('mouseenter' , '.card' , function() {
    var spanused = document.createElement('span');
    spanused.classList.add('usedspan');

    var spanpic = document.createElement('img');
    spanpic.setAttribute('src' , 'finger3.png');
    spanpic.classList.add('fingerpic');

    spanused.appendChild(spanpic);
    this.appendChild(spanused);
});

$(document).on('mouseleave' , '.card' , function() {
    $(this).find('span:gt(0):last').remove();
});



//WHEN CLICK ON CARD
$(document).on('click', '.card', function() {
    var spanused = document.createElement('span');
    spanused.classList.add('usedspan');

    var spanpic = document.createElement('img');
    spanpic.setAttribute('src' , 'finger3.png');
    spanpic.classList.add('fingerpic');

    spanused.appendChild(spanpic);
    this.appendChild(spanused);
    this.classList.add('disablemode3');

    var character = this.querySelector('span').textContent;
    var body = {
        val: character
    };

    var config = {
        method: 'post',
        url: '/chooseCard',
        data: body
    };

    axios(config)
    .then(function (res) {
       socket.emit('tempPlateEvent' , res.data);
       $(".card").addClass('disablemode3');
    })
    .catch(function (err) {
        console.log(err);
    });
});





document.addEventListener('contextmenu', function(event) {
    // event.preventDefault();

});


function editRandomStat(cstat) {
    var values = ['⚔️ATTAQUE⚔️' , '🛡️DEFENSE🛡️' , '💡INTELLIGENCE💡' , '❤️ENDURANCE❤️' , '⚡VITESSE⚡' , '🤸🏼AGILITÉ🤸🏼' , '🎯TECHNIQUE🎯' , '🍀CHANCE🍀'];
    startStatRoulette(values , cstat);
}


function displayStat(value) {

  document.getElementById('mainstattxt').innerText = value;
}

// Fonction pour simuler un effet de roulette
function startStatRoulette(values , cstat) {
  var interval = 50; // Intervalle entre chaque changement de valeur (en millisecondes)
  var maxIterations = 50; // Nombre maximal d'itérations avant de ralentir
  let currentIteration = 0;
  
  // Fonction récursive pour changer de valeur
  function roulette() {
    var randomIndex = Math.floor(Math.random() * values.length);
    displayStat(values[randomIndex]);
    
    currentIteration++;
    if (currentIteration < maxIterations) {
      setTimeout(roulette, interval);
    } else {
       
      // Ralentissement progressif
      interval *= 1.2; // Ajustez ce facteur selon votre préférence
      if (interval < 200) {
        displayStat(cstat);
        
        document.getElementById('mainstattxt').classList.add('endstatclass');

      } else {
        setTimeout(roulette, interval);
      }
      
    }
  }
  
  // Démarrer la roulette
  roulette();
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



function addToPlate(card_info) {
    var chara = card_info[0];
    var chara_stat = card_info[1];
    var chara_pic = card_info[2];
    var player = card_info[3];

    var plate = document.getElementById('plateid');

    var card_container = document.createElement('div');
    card_container.classList.add('playedcard');
    card_container.classList.add('playedpopclass');

    var card_back = document.createElement('div');
    card_back.classList.add('playedback');

    var card_front = document.createElement('div');
    card_front.classList.add('playedfront');

    var card_pic = document.createElement('img');
    card_pic.classList.add('cardpicclass2');
    card_pic.setAttribute('src' , chara_pic);

    var card_author = document.createElement('p');
    card_author.classList.add('cardauthor');
    card_author.textContent = player;

    var card_stat = document.createElement('span');
    card_stat.classList.add('cardstat');
    card_stat.textContent = chara_stat;

    card_front.appendChild(card_stat);
    card_front.appendChild(card_pic);
    card_front.appendChild(card_author);
    card_container.appendChild(card_back);
    card_container.appendChild(card_front);

    plate.appendChild(card_container)

    setTimeout(() => {
        card_container.classList.remove('playedpopclass');
    }, 1100);
}



function editPlate(plate_info) {
    var plate = document.getElementById('plateid');

    for(let i = 0 ; i < plate_info.length ; i ++) {
        var character = plate_info[i][0];
        var chara_stat = plate_info[i][1];
        var chara_pic = plate_info[i][2];
        var player = plate_info[i][3];
        
        var card_container = document.createElement('div');
        card_container.classList.add('playedcard');
        card_container.classList.add('playedpopclass');

        var card_back = document.createElement('div');
        card_back.classList.add('playedback');

        var card_front = document.createElement('div');
        card_front.classList.add('playedfront');

        var card_pic = document.createElement('img');
        card_pic.classList.add('cardpicclass2');
        card_pic.setAttribute('src' , chara_pic);

        var card_author = document.createElement('p');
        card_author.classList.add('cardauthor');
        card_author.textContent = player;

        var card_stat = document.createElement('span');
        card_stat.classList.add('cardstat');
        card_stat.textContent = chara_stat;

        card_front.appendChild(card_stat);
        card_front.appendChild(card_pic);
        card_front.appendChild(card_author);
        card_container.appendChild(card_back);
        card_container.appendChild(card_front);

        plate.appendChild(card_container)

        setTimeout(() => {
            card_container.classList.remove('playedpopclass');
        }, 1100);

    }
    
}



function playCardBackAudio() {
    var ta = document.getElementById('audio8');
    ta.volume = 0.07;
    ta.loop = true;
    
    // ta.play();
        
}


function revealCard(winnerc) {

    var winner_card;
    var plate_cards = document.querySelectorAll('.playedcard');
    $('.playedcard').removeClass('playedpopclass');

    plate_cards.forEach(card => {
       var cspan = card.querySelector('span');
       if(cspan) {
        if(cspan.textContent == winnerc) {
            winner_card = card;
            card.classList.add('flipclasswinner');
        } else card.classList.add('flipclass');
        
       }
    });

    setTimeout(() => {
        winner_card.classList.add('shadow');
    }, 1200);
    
}



function editRoundMessage(stat) {
    var mainarea = document.getElementById('maindiv');
    var wpic = document.createElement('img');

    if(stat == 0) {
        wpic.classList.add('wincardpic');
        wpic.setAttribute('src' , 'cwin.png');
    } else {
        wpic.classList.add('failcardpic');
        wpic.setAttribute('src' , 'fail2.png');
    }


    mainarea.appendChild(wpic);
}




function removeCardLife() {
    var lifearea = document.getElementById('lifecardareaid');
    var lastlife = lifearea.lastElementChild;

    if(lastlife.tagName == "IMG") {
        lifearea.removeChild(lastlife)
    }
}


function enableRound(data) {
    // data[0] -> tmp_cards which must be disable for next round

    var cards = document.querySelectorAll('.card');

    cards.forEach(function(card) {
        var charas = card.querySelector('span');
        var finger = card.querySelectorAll('span')[1];
        if(!data[0].includes(charas.textContent)) {
            if(data[1] != "no") card.classList.remove('disablemode3');
        }

        if(finger) card.removeChild(finger);
    
    });
    
}



function clearPlate() {
    var plate = document.getElementById('plateid');
    $('.playedcard').addClass('hideplateclass')
    setTimeout(() => {
        plate.innerHTML = '';
    }, 1100);
    
}



function replaceHandCard(toremove , new_character) {
    var cards = document.querySelectorAll('.card');
    var scene = document.getElementById('sceneid');
    var anime = [];

    //SELECT ANIME DOUBLON TO KNOW IF THERE IS SHADOW CLASS TO REMOVE AFTER CARD REMOVE
    cards.forEach(function(card) {
        var animecard = card.querySelector('span:nth-child(2)');
        anime.push(animecard.textContent);
    })

    var bonus_tab = checkBonus(anime);

    var sdiv = document.getElementById('statdivoutid');

    var mainarea = document.getElementById('maindiv');
    var statarray = ['⚔️ ATK ' , '🛡️ DEF ' , ' 💡 INT ' , '❤️ END ' , '⚡ VIT ' , '🤸🏼 AGI ' , '🎯 TECH ' , '🍀 LUCK '];

    cards.forEach(function(card) {
      

        var hand_character = card.querySelector('span');
        if(hand_character.textContent == toremove) {
            card.classList.add('removecardclass')
            setTimeout(() => {
                
                var neo_character = new_character.Character;
                var neo_path = new_character.path;
                var neo_anime = new_character.Anime;

                var newCard = document.createElement('div');
                newCard.classList.add('card');
                newCard.classList.add('cardpopclass');
                newCard.classList.add('disablemode3');


                //WHEN CARD HOVER
                newCard.addEventListener('mouseenter' , function(event) {
                    if(!sdiv.classList.contains('statdivout')) sdiv.classList.add('statdivout');

                    for(let j = 0 ; j< 8 ; j ++) {
                        var pstat = document.createElement('p');
                        var span = document.createElement('span');
                        pstat.classList.add('skilltxtout');
                        pstat.textContent = statarray[j];

                        span.classList.add('skilltextoutspan');
                        span.textContent = new_character.stat[j];

                        pstat.appendChild(span);
                        sdiv.appendChild(pstat);
                    }
                    mainarea.appendChild(sdiv);
                });


                //MOUSE LEAVE CARD
                newCard.addEventListener('mouseleave' , function(event) {
                
                    while (sdiv.firstChild) {
                        sdiv.removeChild(sdiv.firstChild);
                    }

                });


                var charapic = document.createElement('img');
                charapic.setAttribute('src', neo_path);
                charapic.classList.add('cardpicclass');

                var charname = document.createElement('span');
                charname.innerHTML = neo_character;
                charname.classList.add('cardtxt');

                var charanime = document.createElement('span');
                charanime.innerHTML = neo_anime;
                charanime.classList.add('cardanimeclass');

                newCard.appendChild(charapic);
                newCard.appendChild(charname);  
                newCard.appendChild(charanime)

                scene.insertBefore(newCard, card.nextSibling);

                card.remove();
                  
            }, 1700);

        }

        var cardanime = card.querySelector('span:nth-child(2)').textContent;
        if(bonus_tab.includes(cardanime)) card.classList.add(getBonusClasse(cardanime.textContent));
        else card.classList.remove(getBonusClasse(cardanime));

    });
}




function checkBonus(cards) {
    var anime = [];
    var bonus_anime = [];

    cards.forEach(card => {
        anime.push(card.Anime);
    });

    anime.forEach(ani => {
        if(checkTwice(anime , ani)) {
            if(!bonus_anime.includes(ani)) bonus_anime.push(ani);
        } 
    });


    return bonus_anime;
    
}


function checkTwice(array , value) {
    var c = 0;
    for(let i = 0 ; i < array.length ; i++) {
        if(array[i] == value) c++;
        if(c>1) return true;
    }

     return false;
}




function getBonusClasse(anime) {
    // if(anime == "Naruto") return "shadownaruto";
    // if(anime == "One Piece") return "shadowonepiece";
    // if(anime == "Bleach") return "shadowbleach";
    // if(anime == "Jojo") return "shadowjojo";
    // if(anime == "Dragon Ball") return "shadowdbz";
    // if(anime == "Fairy Tail") return "shadowfairytail";
    return "shadowprime";
}


function editBonusAnimation(animes) {
    var handle_anime = ['Naruto' , 'One Piece' , 'Bleach' , 'Dragon Ball' , 'Fairy Tail' , 'Jojo' , 'Attack on Titan' , 'Hunter Hunter' , 'Chainsaw Man' , 'Death Note'];
    var bonus_area = document.createElement('div');
    var mainarea = document.getElementById('maindiv');

    animes.forEach(anime => {
        if(handle_anime.includes(anime)) {
            var bonuspicel = document.createElement('img');
            var path;
            var picclass = 'bonuspic';

            switch (anime) {
                case 'Naruto':
                    path = "narutobonus.png"
                    picclass = "bonuscustom";
                break;
                case 'One Piece':
                    path = "onepiecebonus.png"
                break;
                case 'Bleach':
                    path = "bleachbonus.png"
                break;
                case 'Dragon Ball':
                    path = "dbzbonus.png"
                break;
                case 'Fairy Tail':
                    path = "fairytailbonus.png"
                break;
                case 'Jojo':
                    path = "jojobonus.png"
                break;
                case 'Attack on Titan':
                    path = "snkbonus10.png"
                break;
                case 'Hunter Hunter':
                    path = "hxhbonus.png"
                break;
                case 'Chainsaw Man':
                    path = "chainsawbonus.png"
                break;
                case 'Death Note':
                    path = "deathbonus.png"
                break;
                case 'My Hero Academia':
                    path = "mhabonus.png"
                    picclass = "bonuscustom";
                break;
            }


            bonuspicel.setAttribute('src' , path);
            bonuspicel.classList.add(picclass);

            bonus_area.appendChild(bonuspicel);

            mainarea.appendChild(bonus_area)
           
            

        }

    });
}



function displayCardWinner(data) {
    var winner = data[0];
    app.gwinner = winner;
    var stat = data[1];

    if(stat == "yes") $('.replaybtn').show();
    $('.scene').hide();
    $('.stt').hide();
    $('#lifecardareaid').hide();
    $('.cardplate').hide();

    $('.winnerdiv').show();
}