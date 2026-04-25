// Shared primitives: theme, Logo, StatusBar, NavBar, GlassCard, etc.

const useTheme = (mode) => (mode === 'dark' ? PB.dark : PB.light);

// ─── Logo ────────────────────────────────────────────────────
// Small reproduction of the logo mark + wordmark using the brand gradient.
// The real logo asset is at assets/logo.png for hero placements.
function PBLogoMark({ size = 28, theme }) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B8283F"/>
          <stop offset=".55" stopColor="#7A2159"/>
          <stop offset="1" stopColor="#3F2770"/>
        </linearGradient>
      </defs>
      {/* Stylized B — chevron left + two bowls, echoing the wordmark */}
      <path d="M8 10 L22 10 L12 32 L22 54 L8 54 L0 32 Z" fill={`url(#${id})`} />
      <path d="M26 10 L40 10 C50 10 56 15 56 22 C56 27 53 30 49 31 C54 32 58 36 58 42 C58 50 51 54 40 54 L26 54 Z M34 18 L34 28 L40 28 C44 28 47 26 47 23 C47 20 44 18 40 18 Z M34 36 L34 46 L40 46 C46 46 50 44 50 41 C50 38 46 36 40 36 Z" fill={`url(#${id})`} />
    </svg>
  );
}

function PBLogoFull({ height = 28, theme, mode = 'light' }) {
  // Real logo asset — aspect ratio 384/145 ≈ 2.65
  // In dark mode, invert-ish: the serif wordmark in the logo is deep purple,
  // so we lift it with a slight filter to keep the gradient readable on dark bg.
  const w = height * (384 / 145);
  return (
    <img
      src="assets/logo.png"
      alt="Pasión Balcánica"
      style={{
        height: height * 1.6,
        width: w * 1.6,
        objectFit: 'contain',
        display: 'block',
        filter: mode === 'dark' ? 'brightness(1.15) contrast(1.05)' : 'none',
      }}
    />
  );
}

// Gradient text (used sparingly for accent)
function GradientText({ children, style }) {
  return (
    <span style={{
      background: PB.brand.gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}>{children}</span>
  );
}

// ─── iOS Status Bar ──────────────────────────────────────────
function PBStatusBar({ theme, time = '9:41' }) {
  const color = theme.ink;
  return (
    <div style={{
      height: 44, paddingTop: 14, paddingLeft: 28, paddingRight: 22,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      fontFamily: PB.font.ui, fontWeight: 600, fontSize: 15, color,
      flexShrink: 0,
    }}>
      <span>{time}</span>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill={color}>
          <rect x="0" y="7" width="3" height="4" rx=".5"/>
          <rect x="5" y="5" width="3" height="6" rx=".5"/>
          <rect x="10" y="2.5" width="3" height="8.5" rx=".5"/>
          <rect x="15" y="0" width="3" height="11" rx=".5"/>
        </svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
          <path d="M8 11a1.2 1.2 0 110-2.4A1.2 1.2 0 018 11zm3.1-3.6a4.4 4.4 0 00-6.2 0L3.5 6a6.4 6.4 0 019 0zm2.7-2.7a8.2 8.2 0 00-11.6 0L.8 3.3a10.2 10.2 0 0114.4 0z"/>
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x=".5" y=".5" width="22" height="11" rx="3" stroke={color} strokeOpacity=".4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.8" fill={color}/>
          <rect x="23" y="4" width="1.8" height="4" rx=".6" fill={color} fillOpacity=".5"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Floating Liquid Glass Nav ───────────────────────────────
const NAV_ITEMS = [
  { id:'home', label:'Home', labelEs:'Inicio', icon: 'home' },
  { id:'places', label:'Places', labelEs:'Lugares', icon: 'map' },
  { id:'food', label:'Food', labelEs:'Comida', icon: 'fork' },
  { id:'numbers', label:'Numbers', labelEs:'Números', icon: 'phone' },
  { id:'review', label:'Review', labelEs:'Reseña', icon: 'star' },
];

function NavIcon({ name, size = 22, color, filled = false }) {
  const stroke = color, sw = 1.8;
  switch (name) {
    case 'home':
      return filled ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M3 11L12 3l9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z"/>
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11L12 3l9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z"/>
        </svg>
      );
    case 'map':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z"/>
          <circle cx="12" cy="9" r="2.5" fill={filled ? '#fff' : 'none'}/>
        </svg>
      );
    case 'fork':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3v7a2 2 0 002 2v9"/>
          <path d="M11 3v7"/>
          <path d="M15 3c0 5 2 6 2 9s-2 3-2 3v6"/>
        </svg>
      );
    case 'phone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L7.9 9.7a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/>
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3"/>
        </svg>
      );
    default: return null;
  }
}

// Floating pill nav. Blur + saturation + subtle inner highlight = liquid glass.
function PBNav({ theme, active = 'home', lang = 'en', mode = 'light' }) {
  const isDark = mode === 'dark';
  return (
    <div style={{
      position:'absolute', left:16, right:16, bottom:14,
      display:'flex', justifyContent:'center', pointerEvents:'none',
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap:2,
        padding:'8px 10px',
        borderRadius:34,
        background: theme.navGlass,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${theme.surfaceBorder}`,
        boxShadow: isDark
          ? '0 10px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 10px 40px rgba(26,21,18,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        pointerEvents:'auto',
      }}>
        {NAV_ITEMS.map((it) => {
          const isActive = it.id === active;
          return (
            <div key={it.id} style={{
              position:'relative',
              display:'flex', alignItems:'center', justifyContent:'center',
              padding: isActive ? '8px 12px' : '8px 10px',
              borderRadius: 24,
              minWidth: 48,
              background: isActive ? PB.brand.gradient : 'transparent',
              transition: 'all .24s',
              boxShadow: isActive ? '0 4px 14px rgba(184,40,63,0.35)' : 'none',
            }}>
              <NavIcon name={it.icon} size={20} color={isActive ? '#fff' : theme.ink2} filled={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── iPhone Frame (simple, for canvas artboards) ─────────────
// Lighter than the ios_frame starter — just the outer bezel, notch,
// home indicator, and a scroll-clipped viewport. Good for small artboards.
function PhoneFrame({ children, theme, mode = 'light' }) {
  const W = 375, H = 812;
  return (
    <div style={{
      width: W, height: H, position:'relative',
      borderRadius: 48,
      background: theme.bg,
      boxShadow: mode === 'dark'
        ? '0 0 0 8px #0B0908, 0 0 0 9px #2A2420, 0 30px 80px rgba(0,0,0,0.5)'
        : '0 0 0 8px #1A1512, 0 0 0 9px #3A312B, 0 30px 80px rgba(26,21,18,0.25)',
      overflow:'hidden',
      fontFamily: PB.font.ui,
      color: theme.ink,
    }}>
      {/* Dynamic Island */}
      <div style={{
        position:'absolute', top:11, left:'50%', transform:'translateX(-50%)',
        width:120, height:34, borderRadius:20, background:'#000', zIndex:5,
      }}/>
      {children}
      {/* Home indicator */}
      <div style={{
        position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
        width:134, height:5, borderRadius:3,
        background: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(26,21,18,0.35)',
        zIndex:6,
      }}/>
    </div>
  );
}

// Screen scroll area (between status bar and nav)
function Screen({ children, theme, scroll = true, pad = 0, fullBleed = false, style }) {
  return (
    <div style={{
      height: fullBleed ? 812 : 812 - 44, // full phone height when status bar is overlaid
      overflow: scroll ? 'auto' : 'hidden',
      background: theme.bg,
      paddingBottom: 100, // room for floating nav
      ...style,
    }}>
      {children}
    </div>
  );
}

// Glass chip
function Chip({ children, active, theme, style }) {
  return (
    <div style={{
      padding:'7px 14px', borderRadius:999,
      background: active ? PB.brand.gradient : theme.chipBg,
      color: active ? '#fff' : theme.ink2,
      fontSize: 13, fontWeight: 600, fontFamily: PB.font.ui,
      whiteSpace:'nowrap',
      border: active ? 'none' : `1px solid ${theme.hairline}`,
      ...style,
    }}>{children}</div>
  );
}

// Small pill label (kicker)
function Kicker({ children, theme, style }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform:'uppercase',
      fontFamily: PB.font.ui, color: theme.ink3, ...style,
    }}>{children}</div>
  );
}

// Language toggle (EN/ES) in header
function LangToggle({ lang, theme }) {
  return (
    <div style={{
      display:'flex', alignItems:'center',
      background: theme.chipBg,
      borderRadius: 999, padding: 3,
      border: `1px solid ${theme.hairline}`,
      fontFamily: PB.font.ui, fontSize: 12, fontWeight: 600,
    }}>
      {['EN','ES'].map((l) => {
        const isActive = (lang === 'en' && l === 'EN') || (lang === 'es' && l === 'ES');
        return (
          <div key={l} style={{
            padding:'5px 10px', borderRadius: 999, minWidth: 28, textAlign:'center',
            background: isActive ? (PB === PB ? '#fff' : '') : 'transparent',
            color: isActive ? '#1A1512' : theme.ink2,
            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
          }}>{l}</div>
        );
      })}
    </div>
  );
}

// Theme toggle glyph (sun/moon) in header
function ThemeGlyph({ mode, theme }) {
  return (
    <div style={{
      width:34, height:34, borderRadius:17,
      background: theme.chipBg,
      border: `1px solid ${theme.hairline}`,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {mode === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={theme.ink}>
          <path d="M21 12.8A9 9 0 0111.2 3a7 7 0 109.8 9.8z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.ink} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
        </svg>
      )}
    </div>
  );
}

// Screen header bar (logo + lang + theme)
function PBHeader({ theme, mode, lang }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'8px 20px 14px',
    }}>
      <PBLogoFull height={22} theme={theme} mode={mode} />
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <LangToggle lang={lang} theme={theme} />
        <ThemeGlyph mode={mode} theme={theme} />
      </div>
    </div>
  );
}

// Striped placeholder (fallback when no image)
function ImgPlaceholder({ label, ratio = '16/10', theme, style }) {
  const bg = `repeating-linear-gradient(45deg, ${theme.chipBg} 0 8px, transparent 8px 16px)`;
  return (
    <div style={{
      aspectRatio: ratio,
      width:'100%',
      background: bg,
      border: `1px solid ${theme.hairline}`,
      borderRadius: 14,
      display:'flex', alignItems:'center', justifyContent:'center',
      color: theme.ink3, fontFamily:'ui-monospace, Menlo, monospace', fontSize: 11,
      ...style,
    }}>{label}</div>
  );
}

// Map placeholder — subtle map-like look using CSS
function MapMini({ theme, mode, height = 140, pinColor = PB.brand.red }) {
  const stroke = mode === 'dark' ? 'rgba(255,240,230,0.07)' : 'rgba(26,21,18,0.07)';
  const land = mode === 'dark' ? '#241C18' : '#F0EAE0';
  const water = mode === 'dark' ? '#1A1512' : '#DCE7EA';
  return (
    <div style={{
      position:'relative', height, borderRadius: 16, overflow:'hidden',
      background: land, border: `1px solid ${theme.hairline}`,
    }}>
      {/* "river" */}
      <svg width="100%" height="100%" viewBox="0 0 300 140" preserveAspectRatio="none" style={{ position:'absolute', inset:0 }}>
        <path d="M-10 90 Q 60 70 120 85 T 250 72 T 320 90 L 320 150 L -10 150 Z" fill={water}/>
        <path d="M-10 90 Q 60 70 120 85 T 250 72 T 320 90" stroke={stroke} fill="none"/>
        {/* streets */}
        <g stroke={stroke} strokeWidth="1">
          <path d="M0 40 L 300 55"/>
          <path d="M0 20 L 300 30"/>
          <path d="M60 0 L 80 140"/>
          <path d="M140 0 L 155 140"/>
          <path d="M220 0 L 240 140"/>
          <path d="M0 110 L 300 120"/>
        </g>
      </svg>
      {/* pin */}
      <div style={{
        position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-100%)',
      }}>
        <div style={{
          width:28, height:28, borderRadius:'50% 50% 50% 0',
          transform:'rotate(-45deg)',
          background: PB.brand.gradient,
          boxShadow:'0 6px 16px rgba(184,40,63,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff', transform:'rotate(45deg)' }}/>
        </div>
      </div>
      {/* soft vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.08) 100%)'}}/>
    </div>
  );
}

Object.assign(window, {
  useTheme, PBLogoMark, PBLogoFull, GradientText,
  PBStatusBar, PBNav, NavIcon, NAV_ITEMS,
  PhoneFrame, Screen, Chip, Kicker, LangToggle, ThemeGlyph, PBHeader,
  ImgPlaceholder, MapMini,
});
