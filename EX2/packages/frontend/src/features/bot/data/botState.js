import { useEffect, useState, useRef } from "react";
import { getConversationStarter, sendMessageToBot, transcribeAudio } from "../logic/botApi.js";

export function useBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [starter, setStarter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    async function loadStarter() {
      try {
        const data = await getConversationStarter();
        setStarter(data?.starter || "התחל שיחה באנגלית עם הבוט");
      } catch (err) {
        setStarter("לא ניתן לטעון פתיח שיחה כרגע.");
      }
    }
    loadStarter();
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    
    const userMessageText = input.trim();
    const apiHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.text
    }));

    const userMessage = { role: "user", text: userMessageText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    setInput("");

    try {
      const response = await sendMessageToBot(userMessageText, apiHistory);
      const botText = response?.content || "הבוט עדיין לא ענה. נסה שוב";
      const botMessage = { role: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError("שגיאה בשליחת ההודעה. נסה שוב." );
    } finally {
      setLoading(false);
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstart = () => {
          setIsRecording(true);
          setError(null);
        };

        recorder.onerror = (event) => {
          console.error("MediaRecorder error", event.error);
          setIsRecording(false);
          setError("שגיאה בהקלטת קול. נסה שוב.");
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.onstop = async () => {
          setIsRecording(false);
          const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
          stream.getTracks().forEach((track) => track.stop());
          if (blob.size > 0) {
            setLoading(true);
            setError(null);
            try {
              const transcription = await transcribeAudio(blob);
              const text = transcription?.transcription || transcription?.text || "";
              if (text) {
                setInput((prev) => (prev ? `${prev} ${text}` : text));
              } else {
                setError("לא התקבל טקסט מהשרת. נסה שוב.");
              }
            } catch (err) {
              console.error("Audio transcription failed", err);
              setError("שגיאה בתמלול הקול. נסה שוב.");
            } finally {
              setLoading(false);
            }
          }
        };

        try {
          recorder.start();
        } catch (e) {
          console.error(e);
          setIsRecording(false);
          setError("לא ניתן להתחיל הקלטת קול. בדוק הרשאות מיקרופון.");
          stream.getTracks().forEach((track) => track.stop());
        }

        return;
      } catch (err) {
        console.error("Media recorder initialization failed", err);
        setError("לא ניתן להתחבר למיקרופון. בדוק הרשאות ודפדפן.");
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("דפדפן זה אינו תומך בהקלטת קול.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      if (event.error !== "aborted") {
        setError("שגיאה בהקלטה. נסה שוב.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      setError("לא ניתן להתחיל הקלטת קול. בדוק הרשאות מיקרופון.");
    }
  };


  return {
    messages,
    input,
    setInput,
    sendMessage,
    starter,
    loading,
    error,
    isRecording,
    toggleRecording,
  };
}
