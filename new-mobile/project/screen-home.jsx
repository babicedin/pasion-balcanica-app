// Home feed screen — curated highlights with cards.

function HomeScreen({ theme, mode, lang }) {
  const isEs = lang === 'es';
  const heroPlace = PB_PLACES[1]; // Baščaršija
  const featured = PB_PLACES.slice(0, 3);
  const taste = PB_FOOD.slice(0, 4);

  return (
    <Screen theme={theme}>
      <PBHeader theme={theme} mode={mode} lang={lang} />

      {/* Greeting */}
      <div style={{ padding: '6px 20px 18px' }}>
        <Kicker theme={theme}>{isEs ? 'BIENVENIDOS' : 'WELCOME'}</Kicker>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 32, lineHeight: 1.05,
          color: theme.ink, marginTop: 8, letterSpacing: '-0.015em',
        }}>
          {isEs ? 'Descubre ' : 'Discover '}
          <GradientText style={{ fontStyle:'italic', fontWeight: 500 }}>
            {isEs ? 'Sarajevo' : 'Sarajevo'}
          </GradientText>
          {isEs ? ', conmigo.' : ', with me.'}
        </div>
      </div>

      {/* Hero card */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          position:'relative', height: 260, borderRadius: 24, overflow:'hidden',
          boxShadow: theme.glassShadow,
        }}>
          <img src={heroPlace.hero} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)',
          }}/>
          <div style={{ position:'absolute', top:14, left:14 }}>
            <div style={{
              padding:'5px 10px', borderRadius:999,
              background:'rgba(255,255,255,0.18)',
              backdropFilter:'blur(12px) saturate(150%)',
              WebkitBackdropFilter:'blur(12px) saturate(150%)',
              border:'1px solid rgba(255,255,255,0.25)',
              fontSize:11, fontWeight:600, color:'#fff', letterSpacing:0.5,
            }}>{isEs ? 'DESTACADO DE HOY' : 'TODAY\u2019S PICK'}</div>
          </div>
          <div style={{ position:'absolute', left:18, right:18, bottom:18, color:'#fff' }}>
            <div style={{ fontSize: 11, opacity: .8, letterSpacing: 1, textTransform:'uppercase', fontWeight:600 }}>
              {heroPlace.kicker}
            </div>
            <div style={{
              fontFamily: PB.font.display, fontWeight: 600, fontSize: 28, lineHeight: 1.05,
              marginTop: 4, letterSpacing: '-0.01em',
            }}>{isEs ? heroPlace.titleEs : heroPlace.title}</div>
            <div style={{ fontSize: 13, opacity: .88, marginTop: 6, lineHeight: 1.4 }}>
              {heroPlace.short}
            </div>
          </div>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:10,
        padding:'18px 20px 6px',
      }}>
        {[
          { icon:'map', label: isEs ? 'Lugares' : 'Places', count: PB_PLACES.length, tone: PB.brand.red },
          { icon:'fork', label: isEs ? 'Restaurantes' : 'Restaurants', count: PB_FOOD.length, tone: PB.brand.indigo },
        ].map((s, i) => (
          <div key={i} style={{
            padding:14, borderRadius:18,
            background: theme.surface,
            backdropFilter:'blur(20px) saturate(150%)',
            WebkitBackdropFilter:'blur(20px) saturate(150%)',
            border:`1px solid ${theme.surfaceBorder}`,
            boxShadow: theme.glassShadow,
          }}>
            <div style={{
              width:36, height:36, borderRadius:12,
              background: PB.brand.gradientSoft,
              display:'flex', alignItems:'center', justifyContent:'center',
              marginBottom: 10,
            }}>
              <NavIcon name={s.icon} size={18} color={s.tone}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{s.label}</div>
            <div style={{ fontSize: 12, color: theme.ink3, marginTop: 2 }}>
              {s.count} {isEs ? 'marcadores' : 'pins'}
            </div>
          </div>
        ))}
      </div>

      {/* Featured places — horizontal scroll */}
      <div style={{ padding:'16px 0 4px' }}>
        <div style={{ padding:'0 20px', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
          <div style={{
            fontFamily: PB.font.display, fontWeight: 500, fontSize: 20,
            color: theme.ink, letterSpacing: '-0.01em',
          }}>{isEs ? 'Lugares imprescindibles' : 'Must-see places'}</div>
          <div style={{ fontSize: 12, color: theme.ink3, fontWeight: 500 }}>
            {isEs ? 'Ver todo' : 'See all'} ›
          </div>
        </div>
        <div style={{
          display:'flex', gap:12, overflowX:'auto',
          padding:'12px 20px 4px',
          scrollbarWidth:'none',
        }}>
          {featured.map((p) => (
            <div key={p.id} style={{
              flex:'0 0 180px',
              borderRadius: 18, overflow:'hidden',
              background: theme.bgElev,
              border: `1px solid ${theme.hairline}`,
            }}>
              <img src={p.hero} alt="" style={{ width:'100%', height: 120, objectFit:'cover', display:'block' }}/>
              <div style={{ padding:'10px 12px 12px' }}>
                <div style={{ fontSize: 10, color: theme.ink3, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase' }}>
                  {p.kicker.split('·')[0].trim()}
                </div>
                <div style={{
                  fontFamily: PB.font.display, fontWeight: 600, fontSize: 16,
                  color: theme.ink, marginTop: 3, letterSpacing:'-0.005em',
                }}>{isEs ? p.titleEs : p.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Taste of Sarajevo */}
      <div style={{ padding:'12px 20px 4px' }}>
        <div style={{
          fontFamily: PB.font.display, fontWeight: 500, fontSize: 20,
          color: theme.ink, letterSpacing:'-0.01em', marginBottom: 12,
        }}>{isEs ? 'Sabor de Sarajevo' : 'A taste of Sarajevo'}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          {taste.map((f) => (
            <div key={f.id} style={{
              borderRadius: 16, overflow:'hidden',
              background: theme.bgElev,
              border: `1px solid ${theme.hairline}`,
            }}>
              <div style={{ position:'relative', height: 90 }}>
                <img src={f.hero} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                <div style={{
                  position:'absolute', top:6, left:6,
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                  color:'#fff', padding:'3px 7px', borderRadius: 999,
                  background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)',
                  WebkitBackdropFilter:'blur(8px)', textTransform:'uppercase',
                }}>{f.category}</div>
              </div>
              <div style={{ padding:'8px 10px 10px' }}>
                <div style={{
                  fontFamily: PB.font.display, fontWeight: 600, fontSize: 14,
                  color: theme.ink, letterSpacing:'-0.005em', lineHeight: 1.15,
                }}>{f.title}</div>
                <div style={{ fontSize: 11, color: theme.ink3, marginTop: 3 }}>
                  {f.kicker.split('·')[0].trim()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About card teaser */}
      <div style={{ padding:'18px 20px 4px' }}>
        <div style={{
          display:'flex', alignItems:'center', gap: 14,
          padding: 14, borderRadius: 20,
          background: theme.surface,
          border: `1px solid ${theme.surfaceBorder}`,
          backdropFilter:'blur(20px) saturate(150%)',
          WebkitBackdropFilter:'blur(20px) saturate(150%)',
        }}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background: PB.brand.gradient,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily: PB.font.display, fontWeight: 600, fontSize: 22,
            flexShrink: 0,
          }}>V</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: theme.ink3, fontWeight: 600, letterSpacing: 0.5, textTransform:'uppercase' }}>
              {isEs ? 'TU GUÍA' : 'YOUR GUIDE'}
            </div>
            <div style={{ fontSize: 15, color: theme.ink, fontWeight: 600, marginTop: 2 }}>
              Valentina · {isEs ? 'Caminata libre' : 'Free walking tour'}
            </div>
            <div style={{ fontSize: 12, color: theme.ink2, marginTop: 2 }}>
              ES · EN · BCS · {isEs ? 'Toca para conocer' : 'Tap to meet'}
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.ink3} strokeWidth="2">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </div>
      </div>
    </Screen>
  );
}

window.HomeScreen = HomeScreen;
