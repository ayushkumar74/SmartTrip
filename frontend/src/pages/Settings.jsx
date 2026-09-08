import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Palette, Globe, DollarSign, Bell, Shield, User, Map, Accessibility, Database, Info } from 'lucide-react';

export default function Settings() {
 const { theme, setTheme, language, setLanguage, currency, setCurrency, t } = useSettings();
 const [activeTab, setActiveTab] = useState('appearance');

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
 <h1 className="text-2xl font-bold text-text-primary mb-6">{t('settings.title') || 'Settings'}</h1>

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
 ? 'bg-blue-50 text-blue-700 ' 
 : 'text-text-secondary hover:bg-surface-elevated :bg-slate-800/50 hover:text-text-primary :text-slate-50'
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
 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
 : 'bg-surface text-text-secondary border-border hover:bg-surface-elevated :bg-slate-800'
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
 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
 : 'bg-surface text-text-secondary border-border hover:bg-surface-elevated :bg-slate-800'
 }`}
 >
 English
 </button>
 <button
 onClick={() => setLanguage('hi')}
 className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
 language === 'hi' 
 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
 : 'bg-surface text-text-secondary border-border hover:bg-surface-elevated :bg-slate-800'
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
 <CardHeader title={t('settings.currency') || 'Currency'} />
 <CardContent>
 <div className="flex flex-wrap gap-4">
 {['INR', 'USD', 'EUR'].map((cOption) => (
 <button
 key={cOption}
 onClick={() => setCurrency(cOption)}
 className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
 currency === cOption 
 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
 : 'bg-surface text-text-secondary border-border hover:bg-surface-elevated :bg-slate-800'
 }`}
 >
 {cOption}
 </button>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Placeholders for future sections */}
 {!['appearance', 'language', 'currency'].includes(activeTab) && (
 <Card className="">
 <CardHeader title="Coming Soon" subtitle="This settings section is not yet implemented." />
 <CardContent>
 <div className="p-12 mt-4 text-center text-text-muted bg-surface-elevated rounded-xl border border-dashed border-border-strong">
 <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-text-muted">
 <Info className="w-6 h-6" />
 </div>
 <h3 className="font-semibold text-text-secondary mb-2">Not Available Yet</h3>
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
