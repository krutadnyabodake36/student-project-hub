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
      fetchConversations(); // Refresh conversations list
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '80vh' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              </div>

              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No conversations yet</p>
                  <p className="text-sm text-gray-400">
                    Start a conversation by visiting a user's profile
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const unreadCount = conversation.unreadCount?.get?.(user._id) || 0;

                    return (
                      <div
                        key={conversation._id}
                        onClick={() => navigate(`/messages/${otherUser._id}`)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                          userId === otherUser._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {otherUser.profilePicture ? (
                            <img
                              src={otherUser.profilePicture.startsWith('http')
                                ? otherUser.profilePicture
                                : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${otherUser.profilePicture}`}
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                              {otherUser.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {otherUser.name}
                              </h3>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage?.content || 'Start a conversation'}
                              </p>
                              {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary-500 text-white rounded-full">
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
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {currentConversation.participants
                        .filter(p => p._id !== user._id)
                        .map(otherUser => (
                          <div key={otherUser._id} className="flex items-center space-x-3">
                            {otherUser.profilePicture ? (
                              <img
                                src={otherUser.profilePicture.startsWith('http')
                                  ? otherUser.profilePicture
                                  : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${otherUser.profilePicture}`}
                                alt={otherUser.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
                              <p className="text-xs text-gray-500">
                                {otherUser.lastActive && `Active ${formatTime(otherUser.lastActive)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => navigate(`/user/${userId}`)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
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
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
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
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-24 w-24 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
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
