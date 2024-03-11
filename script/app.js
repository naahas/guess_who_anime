
var socket = io();
socket.on('connect' , () => { console.log(socket.id)});






var app = new Vue({

    el: '#app',

    data: function() {
        return {
            testo:"pkm",
            username:'',
            roomid: '',
            opponent:'',
            bombtime:'',
            currenttheme:'',
            opponentres:'',
            canswer:''
            
            
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


        submitUsername: function() {
            var body = {
                val: this.username
            };

            var config = {
                method: 'post',
                url: '/launch',
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


        checkAnswer: function() {
            var player_answer = this.canswer;
            this.canswer = '';
            $('.p1input').val('');

            socket.emit('sendAnswerEvent' , player_answer)
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
            this.username = iouser + " (vous)";
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


        socket.on('joinNotificationEvent' , (player) => {
            $('.waittxt').html("EN ATTENTE D'UN JOUEUR : 1/1 (" + player + ")");
            $('.startbtn').removeClass('disablemode');
        });


        socket.on('changeGamePlayerStatusEvent' , () => {
            ingameRequest();
        });


        socket.on('makePlayerPlayingEvent' , () => {
            isplayingRequest();
        });


        socket.on('displaySetting', () => {
            $('.navdiv').show();
            $('.rdiv').show();
        });


        socket.on('displayOpponent' , (opponent) => {   
            this.opponent = opponent;
            $('.opponentdiv').show();
        });


        socket.on('displayWaitMsgGameEvent' , () => {
            $('.waitgametxt').show();
        });


        socket.on('enableInputEvent' , () => {
            $('.p1div').removeClass('disablemode2');
        });


        socket.on('displayPostRule' , (time , theme) => {
            this.bombtime = time;
            this.currenttheme = theme;
            $('.rdiv2').show();
        });


        socket.on('startSoundEvent' , () => {
            playTimer();
        });


        socket.on('showTypingOpponentEvent' , (msg) => {
            this.opponentres = msg;
        });


        socket.on('cancelGameExitEvent' , () => {
            cancelRequest();
        });


        socket.on('notifHostCancelFromPlayer' , () => {
            $('.waittxt').html("EN ATTENTE D'UN JOUEUR : 0/1");
        });


        socket.on('denableTurnInput' , (nbturn) => {
            this.opponentres = '';
            handleInput(nbturn);
        });

        socket.on('enableForOpponent' , () => {
            console.log("JACTIVE")
            $('.p1div').removeClass('disablemode2');
        });


        socket.on('disableForSelf' , () => {
            console.log("JE DESACTIVE");
            $('.p1div').addClass('disablemode2');
        });


        socket.on('testEvent' , () => {
            alert('WONDER')
        });


        socket.on('answerErrorEvent' , () => {
            editAnswerError();
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
            
        });

     

    },


})




//JS AND JQUERY SECTION


$('.p1input').on('input' , function(e) {
    socket.emit('showTypingEvent' , e.target.value);
})


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


function editAnswerError() {
    $('#p1inputid').addClass('tmpshake');
    $("#p1inputid").animate({'border-bottom-color': '#e26381'}, 400);
    setTimeout(function(){
        $('#p1inputid').removeClass('tmpshake');
     },300);    

     setTimeout(function(){
        $("#p1inputid").css('border-bottom-color' , '#e0cbcb');
     },500);  

     $("#p1inputid").trigger('blur'); 

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
        $('#p1inputid').removeClass('disablemode2');
        $("#p1inputid").removeAttr('disabled');
    } else {
        $('#p1inputid').addClass('disablemode2');
        $("#p1inputid").prop("disabled", true);
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
