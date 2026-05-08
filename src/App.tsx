import { useState } from 'react';
import { TicketForm } from './components/TicketForm';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeTicket, TicketAnalysis } from './services/ai';
import { Bot, Sparkles, History } from 'lucide-react';

interface HistoryItem {
  id: string;
  timestamp: Date;
  rawContent: string;
  analysis: TicketAnalysis;
}

const getPriorityColors = (priority: string) => {
  const colors: Record<string, string> = {
    Low: 'bg-blue-100 text-blue-800 border-blue-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TicketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleAnalyze = async (content: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const analysis = await analyzeTicket(content);
      setResult(analysis);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <AnalysisResult result={result} />
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-500" />
              Analysis History
            </h3>
            <div className="space-y-3">
              {history.map(item => (
                 <div 
                   key={item.id} 
                   className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4" 
                   onClick={() => handleRestoreHistory(item)}
                 >
                   <div className="flex flex-col gap-1.5 overflow-hidden">
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-semibold text-gray-900">{item.analysis.classification}</span>
                       <span className="text-xs text-gray-400">&bull;</span>
                       <span className="text-xs text-gray-500">
                         {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                     <span className="text-sm text-gray-600 truncate">{item.rawContent}</span>
                   </div>
                   <div className="flex items-center sm:shrink-0">
                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColors(item.analysis.priority)}`}>
                       {item.analysis.priority}
                     </span>
                   </div>
                 </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
