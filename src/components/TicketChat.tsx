import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { TicketAnalysis, chatAboutTicket, ChatMessage } from '../services/ai';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

export function TicketChat({ result, rawContent }: { result: TicketAnalysis, rawContent: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAboutTicket(rawContent, result, messages, userMessage);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I ran into an error while trying to process your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 px-5 py-4 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gemini Copilot</h2>
          <p className="text-xs text-gray-500">Ask for feedback, draft variations, or get advice on this ticket.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10 text-sm">
            <Bot className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p>How can I help you handle this ticket?</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-white border border-gray-100 text-gray-800 rounded-tl-none markdown-body prose prose-sm max-w-none"
            )}>
              {msg.role === 'user' ? msg.content : <Markdown>{msg.content}</Markdown>}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-xs text-gray-400">Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="E.g. Make the response more formal, or summarize the issue..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
