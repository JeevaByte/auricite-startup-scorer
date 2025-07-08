
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getNotifications, 
  markNotificationAsRead, 
  getNotificationPreferences,
  updateNotificationPreferences 
} from '@/utils/notificationService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
  data?: any;
}

interface NotificationPreference {
  id: string;
  notification_type: string;
  enabled: boolean;
  frequency: string;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadPreferences();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    const data = await getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  const loadPreferences = async () => {
    if (!user) return;
    const data = await getNotificationPreferences(user.id);
    setPreferences(data);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
    );
  };

  const handlePreferenceChange = async (type: string, field: 'enabled' | 'frequency', value: boolean | string) => {
    if (!user) return;
    
    const updatedPrefs = preferences.map(pref => 
      pref.notification_type === type 
        ? { ...pref, [field]: value }
        : pref
    );
    
    setPreferences(updatedPrefs);
    
    const prefToUpdate = updatedPrefs.find(p => p.notification_type === type);
    if (prefToUpdate) {
      await updateNotificationPreferences(user.id, type, prefToUpdate.enabled, prefToUpdate.frequency);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'pending').length;

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium capitalize">
                      {pref.notification_type.replace('_', ' ')}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={pref.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePreferenceChange(pref.notification_type, 'enabled', !pref.enabled)}
                    >
                      {pref.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                    </Button>
                    <select
                      value={pref.frequency}
                      onChange={(e) => handlePreferenceChange(pref.notification_type, 'frequency', e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No notifications yet
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={notification.status === 'pending' ? 'border-blue-200 bg-blue-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {notification.type}
                      </Badge>
                      {notification.status === 'pending' && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {notification.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
