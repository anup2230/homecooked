
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockUsers } from '@/lib/data';
import type { Conversation, Message, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SendHorizonal } from 'lucide-react';

// Mocking the logged-in user ID. In a real app, this would come from an auth context.
const LOGGED_IN_USER_ID = 'user-3'; // Nonna Isabella

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: LOGGED_IN_USER_ID,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedConversation: Conversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
    };

    setSelectedConversation(updatedConversation);
    setConversations(
      conversations.map(c => (c.id === updatedConversation.id ? updatedConversation : c))
    );
    setNewMessage('');
  };
  
  const getOtherParticipant = (convo: Conversation): User | undefined => {
      return convo.participants.find(p => p.id !== LOGGED_IN_USER_ID);
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-8rem)]">
      <Card className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {/* Conversation List */}
        <div className="col-span-1 border-r">
          <CardHeader>
            <CardTitle className="text-2xl">Inbox</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-6rem)]">
            <div className="space-y-1 p-2">
              {conversations.map(convo => {
                 const otherUser = getOtherParticipant(convo);
                 const lastMessage = convo.messages[convo.messages.length - 1];

                 if (!otherUser) return null;

                 return (
                    <button
                        key={convo.id}
                        onClick={() => setSelectedConversation(convo)}
                        className={cn(
                        'w-full text-left p-3 flex items-start gap-3 rounded-lg transition-colors',
                        selectedConversation?.id === convo.id ? 'bg-secondary' : 'hover:bg-muted/50'
                        )}
                    >
                        <Avatar className="h-12 w-12 border">
                        <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                        <p className="font-semibold">{otherUser.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.senderId === LOGGED_IN_USER_ID && "You: "}
                            {lastMessage.text}
                        </p>
                        </div>
                        <span className="text-xs text-muted-foreground">{lastMessage.timestamp}</span>
                    </button>
                 )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                     <AvatarImage src={getOtherParticipant(selectedConversation)?.avatarUrl} alt={getOtherParticipant(selectedConversation)?.name} />
                    <AvatarFallback>{getOtherParticipant(selectedConversation)?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{getOtherParticipant(selectedConversation)?.name}</h2>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
                  {selectedConversation.messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex items-end gap-2 max-w-lg',
                        message.senderId === LOGGED_IN_USER_ID ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={mockUsers.find(u => u.id === message.senderId)?.avatarUrl} />
                        <AvatarFallback>{mockUsers.find(u => u.id === message.senderId)?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'p-3 rounded-lg text-sm',
                           message.senderId === LOGGED_IN_USER_ID ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}
                      >
                        <p>{message.text}</p>
                         <p className={cn("text-xs mt-1",  message.senderId === LOGGED_IN_USER_ID ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <CardContent className="pt-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <SendHorizonal className="h-5 w-5" />
                    <span className="sr-only">Send Message</span>
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
