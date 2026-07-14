import { eq, asc } from "drizzle-orm";
import { db, initDatabase } from "./index";
import { screens, homeContent, sections, appMeta } from "./schema";
import type { ScreenOrientation, SectionTemplate } from "../types";
import {
  LOGO_HISTORY_HTML,
  LOGO_HISTORY_MEDIA_URL,
  LOGO_HISTORY_TITLE,
} from "../home-history-content";
import {
  GLOBAL_SCREEN_ID,
  serializeContent,
  type SectionContentV2,
} from "../section-content";
import { EMPTY_SLOT_TITLE } from "../slot-utils";

const now = () => new Date().toISOString();

function placeholderHtml(text: string) {
  return `<p>${text}</p>`;
}

function placeholderJson(text: string) {
  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });
}

export const FLAG_HTML = `<p><strong>Государственный флаг Республики Беларусь</strong></p>
<p>Государственный флаг Республики Беларусь — прямоугольное полотнище из двух горизонтально расположенных цветных полос: верхней красного и нижней зелёного цвета, размеры которых 2:1.</p>
<p>У древка по всей длине красной полосы выложена вертикальная традиционная белорусская народная орнаментальная композиция красного цвета на белом поле, ширина которой составляет 1/9 длины флага.</p>
<p>Красный цвет символизирует кровь, пролитую защитниками Отечества. Зелёный цвет — весну, возрождение, леса и поля страны. Орнамент — духовное богатство, культурное наследие и единство народа.</p>
<p>Источник: <a href="https://president.gov.by/ru/gosudarstvo/simvolika/flag" target="_blank" rel="noopener noreferrer">president.gov.by</a></p>`;

export const EMBLEM_HTML = `<p><strong>Государственный герб Республики Беларусь</strong></p>
<p>Государственный герб Республики Беларусь — символ государственного суверенитета Республики Беларусь.</p>
<p>Герб представляет собой изображение, заключённое в контур зелёного цвета в форме круга, в центре которого на фоне неба и восходящего золотистого солнца расположена очертанная золотистым контуром географическая карта Республики Беларусь. Над картой — пятиконечная красная звезда.</p>
<p>В верхней части круга — надпись «Рэспубліка Беларусь». В нижней части — венок из колосьев, переплетённых лентами цветов государственного флага — красного и зелёного, с наложенным в центре венка на ленты государственного флага — красной звезды.</p>
<p>Источник: <a href="https://president.gov.by/ru/gosudarstvo/simvolika/gerb" target="_blank" rel="noopener noreferrer">president.gov.by</a></p>`;

export const ANTHEM_HTML = `<p><strong>Дзяржаўны гімн Рэспублікі Беларусь</strong></p>
<p>Мы, беларусы – мірныя людзі,<br/>
Сэрцам адданыя роднай зямлі,<br/>
Шчыра сябруем, сілы гартуем<br/>
Мы ў працавітай, вольнай сям'і.</p>
<p>Слаўся, зямлі нашай светлае імя,<br/>
Слаўся, народаў братэрскі саюз!<br/>
Наша любімая маці-Радзіма,<br/>
Вечна жыві і квітней, Беларусь!</p>
<p>Разам з братамі мужна вякамі<br/>
Мы баранілі родны парог,<br/>
У бітвах за волю, бітвах за долю<br/>
Свой здабывалі сцяг перамог!</p>
<p>Слаўся, зямлі нашай светлае імя,<br/>
Слаўся, народаў братэрскі саюз!<br/>
Наша любімая маці-Радзіма,<br/>
Вечна жыві і квітней, Беларусь!</p>
<p>Дружба народаў – сіла народаў –<br/>
Наш запаветны, сонечны шлях.<br/>
Горда ж узвіся ў ясныя высі,<br/>
Сцяг пераможны – радасці сцяг!</p>
<p>Слаўся, зямлі нашай светлае імя,<br/>
Слаўся, народаў братэрскі саюз!<br/>
Наша любімая маці-Радзіма,<br/>
Вечна жыві і квітней, Беларусь!</p>
<p>Источник: <a href="https://president.gov.by/ru/gosudarstvo/simvolika/gimn" target="_blank" rel="noopener noreferrer">president.gov.by</a></p>`;

/** @deprecated Use ANTHEM_HTML */
export const FLAG_ANTHEM_HTML = ANTHEM_HTML;

function flagAnthemJson() {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Дзяржаўны гімн Рэспублікі Беларусь", marks: [{ type: "bold" }] }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Мы, беларусы – мірныя людзі,\nСэрцам адданыя роднай зямлі,\nШчыра сябруем, сілы гартуем\nМы ў працавітай, вольнай сям'і.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Слаўся, зямлі нашай светлае імя,\nСлаўся, народаў братэрскі саюз!\nНаша любімая маці-Радзіма,\nВечна жыві і квітней, Беларусь!",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Разам з братамі мужна вякамі\nМы баранілі родны парог,\nУ бітвах за волю, бітвах за долю\nСвой здабывалі сцяг перамог!",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Слаўся, зямлі нашай светлае імя,\nСлаўся, народаў братэрскі саюз!\nНаша любімая маці-Радзіма,\nВечна жыві і квітней, Беларусь!",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Дружба народаў – сіла народаў –\nНаш запаветны, сонечны шлях.\nГорда ж узвіся ў ясныя высі,\nСцяг пераможны – радасці сцяг!",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Слаўся, зямлі нашай светлае імя,\nСлаўся, народаў братэрскі саюз!\nНаша любімая маці-Радзіма,\nВечна жыві і квітней, Беларусь!",
          },
        ],
      },
    ],
  });
}

const homeDefaults = [
  {
    hotspotType: "flag" as const,
    title: "Государственный флаг Республики Беларусь",
    mediaUrl: "/assets/flag-rb.png",
    html: FLAG_HTML,
  },
  {
    hotspotType: "emblem" as const,
    title: "Государственный герб Республики Беларусь",
    mediaUrl: "/assets/emblem-rb.png",
    html: EMBLEM_HTML,
  },
  {
    hotspotType: "anthem" as const,
    title: "Государственный гимн Республики Беларусь",
    mediaUrl: "/assets/anthem-rb.jpg",
    html: ANTHEM_HTML,
  },
  {
    hotspotType: "logo" as const,
    title: LOGO_HISTORY_TITLE,
    mediaUrl: LOGO_HISTORY_MEDIA_URL,
    html: LOGO_HISTORY_HTML,
  },
];

const sectionDefaults = [
  {
    title: "История Белорусского общества глухих",
    coverUrl: "/assets/sections/history.jpg",
    html: `<p><strong>История организации</strong></p>
<p>Белорусское общество глухих ведёт свою историю с середины XX века. Организация объединяет людей с нарушениями слуха, способствует их социальной адаптации, образованию и культурному развитию.</p>
<p>Музей сохраняет документы, фотографии и личные истории, отражающие путь общества от первых общин до современной республиканской организации.</p>
<img src="/assets/sections/history.jpg" alt="" />`,
  },
  {
    title: "Достижения и награды",
    coverUrl: "/assets/sections/awards.jpg",
    html: `<p><strong>Награды и признание</strong></p>
<p>Представители Белорусского общества глухих неоднократно отмечались государственными наградами, дипломами и благодарностями за вклад в развитие культуры, спорта и социальной защиты.</p>
<p>В экспозиции представлены медали, грамоты и памятные знаки, символизирующие достижения организации и её членов.</p>`,
  },
  {
    title: "Дефлимпийское движение",
    coverUrl: "/assets/sections/deaflympics.jpg",
    html: `<p><strong>Дефлимпийские игры</strong></p>
<p>Дефлимпийское движение — важная часть жизни общества глухих во всём мире. Спортсмены Беларуси участвуют в международных соревнованиях, демонстрируя силу духа, мастерство и волю к победе.</p>
<p>На Дефлимпиаде глухие атлеты соревнуются в лёгкой атлетике, плавании, футболе, баскетболе, волейболе и других видах спорта.</p>
<img src="/assets/sections/deaflympics.jpg" alt="" />`,
  },
  {
    title: "Фотогалерея",
    coverUrl: "/assets/sections/gallery.jpg",
    html: `<p><strong>Фотогалерея музея</strong></p>
<p>Коллекция фотографий рассказывает о событиях, встречах, праздниках и буднях Белорусского общества глухих. Снимки фиксируют важные моменты истории организации.</p>
<p>Галерея постоянно пополняется — новые материалы можно добавить через админ-панель музея.</p>
<img src="/assets/sections/gallery.jpg" alt="" />`,
  },
  {
    title: "Международное сотрудничество",
    coverUrl: "/assets/sections/international.jpg",
    html: `<p><strong>Связи с миром</strong></p>
<p>Белорусское общество глухих активно сотрудничает с организациями глухих из разных стран. Проводятся встречи, конференции, культурные обмены и совместные проекты.</p>
<p>Международное партнёрство помогает обмениваться опытом, развивать жестовый язык и укреплять права глухих людей.</p>`,
  },
  {
    title: "Спорт глухих Беларуси",
    coverUrl: "/assets/sections/sports.jpg",
    html: `<p><strong>Спортивные достижения</strong></p>
<p>Спорт занимает особое место в жизни общества глухих. Команды и отдельные спортсмены Беларуси регулярно участвуют в республиканских и международных турнирах.</p>
<p>Тренировки, соревнования и спортивные праздники объединяют людей, воспитывают характер и дарят радость побед.</p>
<img src="/assets/sections/sports.jpg" alt="" />`,
  },
  {
    title: "Санаторий «Приморский»",
    coverUrl: "/assets/sections/sanatorium.jpg",
    html: `<p><strong>Оздоровление и отдых</strong></p>
<p>Санаторий «Приморский» — место отдыха и восстановления здоровья для членов общества глухих и их семей. Расположенный у моря, он сочетает лечение, комфорт и возможность общения.</p>
<p>Здесь проводятся оздоровительные сезоны, культурные мероприятия и встречи, которые остаются в памяти на долгие годы.</p>
<img src="/assets/sections/sanatorium.jpg" alt="" />`,
  },
  {
    title: "Картинная галерея",
    coverUrl: "/assets/sections/art-gallery.jpg",
    html: `<p><strong>Изобразительное искусство</strong></p>
<p>В картинной галерее представлены работы художников — членов общества глухих и их друзей. Живопись, графика и прикладное искусство отражают внутренний мир и творческий дар авторов.</p>
<p>Экспозиция демонстрирует, что глухота не является преградой для самовыражения и создания прекрасного.</p>
<img src="/assets/sections/art-gallery.jpg" alt="" />`,
  },
];

function seedScreen(screenId: ScreenOrientation, screenName: string) {
  const existingScreens = db.select().from(screens).where(eq(screens.id, screenId)).all();
  if (existingScreens.length === 0) {
    db.insert(screens).values({ id: screenId, name: screenName }).run();
  }

  for (const item of homeDefaults) {
    const existing = db
      .select()
      .from(homeContent)
      .where(eq(homeContent.screenId, screenId))
      .all()
      .find((r) => r.hotspotType === item.hotspotType);

    if (!existing) {
      db.insert(homeContent)
        .values({
          id: crypto.randomUUID(),
          screenId,
          hotspotType: item.hotspotType,
          title: item.title,
          contentJson:
            item.hotspotType === "anthem" ? flagAnthemJson() : placeholderJson(item.title),
          contentHtml: item.html,
          mediaUrl: item.mediaUrl,
          updatedAt: now(),
        })
        .run();
    }
  }

  const existingSections = db
    .select()
    .from(sections)
    .where(eq(sections.screenId, GLOBAL_SCREEN_ID))
    .all();
  if (existingSections.length === 0 && screenId === "horizontal") {
    /* sections seeded via applySectionsV2Patch */
  }
}

function applySectionsV2Patch() {
  const SECTIONS_V2_VERSION = "2";

  const metaRows = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "sections_v2_version"))
    .all();
  const currentVersion = metaRows[0]?.value;

  if (currentVersion === SECTIONS_V2_VERSION) return;

  const globalScreen = db.select().from(screens).where(eq(screens.id, GLOBAL_SCREEN_ID)).all();
  if (globalScreen.length === 0) {
    db.insert(screens).values({ id: GLOBAL_SCREEN_ID, name: "Общие разделы" }).run();
  }

  db.delete(sections).where(eq(sections.screenId, "vertical")).run();
  db.delete(sections).where(eq(sections.screenId, "horizontal")).run();
  db.delete(sections).where(eq(sections.screenId, GLOBAL_SCREEN_ID)).run();

  const demoSections: {
    title: string;
    coverUrl: string;
    templateType: SectionTemplate;
    content: SectionContentV2;
  }[] = [
    {
      title: "История Белорусского общества глухих",
      coverUrl: "/assets/sections/history.jpg",
      templateType: "article",
      content: {
        version: 2,
        heroImage: "/assets/sections/history.jpg",
        heroSize: "large",
        intro: "Белорусское общество глухих — одна из старейших общественных организаций страны.",
        body: "С момента основания общество объединяет людей с нарушением слуха, защищает их права и развивает культуру глухих. Музей БелОГ сохраняет память о людях, событиях и достижениях, которые сформировали современное сообщество.",
      },
    },
    {
      title: "Достижения и награды",
      coverUrl: "/assets/sections/awards.jpg",
      templateType: "photo_story",
      content: {
        version: 2,
        stories: [
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/awards.jpg",
            imageSize: "large",
            title: "Признание заслуг",
            text: "Члены общества неоднократно отмечались государственными наградами за вклад в развитие инклюзивного общества.",
          },
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/sports.jpg",
            imageSize: "medium",
            title: "Спортивные победы",
            text: "Спортсмены БелОГ представляют Беларусь на международных соревнованиях и Дефлимпийских играх.",
          },
        ],
      },
    },
    {
      title: "Фотогалерея",
      coverUrl: "/assets/sections/gallery.jpg",
      templateType: "gallery",
      content: {
        version: 2,
        gallery: [
          { id: crypto.randomUUID(), url: "/assets/sections/gallery.jpg", caption: "Мероприятия общества", size: "full" },
          { id: crypto.randomUUID(), url: "/assets/sections/history.jpg", caption: "История организации", size: "medium" },
          { id: crypto.randomUUID(), url: "/assets/sections/sports.jpg", caption: "Спортивные соревнования", size: "medium" },
          { id: crypto.randomUUID(), url: "/assets/sections/deaflympics.jpg", caption: "Дефлимпийские игры", size: "large" },
        ],
      },
    },
    {
      title: "Международное сотрудничество",
      coverUrl: "/assets/sections/international.jpg",
      templateType: "timeline",
      content: {
        version: 2,
        events: [
          {
            id: crypto.randomUUID(),
            year: "1992",
            title: "Всемирная федерация глухих",
            text: "Беларусь активно участвует в международном движении глухих.",
            imageUrl: "/assets/sections/international.jpg",
          },
          {
            id: crypto.randomUUID(),
            year: "2005",
            title: "Обмен делегациями",
            text: "Регулярные визиты и совместные проекты с партнёрами из разных стран.",
          },
          {
            id: crypto.randomUUID(),
            year: "2020",
            title: "Культурные программы",
            text: "Фестивали жестового языка и совместные выставки.",
          },
        ],
      },
    },
    {
      title: "Дефлимпийское движение",
      coverUrl: "/assets/sections/deaflympics.jpg",
      templateType: "article",
      content: {
        version: 2,
        heroImage: "/assets/sections/deaflympics.jpg",
        heroSize: "full",
        intro: "Дефлимпийские игры — крупнейшее спортивное событие для глухих спортсменов.",
        body: "Белорусские атлеты регулярно завоёвывают медали, демонстрируя силу духа и мастерство. История выступлений — важная часть экспозиции музея.",
      },
    },
    {
      title: "Спорт глухих Беларуси",
      coverUrl: "/assets/sections/sports.jpg",
      templateType: "photo_story",
      content: {
        version: 2,
        stories: [
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/sports.jpg",
            imageSize: "full",
            title: "Команда чемпионов",
            text: "Волейбол, лёгкая атлетика, плавание — глухие спортсмены Беларуси добиваются высоких результатов.",
          },
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/deaflympics.jpg",
            imageSize: "medium",
            title: "Путь к победе",
            text: "Тренировки, соревнования и поддержка общества помогают атлетам достигать целей.",
          },
        ],
      },
    },
  ];

  demoSections.forEach((section, index) => {
    db.insert(sections)
      .values({
        id: crypto.randomUUID(),
        screenId: GLOBAL_SCREEN_ID,
        title: section.title,
        coverUrl: section.coverUrl,
        templateType: section.templateType,
        contentJson: serializeContent(section.content),
        contentHtml: null,
        sortOrder: index,
        isPublished: true,
        createdAt: now(),
        updatedAt: now(),
      })
      .run();
  });

  if (metaRows.length === 0) {
    db.insert(appMeta)
      .values({ key: "sections_v2_version", value: SECTIONS_V2_VERSION })
      .run();
  } else {
    db.update(appMeta)
      .set({ value: SECTIONS_V2_VERSION })
      .where(eq(appMeta.key, "sections_v2_version"))
      .run();
  }
}

function buildDemoSlots(): {
  title: string;
  coverUrl: string | null;
  templateType: SectionTemplate;
  content: SectionContentV2;
  isPublished: boolean;
}[] {
  return [
    {
      title: "История Белорусского общества глухих",
      coverUrl: "/assets/sections/history.jpg",
      templateType: "timeline",
      isPublished: true,
      content: {
        version: 2,
        events: [
          {
            id: crypto.randomUUID(),
            year: "1930",
            title: "Основание общества",
            text: "Белорусское общество глухих — одна из старейших общественных организаций страны.",
            imageUrl: "/assets/sections/history.jpg",
          },
          {
            id: crypto.randomUUID(),
            year: "1990",
            title: "Новый этап развития",
            text: "Общество объединяет людей с нарушением слуха, защищает их права и развивает культуру глухих.",
          },
          {
            id: crypto.randomUUID(),
            year: "2020",
            title: "Музей БелОГ",
            text: "Музей сохраняет память о людях, событиях и достижениях, которые сформировали современное сообщество.",
          },
        ],
      },
    },
    {
      title: "Достижения и награды",
      coverUrl: "/assets/sections/awards.jpg",
      templateType: "highlights",
      isPublished: true,
      content: {
        version: 2,
        highlights: [
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/awards.jpg",
            title: "Признание заслуг",
            text: "Члены общества неоднократно отмечались государственными наградами за вклад в развитие инклюзивного общества.",
          },
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/sports.jpg",
            title: "Спортивные победы",
            text: "Спортсмены БелОГ представляют Беларусь на международных соревнованиях и Дефлимпийских играх.",
          },
        ],
      },
    },
    {
      title: "Фотогалерея",
      coverUrl: "/assets/sections/gallery.jpg",
      templateType: "gallery",
      isPublished: true,
      content: {
        version: 2,
        gallery: [
          { id: crypto.randomUUID(), url: "/assets/sections/gallery.jpg", caption: "Мероприятия общества", size: "full" },
          { id: crypto.randomUUID(), url: "/assets/sections/history.jpg", caption: "История организации", size: "medium" },
          { id: crypto.randomUUID(), url: "/assets/sections/sports.jpg", caption: "Спортивные соревнования", size: "medium" },
          { id: crypto.randomUUID(), url: "/assets/sections/deaflympics.jpg", caption: "Дефлимпийские игры", size: "large" },
        ],
      },
    },
    {
      title: "Международное сотрудничество",
      coverUrl: "/assets/sections/international.jpg",
      templateType: "article",
      isPublished: true,
      content: {
        version: 2,
        heroImage: "/assets/sections/international.jpg",
        heroSize: "large",
        intro: "Беларусь активно участвует в международном движении глухих.",
        body: "Регулярные визиты, обмен делегациями и совместные культурные программы укрепляют связи с партнёрами из разных стран.",
      },
    },
    {
      title: "Дефлимпийское движение",
      coverUrl: "/assets/sections/deaflympics.jpg",
      templateType: "photo_story",
      isPublished: true,
      content: {
        version: 2,
        stories: [
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/deaflympics.jpg",
            imageSize: "full",
            title: "Дефлимпийские игры",
            text: "Крупнейшее спортивное событие для глухих спортсменов. Белорусские атлеты регулярно завоёвывают медали.",
          },
        ],
      },
    },
    {
      title: "Спорт глухих Беларуси",
      coverUrl: "/assets/sections/sports.jpg",
      templateType: "photo_story",
      isPublished: true,
      content: {
        version: 2,
        stories: [
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/sports.jpg",
            imageSize: "full",
            title: "Команда чемпионов",
            text: "Волейбол, лёгкая атлетика, плавание — глухие спортсмены Беларуси добиваются высоких результатов.",
          },
          {
            id: crypto.randomUUID(),
            imageUrl: "/assets/sections/deaflympics.jpg",
            imageSize: "medium",
            title: "Путь к победе",
            text: "Тренировки, соревнования и поддержка общества помогают атлетам достигать целей.",
          },
        ],
      },
    },
    ...Array.from({ length: 4 }, () => ({
      title: EMPTY_SLOT_TITLE,
      coverUrl: null,
      templateType: "article" as SectionTemplate,
      isPublished: false,
      content: { version: 2 as const, intro: "", body: "" },
    })),
  ];
}

function applySectionsV3Patch() {
  const SECTIONS_V3_VERSION = "3";

  const metaRows = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "sections_v3_version"))
    .all();
  const currentVersion = metaRows[0]?.value;

  const globalScreen = db.select().from(screens).where(eq(screens.id, GLOBAL_SCREEN_ID)).all();
  if (globalScreen.length === 0) {
    db.insert(screens).values({ id: GLOBAL_SCREEN_ID, name: "Общие разделы" }).run();
  }

  const existing = db
    .select()
    .from(sections)
    .where(eq(sections.screenId, GLOBAL_SCREEN_ID))
    .orderBy(asc(sections.slotIndex))
    .all();

  if (currentVersion === SECTIONS_V3_VERSION && existing.length === 10) {
    return;
  }

  if (currentVersion === SECTIONS_V3_VERSION && existing.length < 10) {
    ensureTenSlots(existing);
    return;
  }

  db.delete(sections).where(eq(sections.screenId, GLOBAL_SCREEN_ID)).run();

  const demoSlots = buildDemoSlots();
  demoSlots.forEach((slot, slotIndex) => {
    db.insert(sections)
      .values({
        id: crypto.randomUUID(),
        screenId: GLOBAL_SCREEN_ID,
        title: slot.title,
        coverUrl: slot.coverUrl,
        templateType: slot.templateType,
        contentJson: serializeContent(slot.content),
        contentHtml: null,
        slotIndex,
        sortOrder: slotIndex,
        isPublished: slot.isPublished,
        createdAt: now(),
        updatedAt: now(),
      })
      .run();
  });

  if (metaRows.length === 0) {
    db.insert(appMeta)
      .values({ key: "sections_v3_version", value: SECTIONS_V3_VERSION })
      .run();
  } else {
    db.update(appMeta)
      .set({ value: SECTIONS_V3_VERSION })
      .where(eq(appMeta.key, "sections_v3_version"))
      .run();
  }
}

function ensureTenSlots(existing: (typeof sections.$inferSelect)[]) {
  const occupied = new Set(existing.map((s) => s.slotIndex ?? s.sortOrder));
  for (let slotIndex = 0; slotIndex < 10; slotIndex++) {
    if (occupied.has(slotIndex)) continue;
    db.insert(sections)
      .values({
        id: crypto.randomUUID(),
        screenId: GLOBAL_SCREEN_ID,
        title: EMPTY_SLOT_TITLE,
        coverUrl: null,
        templateType: "article",
        contentJson: serializeContent({ version: 2, intro: "", body: "" }),
        contentHtml: null,
        slotIndex,
        sortOrder: slotIndex,
        isPublished: false,
        createdAt: now(),
        updatedAt: now(),
      })
      .run();
  }
}

function applySectionsDemoPatch() {
  /* replaced by applySectionsV2Patch */
}

function applyContentPatches() {
  applySymbolsContentPatch();
  applyLogoHistoryPatch();
}

function applyLogoHistoryPatch() {
  const LOGO_HISTORY_VERSION = "1";

  const metaRows = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "logo_history_version"))
    .all();
  const currentVersion = metaRows[0]?.value;

  if (currentVersion === LOGO_HISTORY_VERSION) return;

  for (const screenId of ["horizontal", "vertical"] as const) {
    const existing = db
      .select()
      .from(homeContent)
      .where(eq(homeContent.screenId, screenId))
      .all()
      .find((r) => r.hotspotType === "logo");

    if (existing) {
      db.update(homeContent)
        .set({
          title: LOGO_HISTORY_TITLE,
          contentHtml: LOGO_HISTORY_HTML,
          contentJson: placeholderJson(LOGO_HISTORY_TITLE),
          mediaUrl: LOGO_HISTORY_MEDIA_URL,
          updatedAt: now(),
        })
        .where(eq(homeContent.id, existing.id))
        .run();
    }
  }

  if (metaRows.length === 0) {
    db.insert(appMeta)
      .values({ key: "logo_history_version", value: LOGO_HISTORY_VERSION })
      .run();
  } else {
    db.update(appMeta)
      .set({ value: LOGO_HISTORY_VERSION })
      .where(eq(appMeta.key, "logo_history_version"))
      .run();
  }
}

function applySymbolsContentPatch() {
  const SYMBOLS_CONTENT_VERSION = "4";

  const metaRows = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "symbols_content_version"))
    .all();
  const currentVersion = metaRows[0]?.value;

  if (currentVersion === SYMBOLS_CONTENT_VERSION) return;

  const symbolUpdates: { type: string; title: string; html: string; mediaUrl: string | null }[] = [
    { type: "flag", title: "Государственный флаг Республики Беларусь", html: FLAG_HTML, mediaUrl: "/assets/flag-rb.png" },
    { type: "emblem", title: "Государственный герб Республики Беларусь", html: EMBLEM_HTML, mediaUrl: "/assets/emblem-rb.png" },
    { type: "anthem", title: "Государственный гимн Республики Беларусь", html: ANTHEM_HTML, mediaUrl: "/assets/anthem-rb.jpg" },
  ];

  for (const screenId of ["horizontal", "vertical"] as const) {
    for (const update of symbolUpdates) {
      const existing = db
        .select()
        .from(homeContent)
        .where(eq(homeContent.screenId, screenId))
        .all()
        .find((r) => r.hotspotType === update.type);

      if (existing) {
        db.update(homeContent)
          .set({
            title: update.title,
            contentHtml: update.html,
            contentJson: update.type === "anthem" ? flagAnthemJson() : placeholderJson(update.title),
            mediaUrl: update.mediaUrl,
            updatedAt: now(),
          })
          .where(eq(homeContent.id, existing.id))
          .run();
      } else {
        db.insert(homeContent)
          .values({
            id: crypto.randomUUID(),
            screenId,
            hotspotType: update.type,
            title: update.title,
            contentJson: update.type === "anthem" ? flagAnthemJson() : placeholderJson(update.title),
            contentHtml: update.html,
            mediaUrl: update.mediaUrl,
            updatedAt: now(),
          })
          .run();
      }
    }
  }

  if (metaRows.length === 0) {
    db.insert(appMeta)
      .values({ key: "symbols_content_version", value: SYMBOLS_CONTENT_VERSION })
      .run();
  } else {
    db.update(appMeta)
      .set({ value: SYMBOLS_CONTENT_VERSION })
      .where(eq(appMeta.key, "symbols_content_version"))
      .run();
  }
}

export function seedDatabase() {
  initDatabase();
  seedScreen("horizontal", "Горизонтальный экран");
  seedScreen("vertical", "Вертикальный экран");
  applyContentPatches();
  applySectionsV2Patch();
  applySectionsV3Patch();
}
