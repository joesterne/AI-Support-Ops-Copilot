import { useState, useEffect } from 'react';
import { TicketAnalysis } from '../../services/ai';
import { MessageSquare, PencilLine, CheckCircle, Undo2, Save, Mail } from 'lucide-react';

export function SuggestedResponseBlock({
  result,
  onSendEmail
}: {
  result: TicketAnalysis;
  onSendEmail: (body: string, classification: string) => void;
}) {
  const [editedResponse, setEditedResponse] = useState(result.suggestedResponse);
  const [isCopied, setIsCopied] = useState(false);
  const [isResponseSaved, setIsResponseSaved] = useState(false);

  useEffect(() => {
    setEditedResponse(result.suggestedResponse);
    setIsCopied(false);
    setIsResponseSaved(false);
  }, [result.suggestedResponse]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedResponse);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md">
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Suggested Response</h2>
        </div>
        {editedResponse !== result.suggestedResponse && !isResponseSaved && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold animate-in fade-in zoom-in duration-200">
            <PencilLine className="w-3.5 h-3.5" />
            Unsaved Changes
          </div>
        )}
      </div>
      <div className="p-0 border-b border-gray-100 relative flex flex-col">
        <textarea
          value={editedResponse}
          onChange={(e) => {
            setEditedResponse(e.target.value);
            setIsResponseSaved(false);
          }}
          disabled={isResponseSaved}
          className="w-full min-h-[200px] p-5 pb-8 text-sm text-gray-700 bg-white resize-y font-sans border-0 focus:ring-0 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          placeholder="Drafting response..."
        />
        <div className="absolute bottom-2 right-4 text-xs font-medium text-gray-400">
          {editedResponse.length} characters
        </div>
        {isResponseSaved && (
            <div className="absolute top-4 right-4 flex gap-2 animate-in fade-in duration-200">
              <button 
                onClick={() => setIsResponseSaved(false)} 
                className="bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-indigo-600 text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                  <PencilLine className="w-3.5 h-3.5" />
                  Edit
              </button>
            </div>
        )}
      </div>
      <div className="bg-gray-50 px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left">
            {isResponseSaved ? (
            <span className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" /> Response saved
            </span>
          ) : editedResponse !== result.suggestedResponse ? (
            <span className="text-amber-600 font-medium">
                Unsaved edits will be lost if not saved.
            </span>
          ) : (
            'You can edit this response before copying.'
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {editedResponse !== result.suggestedResponse && !isResponseSaved && (
            <button 
              onClick={() => {
                setEditedResponse(result.suggestedResponse);
                setIsResponseSaved(false);
              }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Undo2 className="w-4 h-4" />
              Discard Changes
            </button>
          )}
          {!isResponseSaved && editedResponse !== result.suggestedResponse && (
            <button 
              onClick={() => setIsResponseSaved(true)}
              className="text-sm font-medium text-white hover:bg-emerald-700 bg-emerald-600 px-4 py-2 rounded-lg border border-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          <button 
            onClick={handleCopy}
            className="text-sm font-medium text-white hover:bg-indigo-700 bg-indigo-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              'Copy to Clipboard'
            )}
          </button>
          <button
            onClick={() => onSendEmail(editedResponse, result.classification)}
            className="text-sm font-medium text-white hover:bg-indigo-700 bg-indigo-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>
        </div>
      </div>
    </section>
  );
}
