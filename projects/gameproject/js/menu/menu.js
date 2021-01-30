
$("#btn_host").click(function() {
    $(".mainButtons").hide();
    $(".lobbySetup").show();
});

$("#btn_join").click(function() {
    $(".mainButtons").hide();
    $(".lobbyJoin").show();
});

$("#btn_singleplayer").click(function() {
    $(".mainButtons").hide();
    $(".singleplayerSetup").show();
});

// $("#btn_hostgame").click(function () {
    
//     alert("host game " + $("lobbyname").val());
// });