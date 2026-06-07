import { useEffect, useState } from "react";
import { getConversationStarter, sendMessageToBot } from "../logic/botApi.js";

export function useBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [starter, setStarter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessageToBot(input.trim());
      const botText = response?.reply || "הבוט עדיין לא ענה. נסה שוב";
      const botMessage = { role: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
      setInput("");
    } catch (err) {
      setError("שגיאה בשליחת ההודעה. נסה שוב." );
    } finally {
      setLoading(false);
    }
  }

  return {
    messages,
    input,
    setInput,
    sendMessage,
    starter,
    loading,
    error,
  };
}
