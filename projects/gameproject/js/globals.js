var canvas = $("#gameWindow")[0];
var renderer;
var objects = [];
var thinkers = [];
var networkThinkers = [];
var inMatch = false;
//resources
var gameModels = {};
var playerModels = {};
var gameTextures = {};
var kartData = {};
var activeMap;
var mapStart = new THREE.Vector3();
var mapCollisionData = {};
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var activeLobby = "";
const netPlayer = {
        name: '',
        sign: '',
        score: 0
};

var mapObjects = {
    items: [],
    objects: []
};

//server variables
var isHost = false;
var readyState = [];

var hostID = "";
var hostConn;
var playerID = "";
var peer;
//var remoteClients = []; //server only
//list of active remote connections! this includes players not currently in the match, waiting to join
var remoteConnections = {};

//Players currently within the map. these are refreshed on map load, and will not correspond with remoteConnections
var localPlayer;
var localPlayerIndex = 0; //player index according to the server
var Players = [];

//var cameraHelper = new THREE.CameraHelper(camera);
//scene.add(cameraHelper);

function pvec(vec)
{
    return new Ammo.btVector3(vec.x, vec.y, vec.z);
}
function pquat(quat)
{
    return new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w);
}

function tvec(vec)
{
    return new THREE.Vector3(vec.x(), vec.y(), vec.z());
}

function tquat(quat)
{
    return new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
}


window.setInterval(async function() {
    for(let i = 0; i < thinkers.length; i++)
        thinkers[i].tick();
}, 1.0 / 60.0 * 1000.0);

window.setInterval(async function() {
    for(let i = 0; i < networkThinkers.length; i++)
        networkThinkers[i].replicate();
}, 200.0); //64 Hz tickrate (1.0 / 64.0) * 1000.0

class GameObject {
    constructor(mesh, rigidBody) {
        this.mesh = mesh;
        this.rigidBody = rigidBody;
    }
    update(deltaTime) {
        var tmpTrans = new Ammo.btTransform();
        let ms = this.rigidBody.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            this.mesh.position.set( p.x(), p.y(), p.z() );
            this.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() );
        }
    }
}

//helpers
const CF_NO_CONTACT_RESPONSE = 4;
const CF_CUSTOM_MATERIAL_CALLBACK = 8;
const TRIANGLE_SHAPE_PROXYTYPE = 1; //unsure
var SkelUtils;

function setCoinCount(count) {
    localPlayer.collectedCoins = count;
    //console.log(localPlayer.collectedCoins + " coins collected");
    $("#coinCount").text(localPlayer.collectedCoins);
    if(localPlayer.collectedCoins !== 10)
        $(".coinCounter").css("color", "white");
    else
        $(".coinCounter").css("color", "gold");
}

const ITEM_NONE             = -1;
const ITEM_BANANA           = 0;
const ITEM_LIGHTNING        = 1;
const ITEM_MUSHROOM         = 2;
const ITEM_MUSHROOM_GOLD    = 3;
const ITEM_SHELL_GREEN      = 4;
const ITEM_SHELL_RED        = 5;
const ITEM_SHELL_BLUE       = 6;
const ITEM_STAR             = 7;
const ITEM_COIN             = 8;
const ITEM_MAX = ITEM_COIN + 1;

var itemIcon = ITEM_NONE;
function setItemIcon(item) {
    if(item === itemIcon)
        return;
    
    itemIcon = item;
    var img = $(".itemIcon");
    switch(item) {
    default:
    case ITEM_NONE:
        img.attr("src", "img/ui/item/none.png");
        break;
    case ITEM_BANANA:
        img.attr("src", "img/ui/item/banana.png");
        break;
    case ITEM_LIGHTNING:
        img.attr("src", "img/ui/item/lightning.png");
        break;
    case ITEM_MUSHROOM:
        img.attr("src", "img/ui/item/mushroom.png");
        break;
    case ITEM_MUSHROOM_GOLD:
        img.attr("src", "img/ui/item/mushroom_gold.png");
        break;
    case ITEM_SHELL_GREEN:
        img.attr("src", "img/ui/item/shell_green.png");
        break;
    case ITEM_SHELL_RED:
        img.attr("src", "img/ui/item/shell_red.png");
        break;
    case ITEM_SHELL_BLUE:
        img.attr("src", "img/ui/item/shell_blue.png");
        break;
    case ITEM_STAR:
        img.attr("src", "img/ui/item/star.png");
        break;
    case ITEM_COIN:
        img.attr("src", "img/ui/item/coin.png");
        break;
    }
}

//network stuff
const uuid = PubNub.generateUUID();
const pubnub = new PubNub({
    publishKey: "pub-c-d2355256-7b44-4146-94f0-8d664c5ddf90",
    subscribeKey: "sub-c-5745a2f8-5ba2-11eb-ae0a-86d20a59f606",
    uuid: uuid
});

// function publish(data){
//     pubnub.publish({
//         channel: activeLobby,
//         message: data
//     });
// }

// function signal(data){
//     // pubnub.signal(
//     //     {
//     //         channel: "locations.route1",
//     //         message: gps
//     //     },
//     //     function(status, response) {
//     //         console.log(status, response);
//     //     }
//     // );
//     pubnub.signal(
//         {
//             channel: activeLobby,
//             message: data
//         },
//         function(status, response) {
//             console.log(status, response);
//         }
//     );
// }

//https://medium.com/bumble-tech/webrtc-making-a-peer-to-peer-game-using-javascript-f7123aed769e
//https://github.com/gutnikov/webrtc-shooter/blob/master/lib/net/peer-connection.js

// class PeerConnection {
//     CHANNEL_NAME = 'data';

//     iceServers = [{
//         url: 'stun:stun.l.google.com:19302'
//     },{
//         url: 'stun:stun.anyfirewall.com:3478'
//     },{
//         url: 'turn:turn.bistri.com:80',
//         credential: 'homeo',
//         username: 'homeo'
//     },{
//         url: 'turn:turn.anyfirewall.com:443?transport=tcp',
//         credential: 'webrtc',
//         username: 'webrtc'
//     }];

//   socket = null;
//   isInitiator = false;
//   dataChannelReady = false;
//   peerConnection = null;
//   dataChannel = null;
//   remoteDescriptionReady = false;
//   pendingCandidates = null;
//   lastMessageOrd = null;

//   constructor(socket, peerUser, isInitiator) {
//     this.parent();
//     this.socket = socket;
//     this.peerUser = peerUser;
//     this.isInitiator = isInitiator;
//     this.pendingCandidates = [];
//     this.peerHandlers = {
//       'icecandidate': this.onLocalIceCandidate,
//       'iceconnectionstatechange': this.onIceConnectionStateChanged,
//       'datachannel': this.onDataChannel
//     };
//     this.dataChannelHandlers = {
//       'open': this.onDataChannelOpen,
//       'close': this.onDataChannelClose,
//       'message': this.onDataChannelMessage
//     };
//     this.connect();
//   }

//   destroy() {
//     this.parent();
//     this.closePeerConnection();
//   }

//   connect() {
//     this.peerConnection = new RTCPeerConnection({
//       iceServers: this.iceServers
//     });
//     Events.listen(this.peerConnection, this.peerHandlers, this);
//     if (this.isInitiator) {
//       this.openDataChannel(
//           this.peerConnection.createDataChannel(this.CHANNEL_NAME, {
//         ordered: false
//       }));
//     }
//     if (this.isInitiator) {
//       this.setLocalDescriptionAndSend();
//     }
//   }

//   closePeerConnection() {
//     this.closeDataChannel();
//     Events.unlisten(this.peerConnection, this.peerHandlers, this);
//     if (this.peerConnection.signalingState !== 'closed') {
//       this.peerConnection.close();
//     }
//   }

//   setSdp(sdp) {
//     var self = this;
//     // Create session description from sdp data
//     var rsd = new RTCSessionDescription(sdp);
//     // And set it as remote description for peer connection
//     self.peerConnection.setRemoteDescription(rsd)
//       .then(function() {
//         self.remoteDescriptionReady = true;
//         self.log('Got SDP from remote peer', 'green');
//         // Add all received remote candidates
//         while (self.pendingCandidates.length) {
//           self.addRemoteCandidate(self.pendingCandidates.pop());
//         }
//         // Got offer? send answer
//         if (!self.isInitiator) {
//           self.setLocalDescriptionAndSend();
//         }
//       });
//   }

//   setLocalDescriptionAndSend() {
//     var self = this;
//     self.getDescription()
//       .then(function(localDescription) {
//         self.peerConnection.setLocalDescription(localDescription)
//           .then(function() {
//             self.log('Sending SDP', 'green');
//             self.sendSdp(self.peerUser.userId, localDescription);
//           });
//       })
//       .catch(function(error) {
//         self.log('onSdpError: ' + error.message, 'red');
//       });
//   }

//   getDescription() {
//     return this.isInitiator ?
//       this.peerConnection.createOffer() :
//       this.peerConnection.createAnswer();
//   }

//   addIceCandidate(candidate) {
//     if (this.remoteDescriptionReady) {
//       this.addRemoteCandidate(candidate);
//     } else {
//       this.pendingCandidates.push(candidate);
//     }
//   }

//   addRemoteCandidate(candidate) {
//     try {
//       this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//       this.log('Added his ICE-candidate:' + candidate.candidate, 'gray');
//     } catch (err) {
//       this.log('Error adding remote ice candidate' + err.message, 'red');
//     }
//   }

//   // When ice framework discoveres new ice candidate, we should send it
//   // to opponent, so he knows how to reach us
//   onLocalIceCandidate(event) {
//     if (event.candidate) {
//       this.log('Send my ICE-candidate: ' + event.candidate.candidate, 'gray');
//       this.sendIceCandidate(this.peerUser.userId, event.candidate);
//     } else {
//       this.log('No more candidates', 'gray');
//     }
//   }

//   // Connectivity has changed? For example someone turned off wifi
//   onIceConnectionStateChanged(event) {
//     this.log('Connection state: ' + event.target.iceConnectionState, 'green');
//   }

//   onDataChannel(event) {
//     if (!this.isInitiator) {
//       this.openDataChannel(event.channel);
//     }
//   }

//   openDataChannel(channel) {
//     this.dataChannel = channel;
//     Events.listen(this.dataChannel, this.dataChannelHandlers, this);
//   }

//   closeDataChannel() {
//     Events.unlisten(this.dataChannel, this.dataChannelHandlers, this);
//     this.dataChannel.close();
//   }

//   // Data channel
//   sendMessage(message) {
//     if (!this.dataChannelReady) {
//       return;
//     }
//     this.dataChannel.send(message);
//   }

//   onDataChannelOpen() {
//     this.dataChannelReady = true;
//     this.emit('open');
//   }

//   onDataChannelMessage(event) {
//     this.emit('message', MessageBuilder.deserialize(event.data));
//   }

//   onDataChannelClose() {
//     this.dataChannelReady = false;
//     this.emit('closed');
//   }

//   sendSdp(userId, sdp) {
//     this.socket.emit('sdp', {
//       userId: userId,
//       sdp: sdp
//     });
//   }

//   sendIceCandidate(userId, candidate) {
//     this.socket.emit('ice_candidate', {
//       userId: userId,
//       candidate: candidate
//     });
//   }

//   log(message, color) {
//     console.log('%c[Peer-%d, %s] %s', 'color:' + color, this.peerUser.userId,
//       this.peerConnection.signalingState, message);
//   }
// }

// class RoomConnection {
//   peers = null;
//   socket = null;
//   roomName = null;
//   roomInfo = null;
//   pendingSdp = null;
//   pendidateCandidates = null;

//   constructor(roomName, socket) {
//     this.parent();
//     this.socket = socket;
//     this.roomName = roomName;
//     this.pendingSdp = {};
//     this.pendingCandidates = {};

//     this.socketHandlers = {
//       'sdp': this.onSdp,
//       'ice_candidate': this.onIceCandidate,
//       'room': this.onJoinedRoom,
//       'user_join': this.onUserJoin,
//       'user_ready': this.onUserReady,
//       'user_leave': this.onUserLeave,
//       'error': this.onError
//     };

//     this.peerConnectionHandlers = {
//       'open': this.onPeerChannelOpen,
//       'close': this.onPeerChannelClose,
//       'message': this.onPeerMessage
//     };

//     Events.on(this.socket, this.socketHandlers, this);
//   }

//   destroy() {
//     this.parent();
//     Events.off(this.socket, this.socketHandlers, this);
//   }

//   connect() {
//     this.sendJoin(this.roomName);
//   }

//   initPeerConnection(user, isInitiator) {
//     // Create connection
//     var cnt = new PeerConnection(this.socket, user, isInitiator);
//     Events.on(cnt, this.peerConnectionHandlers, this, cnt, user);

//     // Sometimes sdp|candidates may arrive before we initialized
//     // peer connection, so not to loose the, we save them as pending
//     var userId = user.userId;
//     var pendingSdp = this.pendingSdp[userId];
//     if (pendingSdp) {
//       cnt.setSdp(pendingSdp);
//       delete this.pendingSdp[userId];
//     }
//     var pendingCandidates = this.pendingCandidates[userId];
//     if (pendingCandidates) {
//       pendingCandidates.forEach(cnt.addIceCandidate, cnt);
//       delete this.pendingCandidates[userId];
//     }
//     return cnt;
//   }

//   onSdp(message) {
//     var userId = message.userId;
//     if (!this.peers[userId]) {
//       this.log('Adding pending sdp from another player. id = ' + userId, 'gray');
//       this.pendingSdp[userId] = message.sdp;
//       return;
//     }
//     this.peers[userId].setSdp(message.sdp);
//   }

//   onIceCandidate(message) {
//     var userId = message.userId;
//     if (!this.peers[userId]) {
//       this.log('Adding pending candidate from another player. id =' + userId, 'gray');
//       if (!this.pendingCandidates[userId]) {
//         this.pendingCandidates[userId] = [];
//       }
//       this.pendingCandidates[userId].push(message.candidate);
//       return;
//     }
//     this.peers[userId].addIceCandidate(message.candidate);
//   }

//   onJoinedRoom(roomInfo) {
//     this.emit('joined', roomInfo);
//     this.roomInfo = roomInfo;
//     this.peers = {};
//     for (var k in this.roomInfo.users) {
//       var user = this.roomInfo.users[k];
//       if (user.userId !== this.roomInfo.userId) {
//         this.peers[user.userId] = this.initPeerConnection(this.roomInfo.users[k], true);
//       }
//     }
//   }

//   onError(error) {
//     this.log('Error connecting to room' + error.message, 'red');
//   }

//   onUserJoin(user) {
//     this.log('Another player joined. id = ' + user.userId, 'orange');
//     var peerConnection = this.initPeerConnection(user, false);
//     this.roomInfo.users.push(user);
//     this.peers[user.userId] = peerConnection;
//   }

//   onUserReady(user) {
//     this.log('Another player ready. id = ' + user.userId, 'orange');
//     this.emit('user_ready', user);
//   }

//   onPeerChannelOpen(peer, user) {
//     this.emit('peer_open', user, peer);
//   }

//   onPeerChannelClose(peer, user) {
//     this.emit('peer_close', user, peer);
//   }

//   onPeerMessage(peer, user, message) {
//     this.emit('peer_message', message, user, peer);
//   }

//   onUserLeave(goneUser) {
//     if (!this.peers[goneUser.userId]) {
//       return;
//     }
//     var cnt = this.peers[goneUser.userId];
//     Events.off(cnt, this.peerConnectionHandlers, this);
//     cnt.destroy();
//     delete this.peers[goneUser.userId];
//     delete this.roomInfo.users[goneUser.userId];
//     this.emit('user_leave', goneUser);
//   }

//   sendJoin(roomName) {
//     this.socket.emit('join', {
//       roomName: roomName
//     });
//   }

//   sendLeave() {
//     this.socket.emit(MessageType.LEAVE);
//   }

//   broadcastMessage(message) {
//     this.broadcast(MessageBuilder.serialize(message));
//   }

//   sendMessageTo(userId, message) {
//     var peer = this.peers[userId];
//     this.peerSend(peer, MessageBuilder.serialize(message));
//   }

//   broadcast(arrayBuffer) {
//     for (var p in this.peers) {
//       this.peerSend(this.peers[p], arrayBuffer);
//     }
//   }

//   peerSend(peer, data) {
//     peer.sendMessage(data);
//   }

//   log(message, color) {
//     console.log('%c%s', 'color:' + color, message);
//   }
// };