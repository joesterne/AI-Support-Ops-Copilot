import { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBody: string;
  classification: string;
}

export function EmailModal({ isOpen, onClose, defaultBody, classification }: EmailModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject(`Re: Ticket - ${classification}`);
      setBody(defaultBody);
      setTo('');
      setIsSent(false);
    }
  }, [isOpen, defaultBody, classification]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Send Email Response
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Sent Successfully</h3>
            <p className="text-gray-500">The response has been sent to the customer.</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col h-full">
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Body</label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm resize-y font-sans"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
