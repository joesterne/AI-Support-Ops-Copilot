import { useState } from 'react';
import { TicketForm } from './components/TicketForm';
import { AnalysisResult } from './components/AnalysisResult';
import { SettingsMenu } from './components/SettingsMenu';
import { EmailModal } from './components/EmailModal';
import { analyzeTicket, TicketAnalysis } from './services/ai';
import { Bot, Sparkles, History, Menu, X, Settings2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: Date;
  rawContent: string;
  analysis: TicketAnalysis;
}

const getPriorityColors = (priority: string) => {
  const p = priority?.toLowerCase() || '';
  if (p.includes('critical')) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (p.includes('high')) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (p.includes('medium')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (p.includes('low')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TicketAnalysis | null>(null);
  const [currentTicketContent, setCurrentTicketContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const [emailClassification, setEmailClassification] = useState('');

  const [priorities, setPriorities] = useState<string[]>(['Low', 'Medium', 'High', 'Critical']);
  const [classifications, setClassifications] = useState<string[]>([
    'Billing', 'Technical Support', 'Feature Request', 'Bug', 'General Inquiry'
  ]);

  const handleAnalyze = async (content: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const analysis = await analyzeTicket(content, priorities, classifications);
      setResult(analysis);
      setCurrentTicketContent(content);
      setHistory(prev => [{
        id: Date.now().toString(),
        timestamp: new Date(),
        rawContent: content,
        analysis
      }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setResult(item.analysis);
    setCurrentTicketContent(item.rawContent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateResult = (updatedResult: TicketAnalysis) => {
    setResult(updatedResult);
    setHistory(prev => prev.map(item => 
      item.id === history[0]?.id ? { ...item, analysis: updatedResult } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
                AI Support Ops Copilot
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Powered by Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-md transition-colors flex items-center gap-2 shadow-sm"
            >
              <Settings2 className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Settings</span>
            </button>
            <button 
              onClick={() => setIsHistoryMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-md transition-colors flex items-center gap-2 shadow-sm"
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-1 min-w-[20px] text-center">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro */}
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Triage & Analysis
          </h2>
          <p className="mt-2 text-gray-600 leading-relaxed">
            Paste a raw customer ticket below. The Copilot will automatically classify the issue, assess sentiment, determine priority, and draft a response to decrease handling time and improve consistency.
          </p>
        </section>

        {/* Input Form */}
        <section>
          <TicketForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm animate-in fade-in slide-in-from-top-2 shadow-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <section className="pt-4 border-t border-gray-200 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-l-4 border-indigo-500 pl-3">Analysis Results</h3>
            <AnalysisResult 
              result={result} 
              rawContent={currentTicketContent} 
              onUpdate={handleUpdateResult}
              priorities={priorities}
              classifications={classifications}
              onSendEmail={(body, classification) => {
                setEmailBody(body);
                setEmailClassification(classification);
                setIsEmailModalOpen(true);
              }}
            />
          </section>
        )}

        {/* History module logic moved to drawer */}
      </main>

      {/* History Drawer */}
      {isHistoryMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in transition-opacity" onClick={() => setIsHistoryMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                History
              </h2>
              <button 
                onClick={() => setIsHistoryMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map(item => (
                     <div 
                       key={item.id} 
                       className="bg-white border text-left border-gray-200 w-full rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col gap-3" 
                       onClick={() => {
                         handleRestoreHistory(item);
                         setIsHistoryMenuOpen(false);
                       }}
                     >
                       <div className="flex items-center justify-between">
                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getPriorityColors(item.analysis.priority)}`}>
                           {item.analysis.priority}
                         </span>
                         <span className="text-xs font-medium text-gray-500">
                           {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       
                       <div className="flex flex-col gap-1.5 overflow-hidden">
                         <span className="text-sm font-bold text-gray-900">{item.analysis.classification}</span>
                         <span className="text-sm text-gray-600 line-clamp-2 leading-snug">{item.rawContent}</span>
                       </div>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No History Yet</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-[200px]">Submit a ticket to see your past analysis here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SettingsMenu 
        isOpen={isSettingsMenuOpen}
        onClose={() => setIsSettingsMenuOpen(false)}
        priorities={priorities}
        setPriorities={setPriorities}
        classifications={classifications}
        setClassifications={setClassifications}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        defaultBody={emailBody}
        classification={emailClassification}
      />
    </div>
  );
}
