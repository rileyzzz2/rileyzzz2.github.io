const uuid = PubNub.generateUUID();
const pubnub = new PubNub({
    publishKey: "pub-c-d2355256-7b44-4146-94f0-8d664c5ddf90",
    subscribeKey: "sub-c-5745a2f8-5ba2-11eb-ae0a-86d20a59f606",
    uuid: uuid
});

$("#btn_host").click(function() {
    $(".mainButtons").hide();
    $(".lobbySetup").show();
});

$("#btn_join").click(function() {
    $(".mainButtons").hide();
    $(".lobbyList").show();
});

// $("#btn_hostgame").click(function () {
    
//     alert("host game " + $("lobbyname").val());
// });