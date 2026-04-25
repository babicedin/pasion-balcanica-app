// Review screen — directs to Google Reviews profile.

function ReviewScreen({ theme, mode, lang }) {
  const isEs = lang === 'es';
  return (
    <Screen theme={theme}>
      <PBHeader theme={theme} mode={mode} lang={lang} />

      <div style={{ padding:'10px 20px 6px' }}>
        <Kicker theme={theme}>{isEs ? 'TU VOZ IMPORTA' : 'YOUR VOICE MATTERS'}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 32, lineHeight: 1.05,
          color: theme.ink, marginTop: 8, letterSpacing:'-0.015em',
        }}>
          {isEs ? 'Déjame una ' : 'Leave me a '}
          <GradientText style={{ fontStyle:'italic' }}>{isEs ? 'reseña' : 'review'}</GradientText>
        </div>
        <div style={{ color: theme.ink2, fontSize: 14, marginTop: 12, lineHeight: 1.55 }}>
          {isEs
            ? 'Si la caminata te hizo sentir Sarajevo un poco más — tu reseña de Google ayuda a otros viajeros a encontrarme.'
            : 'If the walk made Sarajevo feel a little closer — your Google review helps fellow travelers find me.'}
        </div>
      </div>

      {/* Star visual card */}
      <div style={{
        margin:'22px 20px 0',
        borderRadius: 24, overflow:'hidden',
        position:'relative',
        padding: '28px 20px',
        background: PB.brand.gradient,
        color:'#fff',
        boxShadow: '0 12px 40px rgba(184,40,63,0.35)',
      }}>
        {/* decorative glass blobs */}
        <div style={{
          position:'absolute', top:-40, right:-30, width:160, height:160,
          borderRadius:'50%', background:'rgba(255,255,255,0.14)', filter:'blur(2px)',
        }}/>
        <div style={{
          position:'absolute', bottom:-30, left:-20, width:110, height:110,
          borderRadius:'50%', background:'rgba(255,255,255,0.1)',
        }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', gap: 4, marginBottom: 12 }}>
            {[0,1,2,3,4].map(i => (
              <svg key={i} width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3"/>
              </svg>
            ))}
          </div>
          <div style={{
            fontFamily: PB.font.display, fontWeight: 500, fontSize: 22, lineHeight: 1.15,
            fontStyle:'italic', letterSpacing:'-0.01em',
          }}>
            {isEs
              ? '“Valentina hizo que Sarajevo sintiera como en casa — a través de historia, sabores e historias.”'
              : '“Valentina made Sarajevo feel like home — through history, flavors, and stories.”'}
          </div>
          <div style={{ fontSize: 12, marginTop: 14, opacity: 0.82 }}>
            — {isEs ? 'una reseña reciente' : 'a recent review'}
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div style={{ padding:'22px 20px 0' }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
          padding:'16px', borderRadius: 16,
          background: theme.ink,
          color: theme.bg,
          fontSize: 15, fontWeight: 600,
          boxShadow: theme.glassShadow,
        }}>
          {/* Google "G" */}
          <div style={{
            width: 22, height: 22, borderRadius:'50%',
            background:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily: PB.font.display, fontWeight: 700, fontSize: 13, color:'#4285F4',
          }}>G</div>
          {isEs ? 'Reseñar en Google' : 'Review on Google'}
        </div>
        <div style={{ textAlign:'center', fontSize: 11, color: theme.ink3, marginTop: 10 }}>
          {isEs ? 'Abre Google Maps · se necesita cuenta' : 'Opens Google Maps · account required'}
        </div>
      </div>

      {/* Secondary share */}
      <div style={{ padding:'22px 20px 0' }}>
        <div style={{ display:'flex', gap: 10 }}>
          <ShareTile theme={theme} label={isEs ? 'Compartir' : 'Share app'} icon="share"/>
          <ShareTile theme={theme} label={isEs ? 'Instagram' : 'Instagram'} icon="ig"/>
          <ShareTile theme={theme} label={isEs ? 'WhatsApp' : 'WhatsApp'} icon="wa"/>
        </div>
      </div>
    </Screen>
  );
}

function ShareTile({ theme, label, icon }) {
  return (
    <div style={{
      flex: 1,
      padding: '14px 8px',
      borderRadius: 14,
      background: theme.surface,
      border: `1px solid ${theme.surfaceBorder}`,
      display:'flex', flexDirection:'column', alignItems:'center', gap: 8,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: PB.brand.gradientSoft,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {icon === 'share' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PB.brand.magenta} strokeWidth="2" strokeLinecap="round">
            <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        )}
        {icon === 'ig' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PB.brand.magenta} strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill={PB.brand.magenta}/>
          </svg>
        )}
        {icon === 'wa' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PB.brand.magenta} strokeWidth="2">
            <path d="M21 12a9 9 0 11-4.3-7.7L21 3l-1.3 4.3A9 9 0 0121 12z"/><path d="M8 10c0 3 3 6 6 6l1.5-1.5-2-1-1 1c-1-.3-2-1.3-2.3-2.3l1-1-1-2z"/>
          </svg>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: theme.ink2 }}>{label}</div>
    </div>
  );
}

window.ReviewScreen = ReviewScreen;
