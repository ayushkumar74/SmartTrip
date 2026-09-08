import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';

const SettingsContext = createContext();

const CURRENCY_RATES = {
 USD: 1,
 INR: 83.5, // Mock rate for fallback
 EUR: 0.92 // Mock rate for fallback
};

const CURRENCY_SYMBOLS = {
 USD: '$',
 INR: '₹',
 EUR: '€'
};

export function SettingsProvider({ children }) {
 const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
 const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
 const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');

 useEffect(() => {
 localStorage.setItem('theme', theme);
 localStorage.setItem('language', language);
 localStorage.setItem('currency', currency);

 // Apply theme
 const root = window.document.documentElement;
 root.classList.remove('light', 'dark');

 if (theme === 'system') {
 const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
 root.classList.add(systemTheme);
 } else {
 root.classList.add(theme);
 }
 }, [theme, language, currency]);

 // Translation function
 const t = (key) => {
 return translations[language]?.[key] || translations['en']?.[key] || key;
 };

 // Centralized currency formatting. All DB prices are in USD.
 const formatCurrency = (usdAmount) => {
 const rate = CURRENCY_RATES[currency] || 1;
 const symbol = CURRENCY_SYMBOLS[currency] || '$';
 const converted = (usdAmount * rate).toFixed(2);
 // Add comma separators
 return `${symbol}${Number(converted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
 };

 const value = {
 theme,
 setTheme,
 language,
 setLanguage,
 currency,
 setCurrency,
 t,
 formatCurrency
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
