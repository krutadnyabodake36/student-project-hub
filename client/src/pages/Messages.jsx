import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { messageAPI } from '../utils/api';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await messageAPI.getMessages(otherUserId);
      setCurrentConversation(response.data.data.conversation);
      setMessages(response.data.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !userId) return;

    setSending(true);
    try {
      const response = await messageAPI.sendMessage(userId, newMessage.trim());
      setMessages([...messages, response.data.data]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-3xl shadow-2xl overflow-hidden border-2 border-white/20" style={{ height: '80vh' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-white/20 overflow-y-auto glass-dark">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </h2>
              </div>

              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-white/80 mb-2 font-bold">No conversations yet</p>
                  <p className="text-sm text-white/60">
                    Start a conversation by visiting a user's profile
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const unreadCount = conversation.unreadCount?.get?.(user._id) || 0;

                    return (
                      <div
                        key={conversation._id}
                        onClick={() => navigate(`/messages/${otherUser._id}`)}
                        className={`p-4 hover:bg-white/10 cursor-pointer transition ${userId === otherUser._id ? 'bg-white/20' : ''
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          {otherUser.profilePicture ? (
                            <img
                              src={otherUser.profilePicture.startsWith('http')
                                ? otherUser.profilePicture
                                : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${otherUser.profilePicture}`}
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-pink-600 flex items-center justify-center text-white font-black shadow-lg">
                              {otherUser.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-white truncate">
                                {otherUser.name}
                              </h3>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-white/60">
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-white/70 truncate">
                                {conversation.lastMessage?.content || 'Start a conversation'}
                              </p>
                              {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {userId && currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/20 glass-dark flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {currentConversation.participants
                        .filter(p => p._id !== user._id)
                        .map(otherUser => (
                          <div key={otherUser._id} className="flex items-center space-x-3">
                            {otherUser.profilePicture ? (
                              <img
                                src={otherUser.profilePicture.startsWith('http')
                                  ? otherUser.profilePicture
                                  : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${otherUser.profilePicture}`}
                                alt={otherUser.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-pink-600 flex items-center justify-center text-white font-black">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-white">{otherUser.name}</h3>
                              <p className="text-xs text-white/60">
                                {otherUser.lastActive && `Active ${formatTime(otherUser.lastActive)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => navigate(`/user/${userId}`)}
                      className="text-sm text-yellow-300 hover:text-yellow-200 font-bold transition-colors"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white/70 font-medium">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.sender._id === user._id;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${isOwn
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                  : 'glass text-white'
                                }`}
                            >
                              <p className="break-words font-medium">{message.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-white/80' : 'text-white/60'}`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 glass-dark">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-5 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="relative px-6 py-3 text-sm font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl disabled:opacity-50 transform hover:scale-105 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                        <span className="relative">{sending ? 'Sending...' : 'Send'}</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-24 w-24 text-white/50 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="text-lg font-black text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-white/70">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
