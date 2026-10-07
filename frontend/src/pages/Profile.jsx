import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { userService } from '../services/user.service';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { User, Mail, Phone, ShieldCheck, Calendar, Settings, Edit2, Check, X, Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { t } = useSettings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const handleEditClick = () => {
    setFormData({ name: user.name || '', phone: user.phone || '' });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    // Basic Indian phone validation if provided
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateProfile({
        name: formData.name,
        phone: formData.phone || null
      });
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
      // Refresh user state in context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title') || 'My Account'}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('profile.subtitle') || 'Manage your personal details and preferences.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Summary */}
        <div className="md:col-span-4 space-y-6">
          <Card className="rounded-xl border-theme-border shadow-sm">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-surface border border-theme-border flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {user.name?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary truncate max-w-[200px]">{user.name}</h2>
                  <Badge variant="gray" className="mt-1 uppercase text-[10px] tracking-wider">{user.role}</Badge>
                </div>
              </div>
              <div className="pt-4 border-t border-theme-border flex items-center gap-2 text-sm text-secondary">
                <Calendar className="h-4 w-4" /> 
                <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </Card>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-500" /> Account Status
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                  <span className="text-gray-500">Email</span>
                  {user.isEmailVerified ? <span className="text-green-600 font-medium text-xs">Verified</span> : <span className="text-amber-600 font-medium text-xs">Unverified</span>}
                </li>
                <li className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                  <span className="text-gray-500">Phone</span>
                  {user.isPhoneVerified ? <span className="text-green-600 font-medium text-xs">Verified</span> : <span className="text-gray-400 font-medium text-xs">Unverified</span>}
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Google</span>
                  {user.googleId ? <span className="text-green-600 font-medium text-xs">Connected</span> : <span className="text-gray-400 font-medium text-xs">—</span>}
                </li>
              </ul>
            </div>
          </div>

        {/* Right Column: Details */}
        <div className="md:col-span-8 space-y-6">
          <Card className="rounded-xl border-theme-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-theme-border flex justify-between items-center bg-surface">
              <h3 className="font-semibold text-gray-900 text-sm">Personal Information</h3>
              {!isEditing && (
                <button 
                  onClick={handleEditClick}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-lg text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full text-primary text-sm px-3 py-2 bg-page rounded-md border border-theme-border focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-primary font-medium text-sm py-2">{user.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full text-primary text-sm px-3 py-2 bg-page/50 opacity-80 rounded-md border border-theme-border cursor-not-allowed pr-10"
                    />
                    <Lock className="h-4 w-4 text-muted absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  {isEditing && <p className="text-[11px] text-muted mt-1">Email cannot be changed.</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full max-w-sm text-primary text-sm px-3 py-2 bg-page rounded-md border border-theme-border focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="Enter mobile number"
                    />
                  ) : (
                    <p className="text-primary font-medium text-sm py-2">{user.phone || <span className="text-muted italic">Not provided</span>}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 mt-2 border-t border-theme-border flex items-center justify-end gap-3">
                  <button 
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-semibold text-secondary hover:bg-elevated rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-xl border-theme-border shadow-sm overflow-hidden">
            <Link to="/settings" className="block px-6 py-5 hover:bg-elevated transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-surface rounded-lg border border-theme-border group-hover:border-brand-200 transition-colors">
                    <Settings className="h-5 w-5 text-secondary group-hover:text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Preferences & Settings</h4>
                    <p className="text-xs text-secondary mt-0.5">Manage notifications, language, and theme.</p>
                  </div>
                </div>
                <div className="text-brand-600">
                  &rarr;
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
