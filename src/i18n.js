import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "slogan" : "Your Village, Your Doctor",
      "brand": "MediMitra",
      "home": "Home",
      "locate": "Locate Nearby Centres",
      "records": "My Records",
      "check": "Connect with Doctor",
      "find_medicine": "Find Medicine",
      "medical_history": "Medical History",
      "signin": "Sign In",
      "signup": "Sign Up",
      "email": "Email",
      "password": "Password",
      "name": "Name",
      "language": "Language",
      "search": "Search",
      "download": "Download"
    }
  },
  hi: {
    translation: {
      "slogan" : "आपका गाँव, आपका डॉक्टर",
      "brand": "MediMitra",
      "home": "होम",
      "locate": "नज़दीकी केंद्र खोजें",
      "records": "मेरे रिकॉर्ड",
      "check": "डॉक्टर से जुड़ें",
      "find_medicine": "दवा खोजें",
      "medical_history": "चिकित्सा इतिहास",
      "signin": "साइन इन",
      "signup": "साइन अप",
      "email": "ईमेल",
      "password": "पासवर्ड",
      "name": "नाम",
      "language": "भाषा",
      "search": "खोजें",
      "download": "डाउनलोड"
    }
  },
  pa: {
    translation: {
      "slogan" : "ਤੁਹਾਡਾ ਪਿੰਡ, ਤੁਹਾਡਾ ਡਾਕਟਰ",
      "brand": "MediMitra",
      "home": "ਹੋਮ",
      "locate": "ਨੇੜਲੇ ਕੇਂਦਰ ਲੱਭੋ",
      "records": "ਮੇਰੇ ਰਿਕਾਰਡ",
      "check": "ਆਪਣਾ ਸਿਹਤ ਚੈਕ ਕਰੋ",
      "find_medicine": "ਦਵਾ ਲੱਭੋ",
      "medical_history": "ਮੈਡੀਕਲ ਇਤਿਹਾਸ",
      "signin": "ਸਾਈਨ ਇਨ",
      "signup": "ਸਾਈਨ ਅੱਪ",
      "email": "ਈਮੇਲ",
      "password": "ਪਾਸਵਰਡ",
      "name": "ਨਾਂ",
      "language": "ਭਾਸ਼ਾ",
      "search": "ਖੋਜ",
      "download": "ਡਾਊਨਲੋਡ"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;