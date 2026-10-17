const SCRIPT_DATA = {
  title: "Rear Window: Behind the Scenes",
  subtitle: "4th Grade English Festival — Paramount Studios, Summer 1954",
  targetActor: {
    name: "Luciana Peña",
    characterId: "ASSISTANT_DIRECTOR",
    characterName: "Assistant Director (MC)",
    coActor: "Jeronimo Bustos",
    avatar: "🎬",
    description: "La mano derecha del Director en el set de grabación. Atenta a todos los detalles técnicos (luces, música), empática, amable y siempre lista para animar a los actores cuando sienten miedo."
  },
  runningRule: {
    en: "The CAMERA MAN claps the clapperboard before every film scene. Either the DIRECTOR or CAMERA MAN calls \"ACTION!\" to begin — the DIRECTOR always calls \"CUT!\" to end. CUT means we're back in real life (backstage).",
    es: "Regla del espectáculo: El Camarógrafo hace sonar la claqueta antes de cada escena de película. El Director o el Camarógrafo grita «¡ACTION!» para empezar — y el Director siempre grita «¡CUT!» para terminar. «CUT» significa que volvemos a la vida real (detrás de cámaras)."
  },
  characters: {
    CEREMONY_MASTER: {
      id: "CEREMONY_MASTER",
      name: "Ceremony Master Valeria",
      shortName: "Valeria (MC)",
      actors: "Valeria Ortiz",
      avatar: "🎤",
      color: "#ec4899",
      bgLight: "#fdf2f8",
      voiceGender: "female",
      pitch: 1.1,
      rate: 0.95,
      roleEs: "Maestra de Ceremonias que presenta cada escena al público y a los padres."
    },
    DIRECTOR: {
      id: "DIRECTOR",
      name: "Director",
      shortName: "Director",
      actors: "Antonio Amaya / Samantha Guzman",
      avatar: "📢",
      color: "#f59e0b",
      bgLight: "#fffbeb",
      voiceGender: "male",
      pitch: 0.9,
      rate: 0.95,
      roleEs: "El director de la película de 1954. Usa un megáfono de cartón, es exigente pero de buen corazón."
    },
    ASSISTANT_DIRECTOR: {
      id: "ASSISTANT_DIRECTOR",
      name: "Assistant Director (MC)",
      shortName: "Assistant Director (Luciana)",
      actors: "Jeronimo Bustos / Luciana Peña",
      avatar: "⭐",
      color: "#8b5cf6",
      bgLight: "#f5f3ff",
      voiceGender: "female",
      pitch: 1.15,
      rate: 0.92,
      roleEs: "¡TU PERSONAJE! Asistente de Dirección. Cuida el set, prueba la música y apoya emocionalmente a Thorwald."
    },
    MAKEUP_MASTER: {
      id: "MAKEUP_MASTER",
      name: "Makeup Master",
      shortName: "Makeup Master",
      actors: "Veronica / Mariana",
      avatar: "💄",
      color: "#db2777",
      bgLight: "#fce7f3",
      voiceGender: "female",
      pitch: 1.12,
      rate: 0.95,
      roleEs: "Encargada de maquillaje y peinado. Siempre cuida que los actores se vean perfectos para la cámara."
    },
    JEFF: {
      id: "JEFF",
      name: "Jeff / Jessy",
      shortName: "Jeff / Jessy",
      actors: "Nicolas Paez / Valentina Camargo",
      avatar: "🔭",
      color: "#0ea5e9",
      bgLight: "#f0f9ff",
      voiceGender: "male",
      pitch: 1.0,
      rate: 0.95,
      roleEs: "Protagonista de la película dentro de la obra. Es un fotógrafo observador en silla de ruedas con binoculares."
    },
    LISA: {
      id: "LISA",
      name: "Lisa",
      shortName: "Lisa",
      actors: "Isabella Atencia / Ana S. Pulido",
      avatar: "👗",
      color: "#14b8a6",
      bgLight: "#f0fdfa",
      voiceGender: "female",
      pitch: 1.08,
      rate: 0.95,
      roleEs: "Co-protagonista amable y cálida que acompaña a Jeff y anima a todo el equipo."
    },
    THORWALD: {
      id: "THORWALD",
      name: "Thorwald",
      shortName: "Thorwald",
      actors: "Martina Mendieta / Maria Antonia Ortega",
      avatar: "🕵️",
      color: "#6366f1",
      bgLight: "#eef2ff",
      voiceGender: "female",
      pitch: 0.85,
      rate: 0.9,
      roleEs: "Interpreta al villano de la película. Finge ser muy rudo, pero en el fondo está nervioso por su primera gran escena."
    },
    DETECTIVE: {
      id: "DETECTIVE",
      name: "Detective",
      shortName: "Detective",
      actors: "Juan Antonio Diaz / Lorenzo Arango",
      avatar: "🔎",
      color: "#10b981",
      bgLight: "#ecfdf5",
      voiceGender: "male",
      pitch: 0.95,
      rate: 0.98,
      roleEs: "Actor divertido y rápido que practica su caminata de tipo duro y ayuda con el humor."
    },
    MISS_LONELYHEARTS: {
      id: "MISS_LONELYHEARTS",
      name: "Miss Lonelyhearts",
      shortName: "Miss Lonelyhearts",
      actors: "Sara S. Bohorquez / Maria Isabel Velasquez",
      avatar: "🎭",
      color: "#e11d48",
      bgLight: "#fff1f2",
      voiceGender: "female",
      pitch: 1.05,
      rate: 0.9,
      roleEs: "Actriz sensible y empática que protagoniza la emotiva Escena 2 junto al Artista."
    },
    ARTIST: {
      id: "ARTIST",
      name: "Artist",
      shortName: "Artist",
      actors: "Tomas Alvarez / Sara L. Zapata",
      avatar: "🎨",
      color: "#d97706",
      bgLight: "#fef3c7",
      voiceGender: "male",
      pitch: 1.02,
      rate: 0.92,
      roleEs: "Toca un instrumento real y moldea arcilla en la obra. Demuestra que del error también nace el arte."
    },
    CAMERA_MAN: {
      id: "CAMERA_MAN",
      name: "Camera Man",
      shortName: "Camera Man",
      actors: "Geronimo Pedraza / Juan Esteban Martinez",
      avatar: "🎥",
      color: "#2563eb",
      bgLight: "#eff6ff",
      voiceGender: "male",
      pitch: 0.98,
      rate: 0.96,
      roleEs: "Maneja la cámara de cartón y la claqueta oficial antes de cada toma."
    },
    PROP_MASTER: {
      id: "PROP_MASTER",
      name: "Prop Master",
      shortName: "Prop Master",
      actors: "Martin Pedraza / Gabriela Manosalva",
      avatar: "🧰",
      color: "#ea580c",
      bgLight: "#fff7ed",
      voiceGender: "female",
      pitch: 1.1,
      rate: 0.96,
      roleEs: "Encargado de los objetos de utilería (maleta con piedras, arcilla, parlante de música, roca de la suerte)."
    },
    CAST: {
      id: "CAST",
      name: "All Cast / Characters",
      shortName: "Todo el Elenco",
      actors: "Todos los compañeros de 4° Grado",
      avatar: "🌟",
      color: "#7c3aed",
      bgLight: "#f3e8ff",
      voiceGender: "female",
      pitch: 1.05,
      rate: 0.95,
      roleEs: "Todos los actores hablando o bailando juntos en el escenario."
    },
    STAGE: {
      id: "STAGE",
      name: "Stage Direction",
      shortName: "Acción en Escena",
      actors: "Narración / Movimiento",
      avatar: "🎬",
      color: "#64748b",
      bgLight: "#f1f5f9",
      voiceGender: "female",
      pitch: 1.0,
      rate: 0.95,
      roleEs: "Indicaciones de lo que ocurre en el escenario (no se dice en voz alta, se actúa)."
    }
  },

  scenes: [
    {
      id: "scene-1",
      number: "Scene 1",
      title: "SCENE ONE: WELCOME TO STAGE 18 (Beginning)",
      titleEs: "Escena 1: Bienvenidos al Escenario 18 (Inicio)",
      summaryEs: "Estamos en los estudios Paramount en el verano de 1954. Todos se preparan para grabar. Luciana nota primero que las luces parpadean y luego tiene una conversación muy tierna y privada con Thorwald, quien está nervioso por hacer de villano.",
      hasLucianaLines: true,
      lucianaLineCount: 3
    },
    {
      id: "scene-2",
      number: "Scene 2",
      title: "SCENE TWO: THE ARTIST'S SONG (Rising Action)",
      titleEs: "Escena 2: La Canción del Artista",
      summaryEs: "El Artista toca una melodía suave y conversa con Miss Lonelyhearts sobre los recuerdos y el arte. Al cortar la escena, ocurre un pequeño caos divertido con el maquillaje, la arcilla y la cámara.",
      hasLucianaLines: false,
      lucianaLineCount: 0
    },
    {
      id: "scene-2-5",
      number: "Scene 2.5",
      title: "SCENE 2.5: THE PLAYLIST PROBLEM (Rising Action)",
      titleEs: "Escena 2.5: El Problema de la Lista de Música",
      summaryEs: "¡Hora de un descanso con música! Luciana (Assistant Director) y el Prop Master entran corriendo con un parlante portátil. Luciana pone la segunda canción de estilo rock, cabecea al ritmo de la música y opina sobre su energía.",
      hasLucianaLines: true,
      lucianaLineCount: 3
    },
    {
      id: "scene-3",
      number: "Scene 3",
      title: "SCENE THREE: THE VILLAIN'S FEAR (Climax)",
      titleEs: "Escena 3: El Miedo del Villano (Clímax)",
      summaryEs: "Es el momento de la escena más tensa. Thorwald se congela a mitad de su frase por miedo a que piensen que es malo en la vida real. Luciana se sienta a su lado y es la primera del equipo en consolarlo diciéndole que ella también tuvo miedo su primera vez.",
      hasLucianaLines: true,
      lucianaLineCount: 1
    },
    {
      id: "scene-4",
      number: "Scene 4",
      title: "SCENE FOUR: THE RELIEF (Falling Action)",
      titleEs: "Escena 4: El Alivio",
      summaryEs: "¡Thorwald logra hacer su escena perfectamente! Todos celebran, suena la canción favorita y hasta el villano termina bailando feliz.",
      hasLucianaLines: false,
      lucianaLineCount: 0
    },
    {
      id: "scene-5",
      number: "Finale",
      title: "FINALE: THE CURTAIN CALL (Resolution)",
      titleEs: "Gran Final: El Saludo Final (Resolución)",
      summaryEs: "Todo el elenco se forma en línea frente al público para compartir la moraleja de la obra. Luciana recuerda que cada trabajo importa, grande o pequeño, y luego todos juntos agradecen diciendo «Thank you all!».",
      hasLucianaLines: true,
      lucianaLineCount: 2
    }
  ],

  lines: [
    // ================= SCENE 1 =================
    {
      id: 1,
      sceneId: "scene-1",
      type: "dialogue",
      character: "CEREMONY_MASTER",
      emotion: "welcoming, big smile",
      emotionEs: "dando la bienvenida, con una gran sonrisa",
      en: "Good evening, everyone! Welcome to Stage 18 — well, our classroom's version of it! Tonight, our 4th graders take you behind the scenes of a real 1954 film shoot. Please welcome our cast!",
      es: "¡Buenas noches a todos! Bienvenidos al Escenario 18 — bueno, ¡la versión de nuestro salón de clases! Esta noche, nuestros estudiantes de 4° grado los llevarán detrás de cámaras de una grabación real de 1954. ¡Por favor denle la bienvenida a nuestro elenco!"
    },
    {
      id: 2,
      sceneId: "scene-1",
      type: "stage",
      character: "STAGE",
      en: "The DIRECTOR stands center with a cardboard megaphone. MAKEUP MASTER is powdering JEFF/JESSY's face. CAMERA MAN adjusts a cardboard camera. THORWALD and DETECTIVE stretch in the corner.",
      es: "El DIRECTOR está en el centro con un megáfono de cartón. MAKEUP MASTER le pone polvos en la cara a JEFF/JESSY. CAMERA MAN ajusta una cámara de cartón. THORWALD y DETECTIVE estiran en la esquina."
    },
    {
      id: 3,
      sceneId: "scene-1",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "loud, proud, arms wide",
      emotionEs: "fuerte, orgulloso, con los brazos abiertos",
      en: "Welcome to Stage 18, Paramount Studios! Summer, 1954! Biggest indoor set ever built! Don't break anything!",
      es: "¡Bienvenidos al Escenario 18, Estudios Paramount! ¡Verano de 1954! ¡El set bajo techo más grande jamás construido! ¡No rompan nada!"
    },
    {
      id: 4,
      sceneId: "scene-1",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 1,
      emotion: "worried, pointing up",
      emotionEs: "preocupada, señalando hacia arriba al techo",
      en: "Director! The lights are flickering!",
      es: "¡Director! ¡Las luces están parpadeando!",
      phonetic: "Di-rék-tor! De láits ar flí-ke-ring!",
      cueCharacter: "DIRECTOR",
      cueEn: "...Biggest indoor set ever built! Don't break anything!",
      cueEs: "Justo cuando el Director termina de decir «Don't break anything!» (¡No rompan nada!).",
      meaningContextEs: "Acabas de notar un problema técnico en el techo del estudio: las luces del escenario están fallando (encendiéndose y apagándose rápido) y debes avisarle urgente al Director.",
      actingTipEs: "Mira hacia el techo con cara de preocupación, señala hacia arriba con tu mano y habla con voz clara y urgente para que el Director te escuche.",
      keywords: [
        { word: "Director!", pron: "di-rék-tor", meaning: "¡Director!", tip: "Suena casi igual que en español, pon fuerza en 'rék'." },
        { word: "The lights", pron: "de láits", meaning: "Las luces", tip: "'ght' no suena; pronúncialo como 'láits'." },
        { word: "are flickering!", pron: "ar flí-ke-ring", meaning: "¡están parpadeando / titilando!", tip: "Significa que la luz tiembla o se apaga y prende rápido." }
      ],
      chunks: [
        { en: "Director!", es: "¡Director!", pron: "Di-rék-tor!" },
        { en: "The lights", es: "Las luces", pron: "De láits" },
        { en: "are flickering!", es: "¡están parpadeando!", pron: "ar flí-ke-ring!" }
      ]
    },
    {
      id: 5,
      sceneId: "scene-1",
      type: "dialogue",
      character: "LISA",
      emotion: "looking up, half-joking",
      emotionEs: "mirando hacia arriba, medio en broma",
      en: "Ooh, spooky! That actually looks kind of perfect for a mystery movie.",
      es: "¡Uuh, qué escalofriante! De hecho, eso se ve casi perfecto para una película de misterio."
    },
    {
      id: 6,
      sceneId: "scene-1",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "snapping fingers",
      emotionEs: "chasqueando los dedos",
      en: "Fix it! And find Thorwald's suitcase!",
      es: "¡Arréglenlo! ¡Y encuentren la maleta de Thorwald!"
    },
    {
      id: 7,
      sceneId: "scene-1",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "holding empty suitcase",
      emotionEs: "sosteniendo una maleta vacía",
      en: "I have it — but it's empty! ...Wait, I'll put rocks inside! Problem solved!",
      es: "¡La tengo — pero está vacía! ...¡Esperen, pondré piedras adentro! ¡Problema resuelto!"
    },
    {
      id: 8,
      sceneId: "scene-1",
      type: "dialogue",
      character: "DETECTIVE",
      emotion: "stretching, practicing a walk",
      emotionEs: "estirándose, practicando su caminata",
      en: "My tough-guy walk needs practice. Watch this!",
      es: "Mi caminata de tipo duro necesita práctica. ¡Miren esto!"
    },
    {
      id: 9,
      sceneId: "scene-1",
      type: "dialogue",
      character: "THORWALD",
      emotion: "chest out, flexing",
      emotionEs: "sacando pecho, sacando músculos",
      en: "Ha! I'm the scariest man in Hollywood! Nobody does menacing like me!",
      es: "¡Ja! ¡Soy el hombre más aterrador de Hollywood! ¡Nadie hace cara amenazante como yo!"
    },
    {
      id: 10,
      sceneId: "scene-1",
      type: "dialogue",
      character: "JEFF",
      emotion: "grinning, teasing",
      emotionEs: "sonriendo, bromeando",
      en: "Big words, Thorwald! Let's see it in the scene later.",
      es: "¡Grandes palabras, Thorwald! Vamos a verlo más tarde en la escena."
    },
    {
      id: 11,
      sceneId: "scene-1",
      type: "stage",
      character: "STAGE",
      en: "THORWALD laughs loudly — but his smile fades the moment he turns away.",
      es: "THORWALD se ríe fuerte — pero su sonrisa desaparece en el momento en que se da la vuelta."
    },
    {
      id: 12,
      sceneId: "scene-1",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 2,
      emotion: "quiet, private",
      emotionEs: "en voz baja, en privado con él",
      en: "You okay, Thorwald? You seem quiet all of a sudden.",
      es: "¿Estás bien, Thorwald? Pareces callado de repente.",
      phonetic: "Yú o-kéi, Tór-wald? Yú síim kuái-et ol of a sá-den.",
      cueCharacter: "JEFF",
      cueEn: "Big words, Thorwald! Let's see it in the scene later. (Thorwald laughs loudly, then his smile fades)",
      cueEs: "Después de que Jeff le dice «Let's see it in the scene later» y Thorwald se ríe fuerte pero se pone serio al darse la vuelta.",
      meaningContextEs: "Todos creen que Thorwald es muy presumido y valiente, pero tú eres muy observadora y notaste que cuando se dio la vuelta se puso triste y callado de golpe. Te acercas en privado para preguntarle cómo se siente.",
      actingTipEs: "Acércate a Thorwald con suavidad, hablando en un tono cálido y confidencial (que el público te escuche, pero actuando como si fuera un secreto entre ustedes dos).",
      keywords: [
        { word: "You okay", pron: "yú o-kéi", meaning: "¿Estás bien?", tip: "Forma corta y natural de decir 'Are you okay?'." },
        { word: "You seem", pron: "yú síim", meaning: "Pareces / Te ves", tip: "Alarga un poquito la 'i' en 'síim'." },
        { word: "quiet", pron: "kuái-et", meaning: "callado / silencioso", tip: "Dos sílabas suaves: kuái - et." },
        { word: "all of a sudden", pron: "ol of a sá-den", meaning: "de repente / de pronto", tip: "Es una expresión súper común en inglés que significa 'de un momento a otro'." }
      ],
      chunks: [
        { en: "You okay, Thorwald?", es: "¿Estás bien, Thorwald?", pron: "Yú o-kéi, Tór-wald?" },
        { en: "You seem quiet", es: "Pareces callado", pron: "Yú síim kuái-et" },
        { en: "all of a sudden.", es: "de repente.", pron: "ol of a sá-den." }
      ]
    },
    {
      id: 13,
      sceneId: "scene-1",
      type: "dialogue",
      character: "THORWALD",
      emotion: "dropping the act, honest",
      emotionEs: "dejando de fingir, sincero",
      en: "This is my first big villain scene. What if I'm not scary enough?",
      es: "Esta es mi primera gran escena de villano. ¿Qué pasa si no doy suficiente miedo?"
    },
    {
      id: 14,
      sceneId: "scene-1",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 3,
      emotion: "kind, hand on his shoulder",
      emotionEs: "amable, poniendo una mano en su hombro",
      en: "Being nervous doesn't mean you can't do it. Even brave people get scared sometimes.",
      es: "Estar nervioso no significa que no puedas hacerlo. Incluso las personas valientes sienten miedo a veces.",
      phonetic: "Bí-ing nér-vus dá-sent míin yú kánt dú it. Í-ven bréiv pí-pol guet skérd sám-taims.",
      cueCharacter: "THORWALD",
      cueEn: "This is my first big villain scene. What if I'm not scary enough?",
      cueEs: "Inmediatamente después de que Thorwald te confiesa: «What if I'm not scary enough?» (¿Qué pasa si no doy suficiente miedo?).",
      meaningContextEs: "Le das uno de los mensajes más bonitos de toda la obra: sentir nervios es normal y no le quita su talento. Hasta los más valientes sienten miedo.",
      actingTipEs: "Pon tu mano suavemente en el hombro de Thorwald, míralo con una sonrisa tierna y dile esta frase con calma y seguridad para darle confianza.",
      keywords: [
        { word: "Being nervous", pron: "bí-ing nér-vus", meaning: "Estar nervioso", tip: "'Being' suena 'bí-ing'." },
        { word: "doesn't mean", pron: "dá-sent míin", meaning: "no significa", tip: "Enfatiza 'dá-sent' con claridad." },
        { word: "you can't do it", pron: "yú kánt dú it", meaning: "que no puedas hacerlo", tip: "Une 'dú it' suavemente." },
        { word: "Even brave people", pron: "í-ven bréiv pí-pol", meaning: "Incluso la gente valiente", tip: "'Brave' (valiente) se dice 'bréiv'." },
        { word: "get scared sometimes", pron: "guet skérd sám-taims", meaning: "se asusta a veces", tip: "Cuidado con 'scared': empieza con 'sk', no 'es-k'." }
      ],
      chunks: [
        { en: "Being nervous", es: "Estar nervioso", pron: "Bí-ing nér-vus" },
        { en: "doesn't mean you can't do it.", es: "no significa que no puedas hacerlo.", pron: "dá-sent míin yú kánt dú it." },
        { en: "Even brave people", es: "Incluso las personas valientes", pron: "Í-ven bréiv pí-pol" },
        { en: "get scared sometimes.", es: "sienten miedo a veces.", pron: "guet skérd sám-taims." }
      ]
    },
    {
      id: 15,
      sceneId: "scene-1",
      type: "dialogue",
      character: "THORWALD",
      emotion: "forcing a smile, louder",
      emotionEs: "forzando una sonrisa, hablando más fuerte",
      en: "Right! Of course! Scariest man in Hollywood, remember?",
      es: "¡Cierto! ¡Por supuesto! El hombre más aterrador de Hollywood, ¿recuerdas?"
    },
    {
      id: 16,
      sceneId: "scene-1",
      type: "stage",
      character: "STAGE",
      en: "He walks off, not fully convinced. JEFF/JESSY, nearby with camera, quietly watches.",
      es: "Él se aleja caminando, no del todo convencido. JEFF/JESSY, cerca con la cámara, observa en silencio."
    },
    {
      id: 17,
      sceneId: "scene-1",
      type: "dialogue",
      character: "JEFF",
      emotion: "to self, thoughtful",
      emotionEs: "para sí mismo, pensativo",
      en: "Interesting... I should remember that.",
      es: "Interesante... Debería recordar eso."
    },
    {
      id: 18,
      sceneId: "scene-1",
      type: "dialogue",
      character: "MAKEUP_MASTER",
      emotion: "finishing touches",
      emotionEs: "dando los toques finales",
      en: "Hold still! Almost done — perfect for the close-up.",
      es: "¡Quédate quieto! Casi listo — perfecto para el primer plano."
    },
    {
      id: 19,
      sceneId: "scene-1",
      type: "dialogue",
      character: "MAKEUP_MASTER",
      emotion: "stepping back, satisfied",
      emotionEs: "dando un paso atrás, satisfecha",
      en: "There! Now you look ready for your close-up.",
      es: "¡Listo! Ahora te ves preparado para tu primer plano."
    },
    {
      id: 20,
      sceneId: "scene-1",
      type: "dialogue",
      character: "LISA",
      emotion: "warm, to JEFF/JESSY",
      emotionEs: "cálida, hablándole a JEFF/JESSY",
      en: "You'll be great. We're all here.",
      es: "Lo harás genial. Todos estamos aquí."
    },
    {
      id: 21,
      sceneId: "scene-1",
      type: "stage",
      character: "STAGE",
      en: "CAMERA MAN raises the clapperboard.",
      es: "CAMERA MAN levanta la claqueta."
    },
    {
      id: 22,
      sceneId: "scene-1",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "loud, official",
      emotionEs: "fuerte, con voz oficial",
      en: "Rear Window! Scene One, Take One!",
      es: "¡La Ventana Indiscreta! ¡Escena Uno, Toma Uno!"
    },
    {
      id: 23,
      sceneId: "scene-1",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "raising hand",
      emotionEs: "levantando la mano",
      en: "Places, everyone! ...And ACTION!",
      es: "¡A sus puestos, todos! ...¡Y ACCIÓN!"
    },
    {
      id: 24,
      sceneId: "scene-1",
      type: "stage",
      character: "STAGE",
      en: "FILM SCENE BEGINS. JEFF/JESSY sits in a wheelchair with binoculars. LISA stands behind.",
      es: "COMIENZA LA ESCENA DE LA PELÍCULA. JEFF/JESSY se sienta en una silla de ruedas con binoculares. LISA está de pie detrás."
    },
    {
      id: 25,
      sceneId: "scene-1",
      type: "dialogue",
      character: "JEFF",
      emotion: "acting, pointing",
      emotionEs: "actuando, señalando",
      en: "Look! Miss Lonelyhearts is crying again.",
      es: "¡Mira! La Señorita Corazones Solitarios está llorando otra vez."
    },
    {
      id: 26,
      sceneId: "scene-1",
      type: "dialogue",
      character: "LISA",
      emotion: "acting, scolding gently",
      emotionEs: "actuando, regañándolo suavemente",
      en: "You shouldn't spy on people!",
      es: "¡No deberías espiar a la gente!"
    },
    {
      id: 27,
      sceneId: "scene-1",
      type: "dialogue",
      character: "JEFF",
      emotion: "acting, defensive",
      emotionEs: "actuando, a la defensiva",
      en: "Spying? I'm a photographer! I observe!",
      es: "¿Espiando? ¡Soy fotógrafo! ¡Yo observo!"
    },
    {
      id: 28,
      sceneId: "scene-1",
      type: "dialogue",
      character: "THORWALD",
      emotion: "acting, confident",
      emotionEs: "actuando, confiado",
      en: "Is my hair scary enough for the close-up?",
      es: "¿Mi cabello da suficiente miedo para el primer plano?"
    },
    {
      id: 29,
      sceneId: "scene-1",
      type: "dialogue",
      character: "JEFF",
      emotion: "acting, suspicious",
      emotionEs: "actuando, sospechando",
      en: "Wait... what's Thorwald doing with that suitcase?",
      es: "Espera... ¿qué está haciendo Thorwald con esa maleta?"
    },
    {
      id: 30,
      sceneId: "scene-1",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "clapping once",
      emotionEs: "dando una palmada fuerte",
      en: "CUT!",
      es: "¡CORTE!"
    },

    // ================= SCENE 2 =================
    {
      id: 31,
      sceneId: "scene-2",
      type: "dialogue",
      character: "CEREMONY_MASTER",
      emotion: "warm, to audience",
      emotionEs: "cálida, dirigiéndose al público",
      en: "For this next scene, our Artist will really play — no pretending! Parents, listen closely, this song is for you too.",
      es: "Para esta siguiente escena, nuestro Artista tocará de verdad — ¡sin fingir! Papás, escuchen con atención, esta canción también es para ustedes."
    },
    {
      id: 32,
      sceneId: "scene-2",
      type: "stage",
      character: "STAGE",
      en: "LONELYHEARTS area is set up. ARTIST holds a real small instrument.",
      es: "El área de LONELYHEARTS está lista. ARTIST sostiene un instrumento pequeño real."
    },
    {
      id: 33,
      sceneId: "scene-2",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "clapperboard",
      emotionEs: "con la claqueta",
      en: "Scene Two, Take One!",
      es: "¡Escena Dos, Toma Uno!"
    },
    {
      id: 34,
      sceneId: "scene-2",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "gentle",
      emotionEs: "suave",
      en: "Scene Two. The artist and the lonely heart. ...ACTION!",
      es: "Escena Dos. El artista y el corazón solitario. ...¡ACCIÓN!"
    },
    {
      id: 35,
      sceneId: "scene-2",
      type: "stage",
      character: "STAGE",
      en: "FILM SCENE BEGINS. ARTIST really plays a slow, soft tune.",
      es: "COMIENZA LA ESCENA DE LA PELÍCULA. El ARTISTA toca de verdad una melodía lenta y suave."
    },
    {
      id: 36,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "crying softly",
      emotionEs: "llorando suavemente",
      en: "Please... stop. That song reminds me of what I lost.",
      es: "Por favor... detente. Esa canción me recuerda lo que perdí."
    },
    {
      id: 37,
      sceneId: "scene-2",
      type: "dialogue",
      character: "ARTIST",
      emotion: "stopping, gentle",
      emotionEs: "deteniéndose, amable",
      en: "I'm sorry. I didn't mean to make you cry.",
      es: "Lo siento. No quise hacerte llorar."
    },
    {
      id: 38,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "wiping eyes, small smile",
      emotionEs: "secándose las lágrimas, con una pequeña sonrisa",
      en: "It's not your fault. Memories just come back.",
      es: "No es tu culpa. Los recuerdos simplemente regresan."
    },
    {
      id: 39,
      sceneId: "scene-2",
      type: "dialogue",
      character: "ARTIST",
      emotion: "thoughtful",
      emotionEs: "pensativo",
      en: "Sometimes music brings out what we hide inside.",
      es: "A veces la música saca a la luz lo que escondemos por dentro."
    },
    {
      id: 40,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "curious",
      emotionEs: "curiosa",
      en: "What are you making?",
      es: "¿Qué estás haciendo?"
    },
    {
      id: 41,
      sceneId: "scene-2",
      type: "dialogue",
      character: "ARTIST",
      emotion: "proud, holding up clay — visible to audience",
      emotionEs: "orgulloso, levantando la arcilla para que el público la vea",
      en: "Look — something beautiful. Like you.",
      es: "Mira — algo hermoso. Como tú."
    },
    {
      id: 42,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "touched, hand to chest",
      emotionEs: "conmovida, llevándose la mano al pecho",
      en: "That's the kindest thing anyone has said to me in a long time.",
      es: "Eso es lo más amable que alguien me ha dicho en mucho tiempo."
    },
    {
      id: 43,
      sceneId: "scene-2",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "clapping, loud",
      emotionEs: "aplaudiendo, fuerte",
      en: "CUT! Beautiful!",
      es: "¡CORTE! ¡Hermoso!"
    },
    {
      id: 44,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "laughing",
      emotionEs: "riendo",
      en: "I couldn't stop crying! That song got to me!",
      es: "¡No podía dejar de llorar! ¡Esa canción me llegó al corazón!"
    },
    {
      id: 45,
      sceneId: "scene-2",
      type: "dialogue",
      character: "ARTIST",
      emotion: "laughing too",
      emotionEs: "riendo también",
      en: "I was trying to play happy music, but my fingers kept playing sad notes!",
      es: "¡Estaba intentando tocar música alegre, pero mis dedos seguían tocando notas tristes!"
    },
    {
      id: 46,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MAKEUP_MASTER",
      emotion: "rushing over with powder",
      emotionEs: "corriendo hacia ella con polvos de maquillaje",
      en: "Your tears ruined your makeup! Hold still!",
      es: "¡Tus lágrimas arruinaron tu maquillaje! ¡Quédate quieta!"
    },
    {
      id: 47,
      sceneId: "scene-2",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "worried",
      emotionEs: "preocupado",
      en: "My clay is drying out! I need more!",
      es: "¡Mi arcilla se está secando! ¡Necesito más!"
    },
    {
      id: 48,
      sceneId: "scene-2",
      type: "dialogue",
      character: "DETECTIVE",
      emotion: "helpful, jumping in",
      emotionEs: "servicial, saltando a ayudar",
      en: "I'll get clay from the prop room! Fastest runner here!",
      es: "¡Yo traeré arcilla del cuarto de utilería! ¡Aquí está el corredor más rápido!"
    },
    {
      id: 49,
      sceneId: "scene-2",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "catching a falling prop camera",
      emotionEs: "atrapando una cámara de utilería que se caía",
      en: "Got it! And I still got the emotional shot!",
      es: "¡La tengo! ¡Y aun así logré capturar la toma emotiva!"
    },
    {
      id: 50,
      sceneId: "scene-2",
      type: "dialogue",
      character: "LISA",
      emotion: "to JEFF/JESSY, noticing",
      emotionEs: "hablándole a JEFF/JESSY, notándolo pensativo",
      en: "You're quiet today. Just observing again?",
      es: "Estás callado hoy. ¿Solo observando otra vez?"
    },
    {
      id: 51,
      sceneId: "scene-2",
      type: "dialogue",
      character: "JEFF",
      emotion: "shrugging",
      emotionEs: "encogiéndose de hombros",
      en: "Just observing. That's what I do.",
      es: "Solo observando. Eso es lo que hago."
    },
    {
      id: 52,
      sceneId: "scene-2",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "gently",
      emotionEs: "con suavidad",
      en: "Sometimes observing isn't enough. Sometimes people need us to say something.",
      es: "A veces observar no es suficiente. A veces las personas necesitan que digamos algo."
    },

    // ================= SCENE 2.5 =================
    {
      id: 53,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "CEREMONY_MASTER",
      emotion: "playful, to audience",
      emotionEs: "juguetona, hablándole al público",
      en: "Uh oh — looks like there's a music problem on set! Parents, get ready... you might be asked to help solve it!",
      es: "Oh oh — ¡parece que hay un problema de música en el set! Papás, prepárense... ¡tal vez les pidamos ayuda para resolverlo!"
    },
    {
      id: 54,
      sceneId: "scene-2-5",
      type: "stage",
      character: "STAGE",
      isLucianaStage: true,
      en: "PROP MASTER and ASSISTANT DIRECTOR run in holding a portable speaker.",
      es: "PROP MASTER y ASSISTANT DIRECTOR (Luciana) entran corriendo sosteniendo un parlante portátil."
    },
    {
      id: 55,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "excited",
      emotionEs: "emocionado",
      en: "Director! We need music for the break! I have three ideas!",
      es: "¡Director! ¡Necesitamos música para el descanso! ¡Tengo tres ideas!"
    },
    {
      id: 56,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "impatient",
      emotionEs: "impaciente",
      en: "Fine. Play something.",
      es: "Está bien. Pon algo."
    },
    {
      id: 57,
      sceneId: "scene-2-5",
      type: "stage",
      character: "STAGE",
      en: "Trend/dance clip #1 plays — upbeat modern trend. Cast dances.",
      es: "Suena el clip musical #1 — ritmo moderno y alegre. El elenco baila."
    },
    {
      id: 58,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "covering ears, grumpy",
      emotionEs: "tapándose los oídos, gruñón",
      en: "NO! Too much noise! This is Hollywood, not Broadway!",
      es: "¡NO! ¡Demasiado ruido! ¡Esto es Hollywood, no Broadway!"
    },
    {
      id: 59,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "THORWALD",
      emotion: "arms crossed, stiff",
      emotionEs: "con los brazos cruzados, tieso",
      en: "Scary men don't dance.",
      es: "Los hombres aterradores no bailan."
    },
    {
      id: 60,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "DETECTIVE",
      emotion: "nudging him, grinning",
      emotionEs: "dándole un codazo amistoso, sonriendo",
      en: "Come on, Thorwald, live a little!",
      es: "¡Vamos, Thorwald, vive un poco!"
    },
    {
      id: 61,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "THORWALD",
      emotion: "firm",
      emotionEs: "firme",
      en: "No. I have a reputation.",
      es: "No. Tengo una reputación que cuidar."
    },
    {
      id: 62,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 4,
      emotion: "laughing, trying another",
      emotionEs: "riendo, probando otra canción en el parlante",
      en: "Okay — try this one!",
      es: "¡Está bien — prueben esta!",
      phonetic: "O-kéi — trái dís uán!",
      cueCharacter: "THORWALD",
      cueEn: "No. I have a reputation.",
      cueEs: "Justo después de que Thorwald cruza los brazos y dice serio: «No. I have a reputation.»",
      meaningContextEs: "Al Director no le gustó la primera canción y Thorwald dice que no quiere bailar. Entonces tú te ríes con buena actitud y cambias la pista en el parlante para probar la segunda opción.",
      actingTipEs: "Sonríe divertida, haz el gesto de presionar el botón del parlante portátil y dilo con mucha energía y entusiasmo.",
      keywords: [
        { word: "Okay", pron: "o-kéi", meaning: "Está bien / Bueno", tip: "Haz una pequeña pausa antes de decir 'try'." },
        { word: "try", pron: "trái", meaning: "prueben / intenten", tip: "Suena 'trái', con una 'r' suave inglesa." },
        { word: "this one!", pron: "dís uán", meaning: "¡esta! (esta canción)", tip: "'One' se pronuncia exactamente como 'uán'." }
      ],
      chunks: [
        { en: "Okay —", es: "Está bien —", pron: "O-kéi —" },
        { en: "try this one!", es: "¡prueben esta!", pron: "trái dís uán!" }
      ]
    },
    {
      id: 63,
      sceneId: "scene-2-5",
      type: "stage",
      character: "STAGE",
      isLucianaStage: true,
      en: "Trend/dance clip #2 plays — rock-style trend. Cast head-bangs / air-guitars.",
      es: "Suena el clip musical #2 — estilo rock. El elenco mueve la cabeza al ritmo del rock y toca guitarra de aire."
    },
    {
      id: 64,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 5,
      emotion: "nodding along",
      emotionEs: "asintiendo con la cabeza al ritmo de la música",
      en: "Hm... this has some style. Rough, but I like the energy.",
      es: "Mmm... esta tiene estilo. Es ruda, pero me gusta la energía.",
      phonetic: "Mmm... dís jas sám stái-ol. Ráf, bat ái láik di é-ner-yi.",
      cueCharacter: "STAGE",
      cueEn: "(Rock-style trend plays. Cast head-bangs / air-guitars)",
      cueEs: "Se dice justo después de que suena el clip #2 de rock y todos hacen guitarra de aire.",
      meaningContextEs: "Escuchas la canción de rock que acabas de poner. Te parece que suena un poco fuerte o ruda ('rough'), pero te encanta el ritmo y la energía que tiene.",
      actingTipEs: "Mueve la cabeza llevando el ritmo de la canción (nodding along), pon cara de experta musical diciendo «Hm...» y sonríe al decir «I like the energy».",
      keywords: [
        { word: "this has some style", pron: "dís jas sám stái-ol", meaning: "esta tiene estilo", tip: "Cuidado con 'style': empieza con 'st', no 'es-t'." },
        { word: "Rough", pron: "ráf", meaning: "Ruda / Fuerte / Áspera", tip: "¡Palabra clave! Aunque termina en 'gh', se pronuncia con 'f' al final: 'ráf'." },
        { word: "but I like", pron: "bat ái láik", meaning: "pero me gusta", tip: "Une 'bat ái láik' con fluidez." },
        { word: "the energy", pron: "di é-ner-yi", meaning: "la energía", tip: "La 'g' suena como 'y' o 'sh' suave: 'é-ner-yi'." }
      ],
      chunks: [
        { en: "Hm... this has some style.", es: "Mmm... esta tiene estilo.", pron: "Mmm... dís jas sám stái-ol." },
        { en: "Rough,", es: "Es ruda,", pron: "Ráf," },
        { en: "but I like the energy.", es: "pero me gusta la energía.", pron: "bat ái láik di é-ner-yi." }
      ]
    },
    {
      id: 65,
      sceneId: "scene-2-5",
      type: "stage",
      character: "STAGE",
      en: "THORWALD's foot taps despite himself — he catches it and stays stiff again.",
      es: "El pie de THORWALD sigue el ritmo sin querer — él se da cuenta y vuelve a ponerse tieso."
    },
    {
      id: 66,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "MAKEUP_MASTER",
      emotion: "exasperated, fixing someone's hair",
      emotionEs: "exasperada, arreglando el peinado de alguien",
      en: "Please don't sweat off all my hard work with this dancing!",
      es: "¡Por favor no arruinen con sudor todo mi trabajo duro por estar bailando!"
    },
    {
      id: 67,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "hopeful",
      emotionEs: "esperanzado",
      en: "One more! For everyone — even the parents!",
      es: "¡Una más! ¡Para todos — incluso los papás!"
    },
    {
      id: 68,
      sceneId: "scene-2-5",
      type: "stage",
      character: "STAGE",
      en: "Trend/dance clip #3 plays — classic crowd-favorite hit.",
      es: "Suena el clip musical #3 — un éxito clásico favorito de todo el público."
    },
    {
      id: 69,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "thrilled, standing",
      emotionEs: "emocionado, poniéndose de pie",
      en: "NOW we're talking! THIS is cinema! Everyone up — parents too!",
      es: "¡AHORA sí nos entendemos! ¡ESTO es cine! ¡Todos arriba — los papás también!"
    },
    {
      id: 70,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "LISA",
      emotion: "already dancing, laughing",
      emotionEs: "ya bailando, riendo",
      en: "This is my favorite one — come on, everybody!",
      es: "¡Esta es mi favorita — vamos, todo el mundo!"
    },
    {
      id: 71,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "CAST",
      isLuciana: true,
      isLucianaEnsemble: true,
      lucianaOrder: 6,
      emotion: "together, waving audience up",
      emotionEs: "todos juntos, animando con las manos al público a levantarse",
      en: "Come on, everyone! Dance with us!",
      es: "¡Vamos, todos! ¡Bailen con nosotros!",
      phonetic: "Kám on, é-vri-uán! Dáns uíd ás!",
      cueCharacter: "LISA",
      cueEn: "This is my favorite one — come on, everybody!",
      cueEs: "Justo después de que suena la canción #3 y Lisa dice emocionada: «This is my favorite one — come on, everybody!»",
      meaningContextEs: "¡Es el momento de fiesta en el set! Todo el elenco invita a los papás y al público a ponerse de pie y bailar juntos durante 30 segundos.",
      actingTipEs: "Mueve los brazos hacia arriba invitando a los papás del público a levantarse de sus sillas y grítalo con mucha alegría junto a todo tu salón.",
      keywords: [
        { word: "Come on", pron: "kám on", meaning: "¡Vamos! / ¡Anímense!", tip: "Únelo como una sola palabra energética: 'kámon'." },
        { word: "everyone!", pron: "é-vri-uán", meaning: "¡todos! / ¡todo el mundo!", tip: "Tres golpes de voz: é - vri - uán." },
        { word: "Dance with us!", pron: "dáns uíd ás", meaning: "¡Bailen con nosotros!", tip: "'Us' se pronuncia 'ás', no 'us'." }
      ],
      chunks: [
        { en: "Come on, everyone!", es: "¡Vamos, todos!", pron: "Kám on, é-vri-uán!" },
        { en: "Dance with us!", es: "¡Bailen con nosotros!", pron: "Dáns uíd ás!" }
      ]
    },
    {
      id: 72,
      sceneId: "scene-2-5",
      type: "stage",
      character: "STAGE",
      en: "Full cast + audience dance, ~30–45 seconds. THORWALD taps his foot, almost smiles — then crosses his arms when he notices someone watching.",
      es: "Todo el elenco y el público bailan durante 30–45 segundos. THORWALD mueve el pie, casi sonríe — y luego cruza los brazos cuando nota que alguien lo mira."
    },
    {
      id: 73,
      sceneId: "scene-2-5",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "catching breath, delighted",
      emotionEs: "recuperando el aliento, encantado",
      en: "Alright — back to work! But we're keeping that song for the ending!",
      es: "¡Muy bien — de vuelta al trabajo! ¡Pero nos quedamos con esa canción para el final!"
    },

    // ================= SCENE 3 =================
    {
      id: 74,
      sceneId: "scene-3",
      type: "dialogue",
      character: "CEREMONY_MASTER",
      emotion: "voice lower, serious",
      emotionEs: "bajando la voz, seria",
      en: "Now, the mood on set is about to change. This next scene is the big one — the one every actor fears and dreams about. Watch closely.",
      es: "Ahora, el ambiente en el set está a punto de cambiar. Esta siguiente escena es la grande — la que todo actor teme y sueña con hacer. Observen con atención."
    },
    {
      id: 75,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "High-tension lighting. Before the scene starts, THORWALD stands alone, breathing hard.",
      es: "Iluminación de alta tensión. Antes de que comience la escena, THORWALD está solo, respirando profundo."
    },
    {
      id: 76,
      sceneId: "scene-3",
      type: "dialogue",
      character: "THORWALD",
      emotion: "alone, scared",
      emotionEs: "solo, asustado",
      en: "This is it... What if I'm too scary and everyone thinks I'm mean for real?",
      es: "Llegó el momento... ¿Qué pasa si doy demasiado miedo y todos piensan que soy malo en la vida real?"
    },
    {
      id: 77,
      sceneId: "scene-3",
      type: "dialogue",
      character: "JEFF",
      emotion: "noticing, calm — a role reversal from earlier",
      emotionEs: "notándolo, calmado — cambiando los papeles de antes",
      en: "Thorwald? You don't have to pretend with me — I saw you dancing earlier. You're not that scary. And if you mess up, we help you. That's what we do here.",
      es: "¿Thorwald? No tienes que fingir conmigo — te vi bailando hace rato. No das tanto miedo. Y si te equivocas, te ayudamos. Eso es lo que hacemos aquí."
    },
    {
      id: 78,
      sceneId: "scene-3",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "excited, raising board",
      emotionEs: "emocionado, levantando la claqueta",
      en: "Can I call it this time, Director?",
      es: "¿Puedo dar la orden esta vez, Director?"
    },
    {
      id: 79,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "DIRECTOR nods, amused.",
      es: "El DIRECTOR asiente con la cabeza, divertido."
    },
    {
      id: 80,
      sceneId: "scene-3",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "thrilled, official voice",
      emotionEs: "emocionado, con voz oficial",
      en: "Scene Three, Take One! ...ACTION!",
      es: "¡Escena Tres, Toma Uno! ...¡ACCIÓN!"
    },
    {
      id: 81,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "FILM SCENE BEGINS. JEFF/JESSY is alone, watching THORWALD'S window. THORWALD stands menacingly in shadow.",
      es: "COMIENZA LA ESCENA DE LA PELÍCULA. JEFF/JESSY está solo, mirando la ventana de THORWALD. THORWALD está de pie amenazante en la sombra."
    },
    {
      id: 82,
      sceneId: "scene-3",
      type: "dialogue",
      character: "THORWALD",
      emotion: "slow, threatening",
      emotionEs: "lento, amenazante",
      en: "You've been watching me.",
      es: "Me has estado observando."
    },
    {
      id: 83,
      sceneId: "scene-3",
      type: "dialogue",
      character: "JEFF",
      emotion: "voice shaking, acting scared",
      emotionEs: "con voz temblorosa, actuando asustado",
      en: "I know what you did.",
      es: "Sé lo que hiciste."
    },
    {
      id: 84,
      sceneId: "scene-3",
      type: "dialogue",
      character: "THORWALD",
      emotion: "looming, reaching out",
      emotionEs: "acercándose imponente, estirando el brazo",
      en: "Then... you must be SIL—",
      es: "Entonces... debes ser SILEN—"
    },
    {
      id: 85,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "THORWALD freezes mid-line. His hand stays raised. He cannot finish.",
      es: "THORWALD se congela a mitad de la frase. Su mano queda levantada. No puede terminar."
    },
    {
      id: 86,
      sceneId: "scene-3",
      type: "dialogue",
      character: "THORWALD",
      emotion: "breaking character, real fear",
      emotionEs: "saliéndose del personaje, con miedo real",
      en: "I... I can't. I'm sorry. What if they think I'm mean in real life too?",
      es: "Yo... no puedo. Lo siento. ¿Qué pasa si piensan que soy malo en la vida real también?"
    },
    {
      id: 87,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "Everyone stops. Silence. Backstage and play collide.",
      es: "Todos se detienen. Silencio. El detrás de cámaras y la película se unen."
    },
    {
      id: 88,
      sceneId: "scene-3",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "soft, kneeling to his level",
      emotionEs: "suave, arrodillándose a su altura",
      en: "Cut... it's okay, Thorwald. Take a breath.",
      es: "Corte... está bien, Thorwald. Respira profundo."
    },
    {
      id: 89,
      sceneId: "scene-3",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 7,
      emotion: "sitting beside him",
      emotionEs: "sentándose a su lado",
      en: "I was scared my first time too. Everyone gets scared sometimes. That's normal.",
      es: "Yo también tuve miedo mi primera vez. Todo el mundo siente miedo a veces. Eso es normal.",
      phonetic: "Ái uás skérd mái férst táim túu. É-vri-uán guets skérd sám-taims. Dáts nór-mal.",
      cueCharacter: "DIRECTOR",
      cueEn: "Cut... it's okay, Thorwald. Take a breath.",
      cueEs: "Justo después de que el Director se arrodilla y dice con voz suave: «Cut... it's okay, Thorwald. Take a breath.»",
      meaningContextEs: "Thorwald se paralizó frente a todos y siente mucha vergüenza y miedo. Después de que el Director pide calma, tú te sientas junto a Thorwald y le cuentas que a ti también te dio miedo tu primera vez, haciéndolo sentir acompañado y comprendido.",
      actingTipEs: "Siéntate al lado de Thorwald con mucha ternura, míralo a los ojos y háblale como una gran amiga que lo entiende de corazón.",
      keywords: [
        { word: "I was scared", pron: "ái uás skérd", meaning: "Yo tuve miedo / estaba asustada", tip: "Recuerda empezar 'scared' con sonido 'sk'." },
        { word: "my first time too", pron: "mái férst táim túu", meaning: "mi primera vez también", tip: "'First' se pronuncia 'férst'." },
        { word: "Everyone gets scared", pron: "é-vri-uán guets skérd", meaning: "Todos sienten miedo", tip: "Tres sílabas claras en 'é-vri-uán'." },
        { word: "That's normal", pron: "dáts nór-mal", meaning: "Eso es normal", tip: "Muy parecido al español, cierra con una sonrisa tranquilizadora." }
      ],
      chunks: [
        { en: "I was scared", es: "Yo tuve miedo", pron: "Ái uás skérd" },
        { en: "my first time too.", es: "mi primera vez también.", pron: "mái férst táim túu." },
        { en: "Everyone gets scared sometimes.", es: "Todos sienten miedo a veces.", pron: "É-vri-uán guets skérd sám-taims." },
        { en: "That's normal.", es: "Eso es normal.", pron: "Dáts nór-mal." }
      ]
    },
    {
      id: 90,
      sceneId: "scene-3",
      type: "dialogue",
      character: "MAKEUP_MASTER",
      emotion: "gentle",
      emotionEs: "amable",
      en: "Being scary in a play doesn't make you scary in real life. You are ready.",
      es: "Dar miedo en una obra no te hace aterrador en la vida real. Estás listo."
    },
    {
      id: 91,
      sceneId: "scene-3",
      type: "dialogue",
      character: "LISA",
      emotion: "kneeling too, warm",
      emotionEs: "arrodillándose también, cálida",
      en: "I've watched you rehearse. You are brave, Thorwald.",
      es: "Te he visto ensayar. Eres valiente, Thorwald."
    },
    {
      id: 92,
      sceneId: "scene-3",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "holding out a small rock",
      emotionEs: "entregándole una piedrita",
      en: "Take my lucky rock! It gives you courage!",
      es: "¡Toma mi piedra de la suerte! ¡Te da valentía!"
    },
    {
      id: 93,
      sceneId: "scene-3",
      type: "dialogue",
      character: "DETECTIVE",
      emotion: "grinning, lightening the mood",
      emotionEs: "sonriendo, aligerando el ambiente",
      en: "And hey — I forgot my line twice today! You don't see me crying!",
      es: "Y oye — ¡hoy olvidé mi línea dos veces! ¡Y no me ves llorando!"
    },
    {
      id: 94,
      sceneId: "scene-3",
      type: "dialogue",
      character: "ARTIST",
      emotion: "holding up the clay shape",
      emotionEs: "levantando la figura de arcilla",
      en: "Look — I made a horse. It looked like a potato at first. I messed up. I kept going. That's what art is!",
      es: "Mira — hice un caballo. Al principio parecía una papa. Me equivoqué. Seguí adelante. ¡De eso se trata el arte!"
    },
    {
      id: 95,
      sceneId: "scene-3",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "sitting with him",
      emotionEs: "sentándose con él",
      en: "I've dropped my camera three times today. We all make mistakes. But we get back up.",
      es: "Hoy se me ha caído la cámara tres veces. Todos cometemos errores. Pero nos volvemos a levantar."
    },
    {
      id: 96,
      sceneId: "scene-3",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "gentle, sincere",
      emotionEs: "suave, sincera",
      en: "We are all here for you, Thorwald. On a film set, everyone matters.",
      es: "Todos estamos aquí para ti, Thorwald. En un set de cine, todos importan."
    },
    {
      id: 97,
      sceneId: "scene-3",
      type: "dialogue",
      character: "JEFF",
      emotion: "kneeling closer, gentle",
      emotionEs: "arrodillándose más cerca, amable",
      en: "You don't have to BE scary, Thorwald. Just play scary. We're still friends after.",
      es: "No tienes que SER aterrador, Thorwald. Solo juega a dar miedo. Después seguimos siendo amigos."
    },
    {
      id: 98,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "Everyone laughs softly. THORWALD breathes, stands, holds the lucky rock tight.",
      es: "Todos ríen suavemente. THORWALD respira, se pone de pie y aprieta fuerte la piedra de la suerte."
    },
    {
      id: 99,
      sceneId: "scene-3",
      type: "dialogue",
      character: "THORWALD",
      emotion: "quiet but steady, standing",
      emotionEs: "tranquilo pero firme, de pie",
      en: "Okay. I'm ready. Let's try again.",
      es: "Está bien. Estoy listo. Intentémoslo de nuevo."
    },
    {
      id: 100,
      sceneId: "scene-3",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "proud",
      emotionEs: "orgulloso",
      en: "Scene Three, Take Two! ...ACTION!",
      es: "¡Escena Tres, Toma Dos! ...¡ACCIÓN!"
    },
    {
      id: 101,
      sceneId: "scene-3",
      type: "stage",
      character: "STAGE",
      en: "FILM SCENE RESUMES. This time THORWALD holds strong.",
      es: "SE REANUDA LA ESCENA DE LA PELÍCULA. Esta vez THORWALD se mantiene firme."
    },
    {
      id: 102,
      sceneId: "scene-3",
      type: "dialogue",
      character: "THORWALD",
      emotion: "finding his voice, controlled",
      emotionEs: "encontrando su voz, con control",
      en: "Then... you must be SILENCED!",
      es: "Entonces... ¡debes ser SILENCIADO!"
    },
    {
      id: 103,
      sceneId: "scene-3",
      type: "dialogue",
      character: "JEFF",
      emotion: "loud, brave, genuinely reacting",
      emotionEs: "fuerte, valiente, reaccionando con emoción real",
      en: "HELP! POLICE! HELP!",
      es: "¡AYUDA! ¡POLICÍA! ¡AYUDA!"
    },
    {
      id: 104,
      sceneId: "scene-3",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "jumping up, thrilled",
      emotionEs: "saltando de emoción",
      en: "CUT! CUT! PERFECT!",
      es: "¡CORTE! ¡CORTE! ¡PERFECTO!"
    },

    // ================= SCENE 4 =================
    {
      id: 105,
      sceneId: "scene-4",
      type: "stage",
      character: "STAGE",
      en: "Everyone cheers for THORWALD. He looks stunned, then breaks into a real smile.",
      es: "Todos aplauden y celebran a THORWALD. Él se ve sorprendido y luego sonríe de verdad."
    },
    {
      id: 106,
      sceneId: "scene-4",
      type: "dialogue",
      character: "THORWALD",
      emotion: "laughing, relieved",
      emotionEs: "riendo, aliviado",
      en: "I did it! I actually did it!",
      es: "¡Lo hice! ¡De verdad lo logré!"
    },
    {
      id: 107,
      sceneId: "scene-4",
      type: "dialogue",
      character: "LISA",
      emotion: "teasing, nudging him",
      emotionEs: "bromeando, dándole un suave codazo",
      en: "See? Rehearsal pays off!",
      es: "¿Ves? ¡Ensayar vale la pena!"
    },
    {
      id: 108,
      sceneId: "scene-4",
      type: "stage",
      character: "STAGE",
      en: "The classic song from the Playlist Problem starts softly. THORWALD taps his foot, then finally gives in and dances a little, laughing at himself.",
      es: "La canción clásica del Problema de la Lista de Música empieza a sonar suavemente. THORWALD lleva el ritmo con el pie, y finalmente se anima a bailar un poco, riéndose de sí mismo."
    },
    {
      id: 109,
      sceneId: "scene-4",
      type: "dialogue",
      character: "DETECTIVE",
      emotion: "pointing, delighted",
      emotionEs: "señalándolo, encantado",
      en: "HA! Scary women DO dance!",
      es: "¡JA! ¡Las mujeres aterradoras SÍ bailan!"
    },
    {
      id: 110,
      sceneId: "scene-4",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "happy, clapping",
      emotionEs: "feliz, aplaudiendo",
      en: "Best take of the whole day, if you ask me!",
      es: "¡La mejor toma de todo el día, si me preguntan!"
    },
    {
      id: 111,
      sceneId: "scene-4",
      type: "dialogue",
      character: "JEFF",
      emotion: "camera down, grinning",
      emotionEs: "bajando la cámara, sonriendo",
      en: "Told you. Not so scary after all.",
      es: "Te lo dije. No eras tan aterrador después de todo."
    },
    {
      id: 112,
      sceneId: "scene-4",
      type: "dialogue",
      character: "CEREMONY_MASTER",
      emotion: "smiling, relieved",
      emotionEs: "sonriendo, aliviada",
      en: "What a day on set! Mistakes, songs, fear, and courage — sounds like real Hollywood to me. Let's see how it all wraps up.",
      es: "¡Qué gran día en el set! Errores, canciones, miedo y valentía — para mí suena como el verdadero Hollywood. Veamos cómo termina todo."
    },

    // ================= SCENE 5 (FINALE) =================
    {
      id: 113,
      sceneId: "scene-5",
      type: "stage",
      character: "STAGE",
      en: "Cast gathers in a line, facing the audience.",
      es: "El elenco se reúne en una fila, mirando hacia el público."
    },
    {
      id: 114,
      sceneId: "scene-5",
      type: "dialogue",
      character: "MISS_LONELYHEARTS",
      emotion: "warm",
      emotionEs: "cálida",
      en: "On a film set, everyone matters.",
      es: "En un set de cine, todos importan."
    },
    {
      id: 115,
      sceneId: "scene-5",
      type: "dialogue",
      character: "ARTIST",
      emotion: "nodding",
      emotionEs: "asintiendo",
      en: "When one person is scared, we lift them up. When one falls, we help them stand.",
      es: "Cuando una persona tiene miedo, la animamos. Cuando alguien cae, lo ayudamos a levantarse."
    },
    {
      id: 116,
      sceneId: "scene-5",
      type: "dialogue",
      character: "THORWALD",
      emotion: "genuine, no more bravado",
      emotionEs: "sincero, ya sin presumir",
      en: "Even villains get scared sometimes. Real bravery is trying anyway.",
      es: "Incluso los villanos sienten miedo a veces. La verdadera valentía es intentarlo de todos modos."
    },
    {
      id: 117,
      sceneId: "scene-5",
      type: "dialogue",
      character: "CAMERA_MAN",
      emotion: "to audience",
      emotionEs: "hacia el público",
      en: "That's what Rear Window was really about. Not just a mystery — people working together.",
      es: "De eso se trataba realmente La Ventana Indiscreta. No solo de un misterio — sino de personas trabajando juntas."
    },
    {
      id: 118,
      sceneId: "scene-5",
      type: "dialogue",
      character: "MAKEUP_MASTER",
      emotion: "smiling",
      emotionEs: "sonriendo",
      en: "And helping each other look — and feel — their best.",
      es: "Y ayudándonos unos a otros a vernos — y sentirnos — lo mejor posible."
    },
    {
      id: 119,
      sceneId: "scene-5",
      type: "dialogue",
      character: "ASSISTANT_DIRECTOR",
      isLuciana: true,
      lucianaOrder: 8,
      emotion: "nodding",
      emotionEs: "asintiendo con la cabeza y sonriendo al público",
      en: "Every job matters here, big or small.",
      es: "Cada trabajo importa aquí, grande o pequeño.",
      phonetic: "É-vri yób má-ters jíer, bíg or smól.",
      cueCharacter: "MAKEUP_MASTER",
      cueEn: "And helping each other look — and feel — their best.",
      cueEs: "En la fila final frente al público, justo después de que Makeup Master dice: «And helping each other look — and feel — their best.»",
      meaningContextEs: "En el mensaje final al público, tú representas el trabajo en equipo detrás de cámaras: tanto el director o los actores principales como quienes cuidan las luces, el maquillaje o la utilería son igual de importantes.",
      actingTipEs: "De pie en la fila mirando a los papás en el público, asiente con orgullo y proyecta tu voz fuerte y clara.",
      keywords: [
        { word: "Every job", pron: "é-vri yób", meaning: "Cada trabajo", tip: "'Job' suena 'yób' con una 'o' abierta." },
        { word: "matters here", pron: "má-ters jíer", meaning: "importa aquí", tip: "'Matters' significa 'importa' o 'vale mucho'." },
        { word: "big or small", pron: "bíg or smól", meaning: "grande o pequeño", tip: "En 'small', no digas 'es-mól', empieza directo con 'smól'." }
      ],
      chunks: [
        { en: "Every job", es: "Cada trabajo", pron: "É-vri yób" },
        { en: "matters here,", es: "importa aquí,", pron: "má-ters jíer," },
        { en: "big or small.", es: "grande o pequeño.", pron: "bíg or smól." }
      ]
    },
    {
      id: 120,
      sceneId: "scene-5",
      type: "dialogue",
      character: "LISA",
      emotion: "warm",
      emotionEs: "cálida",
      en: "Even the smallest kindness makes a difference.",
      es: "Incluso el gesto más pequeño de amabilidad hace la diferencia."
    },
    {
      id: 121,
      sceneId: "scene-5",
      type: "dialogue",
      character: "PROP_MASTER",
      emotion: "smiling",
      emotionEs: "sonriendo",
      en: "Because in the end, the magic isn't on the screen. The magic is here — in the chaos, the laughter, the teamwork.",
      es: "Porque al final, la magia no está en la pantalla. La magia está aquí — en el caos, las risas y el trabajo en equipo."
    },
    {
      id: 122,
      sceneId: "scene-5",
      type: "dialogue",
      character: "DETECTIVE",
      emotion: "grinning",
      emotionEs: "sonriendo",
      en: "And the dancing. Don't forget the dancing!",
      es: "Y el baile. ¡No olviden el baile!"
    },
    {
      id: 123,
      sceneId: "scene-5",
      type: "dialogue",
      character: "JEFF",
      emotion: "proud",
      emotionEs: "orgulloso",
      en: "And sometimes, watching isn't enough — you have to step in and help. That's the bravest thing.",
      es: "Y a veces, mirar no es suficiente — tienes que dar un paso al frente y ayudar. Eso es lo más valiente."
    },
    {
      id: 124,
      sceneId: "scene-5",
      type: "dialogue",
      character: "DIRECTOR",
      emotion: "proud, to the whole cast",
      emotionEs: "orgulloso, hablándole a todo el elenco",
      en: "Everyone — that's a wrap! Great work, all of you!",
      es: "Todos — ¡terminamos el rodaje! ¡Gran trabajo de todos ustedes!"
    },
    {
      id: 125,
      sceneId: "scene-5",
      type: "dialogue",
      character: "CAST",
      isLuciana: true,
      isLucianaEnsemble: true,
      lucianaOrder: 9,
      emotion: "together, arms wide",
      emotionEs: "todos juntos al mismo tiempo, abriendo los brazos",
      en: "Thank you all!",
      es: "¡Gracias a todos!",
      phonetic: "Zánk yú óol!",
      cueCharacter: "DIRECTOR",
      cueEn: "Everyone — that's a wrap! Great work, all of you!",
      cueEs: "Al final, cuando el Director grita «Everyone — that's a wrap! Great work, all of you!», todos abren los brazos y gritan juntos.",
      meaningContextEs: "¡El cierre triunfal de la obra! Todo el salón agradece al público antes de hacer la venia final y ponerse a bailar con burbujas o confeti.",
      actingTipEs: "Abre grande tus brazos con una gran sonrisa hacia tu familia y amigos en el público y dilo con toda tu alegría junto a tus compañeros.",
      keywords: [
        { word: "Thank you", pron: "zánk yú", meaning: "Gracias", tip: "Pon la punta de la lengua entre los dientes para el sonido 'th'." },
        { word: "all!", pron: "óol", meaning: "¡a todos!", tip: "Alarga el sonido final con alegría." }
      ],
      chunks: [
        { en: "Thank you all!", es: "¡Gracias a todos!", pron: "Zánk yú óol!" }
      ]
    },
    {
      id: 126,
      sceneId: "scene-5",
      type: "stage",
      character: "STAGE",
      en: "All cast bow together. Song #3 from the Playlist Problem plays again — bubbles or confetti fall, given to parents — and everyone, cast and audience, dances and waves together.",
      es: "Todo el elenco hace una reverencia junto. La canción #3 vuelve a sonar — caen burbujas o confeti — y todos, elenco y público, bailan y saludan juntos."
    },
    {
      id: 127,
      sceneId: "scene-5",
      type: "dialogue",
      character: "CEREMONY_MASTER",
      emotion: "proud, to audience",
      emotionEs: "orgullosa, al público",
      en: "And that's a wrap! Thank you for watching our 4th graders bring Hollywood to our classroom. Let's give them one more round of applause!",
      es: "¡Y eso es todo! Gracias por ver a nuestros niños de 4° grado traer Hollywood a nuestro salón. ¡Démosles un fuerte aplauso más!"
    }
  ]
};
