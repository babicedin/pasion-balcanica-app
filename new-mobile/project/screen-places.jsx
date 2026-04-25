// Places list screen.

function PlacesScreen({ theme, mode, lang }) {
  const isEs = lang === 'es';
  return (
    <Screen theme={theme}>
      <PBHeader theme={theme} mode={mode} lang={lang} />

      <div style={{ padding:'4px 20px 14px' }}>
        <Kicker theme={theme}>{isEs ? 'EXPLORAR' : 'EXPLORE'}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 30, lineHeight: 1.05,
          color: theme.ink, marginTop: 6, letterSpacing:'-0.015em',
        }}>
          {isEs ? 'Lugares para ' : 'Places to '}
          <GradientText style={{ fontStyle:'italic' }}>{isEs ? 'visitar' : 'visit'}</GradientText>
        </div>
        <div style={{ color: theme.ink3, fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>
          {isEs ? `${PB_PLACES.length} paradas seleccionadas a mano · Toca cualquiera para abrir el mapa.` : `${PB_PLACES.length} hand-picked stops · Tap any to open the map.`}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:'0 20px 8px' }}>
        <div style={{
          display:'flex', alignItems:'center', gap: 10,
          padding:'12px 14px', borderRadius: 14,
          background: theme.surface,
          border: `1px solid ${theme.surfaceBorder}`,
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.ink3} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <div style={{ color: theme.ink3, fontSize: 14 }}>
            {isEs ? 'Buscar lugares, barrios...' : 'Search places, neighborhoods…'}
          </div>
        </div>
      </div>

      {/* Place cards list */}
      <div style={{ padding:'8px 20px' }}>
        {PB_PLACES.map((p, i) => (
          <div key={p.id} style={{
            display:'flex', gap: 14,
            padding: 12, marginBottom: 12,
            borderRadius: 20,
            background: theme.bgElev,
            border: `1px solid ${theme.hairline}`,
            boxShadow: theme.glassShadow,
          }}>
            <div style={{
              width: 92, height: 92, borderRadius: 14, overflow:'hidden',
              position:'relative', flexShrink: 0,
            }}>
              <img src={p.hero} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{
                position:'absolute', top:6, left:6,
                width: 22, height: 22, borderRadius:'50%',
                background: 'rgba(255,255,255,0.95)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 10, fontWeight: 700, color: PB.brand.magenta,
                fontFamily: PB.font.ui,
              }}>{i+1}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <div style={{ fontSize: 10, color: theme.ink3, fontWeight: 600, letterSpacing: 0.5, textTransform:'uppercase' }}>
                {p.kicker}
              </div>
              <div style={{
                fontFamily: PB.font.display, fontWeight: 600, fontSize: 17,
                color: theme.ink, marginTop: 3, letterSpacing:'-0.005em', lineHeight: 1.15,
              }}>{isEs ? p.titleEs : p.title}</div>
              <div style={{ fontSize: 12, color: theme.ink2, marginTop: 4, lineHeight: 1.4,
                display:'-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {p.short}
              </div>
              <div style={{ display:'flex', gap: 10, marginTop: 8, alignItems:'center' }}>
                <MediaBadge icon="photo" count={p.images} theme={theme}/>
                {p.videos > 0 && <MediaBadge icon="play" count={p.videos} theme={theme}/>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function MediaBadge({ icon, count, theme }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 4,
      fontSize: 11, color: theme.ink3, fontWeight: 500,
    }}>
      {icon === 'photo' ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.ink3} strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2"/>
          <circle cx="9" cy="11" r="2"/>
          <path d="M21 16l-4-4-8 8"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill={theme.ink3}>
          <polygon points="6 4 20 12 6 20 6 4"/>
        </svg>
      )}
      {count}
    </div>
  );
}

window.PlacesScreen = PlacesScreen;
window.MediaBadge = MediaBadge;
