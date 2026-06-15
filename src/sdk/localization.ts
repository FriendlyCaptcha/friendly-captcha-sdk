/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type PlaceholderLocalization = {
  title: string;
  connecting: string;
  retrying: string;
  failed: string;
  newTab: string;
};

const PLACEHOLDER_LOCALIZATIONS: Record<string, PlaceholderLocalization> = {
  ar: {
    title: "التحقق من مكافحة الروبوتات",
    connecting: "التحقق من مكافحة الروبوتات قيد الاتصال…",
    retrying: "استغرق الاتصال بالتحقق من مكافحة الروبوتات وقتًا طويلاً.\n\nإعادة المحاولة…",
    failed: "فشل الاتصال بالتحقق من مكافحة الروبوتات.",
    newTab: "يفتح في تبويب جديد",
  },
  bg: {
    title: "Проверка срещу роботи",
    connecting: "Зарежда се задачата…",
    retrying: "Неуспешно свързване.\n\nОпит за повторно свързване…",
    failed: "Неуспешно свързване.",
    newTab: "отваря се в нов раздел",
  },
  ca: {
    title: "Verificació anti-robot",
    connecting: "Carregant el desafiament…",
    retrying: "Errada de conexió.\n\nReintentant…",
    failed: "Errada de conexió.",
    newTab: "s'obre en una pestanya nova",
  },
  cs: {
    title: "Ověření proti robotům",
    connecting: "Připojování kontroly proti robotům…",
    retrying: "Připojení kontroly proti robotům trvalo příliš dlouho.\n\nOpakuji pokus…",
    failed: "Kontrola proti robotům se nepodařilo připojit.",
    newTab: "otevře se na nové kartě",
  },
  da: {
    title: "Anti-robot-verifikation",
    connecting: "Anti-robot-kontrol forbinder…",
    retrying: "Anti-robot-kontrol tog for lang tid at oprette forbindelse.\n\nPrøver igen…",
    failed: "Anti-robot-kontrol kunne ikke oprette forbindelse.",
    newTab: "åbner i ny fane",
  },
  nl: {
    title: "Anti-robotcheck",
    connecting: "Verbinden met Anti-robotcheck…",
    retrying: "Verbinden met Anti-robotcheck mislukt.\n\nOpnieuw aan het proberen…",
    failed: "Verbinden met Anti-robotcheck mislukt.",
    newTab: "opent in nieuw tabblad",
  },
  en: {
    title: "Anti-Robot verification",
    connecting: "Anti-Robot check connecting…",
    retrying: "Anti-Robot check took too long to connect.\n\nRetrying…",
    failed: "Anti-Robot check failed to connect.",
    newTab: "opens in new tab",
  },
  fi: {
    title: "Robottien torjunnan vahvistus",
    connecting: "Robottien torjunnan tarkistus käynnissä…",
    retrying: "Robottien torjunnan tarkistus kesti liian kauan.\n\nYritetään uudelleen…",
    failed: "Robottien torjunnan tarkistus epäonnistui.",
    newTab: "avautuu uuteen välilehteen",
  },
  fr: {
    title: "Vérification anti-robot",
    connecting: "Connexion à la vérification anti-robot…",
    retrying: "La connexion à la vérification anti-robot a pris trop de temps.\n\nNouvelle tentative…",
    failed: "Échec de la connexion à la vérification anti-robot.",
    newTab: "s'ouvre dans un nouvel onglet",
  },
  de: {
    title: "Anti-Roboter-Verifizierung",
    connecting: "Verbindung zur Anti-Roboter-Verifizierung wird hergestellt…",
    retrying: "Verbindung zur Anti-Roboter-Verifizierung hat zu lange gedauert.\n\nErneuter Versuch…",
    failed: "Verbindung zur Anti-Roboter-Verifizierung ist fehlgeschlagen.",
    newTab: "öffnet in neuem Tab",
  },
  hi: {
    title: "एंटी-रोबोट सत्यापन",
    connecting: "चुनौती लोड हो रही है…",
    retrying: "कनेक्शन विफल.\n\nपुनः प्रयास कर रहे हैं…",
    failed: "कनेक्शन विफल.",
    newTab: "नए टैब में खुलता है",
  },
  hu: {
    title: "Robotellenőrzés",
    connecting: "Robotellenőrzés csatlakozás…",
    retrying: "A robotellenőrzés túl sokáig tartott a csatlakozáshoz.\n\nÚjrapróbálom…",
    failed: "A robotellenőrzés nem tudott csatlakozni.",
    newTab: "új lapon nyílik meg",
  },
  id: {
    title: "Verifikasi Anti-Robot",
    connecting: "Pemeriksaan Anti-Robot sedang terhubung…",
    retrying: "Pemeriksaan Anti-Robot memakan waktu terlalu lama untuk terhubung.\n\nMencoba lagi…",
    failed: "Pemeriksaan Anti-Robot gagal terhubung.",
    newTab: "terbuka di tab baru",
  },
  ja: {
    title: "ロボット防止認証",
    connecting: "チャレンジを読み込んでいます…",
    retrying: "接続失敗.\n\n再試行中…",
    failed: "接続失敗.",
    newTab: "新しいタブで開きます",
  },
  it: {
    title: "Verifica anti-robot",
    connecting: "Connessione verifica anti-robot in corso…",
    retrying: "La connessione alla verifica anti-robot ha richiesto troppo tempo.\n\nRiprovando…",
    failed: "Impossibile connettersi alla verifica anti-robot.",
    newTab: "si apre in una nuova scheda",
  },
  nb: {
    title: "Anti-robot-verifisering",
    connecting: "Laster inn utfordring…",
    retrying: "Klarte ikke å koble til.\n\nPrøver igjen…",
    failed: "Klarte ikke å koble til.",
    newTab: "åpnes i ny fane",
  },
  pl: {
    title: "Weryfikacja antyrobotowa",
    connecting: "Łączenie się z kontrolą antyrobotową…",
    retrying: "Łączenie się z kontrolą antyrobotową trwało zbyt długo. \n\nPonowna próba…",
    failed: "Nie udało się połączyć z kontrolą antyrobotową.",
    newTab: "otwiera się w nowej karcie",
  },
  ro: {
    title: "Verificare anti-robot",
    connecting: "Se incarca testul…",
    retrying: "Conexiunea a esuat.\n\nReincercare…",
    failed: "Conexiunea a esuat.",
    newTab: "se deschide într-o filă nouă",
  },
  pt: {
    title: "Verificação anti-robô",
    connecting: "Verificação anti-robô a ligar…",
    retrying: "A verificação anti-robô demorou demasiado tempo a ligar-se.\n\nA tentar novamente…",
    failed: "A verificação anti-robô não conseguiu ligar-se.",
    newTab: "abre num novo separador",
  },
  ru: {
    title: "Проверка антиробота",
    connecting: "Подключение к проверке антиробота…",
    retrying: "Подключение к проверке антиробота заняло слишком много времени.\n\nПовторяем попытку…",
    failed: "Не удалось подключиться к проверке антиробота.",
    newTab: "откроется в новой вкладке",
  },
  sk: {
    title: "Overovanie proti robotom",
    connecting: "Pripojenie kontroly proti robotom…",
    retrying: "Pripojenie kontroly proti robotom trvalo príliš dlho.\n\nOpakujem pokus…",
    failed: "Pripojenie kontroly proti robotom sa nepodarilo.",
    newTab: "otvorí sa na novej karte",
  },
  sl: {
    title: "Preverjanje proti robotom",
    connecting: "Nalaganje izziva…",
    retrying: "Povezava ni uspela.\n\nPonovni poskus…",
    failed: "Povezava ni uspela.",
    newTab: "odpre se v novem zavihku",
  },
  es: {
    title: "Verificación antirrobot",
    connecting: "Conectando verificación antirrobot…",
    retrying: "La verificación antirrobot tardó demasiado en conectarse.\n\nReintentando…",
    failed: "Error al conectar la verificación antirrobot.",
    newTab: "se abre en una pestaña nueva",
  },
  sv: {
    title: "Anti-robotverifiering",
    connecting: "Anti-robotverifiering ansluter…",
    retrying: "Anti-robotverifiering tog för lång tid att ansluta.\n\nFörsöker igen…",
    failed: "Anti-robotverifiering kunde inte ansluta.",
    newTab: "öppnas i ny flik",
  },
  th: {
    title: "การตรวจสอบป้องกันบอท",
    connecting: "กำลังโหลดการท้าทาย…",
    retrying: "เชื่อมต่อไม่สำเร็จ.\n\nกำลังลองใหม่…",
    failed: "เชื่อมต่อไม่สำเร็จ.",
    newTab: "เปิดในแท็บใหม่",
  },
  tr: {
    title: "Robot önleme doğrulaması",
    connecting: "Robot önleme kontrolü bağlanıyor…",
    retrying: "Robot önleme kontrolü bağlanmak için çok uzun sürdü.\n\nYeniden deniyor…",
    failed: "Robot önleme kontrolü bağlanamadı.",
    newTab: "yeni sekmede açılır",
  },
  vi: {
    title: "Xác minh chống robot",
    connecting: "Kiểm tra robot đang kết nối…",
    retrying: "Kiểm tra chống robot mất quá nhiều thời gian để kết nối.\n\nĐang thử lại…",
    failed: "Kiểm tra chống robot không thể kết nối.",
    newTab: "mở trong tab mới",
  },
  zh: {
    title: "反机器人验证",
    connecting: "反机器人验证正在连接…",
    retrying: "反机器人验证连接耗时过长。\n\n正在重试…",
    failed: "反机器人验证连接失败。",
    newTab: "在新标签页中打开",
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

export function getLocalizedText(lang: string, type: keyof PlaceholderLocalization): string {
  lang = getLanguageCode(lang);
  const messages = PLACEHOLDER_LOCALIZATIONS[lang] || PLACEHOLDER_LOCALIZATIONS["en"];
  return messages[type];
}
