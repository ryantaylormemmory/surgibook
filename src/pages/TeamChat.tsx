import { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { formatRelativeTime } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import { MessageCircle, ArrowLeft, Send, Users, Stethoscope, UserCircle } from 'lucide-react';

type ChatRoom = 'general' | 'anaesthesia' | 'surgery';

const rooms: { id: ChatRoom; label: string; desc: string; icon: typeof Users }[] = [
  { id: 'general', label: 'General', desc: 'All team communication', icon: Users },
  { id: 'anaesthesia', label: 'Anaesthesia', desc: 'Anaesthesia coordination', icon: Stethoscope },
  { id: 'surgery', label: 'Surgery', desc: 'Surgical team liaison', icon: UserCircle },
];

export default function TeamChat() {
  const [activeRoom, setActiveRoom] = useState<ChatRoom>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser({ name: u.name, role: u.role });
    refreshMessages();
    const interval = setInterval(refreshMessages, 5000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function refreshMessages() {
    setMessages(getChatMessages(activeRoom));
  }

  function handleSend() {
    if (!input.trim() || !user) return;
    sendChatMessage(input.trim(), activeRoom, user.name, user.role);
    setInput('');
    refreshMessages();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const room = rooms.find(r => r.id === activeRoom)!;
  const RoomIcon = room.icon;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden"><ArrowLeft size={18} className="text-gray-600" /></Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MessageCircle size={20} className="text-blue-600" /> Team Chat</h1>
          <p className="text-xs text-gray-500">Transparent communication between anaesthesia and surgical teams</p>
        </div>
      </div>

      {/* Room tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 shrink-0">
        {rooms.map(r => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => setActiveRoom(r.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeRoom === r.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={13} /> {r.label}
            </button>
          );
        })}
      </div>

      {/* Room info */}
      <div className="flex items-center gap-2 mb-3 px-1 shrink-0">
        <RoomIcon size={14} className="text-blue-600" />
        <span className="text-xs font-medium text-gray-700">{room.label}</span>
        <span className="text-[10px] text-gray-400">· {room.desc}</span>
        <span className="text-[10px] text-gray-400 ml-auto">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 bg-white border border-gray-200 rounded-xl p-4 mb-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-blue-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Start the conversation in {room.label}</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isCurrentUser = user?.name === m.senderName;
            const showSender = i === 0 || messages[i - 1].senderName !== m.senderName;
            return (
              <div key={m.id} className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                {showSender && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : m.senderRole === 'anesthesia'
                        ? 'bg-teal-100 text-teal-700'
                        : m.senderRole === 'surgery'
                          ? 'bg-orange-100 text-orange-700'
                          : m.senderRole === 'nursing'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-gray-200 text-gray-600'
                  }`}>
                    {m.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                {!showSender && <div className="w-7 shrink-0" />}
                <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {showSender && (
                    <div className={`flex items-center gap-1.5 mb-0.5 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] font-medium text-gray-600">{m.senderName}</span>
                      <span className="text-[9px] text-gray-400 capitalize">{m.senderRole}</span>
                    </div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    {m.content}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 block">{formatRelativeTime(m.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex gap-2 bg-white border border-gray-200 rounded-xl p-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${room.label.toLowerCase()}...`}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          <Send size={13} /> Send
        </button>
      </div>
    </div>
  );
}
