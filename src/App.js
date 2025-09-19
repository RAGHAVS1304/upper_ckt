import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Centres from './pages/Centres';
import Records from './pages/Records';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { useTranslation } from 'react-i18next';
import VideoConference from './pages/VideoConference';

import Navbar from './pages/navbar';
import './App.css';

function Header(){ 
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  return (
    <header className="header">
      <div style={{display:'flex',alignItems:'center'}}>
        <div className="brand">{t('brand')}</div>
        <div className="header-center">
          <Link to="/" className="pill">{t('home')}</Link>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <select
          className="lang-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
        </select>
        <Navbar/>
      </div>
    </header>
  )
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [followUps, setFollowUps] = useState([]);
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/agent/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input })
      });
      const data = await res.json();

      const botMsg = { 
        from: "bot", 
        text: data.response, 
        intent: data.intent,
        source: (data.intent === "retriever" || data.intent === "policy_query") ? "rag" : "llm"
      };
      setMessages(prev => [...prev, botMsg]);
      setFollowUps(data.follow_ups || []);
    } catch (err) {
      setMessages(prev => [...prev, { from: "bot", text: "Error: Could not reach chatbot.", intent:"error", source:"none" }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/agent/reset_chat/", { method: "POST" });
      const data = await res.json();
      setMessages([{ from: "bot", text: data.status, intent: "status", source: "system" }]);
      setFollowUps([]);
    } catch (err) {
      setMessages([{ from: "bot", text: "Error: Could not reset chat.", intent:"error", source:"system" }]);
    }
  };

  const setSuggestion = (text) => {
    setInput(text);
  };

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      {/* Floating button */}
      <button 
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          borderRadius: "50%",
          width: 60,
          height: 60,
          background: "#007bff",
          color: "white",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          zIndex: 1000
        }}
      >
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          width: 320,
          height: 450,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          zIndex: 1000
        }}>
          <div style={{flex: 1, padding: 10, overflowY: "auto"}}>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  textAlign: msg.from === "user" ? "right" : "left",
                  margin: "5px 0"
                }}
              >
                <span 
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: msg.from === "user" ? "#007bff" : "#eee",
                    color: msg.from === "user" ? "white" : "black"
                  }}
                >
                  {msg.text}
                </span>
                {msg.from === "bot" && msg.intent && (
                  <div style={{ fontSize: "12px", color: "#555", marginTop: 2 }}>
                    Intent: {msg.intent} &nbsp;&nbsp; Source: {msg.source}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Follow-up buttons */}
          {followUps.length > 0 && (
            <div style={{ padding: "5px", borderTop: "1px solid #eee" }}>
              {followUps.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSuggestion(q)}
                  style={{
                    margin: "3px",
                    padding: "5px 8px",
                    fontSize: "12px",
                    border: "1px solid #007bff",
                    borderRadius: 6,
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input + Send + Reset */}
          <div style={{display: "flex", borderTop: "1px solid #ccc"}}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{flex: 1, border: "none", padding: 10}}
              placeholder="Type a message..."
              disabled={loading}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading}
              style={{
                border: "none", 
                background: "#007bff", 
                color: "white", 
                padding: "10px 15px", 
                cursor: "pointer"
              }}
            >
              {loading ? "..." : "Send"}
            </button>
            <button 
              onClick={resetChat}
              style={{
                border: "none", 
                background: "#dc3545", 
                color: "white", 
                padding: "10px 12px", 
                cursor: "pointer"
              }}
            >
              ⟳
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/centres' element={<Centres/>} />
        <Route path='/records' element={<Records/>} />
        <Route path='/signin' element={<SignIn/>} />
        <Route path='/signup' element={<SignUp/>} />
        <Route path='/videoconf' element={<VideoConference/>} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  )
}
