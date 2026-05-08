import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface TicketFormProps {
  onAnalyze: (content: string) => void;
  isLoading: boolean;
}

export function TicketForm({ onAnalyze, isLoading }: TicketFormProps) {
  const [ticketContent, setTicketContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketContent.trim() && !isLoading) {
      onAnalyze(ticketContent);
    }
  };

  const sampleTicket = "Hi support, I'm trying to export my Q3 billing report but every time I click the 'Export CSV' button, the screen goes white and nothing happens. This is extremely urgent as we are closing our books for the quarter in two days and I need this data for our accounting team. I'm on Chrome version 120. Please help ASAP!";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <label htmlFor="ticket-input" className="text-sm font-medium text-gray-700">
          Raw Customer Ticket
        </label>
        <button
          type="button"
          onClick={() => setTicketContent(sampleTicket)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Load Example
        </button>
      </div>
      
      <div className="p-4">
        <textarea
          id="ticket-input"
          value={ticketContent}
          onChange={(e) => setTicketContent(e.target.value)}
          placeholder="Paste the raw email, chat transcript, or web form submission here..."
          className="w-full min-h-[160px] p-4 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y font-sans transition-all bg-gray-50/50"
          disabled={isLoading}
        />
      </div>
      
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <p className="text-xs text-gray-500 max-w-[60%]">
          The Copilot will analyze sentiment, classify the issue, determine priority, and draft responses.
        </p>
        <button
          type="submit"
          disabled={isLoading || !ticketContent.trim()}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            (isLoading || !ticketContent.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700 hover:shadow"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analyze Ticket
            </>
          )}
        </button>
      </div>
    </form>
  );
}
