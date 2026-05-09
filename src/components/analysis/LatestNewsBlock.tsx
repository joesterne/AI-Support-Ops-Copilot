import { useState, useEffect } from 'react';
import { TicketAnalysis, fetchLatestNews, NewsArticle } from '../../services/ai';
import { Newspaper, ArrowUpRight, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

function ArticleItem({ article }: { article: NewsArticle }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <a 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-start gap-1 group transition-colors"
      >
        <span>{article.title}</span>
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </a>
      
      {!showPreview ? (
        <div className="mt-1.5">
          <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
          <button 
            onClick={() => setShowPreview(true)}
            className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 mt-1 flex items-center gap-0.5 transition-colors"
          >
            Show Preview <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-2 animate-in fade-in duration-200">
          <p className="text-sm text-gray-700 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 leading-relaxed font-medium">
            {article.summary}
          </p>
          <button 
            onClick={() => setShowPreview(false)}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 mt-2 flex items-center gap-0.5 transition-colors"
          >
            Hide Preview <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function LatestNewsBlock({
  result,
  rawContent
}: {
  result: TicketAnalysis;
  rawContent: string;
}) {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsStatus, setNewsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setNewsArticles([]);
    setNewsStatus('idle');
  }, [result, rawContent]);

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

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-purple-50 border-b border-purple-100 px-4 py-3 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-purple-600" />
        <h2 className="text-base font-semibold text-purple-900">Latest News</h2>
      </div>
      
      {newsStatus === 'success' && newsArticles.length > 0 && (
        <div className="p-4 space-y-4">
          {newsArticles.map((article, idx) => (
            <ArticleItem key={idx} article={article} />
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
  );
}
