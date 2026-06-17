const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ],
};

export class WebRTCHandler {
  constructor(socket, peerSocketId, onStreamCallback, onConnectionStateChange) {
    this.socket = socket;
    this.peerSocketId = peerSocketId;
    this.onStreamCallback = onStreamCallback;
    this.onConnectionStateChange = onConnectionStateChange;
    this.peerConnection = null;
    this.localStream = null;
  }

  async init(localStream) {
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection(configuration);

    // Add local tracks
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Track connection status
    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // Remote stream arrival
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onStreamCallback(event.streams[0]);
      }
    };

    // Send local ICE candidates to peer
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          target: this.peerSocketId,
          candidate: event.candidate,
        });
      }
    };
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socket.emit("offer", {
      target: this.peerSocketId,
      sdp: offer,
    });
  }

  async handleOffer(sdp) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.socket.emit("answer", {
      target: this.peerSocketId,
      sdp: answer,
    });
  }

  async handleAnswer(sdp) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error("Error adding received ICE candidate", e);
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
