import { useState } from 'react';
import { Settings2, X, Plus, Trash2 } from 'lucide-react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  priorities: string[];
  setPriorities: (v: string[]) => void;
  classifications: string[];
  setClassifications: (v: string[]) => void;
}

export function SettingsMenu({ isOpen, onClose, priorities, setPriorities, classifications, setClassifications }: SettingsMenuProps) {
  const [newPriority, setNewPriority] = useState('');
  const [newClassification, setNewClassification] = useState('');

  if (!isOpen) return null;

  const handleAddPriority = () => {
    if (newPriority.trim() && !priorities.includes(newPriority.trim())) {
      setPriorities([...priorities, newPriority.trim()]);
      setNewPriority('');
    }
  };

  const handleRemovePriority = (p: string) => {
    setPriorities(priorities.filter(item => item !== p));
  };

  const handleAddClassification = () => {
    if (newClassification.trim() && !classifications.includes(newClassification.trim())) {
      setClassifications([...classifications, newClassification.trim()]);
      setNewClassification('');
    }
  };

  const handleRemoveClassification = (c: string) => {
    setClassifications(classifications.filter(item => item !== c));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Allowed Priorities</h3>
            <div className="space-y-2 mb-3">
              {priorities.map(p => (
                <div key={p} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700">{p}</span>
                  <button onClick={() => handleRemovePriority(p)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                placeholder="New priority..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
              />
              <button 
                onClick={handleAddPriority}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Allowed Classifications</h3>
            <div className="space-y-2 mb-3">
              {classifications.map(c => (
                <div key={c} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700">{c}</span>
                  <button onClick={() => handleRemoveClassification(c)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newClassification}
                onChange={(e) => setNewClassification(e.target.value)}
                placeholder="New classification..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddClassification()}
              />
              <button 
                onClick={handleAddClassification}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
