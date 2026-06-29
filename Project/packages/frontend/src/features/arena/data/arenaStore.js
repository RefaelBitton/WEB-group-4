import { create } from "zustand";
import io from "socket.io-client";
import { WebRTCHandler } from "../logic/webrtcHandler";

const getWsUrl = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:4000";
};

let socket = null;
let activeConnection = null;
let localAudioStream = null;

export const useArenaStore = create((set, get) => ({
  roomId: null,
  status: "disconnected", // 'disconnected' | 'connecting' | 'waiting' | 'negotiating' | 'connected' | 'error'
  error: null,
  remoteStream: null,
  isMuted: false,

  joinRoom: async (roomName, childId) => {
    set({ status: "connecting", roomId: roomName, error: null, remoteStream: null });
    try {
      localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      socket = io(getWsUrl());
      
      socket.emit("join-room", roomName, childId);
      set({ status: "waiting" });

      // When a peer joins, we become the caller
      socket.on("user-joined", async (userId, peerSocketId) => {
        set({ status: "negotiating" });
        activeConnection = new WebRTCHandler(
          socket,
          peerSocketId,
          (stream) => set({ remoteStream: stream, status: "connected" }),
          (state) => {
            if (state === "connected") set({ status: "connected" });
            if (state === "disconnected" || state === "failed") get().leaveRoom();
          }
        );
        await activeConnection.init(localAudioStream);
        await activeConnection.createOffer();
      });

      // Receiving incoming offer
      socket.on("offer", async (payload) => {
        set({ status: "negotiating" });
        activeConnection = new WebRTCHandler(
          socket,
          payload.callerId,
          (stream) => set({ remoteStream: stream, status: "connected" }),
          (state) => {
            if (state === "connected") set({ status: "connected" });
            if (state === "disconnected" || state === "failed") get().leaveRoom();
          }
        );
        await activeConnection.init(localAudioStream);
        await activeConnection.handleOffer(payload.sdp);
      });

      // Receiving incoming answer
      socket.on("answer", async (payload) => {
        if (activeConnection) {
          await activeConnection.handleAnswer(payload.sdp);
        }
      });

      // Receiving ICE candidates
      socket.on("ice-candidate", async (payload) => {
        if (activeConnection) {
          await activeConnection.handleIceCandidate(payload.candidate);
        }
      });

    } catch (err) {
      console.error("WebRTC room entry error", err);
      set({
        status: "error",
        error: "לא ניתן לגשת למיקרופון. אנא ודא שניתנו הרשאות מתאימות בדפדפן."
      });
    }
  },

  toggleMute: () => {
    if (localAudioStream) {
      const audioTrack = localAudioStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        set({ isMuted: !audioTrack.enabled });
      }
    }
  },

  leaveRoom: () => {
    if (activeConnection) {
      activeConnection.close();
      activeConnection = null;
    }
    if (localAudioStream) {
      localAudioStream.getTracks().forEach((track) => track.stop());
      localAudioStream = null;
    }
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    set({ roomId: null, status: "disconnected", remoteStream: null, isMuted: false });
  }
}));
