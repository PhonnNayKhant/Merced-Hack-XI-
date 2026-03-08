"use client";

import { createContext, useContext, useState, useCallback } from "react";

// All UI strings from page.jsx
export const DEFAULT_STRINGS = {
  appName: "SolShield",
  tagline: "Secure Savings",
  protected: "Protected",
  availableBalance: "Available Balance",
  digitalDollars: "Digital Dollars (USDC)",
  receive: "Receive",
  send: "Send",
  receivingCode: "Your receiving code:",
  recentActivity: "Recent Activity",
  loadingTransactions: "Loading transactions...",
  noTransactions: "No recent transactions",
  receiveUSDC: "Receive USDC",
  sendUSDC: "Send USDC",
  copyAddress: "Copy Address",
  recipientAddress: "Recipient Address",
  solanaAddressPlaceholder: "Solana address...",
  invalidAddress: "Invalid Solana address",
  amountUSDC: "Amount (USDC)",
  bal: "Bal",
  max: "MAX",
  insufficientFunds: "Insufficient funds",
  confirmSend: "Confirm Send",
  sending: "Sending...",
  sent: "Sent!",
  sentSuccess: "was sent successfully.",
  viewOnExplorer: "View on Explorer",
  done: "Done",
  // Chat widget
  typeMessage: "Ask anything about SolShield...",
  askAnything: "Ask me anything about your wallet!",
  poweredBy: "Powered by Gemini AI",
  // Language selector
  translating: "Translating...",
  // Deposit modal
  deposit: "Deposit",
  depositTitle: "Fund Your Wallet",
  depositSubtitle: "Share your address or scan the QR code to receive assets.",
  devnetNotice: "This address accepts Solana Devnet assets only. Do not send real funds to this address.",
  requestDevnetSOL: "Request Devnet SOL",
  airdropProcessing: "Requesting airdrop...",
  airdropSuccess: "Deposit Confirmed! SOL airdropped successfully.",
  airdropError: "Airdrop failed. Try faucet.solana.com instead.",
  copied: "Copied!",
};

// Optional built-in translations so the UI works
// even if the external AI API is unavailable.
// Add more languages here as needed.
const LOCAL_TRANSLATIONS = {
  my: {
    appName: "SolShield",
    tagline: "လုံခြုံသော စုနေလွှာ",
    protected: "အာမခံထားသည်",
    availableBalance: "အသုံးပြုလိုက်နိုင်သော လက်ကျန်",
    digitalDollars: "ဒစ်ဂျစ်တယ် ဒေါ်လာများ (USDC)",
    receive: "လက်ခံမည်",
    send: "ပို့မည်",
    receivingCode: "သင့်လက်ခံရရှိရေး ကုဒ်:",
    recentActivity: "လတ်တလော လုပ်ဆောင်ချက်များ",
    loadingTransactions: "လုပ်ငန်းစဉ်များ တင်ယူနေသည်...",
    noTransactions: "လတ်တလော လုပ်ငန်းစဉ် မရှိပါ",
    receiveUSDC: "USDC လက်ခံမည်",
    sendUSDC: "USDC ပို့မည်",
    copyAddress: "လိပ်စာ ကူးယူမည်",
    recipientAddress: "လက်ခံသူ လိပ်စာ",
    solanaAddressPlaceholder: "Solana လိပ်စာ...",
    invalidAddress: "Solana လိပ်စာ မမှန်ကန်ပါ",
    amountUSDC: "ပမာဏ (USDC)",
    bal: "အကြွင်း",
    max: "အကုန်လုံး",
    insufficientFunds: "လက်ကျန်မလုံလောက်ပါ",
    confirmSend: "ပို့ခြင်း အတည်ပြုမည်",
    sending: "ပို့နေသည်...",
    sent: "ပို့ပြီးပါပြီ!",
    sentSuccess: "ကို အောင်မြင်စွာ ပို့ပြီးပါပြီ။",
    viewOnExplorer: "Explorer တွင်ကြည့်မည်",
    done: "ပြီးပြီ",
    typeMessage: "SolShield အကြောင်း မည်သည့်မေးခွန်းမဆို မေးလိုက်ပါ...",
    askAnything: "သင့်ပိုက်ဆံအိတ်အကြောင်း မည်သည့်မေးခွန်းမဆို မေးပါ။",
    poweredBy: "Gemini AI ဖြင့် လည်ပတ်သည်",
    translating: "ဘာသာပြန်နေသည်...",
  },
  es: {
    appName: "SolShield",
    tagline: "Ahorros seguros",
    protected: "Protegido",
    availableBalance: "Saldo disponible",
    digitalDollars: "Dólares digitales (USDC)",
    receive: "Recibir",
    send: "Enviar",
    receivingCode: "Tu código de recepción:",
    recentActivity: "Actividad reciente",
    loadingTransactions: "Cargando transacciones...",
    noTransactions: "Sin transacciones recientes",
    receiveUSDC: "Recibir USDC",
    sendUSDC: "Enviar USDC",
    copyAddress: "Copiar dirección",
    recipientAddress: "Dirección del destinatario",
    solanaAddressPlaceholder: "Dirección de Solana...",
    invalidAddress: "Dirección de Solana no válida",
    amountUSDC: "Cantidad (USDC)",
    bal: "Saldo",
    max: "MÁX",
    insufficientFunds: "Fondos insuficientes",
    confirmSend: "Confirmar envío",
    sending: "Enviando...",
    sent: "¡Enviado!",
    sentSuccess: "se envió correctamente.",
    viewOnExplorer: "Ver en el explorador",
    done: "Listo",
    typeMessage: "Pregunta lo que quieras sobre SolShield...",
    askAnything: "¡Pregunta lo que quieras sobre tu billetera!",
    poweredBy: "Impulsado por Gemini AI",
    translating: "Traduciendo...",
  },
  // Conflict-affected regions — local translations for offline/reliability
  uk: {
    appName: "SolShield",
    tagline: "Захищені заощадження",
    protected: "Захищено",
    availableBalance: "Доступний баланс",
    digitalDollars: "Цифрові долари (USDC)",
    receive: "Отримати",
    send: "Надіслати",
    receivingCode: "Ваш код для отримання:",
    recentActivity: "Остання активність",
    loadingTransactions: "Завантаження транзакцій...",
    noTransactions: "Немає останніх транзакцій",
    receiveUSDC: "Отримати USDC",
    sendUSDC: "Надіслати USDC",
    copyAddress: "Копіювати адресу",
    recipientAddress: "Адреса отримувача",
    solanaAddressPlaceholder: "Адреса Solana...",
    invalidAddress: "Невірна адреса Solana",
    amountUSDC: "Сума (USDC)",
    bal: "Баланс",
    max: "МАКС",
    insufficientFunds: "Недостатньо коштів",
    confirmSend: "Підтвердити відправку",
    sending: "Надсилання...",
    sent: "Надіслано!",
    sentSuccess: "успішно надіслано.",
    viewOnExplorer: "Переглянути в Explorer",
    done: "Готово",
    typeMessage: "Запитайте що завгодно про SolShield...",
    askAnything: "Запитайте мене що завгодно про ваш гаманець!",
    poweredBy: "Працює на Gemini AI",
    translating: "Переклад...",
  },
  ar: {
    appName: "SolShield",
    tagline: "ادخار آمن",
    protected: "محمي",
    availableBalance: "الرصيد المتاح",
    digitalDollars: "دولارات رقمية (USDC)",
    receive: "استلام",
    send: "إرسال",
    receivingCode: "رمز الاستلام الخاص بك:",
    recentActivity: "النشاط الأخير",
    loadingTransactions: "جاري تحميل المعاملات...",
    noTransactions: "لا توجد معاملات حديثة",
    receiveUSDC: "استلام USDC",
    sendUSDC: "إرسال USDC",
    copyAddress: "نسخ العنوان",
    recipientAddress: "عنوان المستلم",
    solanaAddressPlaceholder: "عنوان Solana...",
    invalidAddress: "عنوان Solana غير صالح",
    amountUSDC: "المبلغ (USDC)",
    bal: "الرصيد",
    max: "الحد الأقصى",
    insufficientFunds: "رصيد غير كافٍ",
    confirmSend: "تأكيد الإرسال",
    sending: "جاري الإرسال...",
    sent: "تم الإرسال!",
    sentSuccess: "تم إرساله بنجاح.",
    viewOnExplorer: "عرض في المستكشف",
    done: "تم",
    typeMessage: "اسأل أي شيء عن SolShield...",
    askAnything: "اسألني أي شيء عن محفظتك!",
    poweredBy: "مدعوم من Gemini AI",
    translating: "جاري الترجمة...",
  },
  prs: {
    appName: "SolShield",
    tagline: "پس‌انداز امن",
    protected: "محافظت شده",
    availableBalance: "موجودی موجود",
    digitalDollars: "دالرهای دیجیتال (USDC)",
    receive: "دریافت",
    send: "ارسال",
    receivingCode: "کد دریافت شما:",
    recentActivity: "فعالیت‌های اخیر",
    loadingTransactions: "در حال بارگذاری معاملات...",
    noTransactions: "معامله اخیری وجود ندارد",
    receiveUSDC: "دریافت USDC",
    sendUSDC: "ارسال USDC",
    copyAddress: "کپی آدرس",
    recipientAddress: "آدرس گیرنده",
    solanaAddressPlaceholder: "آدرس Solana...",
    invalidAddress: "آدرس Solana نامعتبر است",
    amountUSDC: "مبلغ (USDC)",
    bal: "موجودی",
    max: "حداکثر",
    insufficientFunds: "موجودی کافی نیست",
    confirmSend: "تأیید ارسال",
    sending: "در حال ارسال...",
    sent: "ارسال شد!",
    sentSuccess: "با موفقیت ارسال شد.",
    viewOnExplorer: "مشاهده در Explorer",
    done: "انجام شد",
    typeMessage: "هر سوالی درباره SolShield بپرسید...",
    askAnything: "هر سوالی درباره کیف پول خود بپرسید!",
    poweredBy: "با Gemini AI",
    translating: "در حال ترجمه...",
  },
  so: {
    appName: "SolShield",
    tagline: "Kayditaan Ammaan ah",
    protected: "Ilaaliyey",
    availableBalance: "Dharqaadka la heli karo",
    digitalDollars: "Doolarrada Digital (USDC)",
    receive: "Hel",
    send: "Dir",
    receivingCode: "Koodka aad hesho:",
    recentActivity: "Hawlgalka dhawaan",
    loadingTransactions: "Soo dejinta macaamiisha...",
    noTransactions: "Macaamiil dhawaan ah ma jiraan",
    receiveUSDC: "Hel USDC",
    sendUSDC: "Dir USDC",
    copyAddress: "Koobiyo ciwaanka",
    recipientAddress: "Ciwaanka qaataha",
    solanaAddressPlaceholder: "Ciwaanka Solana...",
    invalidAddress: "Ciwaanka Solana ma saxna",
    amountUSDC: "Qadarka (USDC)",
    bal: "Dharqaad",
    max: "U GUUD",
    insufficientFunds: "Maqal ma filan",
    confirmSend: "Xaqiiji diritaanka",
    sending: "Diritaanka...",
    sent: "Waa la diray!",
    sentSuccess: "si guul leh ayaa loo diray.",
    viewOnExplorer: "Arag Explorer",
    done: "Dhammaystir",
    typeMessage: "Wax kasta weydii oo ku saabsan SolShield...",
    askAnything: "Wax kasta weydii oo ku saabsan boorsadaada!",
    poweredBy: "Ku taageeray Gemini AI",
    translating: "Turjumaayo...",
  },
  am: {
    appName: "SolShield",
    tagline: "ደህንነቱ የተጠበቀ ቁጠባ",
    protected: "የተጠበቀ",
    availableBalance: "የሚገኝ ቀሪ ሂሳብ",
    digitalDollars: "ዲጂታል ዶላር (USDC)",
    receive: "ተቀበል",
    send: "ላክ",
    receivingCode: "የመቀበያ ኮድዎ:",
    recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
    loadingTransactions: "ግብይቶች በመጫን ላይ...",
    noTransactions: "የቅርብ ጊዜ ግብይት የለም",
    receiveUSDC: "USDC ተቀበል",
    sendUSDC: "USDC ላክ",
    copyAddress: "አድራሻ ቅዳ",
    recipientAddress: "የተቀባይ አድራሻ",
    solanaAddressPlaceholder: "የSolana አድራሻ...",
    invalidAddress: "የSolana አድራሻ ልክ ያልሆነ",
    amountUSDC: "መጠን (USDC)",
    bal: "ቀሪ ሂሳብ",
    max: "ከፍተኛ",
    insufficientFunds: "በቂ ገንዘብ የለም",
    confirmSend: "ላክ አረጋግጥ",
    sending: "በላክ ላይ...",
    sent: "ተላከ!",
    sentSuccess: "በተሳካ ሁኔታ ተላከ።",
    viewOnExplorer: "በExplorer ላይ ተመልከት",
    done: "ተጠናቅቋል",
    typeMessage: "ስለ SolShield ማንኛውንም ጥያቄ ጠይቅ...",
    askAnything: "ስለ ቦርሳዎ ማንኛውንም ጥያቄ ጠይቅ!",
    poweredBy: "በGemini AI ይሰራል",
    translating: "በመተርጎም ላይ...",
  },
};

export const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  // Conflict-affected regions (prioritized)
  { code: "my", name: "Burmese", native: "မြန်မာ" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "prs", name: "Dari", native: "دری" },
  { code: "so", name: "Somali", native: "Soomaali" },
  { code: "am", name: "Amharic", native: "አማርኛ" },
  // Other languages
  { code: "es", name: "Spanish", native: "Español" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "fr", name: "French", native: "Français" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "th", name: "Thai", native: "ไทย" },
];

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [currentLang, setCurrentLang] = useState("en");
  const [strings, setStrings] = useState(DEFAULT_STRINGS);
  const [isTranslating, setIsTranslating] = useState(false);

  const switchLanguage = useCallback(async (langCode, walletAddress) => {
    if (langCode === "en") {
      setStrings(DEFAULT_STRINGS);
      setCurrentLang("en");
      // Save to MongoDB if we have a wallet address
      if (walletAddress) {
        fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: walletAddress, language: "en" }),
        }).catch(() => { });
      }
      return;
    }

    // First try local translations so the app keeps working
    // even if the external AI API is out of quota.
    const localStrings = LOCAL_TRANSLATIONS[langCode];
    if (localStrings) {
      setStrings(localStrings);
      setCurrentLang(langCode);
      if (walletAddress) {
        fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: walletAddress, language: langCode }),
        }).catch(() => { });
      }
      return;
    }

    setIsTranslating(true);
    try {
      const langName = LANGUAGES.find((l) => l.code === langCode)?.name || langCode;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text: DEFAULT_STRINGS,
          targetLang: langName,
        }),
      });
      const data = await res.json();
      if (data.translated) {
        setStrings(data.translated);
        setCurrentLang(langCode);
        // Save language preference to MongoDB
        if (walletAddress) {
          fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: walletAddress, language: langCode }),
          }).catch(() => { });
        }
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const t = useCallback(
    (key) => strings[key] || DEFAULT_STRINGS[key] || key,
    [strings]
  );

  return (
    <TranslationContext.Provider
      value={{ t, currentLang, switchLanguage, isTranslating, LANGUAGES }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}