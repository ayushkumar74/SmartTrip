import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
 const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
 const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
 const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');
 const [country, setCountry] = useState(() => localStorage.getItem('country') || 'India');

 useEffect(() => {
 localStorage.setItem('theme', theme);
 localStorage.setItem('language', language);
 localStorage.setItem('currency', currency);
 localStorage.setItem('country', country);

 // Apply theme
 const root = window.document.documentElement;
 root.classList.remove('light', 'dark');

 if (theme === 'system') {
 const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
 root.classList.add(systemTheme);
 } else {
 root.classList.add(theme);
 }
 }, [theme, language, currency, country]);

 // Translation function
 const t = (key) => {
 return translations[language]?.[key] || translations['en']?.[key] || key;
 };

 const formatMoney = (amount, currencyCode = 'USD') => {
  const code = String(currencyCode || 'USD').toUpperCase();
  const numericAmount = Number(amount);
  const value = Number.isFinite(numericAmount) ? numericAmount : 0;
  const formatted = new Intl.NumberFormat(undefined, {
   style: 'currency',
   currency: code,
    currencyDisplay: code === 'INR' ? 'symbol' : 'code',
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
  }).format(value);
  return formatted;
 };

 // Keep live-provider currencies authoritative; catalog providers return INR.
 const formatCurrency = (amount, currencyCode = 'USD') => formatMoney(amount, currencyCode);

 const value = {
 theme,
 setTheme,
 language,
 setLanguage,
 currency,
 setCurrency,
 country,
 setCountry,
 t,
 formatCurrency,
 formatMoney
 };

 return (
 <SettingsContext.Provider value={value}>
 {children}
 </SettingsContext.Provider>
 );
}

export function useSettings() {
 const context = useContext(SettingsContext);
 if (!context) {
 throw new Error('useSettings must be used within a SettingsProvider');
 }
 return context;
}
