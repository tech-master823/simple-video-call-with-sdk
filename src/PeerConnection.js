const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};


class PeerConnection {
  constructor({ userId, peerUserId, peerSocketId, stream, roomId, role }) {
    this.userId = userId;
    this.peerUserId = peerUserId;
    this.peerSocketId = peerSocketId;
    this.pc = new RTCPeerConnection(config);
    this.localStream = stream;
    this.events = {};
    this.roomId = roomId;
    this.role = role;
    this.completed = false;
  }

  start() {
    
    window.socket.on('message', (data) => {
      console.log(data.target, this.userId)
      if(data.role === this.role || data.target !== this.userId) return;

      console.log(data.data);
      switch (data.data.type) {
        case 'sdp':
          this.pc.setRemoteDescription(new RTCSessionDescription(data.data.sdp), () => {
            if (this.pc.remoteDescription.type === 'offer') {
              this.pc.createAnswer().then(this.createLocalDescription.bind(this));
            }
          });
          break;
        case 'candidate':
          this.pc.addIceCandidate(new RTCIceCandidate(data.data.candidate));
          break;
        default:
          break;
      }
    });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        window.socket.emit('message', {
          data: { type: 'candidate', candidate: event.candidate },
          roomId: this.roomId,
          to: this.peerSocketId,
          role: this.role,
          userId: this.peerUserId,
        });        
      }
    }
    console.log(this.role)
    if(this.role === "student") {
      this.pc.onnegotiationneeded = () => {
        console.log('Negotiation needed');
        this.pc.createOffer().then(this.createLocalDescription.bind(this));
      };
    }

    this.pc.ontrack = (event) => {
      // console.log('Remote stream added:', event.streams);
      this.events["peerStream"](event.streams[0]); 
      this.completed = true;
    };

    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });
  }

  createLocalDescription(desc) {
    this.pc.setLocalDescription(desc, 
      () => window.socket.emit('message', {
        data: { type: 'sdp', sdp: this.pc.localDescription },
        roomId: this.roomId,
        to: this.peerSocketId,
        role: this.role,
        userId: this.peerUserId,
      })
    );
    
  }

  on(event, callback) {
    this.events[event] = callback;
    return this;
  }
}

export default PeerConnection;

// class PeerConnection {
//   constructor({ stream, peerUserId, peerSocketId, roomId, role }) {
//     this.peerId = peerId;
//     this.pc = new RTCPeerConnection(config);
//     this.events = {};
//     this.role = role;
//     this.localStream = stream;
//   }

//   on(event, callback) { 
//     this.events[event] = callback;
//     return this;
//   }

//   start() {
//     window.socket.on('message', (data) => {
//       if(data.role === this.role) return;
//       switch (data.type) {
//         case 'sdp':
//           this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp), () => {
//             if (this.pc.remoteDescription.type === 'offer') {
//               this.pc.createAnswer().then(this.localDescCreated.bind(this));
//             }
//           });
//           break;
//         case 'candidate':
//           this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//           break;
//         default:
//           break;
//       }
//     });
//     this.pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         window.socket.emit('message', {
//           type: 'candidate', 
//           candidate: event.candidate,
//           role: this.role,
//         });        
//       }
//     }

//     if(this.role === "student") {
//       this.pc.onnegotiationneeded = () => {
//         console.log('Negotiation needed');
//         this.pc.createOffer().then(this.localDescCreated.bind(this));
//       };
//     }

//     this.pc.ontrack = (event) => {
//       this.events["peerStream"](event.streams[0]); 
//     };

//     this.localStream.getTracks().forEach((track) => {
//       this.pc.addTrack(track, this.localStream);
//     });
//   }

//   localDescCreated(desc) {
//     this.pc.setLocalDescription(desc, 
//       () => window.socket.emit('message', {
//         type: 'sdp', 
//         sdp: this.pc.localDescription,
//         role: this.role,
//       })
//     );
//   }
// }

// export default PeerConnection;