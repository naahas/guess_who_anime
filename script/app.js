
var socket = io();
socket.on('connect' , () => { console.log(socket.id)});




var app = new Vue({

    el: '#app',

    data: function() {
        return {
            testo:"pikinemad"
        }
    },


    methods: {

        createLobby: function() {
            alert('PUPUTSU PAISEN')
        }
        

    },

    created:  function() {
        

    },

   
    mounted: async function() {
        
        

    },

})