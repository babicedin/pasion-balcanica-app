/// Lightweight i18n: a flat translation map keyed by locale code.
///
/// We don't use flutter gen-l10n / .arb for this app because translations are
/// mostly short strings in two languages and inline conditionals would be
/// heavier than a single lookup table.
class S {
  final String locale;
  const S._(this.locale);

  bool get isEs => locale == 'es';
  bool get isEn => locale == 'en';

  // Nav tabs
  String get tabHome => isEs ? 'Inicio' : 'Home';
  String get tabPlaces => isEs ? 'Lugares' : 'Places';
  String get tabFood => isEs ? 'Comida' : 'Food';
  String get tabShopping => isEs ? 'Compras' : 'Shop';
  String get tabNumbers => isEs ? 'Números' : 'Numbers';
  String get tabReview => isEs ? 'Reseña' : 'Review';

  // Headers
  String get welcome => isEs ? 'BIENVENIDOS' : 'WELCOME';
  String discoverPre(String city) => isEs ? 'Descubre ' : 'Discover ';
  String discoverPost() => isEs ? ' con nosotros.' : ', with us.';
  String get todaysPick => isEs ? 'NUESTRA SELECCIÓN' : 'OUR PICK';
  String get yourGuide => isEs ? 'TU GUÍA' : 'YOUR GUIDE';
  String get tapToMeet => isEs ? 'Toca para conocer' : 'Tap to meet';
  String get freeWalkingTour => isEs ? 'Caminata libre' : 'Free walking tour';
  String get mustSeePlaces =>
      isEs ? 'Lugares imprescindibles' : 'Must-see places';
  String get seeAll => isEs ? 'Ver todo' : 'See all';
  String get tasteOfSarajevo =>
      isEs ? 'Sabor de Sarajevo' : 'A taste of Sarajevo';
  String get pins => isEs ? 'marcadores' : 'pins';
  String get placesLabel => isEs ? 'Lugares' : 'Places';
  String get restaurantsLabel => isEs ? 'Gastronomía' : 'Eat & Drink';
  String get shoppingLabel => isEs ? 'Compras' : 'Shopping';

  // Places list
  String get explore => isEs ? 'EXPLORAR' : 'EXPLORE';
  String get placesToVisitPre => isEs ? 'Lugares para ' : 'Places to ';
  String get placesToVisitAccent => isEs ? 'visitar' : 'visit';
  String placesSubtitle(int n) =>
      isEs ? '$n paradas seleccionadas a mano.' : '$n hand-picked stops.';
  String get searchPlaces =>
      isEs ? 'Buscar lugares, barrios...' : 'Search places, neighborhoods…';

  // Food list
  String get eatAndDrink => isEs ? 'COMER Y BEBER' : 'EAT & DRINK';
  String get whereLocalsEatPre => isEs ? 'Dónde comen los ' : 'Where locals ';
  String get whereLocalsEatAccent => isEs ? 'locales' : 'eat';
  String get filterAll => isEs ? 'Todos' : 'All';

  // Shopping list
  String get shopAndBrowse => isEs ? 'IR DE COMPRAS' : 'SHOPPING';
  String get whereLocalsShopPre =>
      isEs ? 'Dónde compran los ' : 'Where locals ';
  String get whereLocalsShopAccent => isEs ? 'locales' : 'shop';

  // Numbers
  String get justInCase => isEs ? 'POR SI ACASO' : 'JUST IN CASE';
  String get importantNumbersPre => isEs ? 'Números ' : 'Important ';
  String get importantNumbersAccent => isEs ? 'importantes' : 'numbers';
  String get tapToCall => isEs
      ? 'Toca cualquier fila para llamar al instante.'
      : 'Tap any row to call instantly.';
  String get callCta => isEs ? 'Llamar' : 'Call';
  String get emergencyTip => isEs
      ? '💡 En emergencias médicas graves, llama al 112 (número europeo unificado).'
      : '💡 For serious medical emergencies, dial 112 (unified European number).';

  // Review
  String get yourVoiceMatters => isEs ? 'TU VOZ IMPORTA' : 'YOUR VOICE MATTERS';
  String get leaveReviewPre => isEs ? 'Déjame una ' : 'Leave me a ';
  String get leaveReviewAccent => isEs ? 'reseña' : 'review';
  String get reviewLead => isEs
      ? 'Si la caminata te hizo sentir Sarajevo un poco más — tu reseña de Google ayuda a otros viajeros a encontrarme.'
      : 'If the walk made Sarajevo feel a little closer — your Google review helps fellow travelers find me.';
  // The hardcoded testimonial was removed in favour of the admin-curated
  // `reviews` table. `recentReview` is still used as an attribution fallback
  // when a review row lacks an explicit author.
  String get recentReview => isEs ? 'una reseña reciente' : 'a recent review';
  String get reviewOnGoogle => isEs ? 'Reseñar en Google' : 'Review on Google';
  String get opensGoogleMaps => isEs
      ? 'Abre Google Maps · se necesita cuenta'
      : 'Opens Google Maps · account required';
  String get tapToReadFullReview =>
      isEs ? 'Toca para leer la reseña completa' : 'Tap to read full review';
  String get shareApp => isEs ? 'Compartir' : 'Share app';
  String get instagram => 'Instagram';
  String get whatsapp => 'WhatsApp';

  // About
  String get aboutRoleTagline => isEs
      ? 'Guía de caminata libre, Sarajevo'
      : 'Free walking tour guide, Sarajevo';
  String get walkers => isEs ? 'Caminantes' : 'Walkers';
  String get rating => isEs ? 'Valoración' : 'Rating';
  String get guiding => isEs ? 'Guiando' : 'Guiding';
  String get bookAWalk => isEs ? 'Reserva una caminata' : 'Book a walk';
  String get bookingNotSet => isEs
      ? 'Enlace de reserva aún no configurado.'
      : 'Booking link not set yet.';
  String get shareAppText => isEs
      ? '¡Descubre Sarajevo con Pasión Balcánica!'
      : 'Discover Sarajevo with Pasión Balcánica!';
  String get instagramNotSet => isEs
      ? 'Enlace de Instagram aún no configurado.'
      : 'Instagram link not set yet.';
  String get whatsappNotSet => isEs
      ? 'Enlace de WhatsApp aún no configurado.'
      : 'WhatsApp link not set yet.';
  String get googleReviewNotSet => isEs
      ? 'Enlace de Google aún no configurado.'
      : 'Google review link not set yet.';

  // Details
  String get directions => isEs ? 'Cómo llegar' : 'Directions';
  String get video => isEs ? 'Video' : 'Video';
  String get call => isEs ? 'Llamar' : 'Call';
  String get location => isEs ? 'Ubicación' : 'Location';
  String get gallery => isEs ? 'Galería' : 'Gallery';
  String get videos => isEs ? 'Videos' : 'Videos';
  String get walkthroughTitle =>
      isEs ? 'Un recorrido de 3 min' : 'A 3-min walkthrough';

  // Common
  String get somethingWentWrong =>
      isEs ? 'Algo salió mal' : 'Something went wrong';

  static const en = S._('en');
  static const es = S._('es');
  static S of(String locale) => locale.startsWith('es') ? es : en;
}
