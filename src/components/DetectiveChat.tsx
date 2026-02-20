/**
 * DetectiveChat Component — dark detective theme
 *
 * Messages from the AI detective partner styled to match
 * the dark panel UI.
 */

import * as React from 'react';

export interface ChatMessage {
  id: string;
  type: 'detective' | 'system' | 'success' | 'warning';
  text: string;
  timestamp?: number;
}

interface DetectiveChatProps {
  messages: ChatMessage[];
}

export const DetectiveChat: React.FC<DetectiveChatProps> = ({ messages }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="detective-chat" ref={scrollRef}>
      {messages.map((msg) => (
        <div key={msg.id} className={`chat-message ${msg.type}`}>
          <span style={{ marginRight: 6 }}>{typeIcon(msg.type)}</span>
          <TypewriterText text={msg.text} />
        </div>
      ))}
    </div>
  );
};

// ---- Typewriter sub-component ----

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = React.useState('');
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    setDisplayed('');
    setDone(false);

    if (text.length < 20) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let i = 0;
    const speed = Math.max(8, Math.min(25, 1000 / text.length));
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.substring(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="typewriter-cursor">▌</span>}
    </span>
  );
};

function typeIcon(type: ChatMessage['type']): string {
  switch (type) {
    case 'detective': return '🕵️';
    case 'system': return 'ℹ️';
    case 'success': return '✅';
    case 'warning': return '⚠️';
  }
}
