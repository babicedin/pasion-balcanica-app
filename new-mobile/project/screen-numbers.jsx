// Important Numbers — simple tap-to-call list.

function NumbersScreen({ theme, mode, lang }) {
  const isEs = lang === 'es';
  return (
    <Screen theme={theme}>
      <PBHeader theme={theme} mode={mode} lang={lang} />

      <div style={{ padding:'4px 20px 14px' }}>
        <Kicker theme={theme}>{isEs ? 'POR SI ACASO' : 'JUST IN CASE'}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 30, lineHeight: 1.05,
          color: theme.ink, marginTop: 6, letterSpacing:'-0.015em',
        }}>
          {isEs ? 'Números ' : 'Important '}
          <GradientText style={{ fontStyle:'italic' }}>{isEs ? 'importantes' : 'numbers'}</GradientText>
        </div>
        <div style={{ color: theme.ink3, fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
          {isEs ? 'Toca cualquier fila para llamar al instante.' : 'Tap any row to call instantly.'}
        </div>
      </div>

      <div style={{
        margin:'0 20px',
        borderRadius: 20,
        background: theme.bgElev,
        border: `1px solid ${theme.hairline}`,
        overflow:'hidden',
        boxShadow: theme.glassShadow,
      }}>
        {PB_NUMBERS.map((n, i) => (
          <div key={n.id} style={{
            display:'flex', alignItems:'center', gap: 14,
            padding:'14px 16px',
            borderBottom: i < PB_NUMBERS.length - 1 ? `1px solid ${theme.hairline}` : 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: PB.brand.gradientSoft,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PB.brand.magenta} strokeWidth="2">
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L7.9 9.7a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, lineHeight: 1.2 }}>
                {isEs ? n.titleEs : n.title}
              </div>
              <div style={{ fontSize: 13, color: theme.ink3, marginTop: 2, fontFamily:'ui-monospace, Menlo, monospace' }}>
                {n.phone}
              </div>
            </div>
            <div style={{
              padding:'7px 12px', borderRadius: 999,
              background: PB.brand.gradient,
              color:'#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform:'uppercase',
              boxShadow:'0 3px 10px rgba(184,40,63,0.3)',
            }}>{isEs ? 'Llamar' : 'Call'}</div>
          </div>
        ))}
      </div>

      <div style={{
        margin:'16px 20px 0',
        padding: 14, borderRadius: 14,
        background: theme.surface,
        border: `1px solid ${theme.surfaceBorder}`,
        fontSize: 12, color: theme.ink3, lineHeight: 1.5,
      }}>
        {isEs
          ? '💡 En emergencias médicas graves, llama al 112 (número europeo unificado).'
          : '💡 For serious medical emergencies, dial 112 (unified European number).'}
      </div>
    </Screen>
  );
}

window.NumbersScreen = NumbersScreen;
