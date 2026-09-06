/**
 * apps-data.js
 * -----------------------------------------------------------------------
 * Это "база данных" сайта. Каждое приложение — один объект в SEED_APPS.
 *
 * Как опубликовать новые приложения для ВСЕХ посетителей:
 *   1. Добавляйте и редактируйте приложения через /admin.html — так удобнее.
 *   2. Когда закончите, нажмите в админке «Экспортировать» — скачается
 *      файл apps-export.json со всеми текущими приложениями.
 *   3. Откройте этот файл (apps-data.js), замените содержимое массива
 *      SEED_APPS на содержимое apps-export.json.
 *   4. Сохраните и залейте сайт на хостинг заново.
 *
 * Пока вы не сделали шаги 2-4, изменения из админки видны только вам,
 * в том браузере, где вы их вносили (подробнее — в README.md).
 */

const CATEGORIES = [
  { id: 'games', label: 'Игры', color: '#FF5A36' },
  { id: 'productivity', label: 'Продуктивность', color: '#4C8DFF' },
  { id: 'health', label: 'Здоровье и фитнес', color: '#33C481' },
  { id: 'entertainment', label: 'Развлечения', color: '#C77DFF' },
  { id: 'utilities', label: 'Инструменты', color: '#E0B33C' },
];

const SEED_APPS = [
  {
    id: 'pushr',
    name: 'Pushr',
    developer: 'Независимый разработчик',
    category: 'health',
    tagline: 'Считает отжимания через камеру телефона — без кнопок и таймеров',
    description:
      'Pushr включает камеру во время тренировки и сам распознаёт каждое ' +
      'отжимание, так что руки остаются свободными. В приложении — дневная ' +
      'и недельная статистика, простая серия дней подряд и общий счётчик ' +
      'отжиманий всех пользователей приложения.',
    storeUrl: 'https://apps.apple.com/app/id0000000000',
    icon: '',
    screenshots: [],
    featured: true,
    addedAt: '2026-09-04',
  },
  {
    id: 'stardew-valley',
    name: 'Stardew Valley',
    developer: 'ConcernedApe',
    category: 'games',
    tagline: 'Фермерский симулятор, в котором легко потерять счёт времени',
    description:
      'Унаследованная от дедушки ферма, рыбалка, шахты, отношения с жителями ' +
      'городка и уютный пиксель-арт. Одна из самых залипательных инди-игр ' +
      'на мобильных платформах, полностью адаптированная под сенсорное ' +
      'управление.',
    storeUrl: 'https://apps.apple.com/app/id1454051446',
    icon: '',
    screenshots: [],
    featured: false,
    addedAt: '2026-08-27',
  },
  {
    id: 'hello-kitty-island',
    name: 'Hello Kitty Island Adventure',
    developer: 'Sunblink',
    category: 'games',
    tagline: 'Уютное приключение с Hello Kitty и друзьями на тропическом острове',
    description:
      'Исследуйте остров, выполняйте задания для Hello Kitty и её друзей, ' +
      'обустраивайте собственный дом и собирайте коллекционные предметы. ' +
      'Доступно по подписке Apple Arcade.',
    storeUrl: 'https://apps.apple.com/app/id1637430355',
    icon: '',
    screenshots: [],
    featured: false,
    addedAt: '2026-08-22',
  },
  
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    developer: 'OpenAI',
    category: 'productivity',
    tagline: 'Официальное приложение с синхронизацией истории между устройствами',
    description:
      'Официальный клиент ChatGPT: история чатов синхронизируется между ' +
      'устройствами, есть голосовой режим и доступ к последним моделям ' +
      'OpenAI.',
    storeUrl: 'https://apps.apple.com/app/id6448311069',
    icon: '',
    screenshots: [],
    featured: false,
    addedAt: '2026-08-18',
  },
  {
    id: 'example-entry',
    name: 'Пример записи',
    developer: 'Замените в админке',
    category: 'utilities',
    tagline: 'Эту карточку можно отредактировать или удалить через /admin.html',
    description:
      'Тестовая запись, чтобы показать, как выглядит карточка приложения ' +
      'до того, как вы добавите своё. Смело удаляйте её из админ-панели.',
    storeUrl: '#',
    icon: '',
    screenshots: [],
    featured: false,
    addedAt: '2026-08-10',
  },
];
