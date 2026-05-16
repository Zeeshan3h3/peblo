import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Logo = ({ height = 36 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <img src="/peblo_logo.png" alt="Peblo Logo" style={{ height, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }} className="text-gray-900 dark:text-white">
      Notes
    </span>
  </div>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-1.5 rounded-[10px] text-sm transition-all duration-150 no-underline ${
      isActive
        ? 'bg-[#EDE9FE] dark:bg-[#2E1065] text-[#7C3AED] dark:text-[#A78BFA] font-semibold'
        : 'text-[#6B7280] dark:text-[#9CA3AF] font-medium hover:bg-[#F5F4F1] dark:hover:bg-[#1F1E1B] hover:text-[#1C1C1E] dark:hover:text-[#F5F4F2]'
    }`;

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav
      className="h-14 flex items-center justify-between px-5 sticky top-0 z-50 flex-shrink-0"
      style={{
        height: 56,
        background: isDark ? 'rgba(15,10,30,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: isDark ? '1px solid rgba(124,58,237,0.12)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDark ? 'none' : '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <Logo height={32} />

      {/* Center nav */}
      {user && (
        <div className="flex items-center gap-1">
          <NavLink to="/notes" className={navLinkClass}>Notes</NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center transition-all duration-150 cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: isDark ? '#1A1917' : '#F5F4F1',
            border: `1px solid ${isDark ? '#2C2A27' : '#EEECEA'}`,
            color: isDark ? '#9CA3AF' : '#6B7280',
            fontSize: 15,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EDE9FE'; e.currentTarget.style.color = '#7C3AED'; }}
          onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1A1917' : '#F5F4F1'; e.currentTarget.style.color = isDark ? '#9CA3AF' : '#6B7280'; }}
        >
          <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />
        </button>

        {user ? (
          <>
            {/* Avatar */}
            <div
              className="cursor-default transition-shadow duration-150 hover:shadow-[0_0_0_2px_white,0_0_0_4px_#7C3AED]"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {/* Username */}
            <span
              className="hidden xl:block truncate"
              style={{ fontSize: 13, fontWeight: 500, maxWidth: 100, color: isDark ? '#9CA3AF' : '#4B5563' }}
            >
              {user.name}
            </span>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-150"
              style={{
                fontSize: 13, fontWeight: 500,
                color: isDark ? '#9CA3AF' : '#6B7280',
                background: 'transparent',
                border: `1px solid ${isDark ? '#2C2A27' : '#E5E3DF'}`,
                padding: '6px 14px', borderRadius: 9,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? '#1C0505' : '#FEF2F2';
                e.currentTarget.style.borderColor = isDark ? '#7F1D1D' : '#FCA5A5';
                e.currentTarget.style.color = isDark ? '#F87171' : '#DC2626';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = isDark ? '#2C2A27' : '#E5E3DF';
                e.currentTarget.style.color = isDark ? '#9CA3AF' : '#6B7280';
              }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: 14 }} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <NavLink to="/login" className="btn-peblo-sm">Sign in</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
