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
        if(msg.type === "playerTick") {
            if(Players[publisher])
                Players[publisher].tick(msg); 
            else
                console.log("Could not find registered kart for player " + publisher);
        }

    }
}

pubnub.addListener(listener);

//sessionStorage.setItem("SessionPubNub" pubnub);
//sessionStorage.getItem("variableName");