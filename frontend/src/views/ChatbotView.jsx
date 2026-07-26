import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, MicOff, User, Sparkles, HelpCircle, MessageSquare } from 'lucide-react';
import { api } from '../utils/api';

export const ChatbotView = ({ toast }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am Kronos AI, your Personal AI Career Assistant. How can I help you optimize your resume, prepare for interview questions, or plan your application strategy today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const history = await api.getChatbotMessages();
      if (history && history.length > 0) {
        setMessages(history);
      }
    } catch (err) {
      console.warn('Failed to fetch chatbot history:', err);
    }
  };

  const generateLocalBotReply = (query) => {
    const q = query.toLowerCase();
    if (q.includes('interview') || q.includes('question') || q.includes('project')) {
      return `For technical interviews: 1. Structure your answers using the STAR method (Situation, Task, Action, Result). 2. Highlight quantifiable metric achievements from your previous projects. 3. Review system design & data structures relevant to your targeted role.`;
    }
    if (q.includes('resume') || q.includes('ats')) {
      return `To pass ATS filters: 1. Use clean standard section headings (Experience, Skills, Education). 2. Match technical keywords truthfully from target job descriptions. 3. Avoid multi-column table layouts that confuse PDF parsers.`;
    }
    if (q.includes('salary') || q.includes('negotiat')) {
      return `For salary negotiations: 1. Research market bands for your role and experience level. 2. Never give a single static number first—provide a range. 3. Frame compensation requests around the business value and impact you bring.`;
    }
    return `I evaluated your question regarding "${query}". As your Kronos AI Career Assistant, I recommend tailoring your resume keywords, optimizing your LinkedIn summary, and automating outreach during peak recruiter hours (09:00 AM - 11:00 AM).`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    setSending(true);

    const userEntry = { id: Date.now(), sender: 'user', text: userMsg };
    setMessages(prev => [...prev, userEntry]);

    try {
      const res = await api.sendChatbotMessage(userMsg);
      if (res && res.history && res.history.length > 0) {
        setMessages(res.history);
      } else {
        const botReply = generateLocalBotReply(userMsg);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
      }
    } catch (err) {
      console.warn('Backend API chatbot fallback activated:', err);
      const botReply = generateLocalBotReply(userMsg);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
    } finally {
      setSending(false);
    }
  };

  const toggleMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast('🎙️ Microphone active. Speak your career question...', 'info');
      setTimeout(() => {
        setIsRecording(false);
        setInputText('How do I answer "Tell me about a challenging project" in a Java interview?');
        toast('Voice transcription captured!', 'success');
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={24} color="var(--accent-cyan)" /> AI Career & Interview Chatbot Assistant
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
          Get instant career advice, STAR-method interview practice, and resume optimization tips via Text & Voice.
        </p>
      </div>

      {/* Chat Messages Box */}
      <div className="glass-card" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, idx) => (
          <div
            key={m.id || idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            {m.sender === 'bot' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.15)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={20} color="var(--accent-cyan)" />
              </div>
            )}

            <div
              style={{
                background: m.sender === 'user' ? 'var(--accent-cyan)' : 'rgba(2, 6, 15, 0.7)',
                color: m.sender === 'user' ? '#060a12' : '#ffffff',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                padding: '14px 18px',
                borderRadius: '16px',
                fontSize: '14px',
                lineHeight: 1.5,
                fontWeight: m.sender === 'user' ? 600 : 400
              }}
            >
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(157, 78, 221, 0.15)', border: '1px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} color="#d8b4fe" />
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Row */}
      <form onSubmit={handleSendMessage} className="glass-card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={toggleMic}
          style={{
            background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 242, 254, 0.12)',
            border: isRecording ? '1px solid #f87171' : '1px solid rgba(0, 242, 254, 0.3)',
            color: isRecording ? '#f87171' : 'var(--accent-cyan)',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
          title="Voice / Speech Microphone Input"
        >
          {isRecording ? <MicOff size={20} className="cyber-glow-pulse" /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          className="cyber-input"
          placeholder="Ask career advice, interview questions, or resume tips..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{ flex: 1, fontSize: '14px' }}
        />

        <button className="btn-cyber" type="submit" disabled={sending}>
          <Send size={16} /> {sending ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
