import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Palette, Globe, DollarSign, Bell, Shield, User, Map, Accessibility, Database, Info, Loader2 } from 'lucide-react';

const preferenceDefaults = {
 bookingNotifications: true,
 paymentNotifications: true,
 tripNotifications: true,
 travelStyles: [],
 budgetLevel: null,
};

const travelStyleOptions = ['Beach', 'Adventure', 'Relaxation', 'Luxury'];
const budgetOptions = ['Budget', 'Mid-range', 'Luxury'];

export default function Settings() {
 const { theme, setTheme, language, setLanguage, currency, setCurrency, t } = useSettings();
 const { user } = useAuth();
 const [activeTab, setActiveTab] = useState('appearance');
 const [preferences, setPreferences] = useState(preferenceDefaults);
 const [preferencesLoading, setPreferencesLoading] = useState(true);
 const [preferencesError, setPreferencesError] = useState('');
 const [savingField, setSavingField] = useState('');
 const preferenceQueue = useRef(Promise.resolve());
 const preferenceVersions = useRef({});

 useEffect(() => {
  let active = true;
  setPreferencesLoading(true);
  setPreferencesError('');
  userService.getPreferences()
   .then((response) => {
	if (!active) return;
	const loaded = response.data?.preferences || {};
	setPreferences({
	 ...preferenceDefaults,
	 ...loaded,
	 travelStyles: Array.isArray(loaded.travelStyles) ? loaded.travelStyles : [],
	});
   })
   .catch((error) => {
	if (active) setPreferencesError(error.response?.data?.message || 'Unable to load your preferences.');
   })
   .finally(() => {
	if (active) setPreferencesLoading(false);
   });
  return () => { active = false; };
 }, [user]);

 const savePreference = (field, value) => {
  const version = (preferenceVersions.current[field] || 0) + 1;
  preferenceVersions.current[field] = version;
  setPreferences((current) => ({ ...current, [field]: value }));
  setPreferencesError('');
  setSavingField(field);

  const save = async () => {
   try {
	const response = await userService.updatePreferences({ [field]: value });
	if (preferenceVersions.current[field] === version) {
	 const saved = response.data?.preferences || {};
	 setPreferences((current) => ({ ...current, [field]: saved[field] }));
	 setSavingField('');
	}
   } catch (error) {
	if (preferenceVersions.current[field] === version) {
	 setPreferencesError(error.response?.data?.message || 'Unable to save this preference.');
	 setSavingField('');
	}
   }
  };

  const queued = preferenceQueue.current.then(save, save);
  preferenceQueue.current = queued.catch(() => {});
 };

 const toggleTravelStyle = (style) => {
  const next = preferences.travelStyles.includes(style)
   ? preferences.travelStyles.filter((item) => item !== style)
   : [...preferences.travelStyles, style];
  savePreference('travelStyles', next);
 };

 const navItems = [
 { id: 'appearance', label: t('settings.theme') || 'Appearance', icon: Palette },
 { id: 'language', label: t('settings.language') || 'Language & Region', icon: Globe },
 { id: 'currency', label: t('settings.currency') || 'Currency', icon: DollarSign },
 { id: 'notifications', label: t('settings.notifications') || 'Notifications', icon: Bell },
 { id: 'privacy', label: t('settings.privacy') || 'Privacy & Security', icon: Shield },
 { id: 'account', label: t('settings.account') || 'Account', icon: User },
 { id: 'travel', label: t('settings.travelPrefs') || 'Travel Preferences', icon: Map },
 { id: 'accessibility', label: t('settings.accessibility') || 'Accessibility', icon: Accessibility },
 { id: 'data', label: t('settings.dataPrivacy') || 'Data & Privacy', icon: Database },
 { id: 'about', label: t('settings.about') || 'About', icon: Info },
 ];

 return (
 <div className="max-w-[1100px] mx-auto py-6 px-4 sm:px-6">
 <h1 className="text-2xl font-bold text-primary mb-6">{t('settings.title') || 'Settings'}</h1>

 <div className="flex flex-col md:flex-row gap-8">
 {/* Settings Sidebar */}
 <div className="w-full md:w-64 shrink-0">
 <nav className="space-y-1">
 {navItems.map((item) => (
 <button
 key={item.id}
 onClick={() => setActiveTab(item.id)}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
 activeTab === item.id 
  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' 
  : 'text-secondary hover:bg-elevated hover:text-primary'
 }`}
 >
 <item.icon className="h-5 w-5 shrink-0" />
 {item.label}
 </button>
 ))}
 </nav>
 </div>

 {/* Settings Content Area */}
 <div className="flex-1 space-y-6">
 {activeTab === 'appearance' && (
 <Card className="">
 <CardHeader title={t('settings.theme') || 'Theme'} />
 <CardContent>
 <div className="flex flex-wrap gap-4">
 {['light', 'dark', 'system'].map((tOption) => (
 <button
 key={tOption}
 onClick={() => setTheme(tOption)}
 className={`px-4 py-2 rounded-lg border capitalize transition-colors font-medium ${
 theme === tOption 
 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
 : 'bg-surface text-secondary border-theme-border hover:bg-elevated'
 }`}
 >
 {tOption}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {activeTab === 'language' && (
 <Card className="">
 <CardHeader title={t('settings.language') || 'Language'} />
 <CardContent>
 <div className="flex flex-wrap gap-4">
 <button
 onClick={() => setLanguage('en')}
 className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
 language === 'en' 
 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
 : 'bg-surface text-secondary border-theme-border hover:bg-elevated'
 }`}
 >
 English
 </button>
 <button
 onClick={() => setLanguage('hi')}
 className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
 language === 'hi' 
 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
 : 'bg-surface text-secondary border-theme-border hover:bg-elevated'
 }`}
 >
 हिन्दी (Hindi)
 </button>
 </div>
 </CardContent>
 </Card>
 )}

 {activeTab === 'currency' && (
 <Card className="">
 <CardHeader title={t('settings.currency') || 'Currency'} subtitle="Saved locally as your display preference. Prices remain in the provider or booking currency until conversion is available." />
 <CardContent>
 <p className="text-sm text-secondary mb-4">
  Selecting a currency here does not convert USD, EUR, or other provider prices. Each amount is shown with its authoritative currency.
 </p>
 <div className="flex flex-wrap gap-4">
 {['INR', 'USD', 'EUR'].map((cOption) => (
 <button
 key={cOption}
 onClick={() => setCurrency(cOption)}
 className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
 currency === cOption 
 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
 : 'bg-surface text-secondary border-theme-border hover:bg-elevated'
 }`}
 >
 {cOption}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {activeTab === 'notifications' && (
 <Card>
  <CardHeader title={t('settings.notifications') || 'Notifications'} subtitle="Choose which SmartTrip alerts you receive." />
  <CardContent>
   {preferencesLoading ? <PreferenceLoading /> : (
	<div className="space-y-3">
	 <PreferenceToggle label="Booking notifications" checked={preferences.bookingNotifications} saving={savingField === 'bookingNotifications'} onChange={(value) => savePreference('bookingNotifications', value)} />
	 <PreferenceToggle label="Payment notifications" checked={preferences.paymentNotifications} saving={savingField === 'paymentNotifications'} onChange={(value) => savePreference('paymentNotifications', value)} />
	 <PreferenceToggle label="Trip notifications" checked={preferences.tripNotifications} saving={savingField === 'tripNotifications'} onChange={(value) => savePreference('tripNotifications', value)} />
	</div>
   )}
  </CardContent>
 </Card>
 )}

 {activeTab === 'travel' && (
 <Card>
  <CardHeader title={t('settings.travelPrefs') || 'Travel Preferences'} subtitle="Save the travel styles and budget range used by SmartTrip." />
  <CardContent>
   {preferencesLoading ? <PreferenceLoading /> : (
	<div className="space-y-6">
	 <div>
	  <h3 className="text-sm font-semibold text-primary mb-3">Travel styles</h3>
	  <div className="flex flex-wrap gap-3">
	   {travelStyleOptions.map((style) => (
		<button key={style} type="button" onClick={() => toggleTravelStyle(style)} className={`px-4 py-2 rounded-lg border transition-colors font-medium ${preferences.travelStyles.includes(style) ? 'bg-brand-600 text-white border-brand-600' : 'bg-surface text-secondary border-theme-border hover:bg-elevated'}`}>
		 {style}
		</button>
	   ))}
	  </div>
	 </div>
	 <div>
	  <h3 className="text-sm font-semibold text-primary mb-3">Budget level</h3>
	  <div className="flex flex-wrap gap-3">
	   {budgetOptions.map((budget) => (
		<button key={budget} type="button" onClick={() => savePreference('budgetLevel', budget)} className={`px-4 py-2 rounded-lg border transition-colors font-medium ${preferences.budgetLevel === budget ? 'bg-brand-600 text-white border-brand-600' : 'bg-surface text-secondary border-theme-border hover:bg-elevated'}`}>
		 {budget}
		</button>
	   ))}
	  </div>
	 </div>
	</div>
   )}
  </CardContent>
 </Card>
 )}

 {preferencesError && (activeTab === 'notifications' || activeTab === 'travel') && (
  <p className="text-sm text-red-600" role="alert">{preferencesError}</p>
 )}

 {/* Placeholders for future sections */}
 {!['appearance', 'language', 'currency', 'notifications', 'travel'].includes(activeTab) && (
 <Card className="">
 <CardHeader title="Coming Soon" subtitle="This settings section is not yet implemented." />
 <CardContent>
 <div className="p-12 mt-4 text-center text-muted bg-elevated rounded-xl border border-dashed border-theme-border-strong">
 <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-muted">
 <Info className="w-6 h-6" />
 </div>
 <h3 className="font-semibold text-secondary mb-2">Not Available Yet</h3>
 <p className="max-w-md mx-auto text-sm">Settings for {navItems.find(i => i.id === activeTab)?.label} will be available in a future update to SmartTrip.</p>
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 </div>
 </div>
 );
}

function PreferenceLoading() {
 return <div className="flex items-center gap-2 py-8 text-secondary"><Loader2 className="h-5 w-5 animate-spin" /> Loading preferences...</div>;
}

function PreferenceToggle({ label, checked, saving, onChange }) {
 return (
  <label className="flex items-center justify-between gap-4 rounded-lg border border-theme-border px-4 py-3">
   <span className="text-sm font-medium text-primary">{label}</span>
   <span className="flex items-center gap-2">
	{saving && <Loader2 className="h-4 w-4 animate-spin text-secondary" />}
	<input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-blue-600" />
   </span>
  </label>
 );
}
