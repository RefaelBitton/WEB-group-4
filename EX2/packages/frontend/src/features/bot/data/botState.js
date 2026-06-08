import { useEffect, useState } from "react";
import { getConversationStarter, sendMessageToBot } from "../logic/botApi.js";

export function useBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [starter, setStarter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

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

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
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
      setInput((prev) => prev ? prev + " " + transcript : transcript);
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
