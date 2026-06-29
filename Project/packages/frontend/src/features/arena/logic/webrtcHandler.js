const getIceServers = () => {
  const stunServers = import.meta.env.VITE_STUN_SERVERS
    ? import.meta.env.VITE_STUN_SERVERS.split(",")
    : [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ];

  const iceServers = [
    { urls: stunServers },
  ];

  if (import.meta.env.VITE_TURN_URL) {
    iceServers.push({
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD,
    });
  }

  return iceServers;
};

export class WebRTCHandler {
  constructor(socket, peerSocketId, onStreamCallback, onConnectionStateChange) {
    this.socket = socket;
    this.peerSocketId = peerSocketId;
    this.onStreamCallback = onStreamCallback;
    this.onConnectionStateChange = onConnectionStateChange;
    this.peerConnection = null;
    this.localStream = null;
    this.iceCandidatesQueue = [];
  }

  async init(localStream) {
    this.localStream = localStream;
    this.peerConnection = new RTCPeerConnection({ iceServers: getIceServers() });

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
      } else {
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        this.onStreamCallback(remoteStream);
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
    await this.processQueuedCandidates();
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.socket.emit("answer", {
      target: this.peerSocketId,
      sdp: answer,
    });
  }

  async handleAnswer(sdp) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    await this.processQueuedCandidates();
  }

  async handleIceCandidate(candidate) {
    try {
      if (this.peerConnection && this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        this.iceCandidatesQueue.push(candidate);
      }
    } catch (e) {
      console.error("Error adding received ICE candidate", e);
    }
  }

  async processQueuedCandidates() {
    if (!this.peerConnection) return;
    while (this.iceCandidatesQueue.length > 0) {
      const candidate = this.iceCandidatesQueue.shift();
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding queued ICE candidate", e);
      }
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
