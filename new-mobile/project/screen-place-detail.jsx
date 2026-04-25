// Place detail — full-bleed hero → glass info card slides up.

function PlaceDetailScreen({ theme, mode, lang, fullBleed, place = PB_PLACES[1] }) {
  const isEs = lang === 'es';
  return (
    <Screen theme={theme} scroll={false} fullBleed={fullBleed} style={{ padding: 0 }}>
      {/* Hero — full-bleed, status bar overlays on top */}
      <div style={{ position:'relative', height: 360, overflow:'hidden' }}>
        <img src={place.hero} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
        {/* Soft top wash so status bar icons stay legible on any photo */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height: 130,
          background:'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
          pointerEvents:'none', zIndex: 1,
        }}/>
        {/* Status bar overlaid directly */}
        <div style={{ position:'absolute', top:0, left:0, right:0, zIndex: 3 }}>
          <PBStatusBar theme={{ ...theme, ink: '#fff' }} />
        </div>
        <div style={{
          position:'absolute', inset:0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 100%)',
        }}/>
        {/* Top controls — below the status bar (44px) */}
        <div style={{
          position:'absolute', top: 56, left: 16, right: 16, zIndex: 4,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <CircleBtn>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </CircleBtn>
          <div style={{ display:'flex', gap: 8 }}>
            <CircleBtn>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </CircleBtn>
            <CircleBtn>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 10-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/>
              </svg>
            </CircleBtn>
          </div>
        </div>

        {/* Image count pill */}
        <div style={{
          position:'absolute', bottom: 52, right: 16,
          padding:'5px 10px', borderRadius: 999,
          background:'rgba(0,0,0,0.45)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          color:'#fff', fontSize: 11, fontWeight: 600,
          display:'flex', alignItems:'center', gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <circle cx="9" cy="11" r="2"/>
            <path d="M21 16l-4-4-8 8"/>
          </svg>
          1 / {place.images}
        </div>
      </div>

      {/* Glass info card — pulls up over hero */}
      <div style={{
        position:'relative', zIndex: 5,
        marginTop: -32,
        background: theme.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '20px 20px 110px',
        overflowY:'auto', height: 812 - 328,
        boxShadow: mode === 'dark' ? '0 -1px 0 rgba(255,255,255,0.05)' : '0 -1px 0 rgba(26,21,18,0.04)',
      }}>
        {/* drag handle */}
        <div style={{
          width: 38, height: 4, borderRadius: 2,
          background: theme.hairline,
          margin: '2px auto 14px',
        }}/>

        <Kicker theme={theme}>{place.kicker}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 30, lineHeight: 1.05,
          color: theme.ink, marginTop: 6, letterSpacing: '-0.015em',
        }}>{isEs ? place.titleEs : place.title}</div>

        <div style={{ display:'flex', gap: 8, marginTop: 14 }}>
          <ActionBtn primary theme={theme} mode={mode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            {isEs ? 'Cómo llegar' : 'Directions'}
          </ActionBtn>
          <ActionBtn theme={theme} mode={mode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.ink} strokeWidth="2">
              <polygon points="6 4 20 12 6 20 6 4"/>
            </svg>
            {isEs ? 'Video' : 'Video'}
          </ActionBtn>
        </div>

        <div style={{
          marginTop: 18, color: theme.ink2, fontSize: 14, lineHeight: 1.55,
        }}>
          {place.short} {isEs
            ? 'Este lugar fue fundamental en la historia de Sarajevo — desde el período otomano hasta hoy. Te contaré por qué importa.'
            : 'This place was pivotal to Sarajevo\'s story — from the Ottoman period to today. I\'ll tell you why it matters.'}
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader theme={theme}>{isEs ? 'Ubicación' : 'Location'}</SectionHeader>
          <MapMini theme={theme} mode={mode}/>
          <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: theme.ink3, marginTop: 8, letterSpacing: 0.2 }}>
            {place.coords}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader theme={theme}>{isEs ? 'Galería' : 'Gallery'}</SectionHeader>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 6 }}>
            {[0,1,2].map(i => (
              <img key={i} src={PB_PLACES[(i+1)%PB_PLACES.length].hero} alt="" style={{
                width:'100%', aspectRatio:'1/1', objectFit:'cover', borderRadius: 10,
              }}/>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader theme={theme}>{isEs ? 'Videos' : 'Videos'}</SectionHeader>
          <div style={{
            display:'flex', alignItems:'center', gap: 12,
            padding: 12, borderRadius: 14,
            background: theme.surface,
            border:`1px solid ${theme.surfaceBorder}`,
          }}>
            <div style={{
              width: 56, height: 42, borderRadius: 8, background:'#000',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <polygon points="6 4 20 12 6 20 6 4"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, lineHeight: 1.2 }}>
                {isEs ? 'Un recorrido de 3 min' : 'A 3-min walkthrough'}
              </div>
              <div style={{ fontSize: 11, color: theme.ink3, marginTop: 3 }}>YouTube · 3:12</div>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function CircleBtn({ children }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius:'50%',
      background:'rgba(0,0,0,0.35)',
      backdropFilter:'blur(12px) saturate(150%)', WebkitBackdropFilter:'blur(12px) saturate(150%)',
      border:'1px solid rgba(255,255,255,0.2)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>{children}</div>
  );
}

function ActionBtn({ children, primary, theme, mode }) {
  return (
    <div style={{
      flex: 1, display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
      padding:'12px 14px', borderRadius: 14,
      background: primary ? PB.brand.gradient : theme.chipBg,
      color: primary ? '#fff' : theme.ink,
      fontSize: 13, fontWeight: 600,
      border: primary ? 'none' : `1px solid ${theme.hairline}`,
      boxShadow: primary ? '0 6px 18px rgba(184,40,63,0.3)' : 'none',
    }}>{children}</div>
  );
}

function SectionHeader({ children, theme }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform:'uppercase',
      color: theme.ink3, marginBottom: 10,
    }}>{children}</div>
  );
}

window.PlaceDetailScreen = PlaceDetailScreen;
window.CircleBtn = CircleBtn;
window.ActionBtn = ActionBtn;
window.SectionHeader = SectionHeader;
