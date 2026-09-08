import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { User, Mail, Phone, ShieldCheck, Calendar, Settings } from 'lucide-react';

export default function Profile() {
 const { user } = useAuth();
 const { t } = useSettings();
 
 if (!user) return null;

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">{t('profile.title') || 'Your Profile'}</h1>
        <p className="text-sm text-secondary mt-1">{t('profile.subtitle') || 'Manage your personal information and account security.'}</p>
      </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-3xl mb-4 shadow-sm border-4 border-surface ring-1 ring-theme-border">
              <User className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold text-primary">{user.name}</h2>
            <p className="text-sm text-secondary mb-4">{user.email}</p>
            <Badge variant="blue" className="mb-2 uppercase tracking-wide">{user.role}</Badge>
            <div className="flex items-center justify-center text-sm text-secondary mt-4 gap-2 border-t border-theme-border pt-4">
              <Calendar className="h-4 w-4" /> {t('profile.joined') || 'Joined'} {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </Card>
 
          <Card className="">
            <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" /> {t('profile.status') || 'Account Status'}
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center pb-3 border-b border-theme-border">
                <span className="text-secondary font-medium">{t('profile.emailStatus') || 'Email'}</span>
                {user.isEmailVerified ? <Badge variant="green">{t('profile.verified') || 'Verified'}</Badge> : <Badge variant="yellow">{t('profile.unverified') || 'Unverified'}</Badge>}
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-theme-border">
                <span className="text-secondary font-medium">{t('profile.phoneStatus') || 'Phone'}</span>
                {user.isPhoneVerified ? <Badge variant="green">{t('profile.verified') || 'Verified'}</Badge> : <Badge variant="gray">{t('profile.unverified') || 'Unverified'}</Badge>}
              </li>
              <li className="flex justify-between items-center">
                <span className="text-secondary font-medium">{t('profile.googleAuth') || 'Google Auth'}</span>
                {user.googleId ? <Badge variant="green">{t('profile.connected') || 'Connected'}</Badge> : <Badge variant="gray">{t('profile.notConnected') || 'Not Connected'}</Badge>}
              </li>
            </ul>
          </Card>
 </div>

 {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="">
            <CardHeader title={t('profile.personalInfo') || 'Personal Information'} className="mb-6 border-b border-theme-border pb-4" />
            <div className="space-y-6">
              <div>
                <label htmlFor="profileName" className="block text-sm font-medium text-secondary mb-1.5 flex items-center gap-2">
                  <User className="h-4 w-4" /> {t('profile.fullName') || 'Full Name'}
                </label>
                <input
                  id="profileName"
                  type="text"
                  readOnly
                  value={user.name}
                  className="w-full text-primary font-medium px-4 py-3 bg-page rounded-lg border border-theme-border focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-default"
                />
              </div>
              <div>
                <label htmlFor="profileEmail" className="block text-sm font-medium text-secondary mb-1.5 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {t('profile.emailAddress') || 'Email Address'}
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  readOnly
                  value={user.email}
                  className="w-full text-primary font-medium px-4 py-3 bg-page rounded-lg border border-theme-border focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-default"
                />
              </div>
              <div>
                <label htmlFor="profilePhone" className="block text-sm font-medium text-secondary mb-1.5 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {t('profile.phoneNumber') || 'Phone Number'}
                </label>
                <input
                  id="profilePhone"
                  type="tel"
                  readOnly
                  value={user.phone || t('profile.notProvided')}
                  className="w-full text-primary font-medium px-4 py-3 bg-page rounded-lg border border-theme-border focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-default"
                />
              </div>
            </div>
          </Card>
 
          <Card className="">
            <CardHeader title={t('profile.preferences') || 'Preferences'} className="mb-4 border-b border-theme-border pb-4" />
            <div className="flex items-center gap-4 p-5 rounded-xl bg-page border border-theme-border hover:bg-elevated transition-colors cursor-pointer" tabIndex="0">
              <div className="p-3 bg-surface rounded-lg shadow-sm border border-theme-border">
                <Settings className="h-5 w-5 text-secondary " />
              </div>
              <div>
                <p className="font-semibold text-primary">{t('profile.notificationSettings') || 'Notification Settings'}</p>
                <p className="text-sm text-secondary mt-1">{t('profile.notificationDesc') || 'Manage how you receive travel alerts and recommendations.'}</p>
              </div>
            </div>
          </Card>
 </div>
 </div>
 </div>
 );
}
