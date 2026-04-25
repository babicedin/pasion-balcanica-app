// Food detail screen — mirrors place detail but with category + cuisine.

function FoodDetailScreen({ theme, mode, lang, fullBleed, food = PB_FOOD[0] }) {
  const isEs = lang === 'es';
  return (
    <Screen theme={theme} scroll={false} fullBleed={fullBleed} style={{ padding: 0 }}>
      <div style={{ position:'relative', height: 340, overflow:'hidden' }}>
        <img src={food.hero} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
        {/* Soft top wash for status bar legibility */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height: 130,
          background:'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
          pointerEvents:'none', zIndex: 1,
        }}/>
        {/* Status bar overlaid directly on hero */}
        <div style={{ position:'absolute', top:0, left:0, right:0, zIndex: 3 }}>
          <PBStatusBar theme={{ ...theme, ink: '#fff' }} />
        </div>
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)',
        }}/>
        <div style={{
          position:'absolute', top: 56, left: 16, right: 16, zIndex: 4,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <CircleBtn>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </CircleBtn>
          <CircleBtn>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 10-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/>
            </svg>
          </CircleBtn>
        </div>
        {/* Category chip bottom-left */}
        <div style={{
          position:'absolute', left: 16, bottom: 52,
          padding:'5px 12px', borderRadius:999,
          background: PB.brand.gradient,
          color:'#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform:'uppercase',
          boxShadow:'0 4px 12px rgba(184,40,63,0.35)',
        }}>{food.category}</div>
      </div>

      <div style={{
        position:'relative', zIndex: 5, marginTop: -32,
        background: theme.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '20px 20px 110px',
        overflowY:'auto', height: 812 - 308,
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: theme.hairline, margin: '2px auto 14px' }}/>

        <Kicker theme={theme}>{food.kicker}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 28, lineHeight: 1.05,
          color: theme.ink, marginTop: 6, letterSpacing:'-0.015em',
        }}>{food.title}</div>

        <div style={{ display:'flex', gap: 8, marginTop: 14 }}>
          <ActionBtn primary theme={theme} mode={mode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            {isEs ? 'Cómo llegar' : 'Directions'}
          </ActionBtn>
          <ActionBtn theme={theme} mode={mode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.ink} strokeWidth="2">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L7.9 9.7a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/>
            </svg>
            {isEs ? 'Llamar' : 'Call'}
          </ActionBtn>
        </div>

        <div style={{ marginTop: 18, color: theme.ink2, fontSize: 14, lineHeight: 1.55 }}>
          {food.short} {isEs ? 'Mi recomendación personal — pregunta por el plato del día.' : 'My personal pick — ask for today\'s special.'}
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader theme={theme}>{isEs ? 'Ubicación' : 'Location'}</SectionHeader>
          <MapMini theme={theme} mode={mode}/>
          <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: theme.ink3, marginTop: 8 }}>
            {food.coords}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <SectionHeader theme={theme}>{isEs ? 'Galería' : 'Gallery'}</SectionHeader>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 6 }}>
            {[0,1,2].map(i => (
              <img key={i} src={PB_FOOD[(i+2)%PB_FOOD.length].hero} alt="" style={{
                width:'100%', aspectRatio:'1/1', objectFit:'cover', borderRadius: 10,
              }}/>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}

window.FoodDetailScreen = FoodDetailScreen;
