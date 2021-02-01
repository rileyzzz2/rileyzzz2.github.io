import {beginPlay} from './game.mjs';
import {startGame} from './game.mjs';
import {beginMatch} from './game.mjs';
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

    let params = new URLSearchParams(location.search);

    var singleplayer = params.get('singleplayer');
    if(singleplayer) {
        startGame(0);
        beginMatch();
        return;
    }

    hostID = params.get('join');
    if(hostID) {
        // pubnub.subscribe({
        //     channels: [activeLobby],
        //     withPresence: true
        // });
        //connectToPeer(hostID);

        //connect to the host
        hostConn = peer.connect(hostID);
        hostConn.on('open', function(){

            //create a remote player for the host
            remoteConnections[hostID] = new RemotePlayer(hostConn);
            refreshPlayerList();
        });
    }
    else
    {
        isHost = true;
        hostID = playerID;

        $("#p2pid").text("Your P2P ID is:\n" + hostID);
    }

    refreshPlayerList();
});

class RemotePlayer {
    constructor(conn) {
        this.conn = conn;
        this.conn.on('data', processConnectionData);
        console.log("Connected to remote player " + conn.peer);
    }
}

peer.on('connection', function(conn) {
    console.log("Connection established with client " + conn.peer);
    
    if(!remoteConnections[conn.peer]) {
        remoteConnections[conn.peer] = new RemotePlayer(conn);
        refreshPlayerList();
    }

    console.log("connection list " + Object.keys(remoteConnections));

    //send an update player list message to all connected clients when a client joins
    if(isHost) {
        for(const client in remoteConnections) {
            remoteConnections[client].conn.send({
                type: "refreshConnectedPlayers",
                players: Object.keys(remoteConnections)
            });
        }
    }
    
});

function processConnectionData(data) {
    //console.log("received connection data:");
    //console.log(data.type);

    if(!isHost)
    {
        if(data.type === "refreshConnectedPlayers") {
            for(let i = 0; i < data.players.length; i++) {
                let player = data.players[i];
                if(!remoteConnections[player] && player !== playerID) {
                    remoteConnections[player] = new RemotePlayer(peer.connect(player));
                    refreshPlayerList();
                }
            }
            //remoteConnections = data.players;
        }
        else if(data.type === "startGame") {
            startGame(data.playerIndex);
        }
        else if(data.type === "beginMatch") {
            beginMatch();
        }
    }

    if(isHost) {
        if(data.type === "playerLoaded") {
            readyState[data.index] = true;
            console.log("player " + data.index + " is ready.");
            let checker = arr => arr.every(Boolean);
            if(checker(readyState)) {
                beginMatch();
                for(const client in remoteConnections) {
                    remoteConnections[client].conn.send({
                        type: "beginMatch"
                    });
                }
            }
        }
        
    }

    if(data.type === "itemCollected")
        activeMap.items[data.index].collect();
}

function refreshPlayerList() {
    $(".playerList").empty();
    //let item = "<tr class='playerListElement'></tr>";
    var clientCount = 0;
    function addClient(client) {
        var row = $("<tr class='playerListElement'></tr>");

        var nameCol = $("<td>" + client + "</td>");
        row.append(nameCol);

        var infoCol = $("<td></td>");
        if(client === playerID)
            infoCol.append("(client)");
        if(client === hostID)
            infoCol.append("(host)");
        
        row.append(infoCol);

        $(".playerList").append(row);
        clientCount++;
    }
    //local player
    addClient(playerID);

    for(const client in remoteConnections)
        addClient(client);

    if(isHost && clientCount > 1)
        $(".startGame").show();
    else
        $(".startGame").hide();
}

$(".startGame").click(function() {
    readyState = [];
    startGame(0);
    readyState[0] = true;

    var index = 1; //offset for host
    for(const client in remoteConnections) {
        readyState[index] = false;
        remoteConnections[client].conn.send({
            type: "startGame",
            playerIndex: index++
            //eventually add specific parameters like map, etc
        });
    }
});


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
