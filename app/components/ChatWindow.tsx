'use client';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Send, User, Bot, MapPin, Clock, AlertTriangle, Star, StarOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFavorites } from '../hooks/useFavorites';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  journeyData?: any;
  actions?: string[];
}

interface ChatWindowProps {
  onStationSelect?: (from: string, to: string, mode: string) => void;
  externalQuery?: any;
}

export interface ChatWindowRef {
  // Remove voice-related interface
}

const ChatWindow = forwardRef<ChatWindowRef, ChatWindowProps>(({ 
  onStationSelect, 
  externalQuery
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I can help you with NSW train information. Ask me about schedules, routes, or stations. Try "Next train from Central to Parramatta" or "How do I get to Circular Quay?"'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Remove voice message handler
  useImperativeHandle(ref, () => ({}));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle external queries from StationPicker
  useEffect(() => {
    if (externalQuery && externalQuery.from && externalQuery.to) {
      handleJourneySearch(externalQuery.from, externalQuery.to, externalQuery.mode);
    }
  }, [externalQuery]);

  const formatTime = (isoTime: string) => {
    if (!isoTime) return 'TBA';
    
    try {
      const date = new Date(isoTime);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // Try parsing as date string if ISO parsing fails
        const parsedDate = new Date(isoTime.replace(/-/g, '/'));
        if (isNaN(parsedDate.getTime())) {
          return 'TBA';
        }
        return parsedDate.toLocaleTimeString('en-AU', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      return date.toLocaleTimeString('en-AU', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'TBA';
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return 'TBA';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const addAssistantMessage = (content: string, journeyData?: any, actions?: string[]) => {
    const message = {
      role: 'assistant' as const,
      content,
      journeyData,
      actions
    };
    
    setMessages(prev => [...prev, message]);
    
    // Call onResponse for text-to-speech
    // Removed onResponse prop, so this line is removed.
  };

  const handleJourneySearch = async (from: string, to: string, mode: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, mode })
      });

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const journeyText = data.results.slice(0, 5).map((journey: any, idx: number) => {
          const quickestBadge = journey.isQuickest ? ' ⚡ QUICKEST' : '';
          const changes = journey.changes === 0 ? 'Direct' : `${journey.changes} change${journey.changes > 1 ? 's' : ''}`;
          
          return `${idx + 1}. ${formatTime(journey.departureTime)} → ${formatTime(journey.arrivalTime)}${quickestBadge}
   Duration: ${formatDuration(journey.duration)} | ${changes}
   ${journey.legs[0].line} from Platform ${journey.legs[0].departure.platform}`;
        }).join('\n\n');

        const content = `🚂 Next ${data.results.length} ${mode} services from ${from} to ${to}:\n\n${journeyText}`;

        addAssistantMessage(content, data, ['swap', 'map', 'alert']);
      } else {
        addAssistantMessage('Sorry, I couldn\'t find any journey information for that route. Please check the station names and try again.');
      }
    } catch (error) {
      addAssistantMessage('Sorry, there was an error fetching journey information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageSubmit = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    if (!messageText) {
      setInput('');
    }
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // First, extract intent
      const intentResponse = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage })
      });

      const intent = await intentResponse.json();

      if (intent.needsFollowUp) {
        addAssistantMessage(intent.followUpQuestion || 'Could you please provide more details about your journey?');
        setIsLoading(false);
        return;
      }

      if (intent.from && intent.to) {
        // Sync with StationPicker
        if (onStationSelect) {
          onStationSelect(intent.from, intent.to, intent.mode || 'train');
        }
        
        // Fetch journey data
        await handleJourneySearch(intent.from, intent.to, intent.mode || 'train');
      } else {
        addAssistantMessage('I couldn\'t understand your request. Please specify the departure and arrival stations. For example: "Next train from Central to Chatswood"');
        setIsLoading(false);
      }
    } catch (error) {
      addAssistantMessage('Sorry, I\'m having trouble understanding your request. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleMessageSubmit();
  };

  const handleAction = (action: string, journeyData: any) => {
    switch (action) {
      case 'swap':
        if (onStationSelect && journeyData) {
          onStationSelect(journeyData.to, journeyData.from, journeyData.mode);
        }
        break;
      case 'map':
        // Open map view (could be implemented later)
        addAssistantMessage('Map view is coming soon! For now, you can use the Transport NSW website for maps.');
        break;
      case 'alert':
        // Add to favorites for alerts
        if (journeyData && journeyData.from && journeyData.to) {
          const isCurrentlyFavorite = isFavorite(journeyData.from, journeyData.to, journeyData.mode);
          
          if (isCurrentlyFavorite) {
            const id = `${journeyData.from}-${journeyData.to}-${journeyData.mode}`;
            removeFavorite(id);
            addAssistantMessage(`Removed ${journeyData.from} → ${journeyData.to} from your favorites.`);
          } else {
            addFavorite(journeyData.from, journeyData.to, journeyData.mode);
            addAssistantMessage(`Added ${journeyData.from} → ${journeyData.to} to your favorites! You'll be notified about delays on this route.`);
          }
        }
        break;
    }
  };

  return (
    <Card className="glass-card h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={cn(
                "flex gap-3 animate-fade-up",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "flex-1 space-y-2",
                message.role === 'user' && "text-right"
              )}>
                <p className={cn(
                  "inline-block rounded-lg px-4 py-2 text-sm whitespace-pre-line",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  {message.content}
                </p>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            {message.actions && message.journeyData && (
              <div className={cn(
                "flex gap-2 mt-2 ml-11",
                message.role === 'user' && "justify-end mr-11"
              )}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('swap', message.journeyData)}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Swap
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('map', message.journeyData)}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Map
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('alert', message.journeyData)}
                  className="text-xs"
                >
                  <Star className={cn(
                    "h-3 w-3 mr-1",
                    message.journeyData && isFavorite(
                      message.journeyData.from,
                      message.journeyData.to,
                      message.journeyData.mode
                    ) && "fill-current"
                  )} />
                  {message.journeyData && isFavorite(
                    message.journeyData.from,
                    message.journeyData.to,
                    message.journeyData.mode
                  ) ? "Saved" : "Alert"}
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 animate-fade-up">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block rounded-lg bg-muted px-4 py-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trains, schedules, or stations..."
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
