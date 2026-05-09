import { useState } from 'react';
import { TicketAnalysis } from '../services/ai';
import { ArrowUpRight, Search } from 'lucide-react';
import { TicketChat } from './TicketChat';

import { TicketHeader } from './analysis/TicketHeader';
import { SuggestedResponseBlock } from './analysis/SuggestedResponseBlock';
import { JiraDraftBlock } from './analysis/JiraDraftBlock';
import { KbSuggestionBlock } from './analysis/KbSuggestionBlock';
import { LatestNewsBlock } from './analysis/LatestNewsBlock';
import { KbEditorModal } from './analysis/KbEditorModal';

export function AnalysisResult({ 
  result, 
  rawContent,
  onUpdate,
  priorities,
  classifications,
  onSendEmail
}: { 
  result: TicketAnalysis, 
  rawContent: string,
  onUpdate: (result: TicketAnalysis) => void,
  priorities: string[],
  classifications: string[],
  onSendEmail: (body: string, classification: string) => void
}) {
  const [isKbEditorOpen, setIsKbEditorOpen] = useState(false);
  const [isKbEditorLoading, setIsKbEditorLoading] = useState(false);

  const handleOpenKbEditor = () => {
    setIsKbEditorOpen(true);
    setIsKbEditorLoading(true);
    setTimeout(() => {
      setIsKbEditorLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <TicketHeader 
        result={result} 
        priorities={priorities} 
        classifications={classifications} 
        onUpdate={onUpdate} 
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Main Workflow */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Ticket Chat with Gemini */}
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TicketChat result={result} rawContent={rawContent} />
          </section>

          <SuggestedResponseBlock result={result} onSendEmail={onSendEmail} />

          {/* Escalation Decision */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-gray-900">Escalation Decision</h2>
            </div>
            <div className="p-5 text-gray-700 text-sm">
              {result.escalationDecision}
            </div>
          </section>
        </div>

        {/* Right Column - Engineering & KB */}
        <div className="space-y-6">
          <JiraDraftBlock result={result} />
          <KbSuggestionBlock result={result} onOpenEditor={handleOpenKbEditor} />
          <LatestNewsBlock result={result} rawContent={rawContent} />

          {/* KB Search */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">Search Knowledge Base</h2>
             </div>
             <div className="p-4">
               <div className="relative">
                 <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="Search articles..." 
                   className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                 />
               </div>
             </div>
          </section>
        </div>

      </div>

      <KbEditorModal 
        isOpen={isKbEditorOpen} 
        isLoading={isKbEditorLoading} 
        onClose={() => setIsKbEditorOpen(false)} 
        result={result} 
      />
    </div>
  );
}
