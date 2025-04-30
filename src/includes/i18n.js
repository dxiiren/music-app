import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import ms from "@/locales/ms.json";

export default createI18n({
  locale: "ms",
  fallbackLocale: "en",
  messages: {
    en,
    ms,
  },
  numberFormats: {
    en: {
      currency: {
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    ms: {
      currency: {
        style: "currency",
        currency: "MYR",
        currencyDisplay: "symbol",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  }
});