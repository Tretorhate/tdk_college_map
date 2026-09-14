export type Locale = 'kk' | 'ru';

export const LOCALE_STORAGE_KEY = 'college-map.locale';

const dict = {
  title: { kk: 'Колледж картасы', ru: 'Карта колледжа' },
  searchPlaceholder: { kk: 'Бөлме нөмірі немесе атауы бойынша іздеу', ru: 'Поиск по номеру или названию помещения' },
  searchLabel: { kk: 'Бөлмені іздеу', ru: 'Поиск помещения' },
  noResults: { kk: 'Ештеңе табылмады', ru: 'Ничего не найдено' },
  buildingsLabel: { kk: 'Корпус', ru: 'Корпус' },
  floorsLabel: { kk: 'Қабат', ru: 'Этаж' },
  workshopPlan: { kk: 'Шеберхана жоспары', ru: 'План мастерской' },
  roomCode: { kk: 'Бөлме нөмірі', ru: 'Номер помещения' },
  unnamedRoom: { kk: 'Бөлме', ru: 'Помещение' },
  close: { kk: 'Жабу', ru: 'Закрыть' },
  settings: { kk: 'Баптаулар', ru: 'Настройки' },
  theme: { kk: 'Тақырып', ru: 'Тема' },
  lightTheme: { kk: 'Ашық', ru: 'Светлая' },
  darkTheme: { kk: 'Қараңғы', ru: 'Тёмная' },
  language: { kk: 'Тіл', ru: 'Язык' },
  attributionNote: { kk: 'MIT лицензиясы.', ru: 'Лицензия MIT.' },
  projectCredit: {
    kk: 'Жоба: Tretorhate · tdk_college_map',
    ru: 'Проект: Tretorhate · tdk_college_map',
  },
  licenseLink: { kk: 'Лицензия мәтіні', ru: 'Текст лицензии' },
  zoomIn: { kk: 'Үлкейту', ru: 'Приблизить' },
  zoomOut: { kk: 'Кішірейту', ru: 'Отдалить' },
  fitView: { kk: 'Сыйғызу', ru: 'Вписать' },
  clearSearch: { kk: 'Тазалау', ru: 'Очистить' },
  detailsTitle: { kk: 'Бөлме туралы', ru: 'О помещении' },
} as const;

export type DictKey = keyof typeof dict;

export function t(locale: Locale, key: DictKey): string {
  return dict[key][locale];
}

export function buildingName(locale: Locale, id: string): string {
  if (id === 'main') return locale === 'kk' ? 'Бас корпус' : 'Главный корпус';
  if (id === 'it') return locale === 'kk' ? 'IT корпусы' : 'IT-корпус';
  return locale === 'kk' ? 'Өндірістік корпус' : 'Производственный корпус';
}

export function floorLabel(locale: Locale, floor: number): string {
  return locale === 'kk' ? `${floor}-қабат` : `${floor} этаж`;
}

export function documentTitle(locale: Locale): string {
  return locale === 'kk' ? 'Колледж картасы' : 'Карта колледжа';
}
