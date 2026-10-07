import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { notificationService } from '../services/notification.service';
import { Card, CardContent } from '../components/ui/Card';
import { Bell, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function Notifications() {
 const { t } = useSettings();
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(true);
 const [unreadOnly, setUnreadOnly] = useState(false);
 const [unreadCount, setUnreadCount] = useState(0);

 useEffect(() => {
 fetchNotifications();
 }, [unreadOnly]);

 const fetchNotifications = async () => {
 try {
 setLoading(true);
 const [res, unreadRes] = await Promise.all([
  notificationService.getUserNotifications({ unreadOnly, page: 1, pageSize: 50 }),
  notificationService.getUnreadCount(),
 ]);
 if (res.data?.data?.notifications) {
 setNotifications(res.data.data.notifications);
 }
 setUnreadCount(unreadRes.data?.data?.unreadCount || 0);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const handleMarkAsRead = async (id) => {
 try {
 await notificationService.markAsRead(id);
 setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
 setUnreadCount((count) => Math.max(0, count - 1));
 } catch (err) {
 console.error(err);
 }
 };

 const handleMarkAllAsRead = async () => {
  try {
   await notificationService.markAllAsRead();
   setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })));
   setUnreadCount(0);
  } catch (err) {
   console.error(err);
  }
 };

 return (
 <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
 <div className="flex items-center justify-between gap-4 mb-2">
 <h1 className="text-3xl font-bold text-primary">{t('nav.notifications')}</h1>
 <div className="flex items-center gap-2">
  <button onClick={() => fetchNotifications()} className="p-2 rounded-full hover:bg-elevated text-secondary" aria-label="Refresh notifications">
   <RefreshCw className="h-4 w-4" />
  </button>
  {unreadCount > 0 && (
   <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
  )}
 </div>
 </div>
 <p className="text-secondary mb-6">Stay updated with your latest alerts and bookings.</p>

 <div className="flex items-center gap-3 mb-6">
  <button
    onClick={() => setUnreadOnly((value) => !value)}
    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium border transition-colors ${
      unreadOnly ? 'bg-blue-600 text-white border-blue-600' : 'bg-surface text-secondary border-theme-border hover:bg-elevated'
    }`}
  >
    {unreadOnly ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    {unreadOnly ? 'Unread Only' : 'All Notifications'}
  </button>
 </div>

 {loading ? (
 <div className="text-center py-12 text-muted">{t('common.loading')}</div>
 ) : notifications.length === 0 ? (
 <div className="text-center py-12 bg-surface rounded-lg shadow-sm border border-theme-border">
 <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
 <h3 className="text-lg font-medium text-primary">No Notifications</h3>
 <p className="text-muted">You are all caught up.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {notifications.map((notification) => {
   const isActionable = Boolean(notification.actionUrl);
   return (
    <Card key={notification.id} className={`transition-colors ${notification.isRead ? 'bg-page opacity-75' : 'bg-surface'}`}>
     <CardContent className="p-4 flex gap-4 items-start">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
       <Bell className="h-5 w-5" />
      </div>
      <div className="flex-1">
       <div className="flex items-center gap-2">
         <h4 className={`font-semibold ${notification.isRead ? 'text-secondary' : 'text-primary'}`}>
           {notification.title}
         </h4>
         {!notification.isRead && <span className="rounded-full bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5">Unread</span>}
       </div>
       <p className="text-secondary text-sm mt-1">{notification.message}</p>
       <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
       {isActionable && (
         <a href={notification.actionUrl} className="inline-block mt-3 text-sm text-blue-600 hover:underline">Open details</a>
       )}
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
   );
 })}
 </div>
 )}
 </div>
 );
}
