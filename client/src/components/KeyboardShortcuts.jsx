import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const KeyboardShortcuts = ({ onCreateNote, onGenerateSummary }) => {
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        onCreateNote();
      } else if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        onGenerateSummary();
      } else if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setShowModal(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCreateNote, onGenerateSummary]);

  if (!showModal) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'N'], desc: 'Create new note' },
    { keys: ['Ctrl', 'S'], desc: 'Force save current note' },
    { keys: ['Ctrl', '/'], desc: 'Generate AI summary' },
    { keys: ['?'], desc: 'Show this help menu' },
    { keys: ['Esc'], desc: 'Close this menu' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={() => setShowModal(false)}
    >
      <div 
        className={`w-full max-w-md p-8 rounded-3xl shadow-peblo-lg animate-fade-up border ${
          isDark 
            ? 'bg-peblo-950/90 border-peblo-800/30 text-white' 
            : 'bg-white/90 border-peblo-100 text-peblo-900'
        } backdrop-blur-md`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-peblo-500 text-white shadow-peblo">
            <i className="bi bi-keyboard-fill text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold leading-none mb-1">Shortcuts</h2>
            <p className={`text-sm ${isDark ? 'text-peblo-300' : 'text-peblo-600'}`}>Master your productivity</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {shortcuts.map((s, idx) => (
            <div 
              key={idx}
              className={`flex justify-between items-center p-3 rounded-xl transition-all duration-300 ${
                isDark ? 'hover:bg-peblo-900/50' : 'hover:bg-peblo-50'
              }`}
            >
              <span className={`text-sm font-medium ${isDark ? 'text-peblo-100' : 'text-peblo-800'}`}>
                {s.desc}
              </span>
              <div className="flex gap-1.5">
                {s.keys.map((key, kIdx) => (
                  <kbd 
                    key={kIdx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm border ${
                      isDark 
                        ? 'bg-peblo-900 border-peblo-700 text-peblo-300' 
                        : 'bg-peblo-50 border-peblo-200 text-peblo-600'
                    }`}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setShowModal(false)}
          className="w-full mt-8 py-3.5 rounded-2xl bg-peblo-600 hover:bg-peblo-700 text-white font-bold transition-all duration-300 shadow-peblo hover:shadow-peblo-lg transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Got it, let's write!
        </button>

        <p className={`text-center mt-4 text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-peblo-500' : 'text-peblo-300'}`}>
          Peblo Notes v1.0 • Built with AI
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

