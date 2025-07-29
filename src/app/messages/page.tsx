'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Match {
  id: string;
  helper_id: string;
  household_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  helper_profile: {
    id: string;
    user_id: string;
    user: User;
  };
  household_profile: {
    id: string;
    user_id: string;
    user: User;
  };
}

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function Messages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('You must be logged in to view this page');
        }
        
        setUserId(user.id);
        
        // Fetch user's matches
        const { data: helperMatches, error: helperError } = await supabase
          .from('matches')
          .select(`
            *,
            helper_profile:helper_profiles(id, user_id, user:profiles(*)),
            household_profile:household_profiles(id, user_id, user:profiles(*))
          `)
          .eq('status', 'accepted')
          .or(`helper_profile.user_id.eq.${user.id},household_profile.user_id.eq.${user.id}`);
        
        if (!helperError && helperMatches && helperMatches.length > 0) {
          setMatches(helperMatches);
          
          // Check if a match ID is specified in the URL
          const matchId = searchParams.get('match');
          if (matchId) {
            const match = helperMatches.find(m => m.id === matchId);
            if (match) {
              setActiveMatch(match);
              fetchMessages(match.id);
            } else {
              // If match ID is invalid, use the first match
              setActiveMatch(helperMatches[0]);
              fetchMessages(helperMatches[0].id);
            }
          } else {
            // If no match ID is specified, use the first match
            setActiveMatch(helperMatches[0]);
            fetchMessages(helperMatches[0].id);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `match_id=eq.${searchParams.get('match') || ''}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [supabase, searchParams, router]);
  
  const fetchMessages = async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setMessages(data);
        
        // Mark messages as read
        if (userId) {
          const unreadMessages = data.filter(
            message => message.sender_id !== userId && !message.read
          );
          
          if (unreadMessages.length > 0) {
            const unreadIds = unreadMessages.map(msg => msg.id);
            
            await supabase
              .from('messages')
              .update({ read: true })
              .in('id', unreadIds);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeMatch || !userId) return;
    
    try {
      setSendingMessage(true);
      
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            match_id: activeMatch.id,
            sender_id: userId,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            read: false
          }
        ]);
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const selectMatch = (match: Match) => {
    setActiveMatch(match);
    fetchMessages(match.id);
    
    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('match', match.id);
    window.history.pushState({}, '', url);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading messages...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (matches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Messages</h1>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="card p-6 text-center">
          <p className="text-gray-500">You don't have any matches to message yet.</p>
          <p className="mt-2">Start browsing to find your perfect match!</p>
          <button 
            onClick={() => router.push('/browse')} 
            className="btn-primary mt-4"
          >
            Browse Now
          </button>
        </div>
      </div>
    );
  }

  // Determine the other user in the active match
  const otherUser = userId && activeMatch ? 
    (activeMatch.helper_profile.user_id === userId ? 
      activeMatch.household_profile.user : 
      activeMatch.helper_profile.user) : 
    null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Matches Sidebar */}
        <div className="md:col-span-1 card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Your Matches</h2>
          </div>
          
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {matches.map(match => {
              const matchUser = match.helper_profile.user_id === userId ? 
                match.household_profile.user : 
                match.helper_profile.user;
              
              return (
                <div 
                  key={match.id} 
                  onClick={() => selectMatch(match)}
                  className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeMatch?.id === match.id ? 'bg-primary-50' : ''
                  }`}
                >
                  {matchUser.avatar_url ? (
                    <Image 
                      src={matchUser.avatar_url} 
                      alt={matchUser.full_name} 
                      width={40} 
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {matchUser.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{matchUser.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(match.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="md:col-span-3 card flex flex-col h-[600px]">
          {/* Chat Header */}
          {activeMatch && otherUser && (
            <div className="p-4 border-b flex items-center space-x-3">
              {otherUser.avatar_url ? (
                <Image 
                  src={otherUser.avatar_url} 
                  alt={otherUser.full_name} 
                  width={40} 
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {otherUser.full_name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-medium">{otherUser.full_name}</div>
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet</p>
                <p className="text-sm mt-2">Send a message to start the conversation</p>
              </div>
            ) : (
              messages.map(message => {
                const isOwnMessage = message.sender_id === userId;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${isOwnMessage ? 
                        'bg-primary-500 text-white' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      <div>{message.content}</div>
                      <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
                disabled={sendingMessage}
              />
              <button 
                type="submit" 
                className="btn-primary px-4"
                disabled={!newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}