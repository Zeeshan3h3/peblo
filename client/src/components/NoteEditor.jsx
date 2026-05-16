import { useState, useEffect, useRef, lazy, Suspense, Component } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';

const ReactQuill = lazy(() =>
  import('react-quill-new').then((mod) => {
    import('react-quill-new/dist/quill.snow.css');
    return mod;
  })
);

class EditorErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-500">
          <strong>Editor failed to load.</strong>
          <pre className="text-xs mt-2 text-gray-400">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TOOLBAR_OPTIONS = [
  [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean'],
];

const MODULES = {
  toolbar: TOOLBAR_OPTIONS,
  history: { delay: 500, maxStack: 100, userOnly: true },
};

const FORMATS = [
  'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'align', 'list', 'bullet', 'indent',
  'blockquote', 'code-block', 'link',
];

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const NoteEditor = ({ note, onUpdateNote, onArchiveNote, allTags = [] }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const titleRef = useRef(null);
  const isDark = document.body.classList.contains('dark');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setCategory(note.category || 'Other');
      setShowAiPanel(true);
    }
  }, [note?._id]);

  useEffect(() => {
    if (!note) return;
    const isSynced = title === (note.title || '') &&
      content === (note.content || '') &&
      category === (note.category || 'Other') &&
      JSON.stringify(tags) === JSON.stringify(note.tags || []);
    if (isSynced) { setIsDirty(false); return; }
    setIsDirty(true);
    setSavedFlash(false);
    const t = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await axiosInstance.patch(`/notes/${note._id}`, { title, content, tags, category });
        onUpdateNote(res.data);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2500);
      } catch (err) { console.error('Error:', err.message); }
      finally { setIsSaving(false); }
    }, 1000);
    return () => clearTimeout(t);
  }, [title, content, tags, category, note]);

  useEffect(() => {
    const h = (e) => { if (isDirty || isSaving) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty, isSaving]);

  useEffect(() => {
    const h = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!note || !isDirty) { toast.success("Note saved!"); return; }
        setIsSaving(true);
        try {
          const res = await axiosInstance.patch(`/notes/${note._id}`, { title, content, tags, category });
          onUpdateNote(res.data);
          setSavedFlash(true);
          setTimeout(() => setSavedFlash(false), 2500);
          toast.success("Note saved!");
        } catch { toast.error("Failed to save note"); }
        finally { setIsSaving(false); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [note, title, content, tags, category, isDirty, onUpdateNote]);

  const handleTitleInput = (e) => {
    setTitle(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const handleGenerateSummary = async () => {
    const plain = stripHtml(content);
    if (!plain) { toast.error('Add some content to summarize'); return; }
    setIsGenerating(true);
    try {
      const toastId = toast.loading('Generating AI Summary...');
      const res = await axiosInstance.post(`/notes/${note._id}/generate-summary`);
      onUpdateNote(res.data);
      setShowAiPanel(true);
      toast.success('AI Summary generated!', { id: toastId });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate summary'); }
    finally { setIsGenerating(false); }
  };

  const handleShare = async () => {
    try {
      const res = await axiosInstance.post(`/notes/${note._id}/share`);
      const shareUrl = `${window.location.origin}/shared/${res.data.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch { toast.error('Failed to generate share link'); }
  };

  const handleCopyContent = async () => {
    await navigator.clipboard.writeText(stripHtml(content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const plain = stripHtml(content).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([plain], { type: 'text/plain' }));
    a.download = `${title || 'note'}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const plainText = stripHtml(content);
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const filteredTagSuggestions = allTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)).slice(0, 10);
  const formattedDate = note ? new Date(note.updatedAt).toLocaleDateString('en-GB', { month: 'long', day: 'numeric' }) : '';

  /* ── Empty state ── */
  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background: isDark ? '#0C0618' : '#FAFAF9' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: isDark ? '#1F1E1B' : '#F5F4F1',
          border: `2px dashed ${isDark ? '#2C2A27' : '#DDD9D3'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bi bi-journal-text" style={{ fontSize: 28, color: isDark ? '#3A3835' : '#C4C2BE' }} />
        </div>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, fontStyle: 'italic', color: isDark ? '#6B6860' : '#9CA3AF' }}>
          Select a note
        </p>
        <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, color: isDark ? '#3A3835' : '#C4C2BE' }}>
          Choose from the list or create a new one
        </p>
        <div style={{
          marginTop: 16, background: isDark ? '#1F1E1B' : '#F5F4F1',
          border: `1px solid ${isDark ? '#2C2A27' : '#E5E3DF'}`,
          borderRadius: 10, padding: '8px 16px',
          fontFamily: "'Plus Jakarta Sans'", fontSize: 12, color: '#9CA3AF',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ background: isDark ? '#2C2A27' : '#EEECEA', border: `1px solid ${isDark ? '#3A3835' : '#DDD9D3'}`, borderRadius: 5, padding: '2px 6px', fontFamily: "'JetBrains Mono'", fontSize: 11, color: '#6B7280' }}>Ctrl</span>
          +
          <span style={{ background: isDark ? '#2C2A27' : '#EEECEA', border: `1px solid ${isDark ? '#3A3835' : '#DDD9D3'}`, borderRadius: 5, padding: '2px 6px', fontFamily: "'JetBrains Mono'", fontSize: 11, color: '#6B7280' }}>N</span>
          to create
        </div>
      </div>
    );
  }

  const btnBase = {
    height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5,
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 500,
    cursor: 'pointer', transition: 'all 150ms ease', border: `1px solid ${isDark ? '#2C2A27' : '#E5E3DF'}`,
    background: isDark ? '#1F1E1B' : '#F5F4F1', color: isDark ? '#9CA3AF' : '#6B7280', padding: '0 12px',
  };

  return (
    <div key={note._id} className="flex flex-col h-full overflow-hidden" style={{ background: isDark ? '#0F0A1E' : 'white', animation: 'editorFade 0.25s ease forwards' }}>

      {/* TOP BAR */}
      <div style={{
        height: 52, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
        borderBottom: `1px solid ${isDark ? '#2C2A27' : '#EEECEA'}`,
        background: isDark ? '#0F0A1E' : 'white',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Plus Jakarta Sans'", fontSize: 12, color: '#9CA3AF' }}>
          {isSaving && <><span className="saving-dot" /><span>Saving...</span></>}
          {savedFlash && !isSaving && !isDirty && <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /><span>All changes saved</span></>}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          <button onClick={handleCopyContent} style={{ ...btnBase, ...(copied ? { background: '#D1FAE5', borderColor: '#6EE7B7', color: '#065F46' } : {}) }}>
            <i className={`bi ${copied ? 'bi-clipboard-check' : 'bi-clipboard'}`} style={{ fontSize: 12 }} /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleExport} style={btnBase}>
            <i className="bi bi-download" style={{ fontSize: 12 }} /> Export
          </button>

          <div style={{ width: 1, height: 20, background: isDark ? '#2C2A27' : '#E5E3DF', margin: '0 3px' }} />

          <button onClick={handleShare} style={{
            height: 32, padding: '0 14px', borderRadius: 8,
            background: isDark ? '#0C1F2C' : '#EFF6FF',
            border: `1px solid ${isDark ? '#1E40AF' : '#BFDBFE'}`,
            color: isDark ? '#60A5FA' : '#2563EB',
            fontFamily: "'Plus Jakarta Sans'", fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 200ms ease',
          }}>
            <i className="bi bi-share" style={{ fontSize: 12 }} /> Share
          </button>

          <button onClick={handleGenerateSummary} disabled={isGenerating} style={{
            height: 32, padding: '0 14px', borderRadius: 8, border: 0,
            background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: 'white',
            fontFamily: "'Plus Jakarta Sans'", fontSize: 12, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', gap: 5, cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.6 : 1, transition: 'all 200ms ease',
          }}>
            {isGenerating ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating...</> : <><i className="bi bi-stars" style={{ fontSize: 12 }} /> AI Summary</>}
          </button>

          <button onClick={() => onArchiveNote(note._id)} className="btn-ghost-danger" style={{ height: 32, padding: '0 10px', fontSize: 13 }}>
            <i className="bi bi-archive" />
          </button>
        </div>
      </div>

      {/* TITLE */}
      <div style={{ padding: '24px 24px 0' }}>
        <textarea
          ref={titleRef} rows={1} placeholder="Untitled"
          value={title} onInput={handleTitleInput} onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden',
            fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700,
            letterSpacing: '-0.025em', lineHeight: 1.2,
            color: isDark ? '#F5F4F2' : '#1C1C1E', caretColor: '#7C3AED',
          }}
        />
      </div>

      {/* META ROW */}
      <div style={{ padding: '10px 24px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="chip-gray" style={{ height: 24, fontSize: 11 }}>
          <i className="bi bi-clock-history" style={{ fontSize: 11, color: '#C4B5FD' }} /> {formattedDate}
        </span>
        {note.aiSuggestedTitle && note.aiSuggestedTitle !== title && (
          <button onClick={() => setTitle(note.aiSuggestedTitle)} className="chip-peblo cursor-pointer" style={{
            height: 24, fontSize: 11, border: 0, transition: 'all 150ms ease',
          }}>
            <i className="bi bi-stars" style={{ fontSize: 11 }} /> Suggested: {note.aiSuggestedTitle.length > 30 ? note.aiSuggestedTitle.slice(0, 30) + '…' : note.aiSuggestedTitle}
          </button>
        )}
      </div>

      {/* TAGS ROW */}
      <div style={{ padding: '8px 24px 0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, minHeight: 34, position: 'relative' }}>
        {tags.map(tag => (
          <span key={tag} className="chip-peblo">
            {tag}
            <button onClick={() => removeTag(tag)} style={{ background: 'transparent', border: 0, padding: 0, marginLeft: 2, lineHeight: 1, color: '#A78BFA', opacity: 0.6, cursor: 'pointer', fontSize: 13 }}>
              <i className="bi bi-x" />
            </button>
          </span>
        ))}
        <div style={{ position: 'relative' }}>
          <input
            type="text" placeholder="Add tag..." value={tagInput}
            onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
            onKeyDown={handleTagAdd}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
            style={{
              background: 'transparent', borderTop: 0, borderLeft: 0, borderRight: 0,
              borderBottom: `1.5px solid ${isDark ? '#2C2A27' : '#E5E3DF'}`,
              padding: '2px 6px', fontFamily: "'Plus Jakarta Sans'", fontSize: 12,
              color: isDark ? '#F5F4F2' : '#1C1C1E', minWidth: 80, outline: 'none',
            }}
            onFocusCapture={e => e.target.style.borderBottomColor = '#7C3AED'}
            onBlurCapture={e => e.target.style.borderBottomColor = isDark ? '#2C2A27' : '#E5E3DF'}
          />
          {showTagSuggestions && filteredTagSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', zIndex: 50, marginTop: 4,
              background: isDark ? '#1A1917' : 'white',
              border: `1px solid ${isDark ? '#2C2A27' : '#EEECEA'}`,
              borderRadius: 10, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', minWidth: 160,
            }}>
              {filteredTagSuggestions.map(tag => (
                <div key={tag} onMouseDown={() => { setTags([...tags, tag]); setTagInput(''); setShowTagSuggestions(false); }}
                  style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 100ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1F1E1B' : '#F5F4F1'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <i className="bi bi-tag" style={{ fontSize: 12, color: '#9CA3AF' }} /> {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDITOR */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <EditorErrorBoundary>
          <Suspense fallback={<div className="p-6 text-gray-400 text-sm flex items-center gap-2"><span className="spinner-dark" /> Loading editor...</div>}>
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={MODULES} formats={FORMATS} placeholder="Start writing your note..." style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} />
          </Suspense>
        </EditorErrorBoundary>
      </div>

      {/* STATS BAR */}
      <div style={{
        flexShrink: 0, height: 36, padding: '0 24px',
        background: isDark ? '#0F0A1E' : '#FAFAF9',
        borderTop: `1px solid ${isDark ? '#1F1E1B' : '#F1F0ED'}`,
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        color: isDark ? '#6B6860' : '#9CA3AF',
      }}>
        <span>{wordCount} words</span>
        <span style={{ color: '#D1D5DB', margin: '0 -4px' }}>·</span>
        <span>{readTime} min read</span>
        <span style={{ color: '#D1D5DB', margin: '0 -4px' }}>·</span>
        <span>{(content || '').replace(/<[^>]*>/g, '').length} chars</span>
        {wordCount > 0 && wordCount < 30 && (
          <>
            <span style={{ color: '#D1D5DB', margin: '0 -4px' }}>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontFamily: "'Plus Jakarta Sans'", fontSize: 11, fontWeight: 500 }}>
              <i className="bi bi-exclamation-triangle" style={{ fontSize: 11 }} /> Add more content for better AI results
            </span>
          </>
        )}
      </div>

      {/* AI SUMMARY PANEL */}
      {note.aiSummary && showAiPanel && (
        <div className="ai-panel" style={{ margin: '0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-stars" style={{ color: '#7C3AED', fontSize: 15 }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>AI Summary</span>
            </div>
            <button onClick={() => setShowAiPanel(false)} style={{ background: 'transparent', border: 0, color: '#9CA3AF', fontSize: 16, cursor: 'pointer', padding: '0 2px' }}>×</button>
          </div>
          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, lineHeight: 1.7, color: isDark ? '#9CA3AF' : '#4B5563', marginBottom: 12 }}>{note.aiSummary}</p>
          {note.aiActionItems?.length > 0 && (
            <>
              <div style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: 8 }}>Action Items</div>
              {note.aiActionItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: i < note.aiActionItems.length - 1 ? '1px solid rgba(196,181,253,0.3)' : 'none' }}>
                  <i className="bi bi-square" style={{ color: '#A78BFA', fontSize: 14, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 13, color: isDark ? '#9CA3AF' : '#4B5563', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
