import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, User, Volume2, VolumeX, Sparkles, Paperclip, X } from 'lucide-react';
import { KronosAppLogo } from '../components/KronosAppLogo';
import { api } from '../utils/api';

export const ChatbotView = ({ toast }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am Kronos AI, your Personal AI Career Assistant. How can I help you optimize your resume, prepare for interview questions, or plan your application strategy today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [speakingBotId, setSpeakingBotId] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();

    // Initialize Web Speech API Speech-to-Text Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        if (toast) toast('🎙️ Listening... Speak your career question now!', 'info');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (toast) toast(`Microphone notice: ${event.error || 'No speech detected'}. You can also type directly.`, 'error');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
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

  // Text-to-Speech (Voice Output / Read Lines Aloud)
  const speakText = (text, id = null) => {
    if (!('speechSynthesis' in window)) {
      if (toast) toast('Text-to-speech voice playback is not supported in this browser.', 'error');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingBotId === id) {
        setSpeakingBotId(null);
        return;
      }
    }

    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setSpeakingBotId(id);
    utterance.onend = () => setSpeakingBotId(null);
    utterance.onerror = () => setSpeakingBotId(null);

    window.speechSynthesis.speak(utterance);
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
    return `That's an interesting point about "${query}". As your Kronos AI Career Assistant, I'm here to support you in every aspect of your professional journey! I recommend keeping your resume tailored to the roles you want, continuously updating your skills, and staying proactive in your outreach. Let me know if you want to dive deeper into interview prep, resume reviews, or salary negotiation!`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = (attachment ? `[Attached: ${attachment.name}] ` : '') + inputText.trim();
    setInputText('');
    setAttachment(null);
    setSending(true);

    const userEntry = { id: Date.now(), sender: 'user', text: userMsg };
    setMessages(prev => [...prev, userEntry]);

    try {
      const res = await api.sendChatbotMessage(userMsg);
      let replyText = '';
      if (res && res.reply) {
        replyText = res.reply;
        setMessages(res.history || [...messages, userEntry, { id: Date.now() + 1, sender: 'bot', text: replyText }]);
      } else {
        replyText = generateLocalBotReply(userMsg);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: replyText }]);
      }

      // Automatically speak bot response aloud
      if (replyText) {
        speakText(replyText, Date.now() + 1);
      }
    } catch (err) {
      console.warn('Backend API chatbot fallback activated:', err);
      const replyText = generateLocalBotReply(userMsg);
      const botId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botId, sender: 'bot', text: replyText }]);
      speakText(replyText, botId);
    } finally {
      setSending(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (toast) toast('Web Speech Recognition API is not supported in this browser. Please use Chrome or Edge.', 'error');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn('Mic stop notice:', err);
      }
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Mic start notice:', err);
        setIsRecording(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <KronosAppLogo size={24} /> AI Career & Interview Chatbot Assistant
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
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--panel)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <KronosAppLogo size={20} />
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
                fontWeight: m.sender === 'user' ? 600 : 400,
                position: 'relative'
              }}
            >
              {m.text}

              {/* Bot Voice Speaker Playback Button */}
              {m.sender === 'bot' && (
                <button
                  type="button"
                  onClick={() => speakText(m.text, m.id)}
                  title={speakingBotId === m.id ? 'Stop voice reading' : 'Listen / Speak aloud'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: speakingBotId === m.id ? '#00f2fe' : 'var(--text-muted)',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    padding: '2px',
                    verticalAlign: 'middle'
                  }}
                >
                  {speakingBotId === m.id ? <VolumeX size={16} className="cyber-glow-pulse" /> : <Volume2 size={16} />}
                </button>
              )}
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
            background: isRecording ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 242, 254, 0.12)',
            border: isRecording ? '1px solid #f87171' : '1px solid rgba(0, 242, 254, 0.3)',
            color: isRecording ? '#f87171' : 'var(--accent-cyan)',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Voice Speech-to-Text Microphone Input"
        >
          {isRecording ? <MicOff size={20} className="cyber-glow-pulse" /> : <Mic size={20} />}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setAttachment(e.target.files[0]);
            }
          }}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: attachment ? 'var(--panel-2)' : 'rgba(0, 242, 254, 0.05)',
            border: attachment ? '1px solid var(--gold)' : '1px solid var(--border-subtle)',
            color: attachment ? 'var(--gold)' : 'var(--text-muted)',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            position: 'relative'
          }}
          title="Attach PDF, Document, or Image"
        >
          <Paperclip size={20} />
          {attachment && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--coral)',
                color: '#fff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={12} />
            </span>
          )}
        </button>

        <input
          type="text"
          className="cyber-input"
          placeholder={isRecording ? 'Listening to your voice...' : attachment ? `Attached: ${attachment.name}. Type message...` : 'Ask career advice, interview questions, or resume tips...'}
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
