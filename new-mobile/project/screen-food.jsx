// Food / Restaurants screen — category filter + grid.

function FoodScreen({ theme, mode, lang }) {
  const isEs = lang === 'es';
  const activeCat = 'All';
  return (
    <Screen theme={theme}>
      <PBHeader theme={theme} mode={mode} lang={lang} />

      <div style={{ padding:'4px 20px 14px' }}>
        <Kicker theme={theme}>{isEs ? 'COMER Y BEBER' : 'EAT & DRINK'}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 30, lineHeight: 1.05,
          color: theme.ink, marginTop: 6, letterSpacing:'-0.015em',
        }}>
          {isEs ? 'Dónde comen los ' : 'Where locals '}
          <GradientText style={{ fontStyle:'italic' }}>{isEs ? 'locales' : 'eat'}</GradientText>
        </div>
      </div>

      {/* Category chips */}
      <div style={{
        display:'flex', gap: 8, overflowX:'auto',
        padding:'4px 20px 14px', scrollbarWidth:'none',
      }}>
        {PB_FOOD_CATEGORIES.map((c) => (
          <Chip key={c} active={c === activeCat} theme={theme}>{c}</Chip>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12,
        padding:'0 20px',
      }}>
        {PB_FOOD.map((f) => (
          <div key={f.id} style={{
            borderRadius: 18, overflow:'hidden',
            background: theme.bgElev,
            border: `1px solid ${theme.hairline}`,
            boxShadow: theme.glassShadow,
          }}>
            <div style={{ position:'relative', height: 120 }}>
              <img src={f.hero} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{
                position:'absolute', top: 8, left: 8,
                padding:'4px 8px', borderRadius: 999,
                background:'rgba(255,255,255,0.22)',
                backdropFilter:'blur(10px) saturate(160%)',
                WebkitBackdropFilter:'blur(10px) saturate(160%)',
                border:'1px solid rgba(255,255,255,0.25)',
                fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: 0.4, textTransform:'uppercase',
              }}>{f.category}</div>
            </div>
            <div style={{ padding:'10px 12px 12px' }}>
              <div style={{
                fontFamily: PB.font.display, fontWeight: 600, fontSize: 15,
                color: theme.ink, letterSpacing:'-0.005em', lineHeight: 1.2,
              }}>{f.title}</div>
              <div style={{ fontSize: 11, color: theme.ink3, marginTop: 4, lineHeight: 1.35,
                display:'-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {f.short}
              </div>
              <div style={{ display:'flex', gap: 10, marginTop: 8 }}>
                <MediaBadge icon="photo" count={f.images} theme={theme}/>
                {f.videos > 0 && <MediaBadge icon="play" count={f.videos} theme={theme}/>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

window.FoodScreen = FoodScreen;
