import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── Counter hook ── */
const useCounter = (target, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target || target === 0) { setCount(0); return; }
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

/* ── Stat card config ── */
const STAT_CONFIG = [
  {
    icon: 'bi-journal-richtext', label: 'Total Notes', key: 'totalNotes',
    iconBg: '#EDE9FE', iconBgDark: '#1E1B4B', iconColor: '#7C3AED', iconSize: 20,
    trendLabel: v => `+${v}`, trendBg: '#D1FAE5', trendColor: '#065F46',
    orbColor: 'rgba(124,58,237,0.08)', fillColor: '#7C3AED', fillWidth: '60%',
  },
  {
    icon: 'bi-pencil-square', label: 'Edited This Week', key: 'recentlyEdited',
    iconBg: '#E0F2FE', iconBgDark: '#0C1F2C', iconColor: '#0284C7', iconSize: 18,
    trendLabel: () => 'This week', trendBg: '#E0F2FE', trendColor: '#075985',
    orbColor: 'rgba(2,132,199,0.08)', fillColor: '#0284C7', fillWidth: '80%',
  },
  {
    icon: 'bi-stars', label: 'AI Summaries', key: 'totalAiUsage',
    iconBg: '#F3E8FF', iconBgDark: '#2E1065', iconColor: '#9333EA', iconSize: 20,
    trendLabel: () => 'Generated', trendBg: '#F3E8FF', trendColor: '#6B21A8',
    orbColor: 'rgba(147,51,234,0.1)', fillColor: '#9333EA', fillWidth: '45%',
  },
  {
    icon: 'bi-tags-fill', label: 'Unique Tags', key: 'tagCount',
    iconBg: '#D1FAE5', iconBgDark: '#022C22', iconColor: '#059669', iconSize: 18,
    trendLabel: () => 'Unique', trendBg: '#FEF9C3', trendColor: '#713F12',
    orbColor: 'rgba(5,150,105,0.08)', fillColor: '#059669', fillWidth: '30%',
  },
];

function StatCard({ config, value, isDark }) {
  const animatedValue = useCounter(value ?? 0);
  const [barMounted, setBarMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="card-peblo relative overflow-hidden cursor-default group"
      style={{ padding: '20px 22px' }}
    >
      {/* Decorative orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${config.orbColor} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: isDark ? config.iconBgDark : config.iconBg,
          }}
        >
          <i className={`bi ${config.icon}`} style={{ fontSize: config.iconSize, color: config.iconColor }} />
        </div>
        {(value ?? 0) > 0 && (
          <span style={{
            padding: '3px 8px', borderRadius: 20,
            fontSize: 11, fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: config.trendBg, color: config.trendColor,
          }}>
            {config.trendLabel(value)}
          </span>
        )}
      </div>

      {/* Stat number */}
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 40, fontWeight: 700,
        letterSpacing: '-0.035em', lineHeight: 1,
        color: isDark ? '#F5F4F2' : '#1C1C1E',
        marginBottom: 4,
      }}>
        {animatedValue}
      </div>

      {/* Label */}
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13, fontWeight: 500,
        color: isDark ? '#A8A39A' : '#6B7280',
      }}>
        {config.label}
      </div>

      {/* Progress bar */}
      <div style={{
        height: 3, borderRadius: 9999,
        background: isDark ? '#2C2A27' : '#F1F0ED',
        width: '100%', marginTop: 10,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 9999,
          background: config.fillColor,
          width: barMounted ? config.fillWidth : '0%',
          transition: 'width 1s ease-out',
        }} />
      </div>
    </div>
  );
}

const DashboardPage = () => {
  const [insights, setInsights] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagBarsMounted, setTagBarsMounted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [insightsRes, notesRes] = await Promise.all([
          axiosInstance.get('/notes/insights'),
          axiosInstance.get('/notes', { params: { sort: 'updatedAt' } }),
        ]);
        setInsights(insightsRes.data);
        setRecentNotes(notesRes.data.slice(0, 5));
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (insights) {
      const t = setTimeout(() => setTagBarsMounted(true), 200);
      return () => clearTimeout(t);
    }
  }, [insights]);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const topTags = insights?.topTags || [];
  const maxCount = topTags.reduce((m, t) => Math.max(m, t.count), 1);
  const tagCount = topTags.length;
  const isDark = document.body.classList.contains('dark');

  const statValues = {
    totalNotes: insights?.totalNotes,
    recentlyEdited: insights?.recentlyEdited,
    totalAiUsage: insights?.totalAiUsage,
    tagCount,
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: isDark ? '#0C0618' : '#F8F7F4' }}>
      <Navbar />

      <div className="flex-1 overflow-y-auto page-enter">
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 40px' }}>

          {/* HEADER */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5" style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                color: '#7C3AED', letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                <div className="animate-pulse" style={{ width: 4, height: 4, borderRadius: '50%', background: '#7C3AED' }} />
                Dashboard
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 36, fontWeight: 600,
                letterSpacing: '-0.025em', lineHeight: 1.1,
                color: isDark ? 'white' : '#1C1C1E',
                marginBottom: 4,
              }}>
                Welcome back, {firstName}
              </h1>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14, fontWeight: 400,
                color: isDark ? '#6B6860' : '#9CA3AF',
              }}>
                Your productivity at a glance
              </p>
            </div>
            <div
              className="flex items-center gap-2"
              style={{
                background: isDark ? '#1A1917' : 'white',
                border: `1px solid ${isDark ? '#2C2A27' : '#EEECEA'}`,
                borderRadius: 10, padding: '8px 16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <i className="bi bi-calendar3" style={{ color: '#7C3AED', fontSize: 14 }} />
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13, fontWeight: 500,
                color: isDark ? '#9CA3AF' : '#4B5563',
              }}>
                {today}
              </span>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-peblo" style={{ padding: '20px 22px' }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16 }} />
                  <div className="skeleton" style={{ width: 80, height: 40, marginBottom: 4 }} />
                  <div className="skeleton" style={{ width: 100, height: 16 }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{
              background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 14,
            }}>
              <i className="bi bi-exclamation-circle-fill" />
              {error}
            </div>
          )}

          {insights && !loading && (
            <>
              {/* STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {STAT_CONFIG.map(config => (
                  <StatCard
                    key={config.key}
                    config={config}
                    value={statValues[config.key]}
                    isDark={isDark}
                  />
                ))}
              </div>

              {/* TWO COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* TAGS CARD */}
                <div className="card-peblo" style={{ padding: '22px 24px' }}>
                  <div className="flex items-center justify-between mb-5">
                    <span style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 17, fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: isDark ? '#F5F4F2' : '#1C1C1E',
                    }}>
                      Top Tags
                    </span>
                    {topTags.length > 0 && (
                      <span className="flex items-center gap-1" style={{
                        background: isDark ? '#1F1E1B' : '#F5F4F1',
                        border: '1px solid #E5E3DF',
                        color: '#6B7280', fontSize: 11, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20,
                      }}>
                        <i className="bi bi-bar-chart-fill" style={{ fontSize: 10, color: '#7C3AED', marginRight: 2 }} />
                        Top {topTags.length}
                      </span>
                    )}
                  </div>

                  {topTags.length > 0 ? topTags.map((tagItem, i) => (
                    <div
                      key={tagItem.tag || tagItem.name || tagItem._id}
                      className="flex items-center gap-3"
                      style={{
                        padding: '11px 0',
                        borderBottom: i < topTags.length - 1 ? `1px solid ${isDark ? '#1F1E1B' : '#F5F4F1'}` : 'none',
                      }}
                    >
                      <span className="truncate" style={{
                        flexShrink: 0, width: 90,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 13, fontWeight: 600,
                        color: isDark ? '#F5F4F2' : '#1C1C1E',
                      }}>
                        <span style={{ color: isDark ? '#7C3AED' : '#C4B5FD' }}>#</span>
                        {tagItem.tag || tagItem.name || tagItem._id}
                      </span>
                      <div style={{
                        flex: 1, height: 6, borderRadius: 9999,
                        background: isDark ? '#1F1E1B' : '#F1F0ED',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0,
                          height: '100%', borderRadius: 9999,
                          background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                          width: tagBarsMounted ? `${(tagItem.count / maxCount) * 100}%` : '0%',
                          transition: `width 800ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 120}ms`,
                        }} />
                      </div>
                      <span style={{
                        flexShrink: 0,
                        background: isDark ? '#1E1B4B' : '#EDE9FE',
                        color: isDark ? '#A78BFA' : '#7C3AED',
                        border: `1px solid ${isDark ? '#4C1D95' : '#C4B5FD'}`,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 12, fontWeight: 700,
                        padding: '2px 9px', borderRadius: 20,
                      }}>
                        {tagItem.count}
                      </span>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center py-8 text-center">
                      <i className="bi bi-tags" style={{ fontSize: 32, color: '#D1D5DB', marginBottom: 12 }} />
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#9CA3AF' }}>
                        No tags created yet
                      </p>
                      <p style={{ fontSize: 12, color: '#D1D5DB', marginTop: 4 }}>
                        Add tags to your notes to see them here
                      </p>
                    </div>
                  )}
                </div>

                {/* RECENT NOTES */}
                <div className="card-peblo" style={{ padding: '22px 24px' }}>
                  <div className="flex items-center justify-between mb-5">
                    <span style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: 17, fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: isDark ? '#F5F4F2' : '#1C1C1E',
                    }}>
                      Recent Activity
                    </span>
                    <button
                      onClick={() => navigate('/notes')}
                      className="cursor-pointer"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 13, fontWeight: 500,
                        color: '#7C3AED',
                        textDecoration: 'none',
                        background: 'transparent', border: 0, padding: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      View all →
                    </button>
                  </div>

                  {recentNotes.length > 0 ? recentNotes.map((note, i) => (
                    <div
                      key={note._id}
                      onClick={() => navigate('/notes')}
                      className="flex items-center gap-3 cursor-pointer transition-opacity duration-150 hover:opacity-70"
                      style={{
                        padding: '11px 0',
                        borderBottom: i < recentNotes.length - 1 ? `1px solid ${isDark ? '#1F1E1B' : '#F5F4F1'}` : 'none',
                      }}
                    >
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: note.aiSummary
                            ? (isDark ? '#1E1B4B' : '#EDE9FE')
                            : (isDark ? '#1F1E1B' : '#F5F4F1'),
                          border: `1px solid ${note.aiSummary
                            ? (isDark ? '#4C1D95' : '#C4B5FD')
                            : (isDark ? '#2C2A27' : '#EEECEA')}`,
                        }}
                      >
                        <i
                          className={`bi ${note.aiSummary ? 'bi-stars' : 'bi-journal-text'}`}
                          style={{
                            fontSize: 15,
                            color: note.aiSummary ? '#7C3AED' : (isDark ? '#6B6860' : '#9CA3AF'),
                          }}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 14, fontWeight: 600,
                          color: isDark ? '#F5F4F2' : '#1C1C1E',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {note.title || <em style={{ color: '#9CA3AF', fontWeight: 400 }}>Untitled</em>}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {(note.tags || []).length > 0
                            ? (note.tags || []).slice(0, 2).map(t => (
                                <span key={t} className="chip-gray" style={{ fontSize: 11, padding: '1px 7px' }}>{t}</span>
                              ))
                            : <span style={{ fontSize: 11, color: '#9CA3AF' }}>{note.category || 'Other'}</span>
                          }
                        </div>
                      </div>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 12, fontWeight: 400,
                        color: isDark ? '#6B6860' : '#9CA3AF',
                        flexShrink: 0,
                      }}>
                        {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center py-8 text-center">
                      <i className="bi bi-journal-plus" style={{ fontSize: 32, color: '#D1D5DB', marginBottom: 12 }} />
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#9CA3AF' }}>
                        No notes yet
                      </p>
                      <p style={{ fontSize: 12, color: '#D1D5DB', marginTop: 4, marginBottom: 16 }}>
                        Create your first note to see it here
                      </p>
                      <button onClick={() => navigate('/notes')} className="btn-peblo-sm">
                        <i className="bi bi-plus-lg" style={{ fontSize: 12 }} /> Create Note
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA BANNER */}
              <div
                className="card-peblo mt-4 flex items-center justify-between flex-wrap gap-4"
                style={{
                  padding: '18px 24px',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(147,51,234,0.04) 100%)'
                    : 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(147,51,234,0.03) 100%)',
                  borderColor: 'rgba(124,58,237,0.15)',
                }}
              >
                <div>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 15, fontWeight: 600,
                    color: isDark ? 'white' : '#1C1C1E',
                    marginBottom: 4,
                  }}>
                    Ready to keep writing?
                  </p>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13, fontWeight: 400,
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }}>
                    Open the notes workspace and capture your ideas
                  </p>
                </div>
                <button onClick={() => navigate('/notes')} className="btn-peblo flex items-center gap-1.5">
                  Open Notes <i className="bi bi-arrow-right-short" style={{ fontSize: 18 }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
