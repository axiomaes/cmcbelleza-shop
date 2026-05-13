import 'server-only';

const dictionaries = {
  es: () => import('../messages/es.json').then((module) => module.default),
  en: () => import('../messages/en.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  // Si el locale no es válido o no existe, cargamos español por defecto
  const loadDictionary = dictionaries[locale] || dictionaries.es;
  return loadDictionary();
};
