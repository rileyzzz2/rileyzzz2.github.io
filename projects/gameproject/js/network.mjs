import {beginPlay} from './game.mjs';
//https://itnext.io/how-to-build-a-realtime-multiplayer-game-in-javascript-using-pubnub-5f410fd62f33

var listener = {
    //detect new players
    presence: function(response) {
        if (response.action === 'join') {
            if(response.occupancy < 2){

                // Add hereNow() function here

                // Player is the Host
                netPlayer.name = 'Host';
                netPlayer.sign = 'H';
                isHost = true;
                //guessWord.innerHTML = 'You are the Host. Waiting for opponent...';
            }
            else if(response.occupancy >= 2){
                // Player is the Guest
                if(!isHost){
                    netPlayer.name = 'Guest';
                    netPlayer.sign = 'G';
                    // guessWord.innerHTML = `Guess the drawing!`;
                    // triesLeft.innerHTML = "Tries Left: 3";
                }

                //score.innerHTML = `My Score: ${player.score}`;
                //opponentScore.innerHTML = "Opponent's Score: 0";

                // Unsubscribe from activeLobby channel
                // pubnub.removeListener(listener); 
                // pubnub.unsubscribe({
                //     channels: [activeLobby]
                // });

                alert("starting game!");
                $(".menuOverlay").hide();
                Ammo().then(beginPlay);
                //gameStart(pubnubGuessGame, ChatEngine, GuessWordChatEngine, game, player);               
            }
        }
    }, 
    status: function(event) {
        if (event.category == 'PNConnectedCategory') {
            console.log("PN connected.");
            
            console.log("Starting P2P connection.");
            
            //setUpCanvas();
        } 
    },
    message: function(m) {
        console.log("received message");
        // handle message
        var channelName = m.channel; // The channel to which the message was published
        var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
        var pubTT = m.timetoken; // Publish timetoken
        var msg = m.message; // The Payload
        var publisher = m.publisher; //The Publisher
        if(publisher === uuid)
            return;
        
        if(msg.type === "registerKart")
            Players[publisher] = new NPCKart(publisher);
    },
    signal: function(s) {
        console.log("received signal");
        var msg = s.message;
        var publisher = s.publisher;
        if(publisher === uuid)
            return;
        if(msg.type === "pt") {
            if(Players[publisher])
                Players[publisher].tick(msg); 
            else
                console.log("Could not find registered kart for player " + publisher);
        }

    }
}

pubnub.addListener(listener);


peer = new Peer();
// peer = new Peer({
//     config: {'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]}
// });

peer.on('open', function(id) {
    playerID = id;
    console.log('My peer ID is: ' + id);
    $("#p2pid").text(id);

    let params = new URLSearchParams(location.search);
    hostID = params.get('join');
    if(hostID) {
        // pubnub.subscribe({
        //     channels: [activeLobby],
        //     withPresence: true
        // });
        //connectToPeer(hostID);

        //connect to the host
        var conn = peer.connect(hostID);
        conn.on('open', function(){
            //console.log("connection open, sending message");
            // here you have conn.id
            //conn.send("hello!!!!!!");
            conn.send({
                type: "joinClient",
                id: playerID
            });
        });
    }
    else
    {
        isHost = true;
        hostID = playerID;
    }
});

class RemotePlayer {
    constructor(id, conn) {
        this.id = id;
        this.conn = conn;
    }
}

peer.on('connection', function(conn) {
    console.log("connection msg");
    conn.on('data', function(data){
    // Will print 'hi!'
        console.log("received connection data:");
        console.log(data.type);

        //if server, broadcast client join message to all connected clients
        if(isHost) {
            if(data.type === "joinClient" && data.id !== playerID) {
                //for(let i = 0; i < remoteClients.length; i++)
                //remoteClients.push(data.id);
                remoteConnections[data.id] = new RemotePlayer(data.id, peer.connect(data.id));
                for(const remote in remoteConnections) {
                    remote.conn.send({
                        type: "refreshConnectedPlayers",
                        players: Object.keys(remoteConnections)
                    });
                }
            }
            else if(data.type === "leaveClient" && data.id !== playerID) {
                // const index = remoteClients.indexOf(data.id);
                // if(index > -1)
                //     remoteClients.splice(index, 1);
                remoteConnections[data.id] = null;
            }
        }
        else //!isHost
        {
            if(data.type === "refreshConnectedPlayers") {
                for(const player in data.players) {
                    if(!remoteConnections[player] && player !== playerID)
                        remoteConnections[player] = new RemotePlayer(player, peer.connect(player));
                }
                //remoteConnections = data.players;
            }
        }
    });
});


export function connectToPeer(id) {
    console.log("connecting to peer " + id);
    var conn = peer.connect(id);
    conn.on('open', function(){
        // here you have conn.id
        // conn.send({
        //     type: "connect",
        //     id: playerID
        // });
    });
}


//sessionStorage.setItem("SessionPubNub" pubnub);
//sessionStorage.getItem("variableName");

//https://peerjs.com/
//https://peerjs.com/docs.html#api
//automatically brokered with PeerJS servers



// var conn = peer.connect('another-peers-id');
// // on open will be launch when you successfully connect to PeerServer
// conn.on('open', function(){
//   // here you have conn.id
//   conn.send('hi!');
// });
