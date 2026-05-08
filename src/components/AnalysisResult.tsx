import { useState, useEffect } from 'react';
import { TicketAnalysis, fetchLatestNews, NewsArticle } from '../services/ai';
import Markdown from 'react-markdown';
import {
  AlertTriangle,
  Bug,
  CheckCircle,
  Clock,
  MessageSquare,
  BookOpen,
  Tag,
  ArrowUpRight,
  Smile,
  Frown,
  Meh,
  Search,
  X,
  Save,
  Undo2,
  PencilLine,
  Newspaper,
  Loader2,
  Mail
} from 'lucide-react';
import { cn } from '../lib/utils';

import { TicketChat } from './TicketChat';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [editedResponse, setEditedResponse] = useState(result.suggestedResponse);
  const [isCopied, setIsCopied] = useState(false);
  const [isResponseSaved, setIsResponseSaved] = useState(false);

  const [jiraTitle, setJiraTitle] = useState(result.jiraBugDraft?.title || '');
  const [jiraDescription, setJiraDescription] = useState(result.jiraBugDraft?.description || '');
  const [isJiraDraftSaved, setIsJiraDraftSaved] = useState(false);
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  const [isKbEditorOpen, setIsKbEditorOpen] = useState(false);
  const [kbDraftTitle, setKbDraftTitle] = useState(result.kbSuggestion?.title || '');
  const [kbDraftContent, setKbDraftContent] = useState(result.kbSuggestion?.outline || '');

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsStatus, setNewsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setEditedResponse(result.suggestedResponse);
    setIsCopied(false);
    setIsResponseSaved(false);

    setJiraTitle(result.jiraBugDraft?.title || '');
    setJiraDescription(result.jiraBugDraft?.description || '');
    setIsJiraDraftSaved(false);
    setIsFeedbackOpen(false);
    setFeedbackText('');
    setIsFeedbackSubmitted(false);

    setIsKbEditorOpen(false);
    setKbDraftTitle(result.kbSuggestion?.title || '');
    setKbDraftContent(result.kbSuggestion?.outline || '');

    setNewsArticles([]);
    setNewsStatus('idle');
  }, [rawContent, result.suggestedResponse, result.jiraBugDraft, result.kbSuggestion]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedResponse);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleFetchNews = async () => {
    setNewsStatus('loading');
    try {
      const articles = await fetchLatestNews(rawContent, result.classification);
      setNewsArticles(articles);
      setNewsStatus('success');
    } catch (error) {
      console.error(error);
      setNewsStatus('error');
    }
  };

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
        classes: 'bg-red-50 border-red-200 text-red-700' 
      };
    }
    if (s.includes('happ') || s.includes('satisfi') || s.includes('positiv')) {
      return { 
        icon: <Smile className="w-4 h-4" />, 
        bgIcon: <Smile className="w-8 h-8 text-green-500 opacity-20" />,
        label: 'Happy', 
        classes: 'bg-green-50 border-green-200 text-green-700' 
      };
    }
    return { 
      icon: <Meh className="w-4 h-4" />, 
      bgIcon: <Meh className="w-8 h-8 text-yellow-500 opacity-20" />,
      label: 'Neutral', 
      classes: 'bg-yellow-50 border-yellow-200 text-yellow-700' 
    };
  };

  const sentimentDisplay = getSentimentDisplay();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner - Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <span className="text-sm text-gray-500 font-medium">Sentiment</span>
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 w-max border flex items-center gap-1.5', sentimentDisplay.classes)}>
              {sentimentDisplay.icon}
              {sentimentDisplay.label}
            </span>
          </div>
          {sentimentDisplay.bgIcon}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Main Workflow */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Ticket Chat with Gemini */}
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TicketChat result={result} rawContent={rawContent} />
          </section>

          {/* Suggested Response */}
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
          
          {/* Jira Draft */}
          {result.jiraBugDraft && (
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
          )}

          {/* KB Suggestion */}
          {result.kbSuggestion && (
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
                  onClick={() => setIsKbEditorOpen(true)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  Create KB Article
                </button>
              </div>
            </section>
          )}

          {/* Latest News */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-purple-50 border-b border-purple-100 px-4 py-3 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-semibold text-purple-900">Latest News</h2>
            </div>
            
            {newsStatus === 'success' && newsArticles.length > 0 && (
              <div className="p-4 space-y-4">
                {newsArticles.map((article, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-start gap-1 group transition-colors"
                    >
                      {article.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </a>
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{article.summary}</p>
                  </div>
                ))}
              </div>
            )}
            
            {newsStatus === 'success' && newsArticles.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                No recent news articles found for this topic.
              </div>
            )}

            {newsStatus === 'error' && (
              <div className="p-6 text-center text-sm text-red-500 font-medium flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-200" />
                Failed to fetch the latest news.
              </div>
            )}

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
              <button 
                onClick={handleFetchNews}
                disabled={newsStatus === 'loading'}
                className="text-xs font-medium text-purple-700 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newsStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Newspaper className="w-3.5 h-3.5" />
                    Fetch Latest News
                  </>
                )}
              </button>
            </div>
          </section>

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

      {/* KB Article Editor Modal */}
      {isKbEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Create KB Article
              </h2>
              <button onClick={() => setIsKbEditorOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
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
                onClick={() => setIsKbEditorOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsKbEditorOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                Publish Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
