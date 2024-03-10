
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

        sendAnswer: function() {
            
            var player_answer = this.canswer;
            $('.p1input').val('');

            var body = {
                val: player_answer
            };

            var config = {
                method: 'post',
                url: '/sendAnswer',
                data: body
            };

            axios(config)
            .then(function (res) {
                
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
        })

     

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
