import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const words = ["Organised.", "Intelligent.", "Beautiful.", "Alive."];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setWordIndex(i => (i + 1) % words.length);
        setExiting(false);
      }, 380);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const getAnimStyle = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
  });

  return (
    <div className="bg-[#0C0618] min-h-screen font-sans text-white selection:bg-purple-500/30">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[64px] px-[clamp(24px,5vw,80px)] border-b border-[#7C3AED]/15 backdrop-blur-xl bg-[#0C0618]/85">
        <div className="flex items-center gap-3">
          <img src="/peblo_logo.png" alt="Peblo Logo" className="h-[36px] w-auto object-contain shrink-0" />
          <span className="font-sans text-[18px] font-bold text-white tracking-[-0.02em]">Peblo Notes</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="text-white/65 border border-white/10 bg-transparent px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-150"
          >
            Sign in
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white px-5 py-2 rounded-xl text-sm font-semibold border-0 shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Start free
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[140px] pb-[100px] relative overflow-hidden bg-[#0C0618]">
        {/* Background Layers */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(124,58,237,0.18) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] left-[-150px] w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(88,28,220,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,125,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundSize: '64px 64px', backgroundImage: 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)' }} />

        <div className="relative z-10 flex flex-col items-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/25 px-4 py-1.5 rounded-full mb-8" style={getAnimStyle(100)}>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-sans text-[12px] font-semibold text-[#C4B5FD] tracking-[0.07em] uppercase">Built for Peblo — India's AI Learning Universe</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(44px,7vw,80px)] font-bold text-white leading-[1.05] tracking-[-0.03em] mb-4">
            <div style={getAnimStyle(250)}>Think clearly.</div>
            <div 
              className="bg-clip-text text-transparent animate-[gradient-shift_4s_ease_infinite]" 
              style={{ ...getAnimStyle(400), background: 'linear-gradient(135deg, #A78BFA 0%, #C084FC 50%, #A78BFA 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Write brilliantly.
            </div>
          </h1>

          {/* Subtitle */}
          <div className="font-sans text-[clamp(16px,2.5vw,22px)] font-light text-white/40 mt-1 mb-10" style={getAnimStyle(550)}>
            Your notes —
            <span 
              className="text-[#A78BFA] font-medium inline-block ml-2"
              style={{
                opacity: exiting ? 0 : 1,
                transform: exiting ? 'translateY(-10px)' : 'translateY(0)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              {words[wordIndex]}
            </span>
          </div>

          {/* CTA Row */}
          <div className="flex gap-3 justify-center flex-wrap" style={getAnimStyle(700)}>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white px-8 py-3.5 rounded-2xl font-sans text-[16px] font-bold border-0 shadow-[0_4px_24px_rgba(124,58,237,0.4)] inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(124,58,237,0.5)] transition-all duration-200"
            >
              Start writing free <i className="bi bi-arrow-right-short text-xl" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white/5 border border-white/10 text-white/65 px-7 py-3.5 rounded-2xl font-medium text-base hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              Sign in
            </button>
          </div>

          {/* Trust Row */}
          <div className="flex items-center justify-center gap-6 flex-wrap mt-[52px]" style={getAnimStyle(850)}>
            <div className="inline-flex items-center gap-2 font-sans text-[13px] font-medium text-white/30">
              <i className="bi bi-shield-check text-[#7C3AED]" /> Free to use
            </div>
            <div className="w-px h-[14px] bg-white/10" />
            <div className="inline-flex items-center gap-2 font-sans text-[13px] font-medium text-white/30">
              <i className="bi bi-stars text-[#7C3AED]" /> Powered by Claude AI
            </div>
            <div className="w-px h-[14px] bg-white/10" />
            <div className="inline-flex items-center gap-2 font-sans text-[13px] font-medium text-white/30">
              <i className="bi bi-lock-fill text-[#7C3AED]" /> Private by default
            </div>
          </div>

          {/* App Preview Hint */}
          <div className="mt-[72px] w-full max-w-[780px] bg-white/5 border border-[#7C3AED]/20 rounded-[20px] p-5 pb-6 px-6 backdrop-blur-[20px]" style={getAnimStyle(1000)}>
            <div className="flex gap-[5px] mb-3">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <div className="flex text-left">
              <div className="w-1/3 border-r border-[#7C3AED]/15 flex flex-col gap-1 pr-4">
                <div className="h-12 flex items-center gap-3 px-3 bg-[#7C3AED]/15 border-l-2 border-[#7C3AED] rounded-r-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] shrink-0" />
                  <div className="flex flex-col gap-1 w-full">
                    <div className="h-2 w-20 bg-white/10 rounded-full" />
                    <div className="h-1.5 w-14 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="h-12 flex items-center gap-3 px-3 border-l-2 border-transparent">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] shrink-0 opacity-40" />
                  <div className="flex flex-col gap-1 w-full">
                    <div className="h-2 w-16 bg-white/5 rounded-full" />
                    <div className="h-1.5 w-12 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="h-12 flex items-center gap-3 px-3 border-l-2 border-transparent">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] shrink-0 opacity-40" />
                  <div className="flex flex-col gap-1 w-full">
                    <div className="h-2 w-24 bg-white/5 rounded-full" />
                    <div className="h-1.5 w-16 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex-1 pl-5 flex flex-col relative">
                <div className="h-3 w-2/3 bg-white/10 rounded-full mb-4" />
                <div className="h-2 w-full bg-white/5 rounded-full mb-2" />
                <div className="h-2 w-5/6 bg-white/5 rounded-full mb-2" />
                <div className="h-2 w-4/5 bg-white/5 rounded-full mb-3" />
                
                <div className="absolute bottom-[-10px] right-0 bg-[#7C3AED]/20 text-purple-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <i className="bi bi-stars text-xs" /> AI Summary ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-[#0C0618] px-6 py-[100px] max-w-[1160px] mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold tracking-[0.12em] uppercase text-[#A78BFA] mb-4">Features</div>
          <h2 className="font-display text-[clamp(32px,5vw,52px)] font-bold text-white tracking-[-0.02em] mb-5">Everything a thinker needs</h2>
          <p className="font-sans text-[16px] leading-[1.75] text-white/40 max-w-[480px] mx-auto">
            Peblo Notes is built around meaningful AI — not AI as a gimmick. Every feature exists because real writers, thinkers, and learners need it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="group relative bg-white/5 border border-[#7C3AED]/10 rounded-[20px] p-7 transition-all duration-250 overflow-hidden hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A855F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-xl mb-5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <i className="bi bi-stars text-xl text-[#A78BFA]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-[-0.01em]">Meaningful AI</h3>
            <p className="font-sans text-sm leading-[1.65] text-white/40">
              Generate summaries, extract action items, and get title suggestions — AI that actually helps you think, not just generates text.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="group relative bg-white/5 border border-[#7C3AED]/10 rounded-[20px] p-7 transition-all duration-250 overflow-hidden hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A855F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-xl mb-5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <i className="bi bi-journal-richtext text-xl text-[#A78BFA]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-[-0.01em]">Rich text editor</h3>
            <p className="font-sans text-sm leading-[1.65] text-white/40">
              Bold, italic, code blocks, headings, quotes — a full writing experience with toolbar controls and keyboard shortcuts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white/5 border border-[#7C3AED]/10 rounded-[20px] p-7 transition-all duration-250 overflow-hidden hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A855F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-xl mb-5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <i className="bi bi-cloud-check text-xl text-[#A78BFA]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-[-0.01em]">Auto-save</h3>
            <p className="font-sans text-sm leading-[1.65] text-white/40">
              Every change saved silently in the background. Your ideas are safe the moment you write them.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative bg-white/5 border border-[#7C3AED]/10 rounded-[20px] p-7 transition-all duration-250 overflow-hidden hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A855F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-xl mb-5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <i className="bi bi-share text-xl text-[#A78BFA]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-[-0.01em]">Public sharing</h3>
            <p className="font-sans text-sm leading-[1.65] text-white/40">
              Share any note with a unique link. Clean public view with no login required — perfect for sharing ideas instantly.
            </p>
          </div>

          {/* Card 5 */}
          <div className="group relative bg-white/5 border border-[#7C3AED]/10 rounded-[20px] p-7 transition-all duration-250 overflow-hidden hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A855F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-xl mb-5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <i className="bi bi-tags text-xl text-[#A78BFA]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-[-0.01em]">Tags & categories</h3>
            <p className="font-sans text-sm leading-[1.65] text-white/40">
              Organise notes the way your brain works. Filter by tag, browse by category, and find anything in seconds.
            </p>
          </div>

          {/* Card 6 */}
          <div className="group relative bg-white/5 border border-[#7C3AED]/10 rounded-[20px] p-7 transition-all duration-250 overflow-hidden hover:bg-[#7C3AED]/10 hover:border-[#7C3AED]/30 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A855F7]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-11 h-11 rounded-xl mb-5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <i className="bi bi-bar-chart-line text-xl text-[#A78BFA]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-[-0.01em]">Productivity insights</h3>
            <p className="font-sans text-sm leading-[1.65] text-white/40">
              See your writing habits at a glance — notes written, tags used, AI summaries generated, and weekly activity.
            </p>
          </div>
        </div>
      </section>

      {/* PEBLO TRIBUTE SECTION */}
      <section className="bg-[#7C3AED]/5 border-y border-[#7C3AED]/10 py-[80px] px-6 text-center">
        <div className="max-w-[720px] mx-auto">
          <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#7C3AED]/60 mb-6">A note about this project</div>
          <h2 className="font-display italic font-light text-[clamp(24px,3.5vw,36px)] text-white/85 mb-6 leading-[1.4]">
            Built for Peblo's Full Stack Challenge
          </h2>
          
          <div className="font-sans text-[15px] leading-[1.8] text-white/40 max-w-[580px] mx-auto text-left space-y-4">
            <p>
              Peblo is building India's AI-powered learning universe for children — animated stories, games, quizzes, news, and a personal AI buddy, all in one place. Backed by the Eleven Group, they're creating something genuinely new for Indian kids.
            </p>
            <p>
              This notes app was built as part of their Full Stack Developer challenge. The brief asked for meaningful AI integration — not AI as a gimmick. Every feature in this app reflects that principle.
            </p>
            <p>
              From auto-save to rich text editing, from public sharing to AI summaries with action items — this is a full-stack, production-ready workspace built with care.
            </p>
          </div>

          <div className="flex justify-center gap-12 mt-10 flex-wrap">
            <div className="text-center">
              <div className="font-display text-[36px] font-bold text-white mb-1">13+</div>
              <div className="font-sans text-[12px] text-white/35 font-medium uppercase tracking-[0.06em]">Features Built</div>
            </div>
            <div className="text-center">
              <div className="font-display text-[36px] font-bold text-white mb-1">6</div>
              <div className="font-sans text-[12px] text-white/35 font-medium uppercase tracking-[0.06em]">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="font-display text-[36px] font-bold text-white mb-1">1</div>
              <div className="font-sans text-[12px] text-white/35 font-medium uppercase tracking-[0.06em]">AI Provider</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-[80px] px-6 max-w-[1160px] mx-auto">
        <div className="bg-gradient-to-br from-[#7C3AED]/20 via-[#581CDC]/15 to-[#7C3AED]/10 border border-[#7C3AED]/25 rounded-[28px] py-[64px] px-[48px] text-center relative overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full bg-[#A855F7]/10 -top-12 -right-12 blur-3xl pointer-events-none" />
          <div className="absolute w-48 h-48 rounded-full bg-[#7C3AED]/10 -bottom-8 -left-8 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-display text-[clamp(30px,4vw,48px)] font-bold text-white tracking-[-0.02em] mb-3">
              Start thinking clearly today.
            </h2>
            <p className="font-sans text-[16px] text-white/45 mb-8">
              No credit card. No setup. Just write.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-white text-[#7C3AED] px-10 py-4 rounded-2xl border-0 font-sans text-[16px] font-extrabold shadow-[0_4px_32px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-200 inline-flex items-center gap-2"
            >
              Get started — it's free <i className="bi bi-arrow-right-short text-2xl" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black/20 border-t border-[#7C3AED]/10 py-8 px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/peblo_logo.png" alt="Peblo Logo" className="h-[28px] w-auto object-contain shrink-0" />
          <span className="font-sans text-[15px] font-bold text-white tracking-[-0.02em]">Peblo Notes</span>
        </div>
        <div className="font-sans text-[13px] text-white/20">
          Built with care for Peblo's challenge · 2026
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
