import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { notificationService } from '../services/notification.service';
import { Card, CardContent } from '../components/ui/Card';
import { Bell, CheckCircle } from 'lucide-react';

export default function Notifications() {
 const { t } = useSettings();
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchNotifications();
 }, []);

 const fetchNotifications = async () => {
 try {
 const res = await notificationService.getUserNotifications();
 if (res.data?.data?.notifications) {
 setNotifications(res.data.data.notifications);
 }
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const handleMarkAsRead = async (id) => {
 try {
 await notificationService.markAsRead(id);
 setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
 } catch (err) {
 console.error(err);
 }
 };

 return (
 <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
 <h1 className="text-3xl font-bold text-text-primary mb-2">{t('nav.notifications')}</h1>
 <p className="text-text-secondary mb-8">Stay updated with your latest alerts and bookings.</p>

 {loading ? (
 <div className="text-center py-12 text-text-muted">{t('common.loading')}</div>
 ) : notifications.length === 0 ? (
 <div className="text-center py-12 bg-surface rounded-lg shadow-sm border border-border">
 <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
 <h3 className="text-lg font-medium text-text-primary">No Notifications</h3>
 <p className="text-text-muted">You are all caught up.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {notifications.map(notification => (
 <Card key={notification.id} className={` transition-colors ${notification.isRead ? 'bg-page opacity-75' : 'bg-surface '}`}>
 <CardContent className="p-4 flex gap-4 items-start">
 <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
 <Bell className="h-5 w-5" />
 </div>
 <div className="flex-1">
 <h4 className={`font-semibold ${notification.isRead ? 'text-text-secondary ' : 'text-text-primary '}`}>
 {notification.title}
 </h4>
 <p className="text-text-secondary text-sm mt-1">{notification.message}</p>
 <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
 </div>
 {!notification.isRead && (
 <button 
 onClick={() => handleMarkAsRead(notification.id)}
 className="text-sm text-blue-600 hover:underline flex items-center gap-1"
 >
 <CheckCircle className="h-4 w-4" /> Mark as read
 </button>
 )}
 </CardContent>
 </Card>
 ))}
 </div>
 )}
 </div>
 );
}
