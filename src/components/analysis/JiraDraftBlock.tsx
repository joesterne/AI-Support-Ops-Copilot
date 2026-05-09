import { useState, useEffect, lazy, Suspense } from 'react';
import { TicketAnalysis } from '../../services/ai';
import { Bug, CheckCircle, Undo2, Save, PencilLine, ExternalLink } from 'lucide-react';
const ReactQuill = lazy(() => import('react-quill-new'));
import { cn } from '../../lib/utils';
import 'react-quill-new/dist/quill.snow.css';

export function JiraDraftBlock({ result }: { result: TicketAnalysis }) {
  const [jiraTitle, setJiraTitle] = useState(result.jiraBugDraft?.title || '');
  const [jiraDescription, setJiraDescription] = useState(result.jiraBugDraft?.description || '');
  const [isJiraDraftSaved, setIsJiraDraftSaved] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  useEffect(() => {
    setJiraTitle(result.jiraBugDraft?.title || '');
    setJiraDescription(result.jiraBugDraft?.description || '');
    setIsJiraDraftSaved(false);
    setIsFeedbackOpen(false);
    setFeedbackText('');
    setIsFeedbackSubmitted(false);
  }, [result.jiraBugDraft]);

  if (!result.jiraBugDraft) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-blue-900">Jira Bug Draft</h2>
        </div>
        {!isJiraDraftSaved && (jiraTitle !== result.jiraBugDraft.title || jiraDescription !== result.jiraBugDraft.description) && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-200">
            Unsaved
          </div>
        )}
      </div>
      <div className="p-4 space-y-3 relative">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</div>
          <input
            type="text"
            value={jiraTitle}
            onChange={(e) => { setJiraTitle(e.target.value); setIsJiraDraftSaved(false); }}
            disabled={isJiraDraftSaved}
            className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:text-gray-800"
          />
        </div>
        <div className="react-quill-wrapper pb-8">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</div>
          <Suspense fallback={<div className="h-[150px] bg-gray-50 animate-pulse rounded-md border border-gray-100 flex items-center justify-center text-xs text-gray-400">Loading editor...</div>}>
            <ReactQuill 
              theme="snow"
              value={jiraDescription}
              onChange={(value) => { setJiraDescription(value); setIsJiraDraftSaved(false); }}
              readOnly={isJiraDraftSaved}
              modules={{ toolbar: isJiraDraftSaved ? false : [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link', 'code-block'],
                ['clean']
              ]}}
              className={cn(
                "text-sm font-sans transition-all [&_.ql-editor]:min-h-[150px]",
                isJiraDraftSaved 
                  ? "[&_.ql-container]:border-transparent [&_.ql-editor]:px-0" 
                  : "bg-white [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md focus-within:ring-2 focus-within:ring-blue-500 rounded-md"
              )}
            />
          </Suspense>
        </div>
        {isJiraDraftSaved && (
          <div className="absolute top-4 right-4 flex gap-2 animate-in fade-in duration-200">
            <button 
              onClick={() => setIsJiraDraftSaved(false)} 
              className="bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-blue-600 text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <PencilLine className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {isJiraDraftSaved ? (
              <span className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Draft saved
              </span>
            ) : (jiraTitle !== result.jiraBugDraft.title || jiraDescription !== result.jiraBugDraft.description) ? (
              <span className="text-amber-600 font-medium">
                  Unsaved edits will be lost if not saved.
              </span>
            ) : (
              'You can edit this draft before saving.'
            )}
          </span>
          <div className="flex items-center gap-2">
            {(!isJiraDraftSaved && (jiraTitle !== result.jiraBugDraft.title || jiraDescription !== result.jiraBugDraft.description)) && (
              <button 
                onClick={() => {
                  setJiraTitle(result.jiraBugDraft?.title || '');
                  setJiraDescription(result.jiraBugDraft?.description || '');
                  setIsJiraDraftSaved(false);
                }}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Discard Changes
              </button>
            )}
            {!isJiraDraftSaved && (
              <button 
                onClick={() => setIsJiraDraftSaved(true)}
                className="text-xs font-medium text-white hover:bg-blue-700 bg-blue-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>
            )}
            <a 
              href={`https://jira.example.com/secure/CreateIssue.jspa?issuetype=1&summary=${encodeURIComponent(jiraTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-white hover:bg-blue-700 bg-blue-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Create in Jira
            </a>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">Help improve AI accuracy</span>
            <button
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-md transition-colors"
            >
              Provide Feedback
            </button>
          </div>
          
          {isFeedbackOpen && (
            <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What was good or bad about this draft?"
                className="w-full text-sm border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[70px] resize-y font-sans mb-2"
              />
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setIsFeedbackSubmitted(true);
                    setTimeout(() => { setIsFeedbackOpen(false); setIsFeedbackSubmitted(false); setFeedbackText(''); }, 2000);
                  }}
                  disabled={isFeedbackSubmitted || !feedbackText.trim()}
                  className={cn(
                    "text-xs font-medium text-white px-3 py-1.5 rounded-md transition-colors",
                    isFeedbackSubmitted || !feedbackText.trim() ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {isFeedbackSubmitted ? 'Feedback Submitted!' : 'Submit'}
                </button>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
