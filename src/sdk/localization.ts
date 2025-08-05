/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const PLACEHOLDER_LOCALIZATIONS: Record<
  string,
  { title: string; connecting: string; retrying: string; failed: string }
> = {
  ar: {
    title: "التحقق من مكافحة الروبوتات",
    connecting: "التحقق من مكافحة الروبوتات قيد الاتصال…",
    retrying: "استغرق الاتصال بالتحقق من مكافحة الروبوتات وقتًا طويلاً.\n\nإعادة المحاولة…",
    failed: "فشل الاتصال بالتحقق من مكافحة الروبوتات.",
  },
  cs: {
    title: "Ověření proti robotům",
    connecting: "Připojování kontroly proti robotům…",
    retrying: "Připojení kontroly proti robotům trvalo příliš dlouho.\n\nOpakuji pokus…",
    failed: "Kontrola proti robotům se nepodařilo připojit.",
  },
  da: {
    title: "Anti-robot-verifikation",
    connecting: "Anti-robot-kontrol forbinder…",
    retrying: "Anti-robot-kontrol tog for lang tid at oprette forbindelse.\n\nPrøver igen…",
    failed: "Anti-robot-kontrol kunne ikke oprette forbindelse.",
  },
  nl: {
    title: "Anti-robotcheck",
    connecting: "Verbinden met Anti-robotcheck…",
    retrying: "Verbinden met Anti-robotcheck mislukt.\n\nOpnieuw aan het proberen…",
    failed: "Verbinden met Anti-robotcheck mislukt.",
  },
  en: {
    title: "Anti-Robot verification",
    connecting: "Anti-Robot check connecting…",
    retrying: "Anti-Robot check took too long to connect.\n\nRetrying…",
    failed: "Anti-Robot check failed to connect.",
  },
  fi: {
    title: "Robottien torjunnan vahvistus",
    connecting: "Robottien torjunnan tarkistus käynnissä…",
    retrying: "Robottien torjunnan tarkistus kesti liian kauan.\n\nYritetään uudelleen…",
    failed: "Robottien torjunnan tarkistus epäonnistui.",
  },
  fr: {
    title: "Vérification anti-robot",
    connecting: "Connexion à la vérification anti-robot…",
    retrying: "La connexion à la vérification anti-robot a pris trop de temps.\n\nNouvelle tentative…",
    failed: "Échec de la connexion à la vérification anti-robot.",
  },
  de: {
    title: "Anti-Roboter-Verifizierung",
    connecting: "Verbindung zur Anti-Roboter-Verifizierung wird hergestellt…",
    retrying: "Verbindung zur Anti-Roboter-Verifizierung hat zu lange gedauert.\n\nErneuter Versuch…",
    failed: "Verbindung zur Anti-Roboter-Verifizierung ist fehlgeschlagen.",
  },
  hu: {
    title: "Robotellenőrzés",
    connecting: "Robotellenőrzés csatlakozás…",
    retrying: "A robotellenőrzés túl sokáig tartott a csatlakozáshoz.\n\nÚjrapróbálom…",
    failed: "A robotellenőrzés nem tudott csatlakozni.",
  },
  id: {
    title: "Verifikasi Anti-Robot",
    connecting: "Pemeriksaan Anti-Robot sedang terhubung…",
    retrying: "Pemeriksaan Anti-Robot memakan waktu terlalu lama untuk terhubung.\n\nMencoba lagi…",
    failed: "Pemeriksaan Anti-Robot gagal terhubung.",
  },
  it: {
    title: "Verifica anti-robot",
    connecting: "Connessione verifica anti-robot in corso…",
    retrying: "La connessione alla verifica anti-robot ha richiesto troppo tempo.\n\nRiprovando…",
    failed: "Impossibile connettersi alla verifica anti-robot.",
  },
  pl: {
    title: "Weryfikacja antyrobotowa",
    connecting: "Łączenie się z kontrolą antyrobotową…",
    retrying: "Łączenie się z kontrolą antyrobotową trwało zbyt długo. \n\nPonowna próba…",
    failed: "Nie udało się połączyć z kontrolą antyrobotową.",
  },
  pt: {
    title: "Verificação anti-robô",
    connecting: "Verificação anti-robô a ligar…",
    retrying: "A verificação anti-robô demorou demasiado tempo a ligar-se.\n\nA tentar novamente…",
    failed: "A verificação anti-robô não conseguiu ligar-se.",
  },
  ru: {
    title: "Проверка антиробота",
    connecting: "Подключение к проверке антиробота…",
    retrying: "Подключение к проверке антиробота заняло слишком много времени.\n\nПовторяем попытку…",
    failed: "Не удалось подключиться к проверке антиробота.",
  },
  sk: {
    title: "Overovanie proti robotom",
    connecting: "Pripojenie kontroly proti robotom…",
    retrying: "Pripojenie kontroly proti robotom trvalo príliš dlho.\n\nOpakujem pokus…",
    failed: "Pripojenie kontroly proti robotom sa nepodarilo.",
  },
  es: {
    title: "Verificación antirrobot",
    connecting: "Conectando verificación antirrobot…",
    retrying: "La verificación antirrobot tardó demasiado en conectarse.\n\nReintentando…",
    failed: "Error al conectar la verificación antirrobot.",
  },
  sv: {
    title: "Anti-robotverifiering",
    connecting: "Anti-robotverifiering ansluter…",
    retrying: "Anti-robotverifiering tog för lång tid att ansluta.\n\nFörsöker igen…",
    failed: "Anti-robotverifiering kunde inte ansluta.",
  },
  tr: {
    title: "Robot önleme doğrulaması",
    connecting: "Robot önleme kontrolü bağlanıyor…",
    retrying: "Robot önleme kontrolü bağlanmak için çok uzun sürdü.\n\nYeniden deniyor…",
    failed: "Robot önleme kontrolü bağlanamadı.",
  },
  vi: {
    title: "Xác minh chống robot",
    connecting: "Kiểm tra robot đang kết nối…",
    retrying: "Kiểm tra chống robot mất quá nhiều thời gian để kết nối.\n\nĐang thử lại…",
    failed: "Kiểm tra chống robot không thể kết nối.",
  },
  zh: {
    title: "反机器人验证",
    connecting: "反机器人验证正在连接…",
    retrying: "反机器人验证连接耗时过长。\n\n正在重试…",
    failed: "反机器人验证连接失败。",
  },
};

// Languages that require a right-to-left layout.
const RTL_LANGUAGES = ["ar", "he", "fa", "ur", "ps", "sd", "yi"];

function getLanguageCode(lang: string): string {
  return lang.toLowerCase().split("-")[0].split("_")[0];
}

export function isRTLLanguage(lang: string): boolean {
  lang = getLanguageCode(lang);
  return RTL_LANGUAGES.indexOf(lang) !== -1;
}

export function getLocalizedWidgetTitle(lang: string): string {
  lang = getLanguageCode(lang);
  const messages = PLACEHOLDER_LOCALIZATIONS[lang] || PLACEHOLDER_LOCALIZATIONS["en"];
  return messages.title + " - Widget";
}

export function getLocalizedPlaceholderText(lang: string, type: "connecting" | "failed" | "retrying"): string {
  lang = getLanguageCode(lang);
  const messages = PLACEHOLDER_LOCALIZATIONS[lang] || PLACEHOLDER_LOCALIZATIONS["en"];
  return messages[type];
}
