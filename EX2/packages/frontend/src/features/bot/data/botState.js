import { useEffect, useState, useRef } from "react";
import { getConversationStarter, sendMessageToBot, transcribeAudio } from "../logic/botApi.js";
import { useUserStore } from "../../user/data/userStore.js";
import { useGamificationStore } from "../../gamification/data/gamificationStore.js";

export function useBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [starter, setStarter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [voiceEnabled, setVoiceEnabledState] = useState(() => {
    return localStorage.getItem("bot_voice_enabled") === "true";
  });

  const setVoiceEnabled = (val) => {
    setVoiceEnabledState(val);
    localStorage.setItem("bot_voice_enabled", val ? "true" : "false");
  };

  const usedMicForMessage = useRef(false);

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
    const wasMicUsed = usedMicForMessage.current;
    usedMicForMessage.current = false;

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
      const rawContent = response?.content || "הבוט עדיין לא ענה. נסה שוב";
      // Extract the main English response (everything before the first double-newline if errors occurred)
      const botText = response?.evaluation?.hasErrors 
        ? rawContent.split('\n\n')[0] 
        : rawContent;
      
      const botMessage = { 
        role: "bot", 
        text: botText,
        evaluation: response?.evaluation || null
      };
      setMessages((prev) => [...prev, botMessage]);

      if (voiceEnabled || wasMicUsed) {
        if (wasMicUsed && !voiceEnabled) {
          setVoiceEnabled(true);
        }
        speakText(botText);
      }

      // Award gamification points only for a correct sentence (hasErrors === false)
      const currentChildId = useUserStore.getState().user?._id;
      if (currentChildId && response?.evaluation && response.evaluation.hasErrors === false) {
        useGamificationStore.getState().triggerAward(currentChildId, "correct_sentence");

        // Keep track of correct sentences in the current session
        const correctCount = parseInt(sessionStorage.getItem("correct_sentences_count") || "0") + 1;
        sessionStorage.setItem("correct_sentences_count", correctCount.toString());
        if (correctCount === 5) {
          useGamificationStore.getState().triggerAward(currentChildId, "chat_streak_5");
        }
      }
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
                usedMicForMessage.current = true;
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
      usedMicForMessage.current = true;
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

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Filter out the Hebrew Correction part to speak only English
    const englishText = text.split(/\n\n\(Hebrew Correction:/)[0].trim();
    if (!englishText) return;

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(englishText);
      utterance.lang = "en-US";

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const enVoice = voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB") || v.lang.startsWith("en")) || voices[0];
        if (enVoice) {
          utterance.voice = enVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    }, 100);
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
    voiceEnabled,
    setVoiceEnabled,
    speakText,
  };
}
