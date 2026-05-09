import { useState, useEffect } from 'react';
import { BookOpen, X, Loader2 } from 'lucide-react';
import { TicketAnalysis } from '../../services/ai';

export function KbEditorModal({
  isOpen,
  isLoading,
  onClose,
  result
}: {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  result: TicketAnalysis;
}) {
  const [kbDraftTitle, setKbDraftTitle] = useState(result.kbSuggestion?.title || '');
  const [kbDraftContent, setKbDraftContent] = useState(result.kbSuggestion?.outline || '');

  useEffect(() => {
    if (isOpen) {
      setKbDraftTitle(result.kbSuggestion?.title || '');
      setKbDraftContent(result.kbSuggestion?.outline || '');
    }
  }, [isOpen, result.kbSuggestion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Create KB Article
          </h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
             <p className="text-sm text-gray-500 font-medium tracking-wide animate-pulse">Preparing article draft...</p>
          </div>
        ) : (
          <>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={kbDraftTitle}
                  onChange={(e) => setKbDraftTitle(e.target.value)}
                  className="w-full text-base border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                <textarea
                  value={kbDraftContent}
                  onChange={(e) => setKbDraftContent(e.target.value)}
                  className="w-full min-h-[300px] text-sm text-gray-700 border border-gray-300 rounded-md p-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y font-mono transition-all"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                Publish Article
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
