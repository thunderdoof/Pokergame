const express = require('express')
const app = express()
const expressValidator = require('express-validator');
const path = require('path')
const bodyParser = require('body-parser');

var server = require('http').Server(app);
var io = require('socket.io').listen(server)

const port = 3000

const Game = require('./js/Game.js')
const Deck = require('./js/Deck.js')
const Player = require('./js/Player.js')
const Card = require('./js/Card.js')

const SocketEngine = require('./js/SocketEngine')
app.use(expressValidator())
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(path.join(__dirname, 'clientJS')));

server.listen(process.env.PORT || port);
console.log("Server started")


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/poker_client.html'))
})


//GLOBALS
suits = ['HEARTS', 'DIAMONDS', 'SPADES', 'CLUBS']
states = ['PREFLOP', 'FLOP', 'TURN', 'RIVER']

//NEW GAME STARTED
var socketEngine = new SocketEngine(io)
var game = new Game(socketEngine) //new game


function obfuscatePlayerCards() {
    var players = game.getTable().getPlayers()
    arr = []
    var hidden_cards = [new Card("HIDDEN","HIDDEN" ),new Card("HIDDEN","HIDDEN" )]

    for (var i = 0; i < players.length; i++) {
        arr.push(new Player(players[i].id, players[i].stack, players[i].blind_type, players[i].has_folded, hidden_cards))

    }
    return arr
}
io.on('connection', (socket) => {
    socketEngine.addConnection(socket)
    game.table.addPlayer(socket.id)
    console.log("added player " + socket.id)

    var data = {
        players: obfuscatePlayerCards(),
        my_player: game.getTable().getPlayer(socket.id)
    }
    socket.emit('send_data', data)

    console.log(socketEngine.getConnectedLength() + " players connected")
    if (socketEngine.getConnectedLength() > 1) { //2 players, lets start the game
        console.log("Starting game")
        game.start()
        var obf = obfuscatePlayerCards()
for(var i=0;i<game.getTable().getPlayers().length;i++) {
    var data = {
        players: obf,
        my_player: game.getTable().getPlayers()[i]
    }
    socketEngine.emit("send_data", data,game.getTable().getPlayers()[i].id)
  
}
       
    }

    socket.on('disconnect', (msg) => {
        socketEngine.connected[socket.id] = null
        game.cancelRound()
    });

})

module.exports = this


// GAME LOGIC
//SETS

/*PLAYER_CARD_ARRAY = COMMUNITY + hole_cards
j=1
for(i=0; i+j<player_card_array.length; i++){
    if(player_card_array[i].number == player_card_array[i+j].number){
        return true
    } else {
        j++
    }

}*/