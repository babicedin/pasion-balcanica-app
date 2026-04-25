// App — design canvas with all screens, light + dark.

function PhoneArtboard({ screen, mode, lang = 'en', active, fullBleed = false }) {
  const theme = useTheme(mode);
  return (
    <PhoneFrame theme={theme} mode={mode}>
      {!fullBleed && <PBStatusBar theme={theme} />}
      {screen({ theme, mode, lang, fullBleed })}
      {active !== null && <PBNav theme={theme} active={active} lang={lang} mode={mode} />}
    </PhoneFrame>
  );
}

const BOARD_W = 375, BOARD_H = 812;

function App() {
  return (
    <DesignCanvas>
      {/* Intro note */}
      <DCSection id="intro" title="Pasión Balcánica — Mobile App" subtitle="Minimal Apple-style · liquid glass · light + dark. Designs based on the back-office schema: Places, Restaurants, Numbers, Review, and a minimal About card. Accent uses the logo gradient sparingly.">
        <DCPostIt width={260}>
          <b>Design system</b><br/>
          Type: Fraunces (display) + Inter (UI)<br/>
          Accent: crimson → magenta → indigo (from logo)<br/>
          Surface: warm off-white / deep warm ink<br/>
          Glass: 24px blur + 180% saturate on nav & cards<br/>
          Nav: floating pill, 5 tabs (Home · Places · Food · Numbers · Review)
        </DCPostIt>
        <DCPostIt width={240}>
          <b>Navigation map</b><br/>
          Home → any featured card → detail<br/>
          Places → list → detail (hero + glass card)<br/>
          Food → category chips → grid → detail<br/>
          Numbers → tap-to-call<br/>
          Review → Google Reviews deeplink<br/>
          About (from Home teaser)
        </DCPostIt>
      </DCSection>

      {/* Light mode core flow */}
      <DCSection id="light" title="Light mode" subtitle="Default theme. Warm off-white surfaces, subtle glass, gradient used only on active nav / primary CTAs.">
        <DCArtboard id="light-home" label="Home · feed" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={HomeScreen} mode="light" lang="en" active="home"/>
        </DCArtboard>
        <DCArtboard id="light-places" label="Places · list" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={PlacesScreen} mode="light" lang="en" active="places"/>
        </DCArtboard>
        <DCArtboard id="light-place-detail" label="Place · detail" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={PlaceDetailScreen} mode="light" lang="en" active={null} fullBleed/>
        </DCArtboard>
        <DCArtboard id="light-food" label="Food · grid" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={FoodScreen} mode="light" lang="en" active="food"/>
        </DCArtboard>
        <DCArtboard id="light-food-detail" label="Food · detail" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={FoodDetailScreen} mode="light" lang="en" active={null} fullBleed/>
        </DCArtboard>
        <DCArtboard id="light-numbers" label="Numbers" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={NumbersScreen} mode="light" lang="en" active="numbers"/>
        </DCArtboard>
        <DCArtboard id="light-review" label="Review" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={ReviewScreen} mode="light" lang="en" active="review"/>
        </DCArtboard>
        <DCArtboard id="light-about" label="About guide" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={AboutScreen} mode="light" lang="en" active={null}/>
        </DCArtboard>
      </DCSection>

      {/* Dark mode — same flow */}
      <DCSection id="dark" title="Dark mode" subtitle="Deep warm ink, frosted-glass surfaces. Same gradient reads as a small, warm glow.">
        <DCArtboard id="dark-home" label="Home · feed" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={HomeScreen} mode="dark" lang="en" active="home"/>
        </DCArtboard>
        <DCArtboard id="dark-places" label="Places · list" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={PlacesScreen} mode="dark" lang="en" active="places"/>
        </DCArtboard>
        <DCArtboard id="dark-place-detail" label="Place · detail" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={PlaceDetailScreen} mode="dark" lang="en" active={null} fullBleed/>
        </DCArtboard>
        <DCArtboard id="dark-food" label="Food · grid" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={FoodScreen} mode="dark" lang="en" active="food"/>
        </DCArtboard>
        <DCArtboard id="dark-numbers" label="Numbers" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={NumbersScreen} mode="dark" lang="en" active="numbers"/>
        </DCArtboard>
        <DCArtboard id="dark-review" label="Review" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={ReviewScreen} mode="dark" lang="en" active="review"/>
        </DCArtboard>
      </DCSection>

      {/* Spanish */}
      <DCSection id="es" title="Español" subtitle="Same flow with the EN/ES toggle flipped — content swaps to Spanish labels and titles.">
        <DCArtboard id="es-home" label="Inicio · feed" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={HomeScreen} mode="light" lang="es" active="home"/>
        </DCArtboard>
        <DCArtboard id="es-places" label="Lugares" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={PlacesScreen} mode="light" lang="es" active="places"/>
        </DCArtboard>
        <DCArtboard id="es-review" label="Reseña" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={ReviewScreen} mode="light" lang="es" active="review"/>
        </DCArtboard>
        <DCArtboard id="es-numbers-dark" label="Números · dark" width={BOARD_W} height={BOARD_H}>
          <PhoneArtboard screen={NumbersScreen} mode="dark" lang="es" active="numbers"/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
