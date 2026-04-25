// About card (accessed from home teaser) — minimal profile.

function AboutScreen({ theme, mode, lang }) {
  const isEs = lang === 'es';
  return (
    <Screen theme={theme}>
      <PBHeader theme={theme} mode={mode} lang={lang} />

      {/* Avatar hero card */}
      <div style={{
        margin:'8px 20px 0',
        padding:'26px 22px',
        borderRadius: 28,
        background: theme.surface,
        border: `1px solid ${theme.surfaceBorder}`,
        backdropFilter:'blur(24px) saturate(160%)', WebkitBackdropFilter:'blur(24px) saturate(160%)',
        boxShadow: theme.glassShadow,
        textAlign:'center',
        position:'relative', overflow:'hidden',
      }}>
        {/* soft gradient wash */}
        <div style={{
          position:'absolute', inset: 0,
          background: PB.brand.gradientSoft,
          pointerEvents:'none',
        }}/>
        <div style={{ position:'relative' }}>
          <div style={{
            width: 96, height: 96, borderRadius:'50%',
            background: PB.brand.gradient,
            margin: '0 auto 14px',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily: PB.font.display, fontWeight: 600, fontSize: 40,
            boxShadow:'0 10px 30px rgba(184,40,63,0.35)',
          }}>V</div>
          <div style={{
            fontFamily: PB.font.display, fontWeight: 500, fontSize: 28,
            color: theme.ink, letterSpacing:'-0.015em',
          }}>Valentina</div>
          <div style={{ fontSize: 13, color: theme.ink2, marginTop: 6, fontStyle:'italic', fontFamily: PB.font.display }}>
            {isEs ? 'Guía de caminata libre, Sarajevo' : 'Free walking tour guide, Sarajevo'}
          </div>

          {/* language chips */}
          <div style={{ display:'flex', justifyContent:'center', gap: 6, marginTop: 16, flexWrap:'wrap' }}>
            {['Español','English','Bosanski'].map(l => (
              <div key={l} style={{
                padding:'5px 11px', borderRadius:999,
                background: theme.bgElev,
                border: `1px solid ${theme.hairline}`,
                fontSize: 11, fontWeight: 600, color: theme.ink2,
              }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{
        margin:'16px 20px 0',
        padding: 18, borderRadius: 20,
        background: theme.bgElev,
        border: `1px solid ${theme.hairline}`,
      }}>
        <div style={{ color: theme.ink2, fontSize: 14, lineHeight: 1.6 }}>
          {isEs
            ? 'Hola, soy Valentina. Caminar por Sarajevo es entrar en una conversación entre imperios, guerras y cafés al atardecer. Te llevaré a los lugares que yo elegiría para una amiga — sin prisas, con historias reales.'
            : 'Hi, I\'m Valentina. Walking Sarajevo is stepping into a conversation between empires, wars, and sunset coffees. I\'ll take you where I\'d take a friend — unhurried, with real stories.'}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        margin:'14px 20px 0',
        display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10,
      }}>
        {[
          { n: '1,240+', l: isEs ? 'Caminantes' : 'Walkers' },
          { n: '4.9', l: isEs ? 'Valoración' : 'Rating' },
          { n: '6 yr', l: isEs ? 'Guiando' : 'Guiding' },
        ].map(s => (
          <div key={s.l} style={{
            padding: '14px 10px', borderRadius: 16, textAlign:'center',
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
          }}>
            <div style={{
              fontFamily: PB.font.display, fontWeight: 600, fontSize: 22,
              color: theme.ink, letterSpacing:'-0.01em',
            }}>{s.n}</div>
            <div style={{ fontSize: 11, color: theme.ink3, marginTop: 2, letterSpacing: 0.4, textTransform:'uppercase', fontWeight: 600 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Booking CTA */}
      <div style={{ padding:'18px 20px 0' }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
          padding:'15px', borderRadius: 16,
          background: PB.brand.gradient,
          color:'#fff', fontSize: 14, fontWeight: 600,
          boxShadow:'0 10px 30px rgba(184,40,63,0.32)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {isEs ? 'Reserva una caminata' : 'Book a walk'}
        </div>
      </div>
    </Screen>
  );
}

window.AboutScreen = AboutScreen;
