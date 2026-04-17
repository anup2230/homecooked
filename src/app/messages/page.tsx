"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SendHorizonal, Loader2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  orderId: string | null;
  sender: { id: string; name: string | null; image: string | null };
  order?: { id: string; dish: { title: string } } | null;
}

interface Conversation {
  partnerId: string;
  partnerName: string | null;
  partnerImage: string | null;
  lastMessage: Message;
  messages: Message[];
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const msgs: Message[] = data.messages;

      // Group into conversations by partner
      const convMap = new Map<string, Conversation>();
      msgs.forEach(msg => {
        const partnerId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
        const isSenderMe = msg.senderId === user?.id;
        const partnerName = isSenderMe ? null : msg.sender.name;
        const partnerImage = isSenderMe ? null : msg.sender.image;

        const existing = convMap.get(partnerId);
        if (existing) {
          existing.messages.push(msg);
          if (new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
            existing.lastMessage = msg;
          }
          if (!isSenderMe && !msg.readAt) existing.unreadCount++;
        } else {
          convMap.set(partnerId, {
            partnerId,
            partnerName: partnerName ?? 'Unknown',
            partnerImage,
            lastMessage: msg,
            messages: [msg],
            unreadCount: !isSenderMe && !msg.readAt ? 1 : 0,
          });
        }
      });

      // Sort messages within each conversation chronologically
      convMap.forEach(conv => {
        conv.messages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // Sort conversations by last message date
      const sorted = Array.from(convMap.values()).sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );

      setConversations(sorted);
      if (!selectedPartnerId && sorted.length > 0) {
        setSelectedPartnerId(sorted[0].partnerId);
      }
    } catch {
      // Silent — don't toast on background polls
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.id, selectedPartnerId]);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedPartnerId, conversations]);

  const selectedConversation = conversations.find(c => c.partnerId === selectedPartnerId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartnerId || isSending) return;

    setIsSending(true);
    const body = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: selectedPartnerId, body }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      const newMsg: Message = data.message;

      // Optimistically update UI
      setConversations(prev =>
        prev.map(conv => {
          if (conv.partnerId !== selectedPartnerId) return conv;
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: newMsg,
          };
        })
      );

      scrollToBottom();
    } catch {
      toast({ title: 'Failed to send message', variant: 'destructive' });
      setNewMessage(body); // Restore message on failure
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isLoggedIn) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center flex-col gap-4">
        <MessageCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Please log in to view your messages.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <Card className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 overflow-hidden">
        {/* Conversation List */}
        <div className="col-span-1 border-r flex flex-col">
          <CardHeader className="border-b shrink-0">
            <CardTitle className="text-xl">Messages</CardTitle>
          </CardHeader>

          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 p-4 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No messages yet.</p>
              <Button size="sm" asChild variant="outline">
                <Link href="/discover">Find a cook</Link>
              </Button>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {conversations.map(convo => (
                  <button
                    key={convo.partnerId}
                    onClick={() => setSelectedPartnerId(convo.partnerId)}
                    className={cn(
                      'w-full text-left p-3 flex items-start gap-3 rounded-lg transition-colors',
                      selectedPartnerId === convo.partnerId
                        ? 'bg-secondary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <Avatar className="h-11 w-11 border shrink-0">
                      <AvatarImage src={convo.partnerImage ?? undefined} alt={convo.partnerName ?? '?'} />
                      <AvatarFallback>{convo.partnerName?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-sm truncate">{convo.partnerName}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(convo.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.lastMessage.senderId === user?.id && 'You: '}
                        {convo.lastMessage.body}
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Message Thread */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b shrink-0">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage
                    src={selectedConversation.partnerImage ?? undefined}
                    alt={selectedConversation.partnerName ?? '?'}
                  />
                  <AvatarFallback>{selectedConversation.partnerName?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.partnerName}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
                  {selectedConversation.messages.map(message => {
                    const isMe = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex items-end gap-2 max-w-[75%]',
                          isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        )}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage
                            src={isMe ? (user?.image ?? undefined) : (selectedConversation.partnerImage ?? undefined)}
                          />
                          <AvatarFallback>
                            {isMe ? user?.name?.charAt(0) : selectedConversation.partnerName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2 text-sm',
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          )}
                        >
                          {message.order && (
                            <p className={cn('text-xs mb-1 opacity-70')}>
                              Re: {message.order.dish.title}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <CardContent className="pt-3 pb-4 border-t shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                    disabled={isSending}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-5 w-5" />
                    )}
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center flex-col gap-3 text-muted-foreground">
              <MessageCircle className="h-10 w-10" />
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
