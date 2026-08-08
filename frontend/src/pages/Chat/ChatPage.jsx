import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import MessageBubble from '../../components/Chat/MessageBubble';
import { FiSend, FiPaperclip, FiAlertCircle, FiMessageSquare, FiSearch, FiX } from 'react-icons/fi';
import ReportModal from '../../components/modals/ReportModal';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = API_URL.replace('/api', '');

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user: currentUser, accessToken: token } = useAuthStore();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');

  // Keep ref in sync with activeChat state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Socket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, { auth: { token } });

    newSocket.on('new_message', (message) => {
      // Use ref to get the latest activeChat value
      const currentActiveChat = activeChatRef.current;

      // Update messages if this is the active chat
      if (currentActiveChat && message.conversation_id === currentActiveChat.id) {
        setMessages((prev) => {
          // Avoid duplicates (we already add our own sent messages optimistically)
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Always update the conversation list's last message
      setConversations(prev => prev.map(c =>
        c.id === message.conversation_id
          ? { ...c, messages: [message] }
          : c
      ));
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [token]);

  // Fetch conversations + handle initialUserId
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/chat/conversations');
        let convList = res.data || [];
        setConversations(convList);

        // If a userId is provided in the URL, create or get that conversation
        if (initialUserId) {
          try {
            const createRes = await axiosInstance.post('/chat/conversations',
              { recipientId: initialUserId }
            );
            const newConv = createRes.data;
            if (newConv && newConv.id) {
              setActiveChat(newConv);
              setShowMobileSidebar(false);
              // Add to list if not already there
              if (!convList.some(c => c.id === newConv.id)) {
                setConversations(prev => [newConv, ...prev]);
              }
            }
          } catch (err) {
            console.error("Failed to create/get conversation for userId:", initialUserId, err);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [initialUserId]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/chat/conversations/${activeChat.id}/messages`);
        setMessages(res.data || []);

        // Mark as read
        await axiosInstance.patch(`/chat/conversations/${activeChat.id}/read`, {});
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();
  }, [activeChat?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !file) || !activeChat || sendingMessage) return;

    const recipientId = activeChat.participant_one_id === currentUser?.id
      ? activeChat.participant_two_id
      : activeChat.participant_one_id;

    const formData = new FormData();
    formData.append('recipientId', recipientId);
    if (inputText.trim()) formData.append('content', inputText);
    if (file) formData.append('attachment', file);

    const savedText = inputText;
    setInputText('');
    setFile(null);
    setSendingMessage(true);

    try {
      const res = await axiosInstance.post('/chat/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });

      // Update conversation last message
      setConversations(prev => prev.map(c =>
        c.id === activeChat.id
          ? { ...c, messages: [res.data], updated_at: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      console.error("Failed to send message", err);
      setInputText(savedText); // Restore text on error
    } finally {
      setSendingMessage(false);
    }
  };

  const getParticipantName = useCallback((conv) => {
    if (!currentUser || !conv) return "Unknown";
    const other = conv.participant_one_id === currentUser.id ? conv.participant_two : conv.participant_one;
    if (!other) return "Unknown";
    if (other.store_profile) return other.store_profile.store_name;
    if (other.professional_profile) return other.professional_profile.full_name;
    if (other.client_profile) return other.client_profile.full_name;
    return other.email;
  }, [currentUser]);

  const getParticipantAvatar = useCallback((conv) => {
    if (!currentUser || !conv) return null;
    const other = conv.participant_one_id === currentUser.id ? conv.participant_two : conv.participant_one;
    if (!other) return null;
    if (other.store_profile?.logo_url) return other.store_profile.logo_url;
    if (other.professional_profile?.avatar_url) return other.professional_profile.avatar_url;
    if (other.client_profile?.avatar_url) return other.client_profile.avatar_url;
    return null;
  }, [currentUser]);

  const getParticipantRole = useCallback((conv) => {
    if (!currentUser || !conv) return "";
    const other = conv.participant_one_id === currentUser.id ? conv.participant_two : conv.participant_one;
    if (!other) return "";
    if (other.role === 'store') return 'Magasin';
    if (other.role === 'professional') return 'Professionnel';
    if (other.role === 'customer') return 'Client';
    return '';
  }, [currentUser]);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const name = getParticipantName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const handleSelectChat = (conv) => {
    setActiveChat(conv);
    setShowMobileSidebar(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 relative z-10 pb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        <div className="flex h-full">

          {/* ═══ Sidebar ═══ */}
          <div className={`${showMobileSidebar ? 'block' : 'hidden'} md:block w-full md:w-[340px] lg:w-[380px] border-r border-gray-100 flex-shrink-0 flex flex-col bg-white`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiMessageSquare className="text-blue-600" size={20} />
                Messages
              </h2>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <FiMessageSquare className="text-gray-300 mb-3" size={40} />
                  <p className="text-gray-400 text-sm">
                    {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation pour le moment'}
                  </p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const name = getParticipantName(conv);
                  const avatar = getParticipantAvatar(conv);
                  const role = getParticipantRole(conv);
                  const isActive = activeChat?.id === conv.id;
                  const lastMsg = conv.messages?.[0];

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectChat(conv)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 border-l-4 ${
                        isActive
                          ? 'bg-blue-50/80 border-blue-500'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(name)
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                            {name}
                          </span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                            {lastMsg ? new Date(lastMsg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {lastMsg?.message_type === 'text'
                              ? lastMsg.content
                              : (lastMsg ? '📎 Pièce jointe' : 'Commencez la conversation...')}
                          </p>
                          {role && (
                            <span className="text-[9px] font-semibold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                              {role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ═══ Main Chat Area ═══ */}
          <div className={`${!showMobileSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-gray-50/50`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="h-16 px-4 md:px-6 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Back button on mobile */}
                    <button
                      onClick={() => setShowMobileSidebar(true)}
                      className="md:hidden text-gray-400 hover:text-gray-600 p-1"
                    >
                      ←
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {getParticipantAvatar(activeChat) ? (
                        <img src={getParticipantAvatar(activeChat)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(getParticipantName(activeChat))
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{getParticipantName(activeChat)}</h3>
                      <span className="text-[10px] text-gray-400">{getParticipantRole(activeChat)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 text-xs font-medium transition-all px-3 py-1.5 rounded-lg"
                  >
                    <FiAlertCircle size={14} /> Signaler
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <FiMessageSquare className="text-blue-400" size={28} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-1">Aucun message pour le moment</p>
                      <p className="text-gray-400 text-xs">Envoyez le premier message pour commencer la discussion !</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender_id === currentUser?.id}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 md:px-6 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                  {file && (
                    <div className="mb-2 flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg">
                      <span className="truncate">📎 {file.name}</span>
                      <button onClick={() => setFile(null)} className="hover:text-red-500 flex-shrink-0">
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50"
                    >
                      <FiPaperclip size={18} />
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </button>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Écrire un message..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={(!inputText.trim() && !file) || sendingMessage}
                      className="bg-blue-600 text-white rounded-xl p-2.5 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      <FiSend size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-5">
                  <FiMessageSquare className="text-blue-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Vos messages</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Sélectionnez une conversation dans la liste ou contactez un professionnel ou magasin pour commencer à discuter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isReportModalOpen && activeChat && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetId={activeChat.participant_one_id === currentUser?.id ? activeChat.participant_two_id : activeChat.participant_one_id}
          targetType="user"
          conversationId={activeChat.id}
        />
      )}
    </div>
  );
};

export default ChatPage;
