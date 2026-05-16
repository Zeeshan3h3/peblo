import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

const SharedNotePage = () => {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axiosInstance.get(`/notes/shared/${shareId}`);
        setNote(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [shareId]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-peblo-950">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center animate-spin-slow"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' }}
        >
          <i className="bi bi-stars text-white text-xl" />
        </div>
        <p className="text-gray-400 text-sm">Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-6 bg-gray-50 dark:bg-peblo-950">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
          <i className="bi bi-lock text-gray-300 text-3xl" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-200 mt-4">
          Note not found
        </h1>
        <p className="text-gray-400 max-w-xs leading-relaxed mt-2">
          This note may have been made private or the link is incorrect.
        </p>
        <Link to="/signup" className="btn-peblo mt-6">
          <i className="bi bi-pencil-square text-sm" /> Create your own notes
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const plainText = (note.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const actionItems = note.actionItems || note.aiActionItems || [];

  return (
    <div className="bg-gray-50 dark:bg-peblo-950 min-h-screen">

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-peblo-950/80 backdrop-blur-md border-b border-gray-200 dark:border-peblo-900 px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/peblo_logo.png" alt="Peblo Logo" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <span className="font-display text-base font-semibold text-gray-900 dark:text-white tracking-tight">
            Notes
          </span>
        </div>

        <Link to="/signup" className="btn-peblo-sm">
          <i className="bi bi-pencil-square text-xs" /> Start writing free
        </Link>
      </header>

      {/* CONTENT */}
      <main className="max-w-3xl mx-auto px-6 py-16">

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {note.tags.map(tag => (
              <span key={tag} className="chip-peblo">{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-display text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
          {note.title || 'Untitled'}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span className="flex items-center gap-1.5">
            <i className="bi bi-clock text-xs" /> {formattedDate}
          </span>
          <span>·</span>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-800 mb-10" />

        {/* Note content */}
        <div
          className="shared-content text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: note.content || 'No content.' }}
        />

        {/* AI Summary */}
        {note.aiSummary && (
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-peblo-50 to-purple-50 dark:from-peblo-950 dark:to-purple-950 border border-peblo-200 dark:border-peblo-800">
            <div className="flex items-center gap-2 mb-4">
              <i className="bi bi-stars text-peblo-500 text-xl" />
              <span className="text-peblo-600 font-bold text-base">AI Summary</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {note.aiSummary}
            </p>

            {actionItems.length > 0 && (
              <div className="mt-4">
                {actionItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 py-2 ${i < actionItems.length - 1 ? 'border-b border-peblo-100 dark:border-peblo-900' : ''}`}
                  >
                    <i className="bi bi-square text-peblo-400 text-sm flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-10 mt-12 border-t border-gray-200 dark:border-gray-800">
        <p className="text-gray-400 text-sm">
          Made with{' '}
          <span className="text-peblo-600 font-semibold">Peblo Notes</span>
        </p>
        <Link to="/signup" className="btn-peblo mt-4 mx-auto inline-flex">
          Start taking notes for free
        </Link>
      </footer>
    </div>
  );
};

export default SharedNotePage;
