
//https://itnext.io/how-to-build-a-realtime-multiplayer-game-in-javascript-using-pubnub-5f410fd62f33

const uuid = PubNub.generateUUID();
const pubnub = new PubNub({
    publishKey: "pub-c-d2355256-7b44-4146-94f0-8d664c5ddf90",
    subscribeKey: "sub-c-5745a2f8-5ba2-11eb-ae0a-86d20a59f606",
    uuid: uuid
});

(function() {
    const player = {
        name: '',
        sign: '',
        score: 0
    }
    
})();

var lobby = "";
listener = {
    //detect new players
    presence: function(response) {
        if (response.action === 'join') {
            if(response.occupancy < 2){

                // Add hereNow() function here

                // Player is the Host
                player.name = 'Host';
                player.sign = 'H';
                isHost = true;
                //guessWord.innerHTML = 'You are the Host. Waiting for opponent...';
            }
            else if(response.occupancy >= 2){
                // Player is the Guest
                if(!isHost){
                    player.name = 'Guest';
                    player.sign = 'G';
                    // guessWord.innerHTML = `Guess the drawing!`;
                    // triesLeft.innerHTML = "Tries Left: 3";
                }

                //score.innerHTML = `My Score: ${player.score}`;
                //opponentScore.innerHTML = "Opponent's Score: 0";

                // Unsubscribe fromm lobby channel
                pubnub.removeListener(listener); 
                pubnub.unsubscribe({
                    channels: [lobby]
                });

                //gameStart(pubnubGuessGame, ChatEngine, GuessWordChatEngine, game, player);               
            }
        }
    }, 
    status: function(event) {
        if (event.category == 'PNConnectedCategory') {
            //setUpCanvas();
        } 
    }   
}

pubnub.addListener(listener);
pubnubGuessGame.subscribe({
  channels: [lobby],
  withPresence: true
});
//sessionStorage.setItem("SessionPubNub" pubnub);
//sessionStorage.getItem("variableName");

function startMultiplayerGame() {

}