import { useState, useEffect } from 'react';
import { TicketAnalysis } from '../../services/ai';
import { AlertTriangle, Tag, Smile, Frown, Meh, PencilLine, Undo2, Save, CheckCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

type TrafficStatus = {
  label: 'Red' | 'Amber' | 'Green';
  classes: string;
  description: string;
};

export function TicketHeader({
  result,
  priorities,
  classifications,
  onUpdate
}: {
  result: TicketAnalysis;
  priorities: string[];
  classifications: string[];
  onUpdate: (result: TicketAnalysis) => void;
}) {
  const [editedTitle, setEditedTitle] = useState(result.title || 'Untitled Ticket');
  const [isTitleSaved, setIsTitleSaved] = useState(false);

  useEffect(() => {
    setEditedTitle(result.title || 'Untitled Ticket');
    setIsTitleSaved(false);
  }, [result.title]);

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p.includes('critical')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (p.includes('high')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (p.includes('medium')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (p.includes('low')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const pColor = getPriorityColor(result.priority);

  const getSentimentDisplay = () => {
    const s = result.sentiment.toLowerCase();
    if (s.includes('frustrat') || s.includes('angr') || s.includes('upset')) {
      return { 
        icon: <Frown className="w-4 h-4" />, 
        bgIcon: <Frown className="w-8 h-8 text-red-500 opacity-20" />,
        label: 'Frustrated', 
        classes: 'bg-red-50 border-red-200 text-red-700',
        description: 'Customer expresses dissatisfaction or annoyance. Requires empathetic handling.'
      };
    }
    if (s.includes('happ') || s.includes('satisfi') || s.includes('positiv')) {
      return { 
        icon: <Smile className="w-4 h-4" />, 
        bgIcon: <Smile className="w-8 h-8 text-green-500 opacity-20" />,
        label: 'Happy', 
        classes: 'bg-green-50 border-green-200 text-green-700',
        description: 'Customer expresses satisfaction. Opportunity to build loyalty.'
      };
    }
    return { 
      icon: <Meh className="w-4 h-4" />, 
      bgIcon: <Meh className="w-8 h-8 text-yellow-500 opacity-20" />,
      label: 'Neutral', 
      classes: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      description: 'Customer is neutral or transactional. Standard response appropriate.'
    };
  };

  const sentimentDisplay = getSentimentDisplay();

  const getTrafficStatus = (): TrafficStatus => {
    const priority = result.priority.toLowerCase();
    const sentiment = result.sentiment.toLowerCase();
    const escalation = result.escalationDecision.toLowerCase();

    const isRed =
      priority.includes('critical') ||
      sentiment.includes('frustrat') ||
      sentiment.includes('angr') ||
      escalation.includes('escalat');

    if (isRed) {
      return {
        label: 'Red',
        classes: 'bg-rose-50 text-rose-700 border-rose-200',
        description: 'High risk ticket. Immediate action recommended.'
      };
    }

    const isAmber = priority.includes('high') || priority.includes('medium') || sentiment.includes('neutral');

    if (isAmber) {
      return {
        label: 'Amber',
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
        description: 'Moderate risk ticket. Handle soon and monitor.'
      };
    }

    return {
      label: 'Green',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Low risk ticket. Standard response is sufficient.'
    };
  };

  const trafficStatus = getTrafficStatus();

  return (
    <>
      {/* Ticket Title */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
        <div className="flex-1 w-full relative group">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => {
              setEditedTitle(e.target.value);
              setIsTitleSaved(false);
            }}
            disabled={isTitleSaved}
            className="w-full text-xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none px-1 py-1 transition-colors disabled:hover:border-transparent disabled:text-gray-900"
            placeholder="Ticket Title"
          />
          {isTitleSaved && (
             <button 
               onClick={() => setIsTitleSaved(false)} 
               className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-indigo-600 text-xs px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
             >
                <PencilLine className="w-3.5 h-3.5" />
                Edit
             </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {editedTitle !== (result.title || 'Untitled Ticket') && !isTitleSaved && (
            <>
              <button 
                onClick={() => {
                  setEditedTitle(result.title || 'Untitled Ticket');
                  setIsTitleSaved(false);
                }}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Discard
              </button>
              <button 
                onClick={() => setIsTitleSaved(true)}
                className="text-xs font-medium text-white hover:bg-emerald-700 bg-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            </>
          )}
          {isTitleSaved && (
             <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs px-2 py-1.5">
               <CheckCircle className="w-4 h-4" /> Saved
             </span>
          )}
        </div>
      </section>

      {/* Top Banner - Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Traffic Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium">Ticket Status</span>
            <span className={cn('mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border w-max inline-flex items-center gap-1.5', trafficStatus.classes)}>
              <span className={cn('h-2 w-2 rounded-full', trafficStatus.label === 'Red' ? 'bg-rose-500' : trafficStatus.label === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500')} />
              {trafficStatus.label}
            </span>
            <span className="mt-1 text-xs text-gray-500">{trafficStatus.description}</span>
          </div>
          <div className={cn('h-8 w-8 rounded-full border-2', trafficStatus.label === 'Red' ? 'border-rose-300 bg-rose-100' : trafficStatus.label === 'Amber' ? 'border-amber-300 bg-amber-100' : 'border-emerald-300 bg-emerald-100')} />
        </div>

        {/* Priority */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col flex-1 gap-1">
            <span className="text-sm text-gray-500 font-medium">Priority</span>
            <select
              value={result.priority}
              onChange={(e) => onUpdate({ ...result, priority: e.target.value })}
              className={cn('px-2.5 py-1 rounded-full text-xs font-semibold w-max border cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500', pColor)}
            >
              {!priorities.includes(result.priority) && (
                <option value={result.priority}>{result.priority}</option>
              )}
              {priorities.map(p => <option key={p} value={p} className="bg-white text-gray-900">{p}</option>)}
            </select>
          </div>
          <AlertTriangle className={cn('w-8 h-8 opacity-20', pColor.split(' ')[1])} />
        </div>

        {/* Classification */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-sm text-gray-500 font-medium mb-1">Classification</span>
          <div className="flex items-center gap-1.5 w-full">
            <Tag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <select
              value={result.classification}
              onChange={(e) => onUpdate({ ...result, classification: e.target.value })}
              className="flex-1 text-gray-900 font-semibold bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:ring-0 px-0 py-0.5 outline-none cursor-pointer text-sm truncate"
            >
              {!classifications.includes(result.classification) && (
                <option value={result.classification}>{result.classification}</option>
              )}
              {classifications.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
              Sentiment
              <div className="relative group/tooltip flex items-center">
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                <div className="absolute opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-xs bg-gray-900 text-gray-100 p-2 rounded-lg shadow-lg pointer-events-none text-center leading-relaxed">
                  {sentimentDisplay.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            </div>
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 w-max border flex items-center gap-1.5', sentimentDisplay.classes)}>
              {sentimentDisplay.icon}
              {sentimentDisplay.label}
            </span>
          </div>
          {sentimentDisplay.bgIcon}
        </div>
      </div>
    </>
  );
}
