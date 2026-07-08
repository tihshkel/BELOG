import { eq, and } from "drizzle-orm";
import { db, initDatabase } from "./index";
import { screens, homeContent, sections, appMeta } from "./schema";
import type { ScreenOrientation, SectionTemplate } from "../types";
import {
  GLOBAL_SCREEN_ID,
  serializeContent,
  type SectionContentV2,
} from "../section-content";

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

export const FLAG_ANTHEM_HTML = `<p><strong>Дзяржаўны гімн Рэспублікі Беларусь</strong></p>
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
Вечна жыві і квітней, Беларусь!</p>`;

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
    html: FLAG_ANTHEM_HTML,
  },
  {
    hotspotType: "emblem" as const,
    title: "Законы и указы",
    mediaUrl: "/assets/emblem-rb.png",
    html: `<p><strong>Нормативные акты, касающиеся Белорусского общества глухих</strong></p>
<ul>
<li>Закон Республики Беларусь «О социальной защите инвалидов в Республике Беларусь»</li>
<li>Указ Президента Республики Беларусь о мерах по поддержке общественных объединений инвалидов</li>
<li>Положение о Белорусском республиканском обществе глухих</li>
</ul>
<p>Контент этого раздела может быть отредактирован в админ-панели.</p>`,
  },
  {
    hotspotType: "logo" as const,
    title: "История музея",
    mediaUrl: "/assets/logo-belog.png",
    html: `<p><strong>Белорусское общество глухих</strong></p>
<p>Белорусское общество глухих — общественная организация, объединяющая глухих и слабослышащих граждан Республики Беларусь. Музей сохраняет историю развития общества, его культурных и спортивных достижений.</p>
<p>Контент этого раздела может быть отредактирован в админ-панели.</p>`,
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
            item.hotspotType === "flag" ? flagAnthemJson() : placeholderJson(item.title),
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

function applySectionsDemoPatch() {
  /* replaced by applySectionsV2Patch */
}

function applyContentPatches() {
  const FLAG_ANTHEM_VERSION = "2";

  const metaRows = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "flag_anthem_version"))
    .all();
  const currentVersion = metaRows[0]?.value;

  if (currentVersion === FLAG_ANTHEM_VERSION) return;

  for (const screenId of ["horizontal", "vertical"] as const) {
    db.update(homeContent)
      .set({
        contentHtml: FLAG_ANTHEM_HTML,
        contentJson: flagAnthemJson(),
        updatedAt: now(),
      })
      .where(and(eq(homeContent.screenId, screenId), eq(homeContent.hotspotType, "flag")))
      .run();
  }

  if (metaRows.length === 0) {
    db.insert(appMeta)
      .values({ key: "flag_anthem_version", value: FLAG_ANTHEM_VERSION })
      .run();
  } else {
    db.update(appMeta)
      .set({ value: FLAG_ANTHEM_VERSION })
      .where(eq(appMeta.key, "flag_anthem_version"))
      .run();
  }
}

export function seedDatabase() {
  initDatabase();
  seedScreen("horizontal", "Горизонтальный экран");
  seedScreen("vertical", "Вертикальный экран");
  applyContentPatches();
  applySectionsV2Patch();
}
