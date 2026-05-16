import { useState, useEffect } from 'react';

const KeyboardShortcuts = ({ onCreateNote, onForceSave, onGenerateSummary }) => {
  const [showModal, setShowModal] = useState(false);

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
  }, [onCreateNote, onForceSave, onGenerateSummary]);

  if (!showModal) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={() => setShowModal(false)}
    >
      <div 
        style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '32px',
          minWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          color: '#1E1E2E'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Keyboard Shortcuts ⌨️</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#1E1E2E', color: 'white', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>Ctrl + N</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Create new note</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#1E1E2E', color: 'white', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>Ctrl + S</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Force save current note</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#1E1E2E', color: 'white', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>Ctrl + /</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Generate AI summary</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#1E1E2E', color: 'white', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>?</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Show this help menu</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ background: '#1E1E2E', color: 'white', padding: '4px 10px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>Escape</span>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Close this menu</span>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(false)}
          style={{
            backgroundColor: '#4F46E5', color: 'white', width: '100%',
            padding: '12px', borderRadius: '8px', marginTop: '24px',
            fontWeight: 600
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
