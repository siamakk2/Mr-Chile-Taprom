/**
 * Guides.
 *
 * Four pieces that answer a question somebody actually types before they are
 * ready to book anything. The test each one has to pass: would this still be
 * worth reading if the taproom were not mentioned in it?
 *
 * Content is data, not markup, so both languages render from one shape and a
 * missing translation is impossible to ship.
 */

export const GUIDES = [
  // ==========================================================================
  {
    slug: { en: 'cumbia-for-beginners', es: 'cumbia-para-principiantes' },
    date: '2026-08-29',
    title: {
      en: 'How to Learn Cumbia in Sonoma County (When You Have Never Danced)',
      es: 'Cómo aprender cumbia en el condado de Sonoma (sin haber bailado nunca)',
    },
    metaTitle: {
      en: 'Learn Cumbia in Sonoma County | Beginner Guide',
      es: 'Aprende cumbia en el condado de Sonoma | Guía',
    },
    description: {
      en: 'What cumbia actually is, the one basic step, whether you need a partner, what to wear, and where to learn it in Santa Rosa. Written for people who have never danced.',
      es: 'Qué es la cumbia, el paso básico, si necesitas pareja, qué ponerte y dónde aprenderla en Santa Rosa. Para quien nunca ha bailado.',
    },
    lede: {
      en: 'The honest answer to "can I just turn up?" is yes — and here is what actually happens when you do.',
      es: 'La respuesta honesta a "¿puedo llegar y ya?" es sí — y esto es lo que realmente pasa cuando llegas.',
    },
    sections: [
      {
        h: { en: 'What cumbia is, briefly', es: 'Qué es la cumbia, en corto' },
        p: {
          en: ['Cumbia began on the Caribbean coast of Colombia and travelled. Mexico made it its own, and so did Peru, Argentina and Texas — which is why cumbia at a Santa Rosa taproom can sound like an accordion, a synthesiser or a wall of speakers, depending on the night.',
               'For a dancer, the useful part is that the rhythm is in four, the tempo is forgiving, and the basic step is a weight shift rather than a pattern to memorise. That is why it is the social dance people learn fastest.'],
          es: ['La cumbia nació en la costa caribeña de Colombia y viajó. México la hizo suya, y también Perú, Argentina y Texas — por eso la cumbia en un taproom de Santa Rosa puede sonar a acordeón, a sintetizador o a una pared de bocinas, según la noche.',
               'Para quien baila, lo útil es que el ritmo va en cuatro, el tempo perdona, y el paso básico es un cambio de peso, no una coreografía que memorizar. Por eso es el baile social que la gente aprende más rápido.'],
        },
      },
      {
        h: { en: 'The basic step', es: 'El paso básico' },
        p: {
          en: ['Weight onto the right foot, then the left, then the right again, then pause. Repeat starting with the left. That is it. The pause is the part beginners rush; the music will wait for you.',
               'Everything else — the turns, the arm that guides, the drag of the back foot that gives cumbia its lean — is decoration on top of that shift. An hour of practice gets most people through a whole song without counting.'],
          es: ['Peso al pie derecho, luego al izquierdo, luego al derecho otra vez, y pausa. Repite empezando con el izquierdo. Ya está. La pausa es lo que los principiantes apuran; la música te espera.',
               'Todo lo demás — las vueltas, el brazo que guía, el arrastre del pie que le da a la cumbia su inclinación — es adorno sobre ese cambio de peso. Con una hora de práctica la mayoría aguanta una canción entera sin contar.'],
        },
      },
      {
        h: { en: 'Do you need a partner?', es: '¿Necesitas pareja?' },
        p: {
          en: ['No, and this is the question that keeps most people at home. A beginner class rotates partners precisely so that people who arrive alone are not left standing, and arriving alone is normal rather than conspicuous.',
               'If you do come with someone, you will probably still be rotated. Learning to follow three different leads in an hour teaches you more than an hour with one.'],
          es: ['No, y esta es la pregunta que mantiene a la mayoría en casa. Una clase para principiantes rota parejas justamente para que quien llega solo no se quede parado, y llegar solo es lo normal, no algo que resalte.',
               'Si vienes acompañado, probablemente también rotarás. Aprender a seguir a tres personas distintas en una hora enseña más que una hora con una sola.'],
        },
      },
      {
        h: { en: 'What to wear', es: 'Qué ponerte' },
        p: {
          en: ['Shoes that pivot. That is the only real requirement. A smooth sole turns on the ball of the foot; a rubber running shoe grips and will fight you, and after two hours your knees will mention it.',
               'Otherwise, whatever you would wear to a bar. Cumbia nights in Sonoma County are not dress-code events, and you will see boots, sneakers and heels on the same floor.'],
          es: ['Zapatos que giren. Ese es el único requisito real. Una suela lisa gira sobre la punta del pie; un tenis de goma se agarra y te va a pelear, y después de dos horas tus rodillas te lo van a decir.',
               'Por lo demás, lo que te pondrías para ir a un bar. Las noches de cumbia en el condado de Sonoma no son de código de vestimenta, y verás botas, tenis y tacones en la misma pista.'],
        },
      },
      {
        h: { en: 'Where to learn it locally', es: 'Dónde aprenderla aquí' },
        p: {
          en: ['Sonoma County has a small but real Latin social dance scene, and the most reliable way in is a class attached to a social night — you learn the step, then use it immediately, which is the only way it sticks.',
               'Mr. Chile Taproom runs Cumbia Rosa on the first Saturday of every month with Ritmo y Pasión Dance: a beginner class at 8:15pm with Maria and Rogelio, then DJ Edge until 2am. No partner, no experience, 21 and over.'],
          es: ['El condado de Sonoma tiene una escena de baile latino pequeña pero real, y la entrada más confiable es una clase pegada a una noche social — aprendes el paso y lo usas de inmediato, que es la única forma de que se quede.',
               'Mr. Chile Taproom hace Cumbia Rosa el primer sábado de cada mes con Ritmo y Pasión Dance: clase para principiantes a las 8:15pm con Maria y Rogelio, y después DJ Edge hasta las 2am. Sin pareja, sin experiencia, 21 y mayores.'],
        },
      },
    ],
    faq: [
      { q: { en: 'Is cumbia hard to learn?', es: '¿Es difícil aprender cumbia?' },
        a: { en: 'It is the easiest of the common Latin social dances to start. The basic step is a four-count weight shift with no footwork pattern to memorise, and most people can dance a full song after about an hour of instruction.',
             es: 'Es el más fácil de empezar entre los bailes latinos sociales. El paso básico es un cambio de peso en cuatro tiempos, sin coreografía que memorizar, y la mayoría baila una canción completa después de una hora de clase.' } },
      { q: { en: 'Can I go to a cumbia night alone?', es: '¿Puedo ir solo a una noche de cumbia?' },
        a: { en: 'Yes. Beginner classes rotate partners so people who come alone are paired up, and arriving alone is common at social dance nights.',
             es: 'Sí. Las clases para principiantes rotan parejas para que quien llega solo baile, y llegar solo es común en las noches de baile social.' } },
      { q: { en: 'What shoes should I wear to dance cumbia?', es: '¿Qué zapatos uso para bailar cumbia?' },
        a: { en: 'Anything with a smooth sole that lets you pivot. Avoid rubber-soled running shoes, which grip the floor and make turning hard on your knees.',
             es: 'Cualquier zapato de suela lisa que te deje girar. Evita tenis de suela de goma, que se agarran al piso y hacen que girar lastime las rodillas.' } },
    ],
    links: ['cumbia', 'events'],
  },

  // ==========================================================================
  {
    slug: { en: 'planning-a-quinceanera-in-santa-rosa', es: 'planear-una-quinceanera-en-santa-rosa' },
    date: '2026-08-29',
    title: {
      en: 'Planning a Quinceañera in Santa Rosa: A Practical Timeline',
      es: 'Planear una quinceañera en Santa Rosa: un calendario práctico',
    },
    metaTitle: {
      en: 'Planning a Quinceañera in Santa Rosa | Timeline & Costs',
      es: 'Planear una quinceañera en Santa Rosa | Calendario y costos',
    },
    description: {
      en: 'A month-by-month timeline for a Santa Rosa quinceañera, what drives the budget, how many guests a venue really holds, and the questions to ask before you put down a deposit.',
      es: 'Un calendario mes a mes para una quinceañera en Santa Rosa, qué mueve el presupuesto, cuánta gente cabe de verdad, y qué preguntar antes de dar un depósito.',
    },
    lede: {
      en: 'The two things that go wrong are booking the venue too late and counting the guest list too optimistically. Both are avoidable.',
      es: 'Las dos cosas que salen mal son reservar el salón demasiado tarde y contar la lista de invitados con demasiado optimismo. Las dos se evitan.',
    },
    sections: [
      {
        h: { en: 'Twelve to nine months out', es: 'De doce a nueve meses antes' },
        p: {
          en: ['Set the date and book the venue, in that order, and expect the venue to move the date. Saturdays in spring and summer go first in Sonoma County, and a Friday or Sunday can cost noticeably less for the same room.',
               'Decide roughly how many people before you tour anywhere. A room that seats 80 comfortably will hold 100 standing and 60 with a dance floor, and those are three different parties.'],
          es: ['Fija la fecha y reserva el salón, en ese orden, y cuenta con que el salón mueva la fecha. Los sábados de primavera y verano se van primero en el condado de Sonoma, y un viernes o domingo puede costar bastante menos por el mismo espacio.',
               'Decide más o menos cuánta gente antes de ir a ver lugares. Un salón donde caben 80 sentados aguanta 100 de pie y 60 con pista de baile, y esas son tres fiestas distintas.'],
        },
      },
      {
        h: { en: 'What actually drives the budget', es: 'Qué mueve de verdad el presupuesto' },
        p: {
          en: ['Food and headcount, in that order. Everything else — the dress, the flowers, the photographer — is close to fixed, while catering multiplies by every name you add. Cutting twenty guests usually saves more than cutting any single vendor.',
               'The second driver is alcohol, and the rules are not negotiable. A venue with its own licence handles it; a venue without one means a licensed bartender and permits, and in California you cannot simply bring your own for a large party.'],
          es: ['La comida y el número de invitados, en ese orden. Todo lo demás — el vestido, las flores, el fotógrafo — es casi fijo, mientras que el banquete se multiplica por cada nombre que agregas. Quitar veinte invitados normalmente ahorra más que quitar cualquier proveedor.',
               'Lo segundo es el alcohol, y ahí las reglas no se negocian. Un lugar con su propia licencia lo resuelve; uno sin licencia significa cantinero con permiso y trámites, y en California no puedes simplemente llevar el tuyo para una fiesta grande.'],
        },
      },
      {
        h: { en: 'Six months out', es: 'Seis meses antes' },
        p: {
          en: ['Court, music and dress. The waltz and the surprise dance need real rehearsal time, and fourteen-year-olds have school schedules — booking a choreographer late is the most common reason the dance is cut on the day.',
               'Book the DJ or band now too. If you want live cumbia or a sonidero rather than a playlist, the good ones in Sonoma County are booked months ahead, particularly for Saturdays.'],
          es: ['Chambelanes, música y vestido. El vals y el baile sorpresa necesitan ensayo de verdad, y los de catorce años tienen escuela — contratar coreógrafo tarde es la razón más común de que el baile se cancele el mismo día.',
               'Aparta también al DJ o al grupo. Si quieres cumbia en vivo o un sonidero en lugar de una playlist, los buenos en el condado de Sonoma se apartan con meses, sobre todo para sábados.'],
        },
      },
      {
        h: { en: 'Questions to ask any venue', es: 'Qué preguntar en cualquier salón' },
        p: {
          en: ['Ask what time you get in, not what time the party starts — setup and decoration take longer than anyone plans. Ask what time you must be out, and what the overtime rate is.',
               'Ask whether the price includes tables, chairs, linens and staff, or whether those are rentals on top. Ask about the sound system and whether there is a noise limit or a hard stop. Ask about parking, because a hundred guests means fifty cars. And ask what happens if it rains on an outdoor space.'],
          es: ['Pregunta a qué hora puedes entrar, no a qué hora empieza la fiesta — montar y decorar toma más de lo que uno calcula. Pregunta a qué hora hay que salir, y cuánto cuesta la hora extra.',
               'Pregunta si el precio incluye mesas, sillas, manteles y personal, o si eso se renta aparte. Pregunta por el sonido y si hay límite de ruido u hora tope. Pregunta por el estacionamiento, porque cien invitados son cincuenta carros. Y pregunta qué pasa si llueve en un espacio al aire libre.'],
        },
      },
      {
        h: { en: 'Venues in Santa Rosa', es: 'Salones en Santa Rosa' },
        p: {
          en: ['Santa Rosa has banquet halls, wineries, community centres and bars that do buyouts, and they suit different parties. A hall gives you space and a blank canvas; a winery gives you the setting at a premium; a venue buyout gives you a room that already has a bar, a sound system and staff who run events every week.',
               'Mr. Chile Taproom books quinceañeras on the creekside patio, in the semi-private back room, or as a full venue buyout with stage, PA and projector. Bilingual staff, free parking on site, and a taco truck already out back.'],
          es: ['Santa Rosa tiene salones de banquetes, viñedos, centros comunitarios y bares que se rentan completos, y cada uno sirve para fiestas distintas. Un salón te da espacio y lienzo en blanco; un viñedo te da el entorno con precio alto; rentar un lugar completo te da un espacio que ya tiene barra, sonido y personal que hace eventos cada semana.',
               'Mr. Chile Taproom renta para quinceañeras en el patio junto al arroyo, en el salón trasero semiprivado, o el lugar completo con escenario, sonido y proyector. Personal bilingüe, estacionamiento gratis y una troca de tacos ya instalada atrás.'],
        },
      },
    ],
    faq: [
      { q: { en: 'How far in advance should you book a quinceañera venue?', es: '¿Con cuánta anticipación se aparta un salón para quinceañera?' },
        a: { en: 'Nine to twelve months for a Saturday in spring or summer, which is when demand peaks. Fridays, Sundays and the winter months are easier to book and often cost less.',
             es: 'De nueve a doce meses para un sábado de primavera o verano, cuando hay más demanda. Los viernes, domingos y los meses de invierno son más fáciles de apartar y suelen costar menos.' } },
      { q: { en: 'What is the biggest cost in a quinceañera?', es: '¿Cuál es el gasto más grande de una quinceañera?' },
        a: { en: 'Catering, because it scales with the guest list while most other costs are fixed. Reducing the guest count usually saves more than changing any single vendor.',
             es: 'El banquete, porque crece con la lista de invitados mientras casi todo lo demás es fijo. Reducir invitados normalmente ahorra más que cambiar cualquier proveedor.' } },
      { q: { en: 'Can you bring your own alcohol to a venue in California?', es: '¿Puedes llevar tu propio alcohol a un salón en California?' },
        a: { en: 'Usually not for a large private event. A venue with its own licence serves it directly; a venue without one generally requires a licensed bartender and the appropriate permit. Confirm with the venue before planning around it.',
             es: 'Normalmente no para un evento privado grande. Un lugar con licencia propia lo sirve directamente; uno sin licencia suele requerir cantinero con licencia y el permiso correspondiente. Confírmalo con el lugar antes de planear.' } },
    ],
    links: ['private', 'visit'],
  },

  // ==========================================================================
  {
    slug: { en: 'what-is-a-sonidero', es: 'que-es-un-sonidero' },
    date: '2026-08-29',
    title: {
      en: 'What Is a Sonidero? The Sound System Culture Behind the Night',
      es: '¿Qué es un sonidero? La cultura de sonido detrás de la noche',
    },
    metaTitle: {
      en: 'What Is a Sonidero? | Cumbia Sound System Culture',
      es: '¿Qué es un sonidero? | Cultura del sonido y la cumbia',
    },
    description: {
      en: 'A sonidero is not a DJ. An explanation of the saludos, the sound systems, the echo on the microphone, and why a sonidero night sounds nothing like a club.',
      es: 'Un sonidero no es un DJ. Explicación de los saludos, los equipos de sonido, el eco en el micrófono, y por qué una noche sonidera no suena como un club.',
    },
    lede: {
      en: 'If you have only ever been to a club night, the microphone will confuse you for about ten minutes. Then it will make complete sense.',
      es: 'Si sólo has ido a noches de club, el micrófono te va a confundir unos diez minutos. Después va a tener todo el sentido.',
    },
    sections: [
      {
        h: { en: 'Not a DJ', es: 'No es un DJ' },
        p: {
          en: ['A DJ plays records and mostly stays out of the way. A sonidero is the opposite: the person on the microphone is a performer, and the records are the material they perform with. The sound system itself has a name, a reputation and often a following that travels with it.',
               'The tradition grew out of Mexico City neighbourhoods — Tepito, Peralvillo — where sound systems played street parties, and it spread with migration. What you hear in Santa Rosa is a direct continuation of that, not a revival of it.'],
          es: ['Un DJ pone discos y casi no se mete. Un sonidero es lo contrario: quien está en el micrófono es un artista, y los discos son su material. El equipo de sonido tiene nombre, reputación y muchas veces seguidores que viajan con él.',
               'La tradición salió de barrios de la Ciudad de México — Tepito, Peralvillo — donde los sonidos tocaban en fiestas de calle, y se extendió con la migración. Lo que escuchas en Santa Rosa es una continuación directa de eso, no un revival.'],
        },
      },
      {
        h: { en: 'The saludos', es: 'Los saludos' },
        p: {
          en: ['Mid-song, the sonidero reads out dedications: names, neighbourhoods, hometowns, families back in Mexico, whole crews standing by the speakers. These are the saludos, and they are the heart of the form rather than an interruption of it.',
               'It is worth understanding what is happening socially. A room full of people who left somewhere gets their hometown said out loud, over music, in front of everybody. People pass notes up all night to make it happen.'],
          es: ['A media canción, el sonidero lee dedicatorias: nombres, colonias, pueblos, familias allá en México, grupos enteros parados junto a las bocinas. Esos son los saludos, y son el corazón de la cosa, no una interrupción.',
               'Vale la pena entender lo que pasa socialmente. Un salón lleno de gente que se fue de algún lado escucha el nombre de su pueblo dicho en voz alta, sobre la música, frente a todos. La gente pasa papelitos toda la noche para que suceda.'],
        },
      },
      {
        h: { en: 'Why it sounds like that', es: 'Por qué suena así' },
        p: {
          en: ['The heavy echo and reverb on the voice is deliberate and traditional. So is the slowed-down, bass-forward treatment of cumbia — rebajada, a style that came out of Monterrey when tracks were played at lower speed and the sound stuck.',
               'The systems are built for volume and low end rather than fidelity. That is a design decision from playing outdoors to hundreds of people, and it carries indoors as a specific, recognisable sound.'],
          es: ['El eco y la reverberación pesada en la voz son intencionales y tradicionales. También lo es la cumbia lenta y con mucho bajo — la rebajada, un estilo que salió de Monterrey cuando las canciones se tocaban a menor velocidad y el sonido se quedó.',
               'Los equipos están hechos para volumen y graves, no para fidelidad. Es una decisión de diseño de tocar al aire libre para cientos de personas, y adentro se traduce en un sonido específico y reconocible.'],
        },
      },
      {
        h: { en: 'What a night is like', es: 'Cómo es la noche' },
        p: {
          en: ['Later and looser than a dance class night. People dance in pairs and in groups, phones go up for the saludos, and the floor fills gradually rather than all at once. Nobody is being taught anything, and nobody needs to be.',
               'Mr. Chile Taproom hosts sonidero nights on select Saturdays from 9pm, with sound systems including Familia Linares and Beto Méndez. Tickets at the door, 21 and over.'],
          es: ['Más tarde y más suelta que una noche con clase. La gente baila en pareja y en grupo, los teléfonos se levantan para los saludos, y la pista se llena poco a poco. Nadie está enseñando nada, y nadie lo necesita.',
               'Mr. Chile Taproom tiene noches sonideras algunos sábados desde las 9pm, con sonidos como Familia Linares y Beto Méndez. Boletos en la puerta, 21 y mayores.'],
        },
      },
    ],
    faq: [
      { q: { en: 'What is the difference between a sonidero and a DJ?', es: '¿Cuál es la diferencia entre un sonidero y un DJ?' },
        a: { en: 'A DJ selects and mixes records. A sonidero performs on the microphone over the music, reading dedications known as saludos, and the sound system itself is a named act with its own following.',
             es: 'Un DJ selecciona y mezcla discos. Un sonidero actúa en el micrófono sobre la música, leyendo dedicatorias llamadas saludos, y el equipo de sonido es un acto con nombre y seguidores propios.' } },
      { q: { en: 'What are saludos?', es: '¿Qué son los saludos?' },
        a: { en: 'Dedications read aloud by the sonidero during a song — names, neighbourhoods, hometowns and families, often sent up on notes by people in the room. They are central to the tradition.',
             es: 'Dedicatorias que el sonidero lee en voz alta durante una canción — nombres, colonias, pueblos y familias, muchas veces mandadas en papelitos por la gente del salón. Son parte central de la tradición.' } },
      { q: { en: 'What is cumbia rebajada?', es: '¿Qué es la cumbia rebajada?' },
        a: { en: 'Cumbia played at a slowed-down speed, a style associated with Monterrey that gives the music a heavier, lower sound. It is common at sonidero nights.',
             es: 'Cumbia tocada a menor velocidad, un estilo asociado con Monterrey que le da un sonido más pesado y grave. Es común en las noches sonideras.' } },
    ],
    links: ['events', 'cumbia'],
  },

  // ==========================================================================
  {
    slug: { en: 'private-event-venue-checklist', es: 'lista-para-elegir-salon' },
    date: '2026-08-29',
    title: {
      en: 'Booking a Private Event Venue: What to Ask Before You Pay a Deposit',
      es: 'Rentar un salón para evento privado: qué preguntar antes de dar depósito',
    },
    metaTitle: {
      en: 'Private Event Venue Checklist | Santa Rosa & Sonoma County',
      es: 'Lista para elegir salón | Santa Rosa y condado de Sonoma',
    },
    description: {
      en: 'The questions that decide whether a private event goes smoothly — access times, what is included, noise limits, parking, deposits and the rain plan. Use it at any venue.',
      es: 'Las preguntas que deciden si un evento privado sale bien — horarios de acceso, qué incluye, límites de ruido, estacionamiento, depósitos y plan de lluvia. Úsala en cualquier salón.',
    },
    lede: {
      en: 'Almost every private event that goes wrong goes wrong on something that was answerable in advance. This is the list.',
      es: 'Casi todo evento privado que sale mal, sale mal por algo que se podía preguntar antes. Esta es la lista.',
    },
    sections: [
      {
        h: { en: 'Time, not just the date', es: 'El horario, no sólo la fecha' },
        p: {
          en: ['The number that matters is access time, not start time. If your event starts at six and you get the room at five, you are decorating in front of your first guests. Ask when you can load in, and whether anything is booked before you.',
               'Ask the hard stop and the overtime rate, in writing. Ask who cleans up and by when. A cheap room with a midnight hard stop and a cleaning charge can cost more than an expensive one without either.'],
          es: ['El número que importa es la hora de acceso, no la de inicio. Si tu evento empieza a las seis y te dan el salón a las cinco, vas a estar decorando frente a tus primeros invitados. Pregunta cuándo puedes entrar a montar y si hay algo reservado antes.',
               'Pregunta la hora tope y el costo de hora extra, por escrito. Pregunta quién limpia y hasta cuándo. Un salón barato con hora tope a medianoche y cargo de limpieza puede salir más caro que uno caro sin ninguna de las dos.'],
        },
      },
      {
        h: { en: 'What the price actually includes', es: 'Qué incluye realmente el precio' },
        p: {
          en: ['Get it itemised. Tables, chairs, linens, glassware, staff, a bartender, setup, breakdown, cleaning — each of these is included somewhere and a rental somewhere else, and the gap between two quotes is usually here rather than in the room rate.',
               'Ask about the food rules specifically. Whether outside catering is allowed, whether there is a required caterer, whether you can bring a cake, and whether there is a fee for any of it.'],
          es: ['Pide el desglose. Mesas, sillas, manteles, cristalería, personal, cantinero, montaje, desmontaje, limpieza — cada cosa viene incluida en algún lugar y se renta en otro, y la diferencia entre dos cotizaciones suele estar aquí, no en el precio del salón.',
               'Pregunta específicamente por las reglas de comida. Si se permite banquete de fuera, si hay proveedor obligatorio, si puedes llevar pastel, y si algo de eso tiene cargo.'],
        },
      },
      {
        h: { en: 'Sound, capacity and the fire marshal', es: 'Sonido, capacidad y el reglamento' },
        p: {
          en: ['Ask for the legal capacity, then ask what the room is comfortable at, because they are different numbers. Seated dining, standing reception and dancing all fit different counts in the same square footage.',
               'Ask whether there is a house sound system or whether your DJ brings one, whether there is a noise ordinance and what time it starts, and whether a live band is allowed at all. A venue that already runs live music every weekend has answered these questions long before you asked.'],
          es: ['Pregunta la capacidad legal, y luego pregunta con cuánta gente el salón se siente cómodo, porque son números distintos. Cena sentada, recepción de pie y baile caben en cantidades diferentes en el mismo espacio.',
               'Pregunta si hay sonido de la casa o si tu DJ lo trae, si hay reglamento de ruido y a qué hora empieza, y si se permite grupo en vivo. Un lugar que ya hace música en vivo cada fin de semana ya respondió esto mucho antes de que preguntaras.'],
        },
      },
      {
        h: { en: 'The unglamorous questions', es: 'Las preguntas sin glamour' },
        p: {
          en: ['Parking, and how much of it. Accessibility — step-free entry, an accessible bathroom, and where an older relative sits. Bathrooms relative to headcount. Whether there is somewhere to put coats, gifts or a cake before service.',
               'The deposit and the cancellation terms, which is the one people sign without reading. What is refundable, by when, and what happens if the venue cancels. And the rain plan for anything outdoors — not "we would probably move inside," but which room, and does it fit everyone.'],
          es: ['Estacionamiento, y cuánto. Accesibilidad — entrada sin escalones, baño accesible, y dónde se sienta un familiar mayor. Baños en proporción a los invitados. Si hay dónde dejar abrigos, regalos o el pastel antes de servir.',
               'El depósito y las condiciones de cancelación, que es lo que la gente firma sin leer. Qué se devuelve, hasta cuándo, y qué pasa si el lugar cancela. Y el plan de lluvia para cualquier cosa al aire libre — no "seguramente nos metemos", sino cuál salón, y si cabe toda la gente.'],
        },
      },
      {
        h: { en: 'Booking in Santa Rosa', es: 'Rentar en Santa Rosa' },
        p: {
          en: ['Mr. Chile Taproom answers these directly: a creekside patio buyout for up to 80, a semi-private back room for 25 to 45, or a full venue buyout with stage, PA and projector. Free parking on site, bilingual staff, and a licensed bar so alcohol is not a separate problem to solve.',
               'Call (707) 239-4188 or send an enquiry, and ask every question on this list — of us and of everyone else you are considering.'],
          es: ['Mr. Chile Taproom responde esto directamente: renta del patio junto al arroyo hasta 80 personas, salón trasero semiprivado de 25 a 45, o el lugar completo con escenario, sonido y proyector. Estacionamiento gratis, personal bilingüe, y barra con licencia para que el alcohol no sea otro problema que resolver.',
               'Llama al (707) 239-4188 o manda tu solicitud, y haz cada pregunta de esta lista — a nosotros y a todos los demás que estés considerando.'],
        },
      },
    ],
    faq: [
      { q: { en: 'What should you ask before booking an event venue?', es: '¿Qué preguntar antes de rentar un salón?' },
        a: { en: 'Access and hard-stop times with the overtime rate, an itemised list of what the price includes, comfortable capacity for your format, noise limits, parking and accessibility, the deposit and cancellation terms, and the rain plan for outdoor space.',
             es: 'Horarios de acceso y hora tope con el costo de hora extra, un desglose de lo que incluye el precio, capacidad cómoda para tu formato, límites de ruido, estacionamiento y accesibilidad, depósito y cancelación, y el plan de lluvia si hay espacio al aire libre.' } },
      { q: { en: 'How many guests fit in a private event space?', es: '¿Cuánta gente cabe en un salón privado?' },
        a: { en: 'It depends on format rather than square footage. The same room holds fewer people for a seated dinner than for a standing reception, and fewer again once a dance floor is in it. Ask for the comfortable number for your format, not just the legal capacity.',
             es: 'Depende del formato, no de los metros cuadrados. El mismo salón aguanta menos gente en cena sentada que en recepción de pie, y menos todavía con pista de baile. Pregunta el número cómodo para tu formato, no sólo la capacidad legal.' } },
    ],
    links: ['private', 'visit'],
  },
];
