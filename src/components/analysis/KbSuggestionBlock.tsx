import { TicketAnalysis } from '../../services/ai';
import { BookOpen } from 'lucide-react';

export function KbSuggestionBlock({
  result,
  onOpenEditor
}: {
  result: TicketAnalysis;
  onOpenEditor: () => void;
}) {
  if (!result.kbSuggestion) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-semibold text-emerald-900">KB Suggestion</h2>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Article Title</div>
          <div className="text-sm font-medium text-gray-900">{result.kbSuggestion.title}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Outline</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {result.kbSuggestion.outline}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
        <button 
          onClick={onOpenEditor}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors"
        >
          Create KB Article
        </button>
      </div>
    </section>
  );
}
