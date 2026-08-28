import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";

const ChatBubble = ({ from, text }) => (
  <div style={{ marginBottom: 12, display: "flex", justifyContent: from === "user" ? "flex-end" : "flex-start" }}>
    <div
      style={{
        maxWidth: "78%",
        background: from === "user" ? "var(--accent-strong)" : "var(--bg-secondary)",
        color: from === "user" ? "#fff" : "var(--text-primary)",
        padding: "10px 12px",
        borderRadius: 10,
        boxShadow: "0 6px 18px var(--shadow-color)",
      }}
    >
      {text}
    </div>
  </div>
);

const AIChat = () => {
  const location = useLocation();
  const initialContext = location.state?.analysis || null;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // seed system message with short context if available
    if (initialContext) {
      setMessages((m) => [
        ...m,
        { from: "system", text: "Context: " + (initialContext?.forecast?.reasoning ? initialContext.forecast.reasoning.slice(0, -1) : "(analysis available)") },
      ]);
    }
  }, [initialContext]);

  const sendMessage = async (msg) => {
    if (!msg || msg.trim() === "") return;
    const userMsg = msg.trim();
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    setError(null);
    const tryPost = async (url) => {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: initialContext, question: userMsg }),
      });
      return resp;
    };

    try {
      // First try the dev-server relative path (works when Vite proxy is configured)
      let res = await tryPost("/api/ai/chat");

      // If Vite isn't proxying and returned 404, retry the backend directly
      if (res.status === 404) {
        res = await tryPost("http://localhost:7000/api/ai/chat");
      }

      if (!res.ok) {
        // attempt to parse error body, but tolerate empty responses
        let errBody = null;
        try {
          errBody = await res.json();
        } catch (e) {
          // ignore JSON parse errors
        }
        throw new Error(errBody?.error || `AI service returned ${res.status}`);
      }

      // Parse successful response (tolerate empty body)
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = { reply: "(no content)" };
      }

      setMessages((m) => [...m, { from: "assistant", text: data.reply || String(data) }] );
    } catch (err) {
      setError(err.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const { theme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div style={{ background: "var(--bg-secondary)", padding: 18, borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <h4 style={{ color: "var(--text-primary)" }}>AI Co-Pilot Chat</h4>
              <p style={{ color: "var(--text-secondary)" }}>Ask questions about the generated forecast and recommendations.</p>

              <div style={{ maxHeight: 420, overflowY: "auto", padding: 8, marginBottom: 12 }}>
                {messages.map((m, i) => (
                  <ChatBubble key={i} from={m.from === "assistant" ? "assistant" : m.from === "user" ? "user" : "assistant"} text={m.text} />
                ))}
                {loading && <div style={{ color: "var(--text-secondary)" }}>Thinking…</div>}
                {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-control"
                  placeholder="Ask something about this forecast..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button className="btn btn-primary" type="submit" disabled={loading || !input}>
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
