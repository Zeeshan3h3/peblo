import { useState } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const PREDEFINED_TAGS = ['work', 'personal', 'planning', 'urgent'];
const CATEGORIES = [
  { label: 'All Notes', value: '', icon: 'bi-journal-text' },
  { label: 'Work', value: 'Work', icon: 'bi-briefcase' },
  { label: 'Personal', value: 'Personal', icon: 'bi-house' },
  { label: 'Study', value: 'Study', icon: 'bi-book' },
  { label: 'Other', value: 'Other', icon: 'bi-archive' },
];

const stripHtml = (html = '') => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

function SkeletonCard() {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)' }}>
      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 10, width: '100%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 10, width: '66%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 8, width: '40%' }} />
    </div>
  );
}

const NotesList = ({
  notes, selectedNote, search, activeTag, activeCategory, loading,
  onSelectNote, onCreateNote, onSearchChange, onTagChange, onCategoryChange,
  onTogglePin, onFetchNotes,
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const { isDark } = useTheme();

  const fetchArchivedNotes = async () => {
    try {
      const res = await axiosInstance.get('/notes?archived=true');
      setArchivedNotes(res.data);
    } catch { console.error('Failed to fetch archived notes'); }
  };

  const toggleArchived = () => {
    const next = !showArchived;
    setShowArchived(next);
    if (next) fetchArchivedNotes();
  };

  const handleRestore = async (e, noteId) => {
    e.stopPropagation();
    try {
      await axiosInstance.patch(`/notes/${noteId}/unarchive`);
      setArchivedNotes(p => p.filter(n => n._id !== noteId));
      toast.success('Note restored!');
      if (onFetchNotes) onFetchNotes();
    } catch { toast.error('Failed to restore note'); }
  };

  const handlePin = async (e, note) => {
    e.stopPropagation();
    try {
      const res = await axiosInstance.patch(`/notes/${note._id}/pin`);
      onTogglePin(res.data);
    } catch { toast.error('Failed to pin note'); }
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

  return (
    <div
      className="flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{
        width: 280,
        background: isDark ? '#0F0A1E' : 'white',
        borderRight: `1px solid ${isDark ? '#2C2A27' : '#EEECEA'}`,
      }}
    >
      {/* NEW NOTE BUTTON */}
      <div style={{ padding: '12px 12px 0' }}>
        <button
          onClick={onCreateNote}
          className="flex items-center justify-center gap-1.5 cursor-pointer"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
            color: 'white',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, fontWeight: 600,
            padding: '9px 16px', borderRadius: 10, border: 0,
            boxShadow: '0 2px 12px rgba(124,58,237,0.3)',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9, #7C3AED)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED, #8B5CF6)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 14 }} />
          New Note
        </button>
      </div>

      {/* SEARCH */}
      <div style={{ padding: '10px 12px 0' }}>
        <div style={{ position: 'relative' }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', fontSize: 13, pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: isDark ? '#1A1917' : '#F8F7F4',
              border: `1.5px solid ${isDark ? '#2C2A27' : '#E5E3DF'}`,
              borderRadius: 10,
              padding: '9px 12px 9px 34px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              color: isDark ? '#F5F4F2' : '#1C1C1E',
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#7C3AED';
              e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
            }}
            onBlur={e => {
              e.target.style.borderColor = isDark ? '#2C2A27' : '#E5E3DF';
              e.target.style.boxShadow = 'none';
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 0, padding: 2,
                color: '#9CA3AF', cursor: 'pointer', fontSize: 12, lineHeight: 1,
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      </div>

      {/* TAG CHIPS */}
      <div className="hide-scrollbar" style={{
        display: 'flex', gap: 5, overflowX: 'auto',
        padding: '10px 12px 0',
      }}>
        <button
          onClick={() => onTagChange('')}
          className="cursor-pointer"
          style={{
            padding: '3px 10px', borderRadius: 9999, whiteSpace: 'nowrap',
            fontSize: 11, fontWeight: 500, border: '1px solid',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 150ms ease',
            background: activeTag === '' ? '#7C3AED' : (isDark ? '#1F1E1B' : '#F5F4F1'),
            color: activeTag === '' ? 'white' : (isDark ? '#9CA3AF' : '#6B7280'),
            borderColor: activeTag === '' ? '#7C3AED' : (isDark ? '#2C2A27' : '#EEECEA'),
          }}
        >
          All
        </button>
        {[...new Set([...PREDEFINED_TAGS, ...allTags])].map(tag => (
          <button
            key={tag}
            onClick={() => onTagChange(activeTag === tag ? '' : tag)}
            className="cursor-pointer"
            style={{
              padding: '3px 10px', borderRadius: 9999, whiteSpace: 'nowrap',
              fontSize: 11, fontWeight: 500, border: '1px solid',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 150ms ease',
              background: activeTag === tag ? '#7C3AED' : (isDark ? '#1F1E1B' : '#F5F4F1'),
              color: activeTag === tag ? 'white' : (isDark ? '#9CA3AF' : '#6B7280'),
              borderColor: activeTag === tag ? '#7C3AED' : (isDark ? '#2C2A27' : '#EEECEA'),
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* CATEGORIES */}
      <div style={{ flexShrink: 0, paddingTop: 14, paddingBottom: 4 }}>
        <div style={{
          padding: '0 16px 6px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 10, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#9CA3AF',
        }}>
          Categories
        </div>
        {CATEGORIES.map(cat => {
          const count = cat.value === ''
            ? notes.length
            : notes.filter(n => (n.category || '').toLowerCase() === cat.value.toLowerCase()).length;
          const isActive = activeCategory === cat.value;
          return (
            <div
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className="cursor-pointer"
              style={{
                margin: '1px 8px', padding: '8px 10px',
                borderRadius: 9,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 150ms ease',
                background: isActive
                  ? (isDark ? '#1E1B4B' : '#EDE9FE')
                  : 'transparent',
                color: isActive
                  ? (isDark ? '#A78BFA' : '#7C3AED')
                  : (isDark ? '#9CA3AF' : '#6B7280'),
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = isDark ? '#1F1E1B' : '#F5F4F1';
                  e.currentTarget.style.color = isDark ? '#E5E7EB' : '#374151';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isDark ? '#9CA3AF' : '#6B7280';
                }
              }}
            >
              <i className={`bi ${cat.icon}`} style={{
                fontSize: 14, flexShrink: 0,
                color: isActive ? '#7C3AED' : '#9CA3AF',
              }} />
              <span style={{ flex: 1 }}>{cat.label}</span>
              {count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '1px 7px', borderRadius: 20,
                  background: isActive
                    ? (isDark ? '#2E1065' : '#DDD6FE')
                    : (isDark ? '#1F1E1B' : '#F5F4F1'),
                  color: isActive
                    ? (isDark ? '#A78BFA' : '#5B21B6')
                    : '#9CA3AF',
                }}>
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* COUNT ROW */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px 6px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 11, fontWeight: 500, color: '#9CA3AF',
        borderBottom: `1px solid ${isDark ? '#1F1E1B' : '#F1F0ED'}`,
      }}>
        <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
        {(search || activeTag || activeCategory) && (
          <button
            onClick={() => { onSearchChange(''); onTagChange(''); onCategoryChange(''); }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11, color: '#7C3AED',
              background: 'transparent', border: 0, padding: 0,
              cursor: 'pointer', textDecoration: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* NOTES LIST */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : notes.length === 0 ? (
          (search || activeTag || activeCategory) ? (
            <div className="flex flex-col items-center py-12 px-5 text-center">
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: isDark ? '#1F1E1B' : '#F5F4F1',
                border: `1px solid ${isDark ? '#2C2A27' : '#EEECEA'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <i className="bi bi-search" style={{ fontSize: 24, color: '#D1D5DB' }} />
              </div>
              <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, fontWeight: 600, color: isDark ? '#F5F4F2' : '#1C1C1E', marginBottom: 4 }}>
                No results found
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>Try different keywords or filters</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 px-5 text-center">
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: isDark ? '#1E1B4B' : '#EDE9FE',
                border: `1px solid ${isDark ? '#4C1D95' : '#C4B5FD'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <i className="bi bi-journal-plus" style={{ fontSize: 24, color: '#7C3AED' }} />
              </div>
              <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, fontWeight: 600, color: isDark ? '#F5F4F2' : '#1C1C1E', marginBottom: 4 }}>
                No notes yet
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
                Create your first note and start capturing ideas
              </p>
              <button onClick={onCreateNote} className="btn-peblo-sm">
                <i className="bi bi-plus-lg" style={{ fontSize: 12 }} /> Create Note
              </button>
            </div>
          )
        ) : (
          notes.map(note => {
            const isSelected = selectedNote?._id === note._id;
            const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
            const preview = stripHtml(note.content);

            return (
              <div
                key={note._id}
                className={`note-card ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectNote(note)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="note-title"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13, fontWeight: 600,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      flex: 1, lineHeight: 1.4,
                      color: !note.title ? '#9CA3AF' : undefined,
                      fontStyle: !note.title ? 'italic' : undefined,
                    }}
                  >
                    {note.title || 'Untitled'}
                  </span>
                  <button
                    onClick={e => handlePin(e, note)}
                    className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                    style={{ flexShrink: 0 }}
                  >
                    <i className={`bi ${note.isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}`} style={{ fontSize: 14 }} />
                  </button>
                </div>

                <p style={{
                  marginTop: 6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12, fontWeight: 400, lineHeight: 1.5,
                  color: isDark ? '#6B6860' : '#9CA3AF',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {preview || 'No content'}
                </p>

                <div style={{
                  marginTop: 10, display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {note.isPinned && (
                      <span className="chip-peblo" style={{ fontSize: 10, padding: '2px 8px', height: 'auto' }}>
                        <i className="bi bi-pin-angle-fill" style={{ fontSize: 10 }} /> Pinned
                      </span>
                    )}
                    {(note.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="chip-gray" style={{ fontSize: 10, padding: '2px 8px' }}>{tag}</span>
                    ))}
                  </div>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 11, fontWeight: 400,
                    color: isDark ? '#4A4845' : '#C4C2BE',
                    flexShrink: 0,
                  }}>
                    {formattedDate}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* ARCHIVED SECTION */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          margin: '4px 16px',
        }}>
          <div style={{ flex: 1, height: 1, background: isDark ? '#1F1E1B' : '#F1F0ED' }} />
          <button
            onClick={toggleArchived}
            className="flex items-center gap-1 cursor-pointer"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11, fontWeight: 500,
              color: '#9CA3AF',
              background: 'transparent', border: 0, whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.color = isDark ? '#E5E7EB' : '#374151'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
          >
            <i className="bi bi-archive" style={{ fontSize: 11 }} />
            Archived ({showArchived ? archivedNotes.length : '...'})
          </button>
          <div style={{ flex: 1, height: 1, background: isDark ? '#1F1E1B' : '#F1F0ED' }} />
        </div>

        {showArchived && archivedNotes.map(note => (
          <div
            key={note._id}
            className="note-card group"
            style={{ opacity: 0.6 }}
          >
            <div className="flex items-start justify-between gap-2">
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13, fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1, color: isDark ? '#6B6860' : '#9CA3AF',
              }}>
                {note.title || 'Untitled'}
              </span>
              <button
                onClick={e => handleRestore(e, note._id)}
                className="btn-success opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                <i className="bi bi-arrow-counterclockwise" style={{ fontSize: 11 }} /> Restore
              </button>
            </div>
            <p style={{
              marginTop: 4, fontSize: 12, color: '#9CA3AF',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {stripHtml(note.content) || 'No content'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
