import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Clock, AlertTriangle, CheckCircle2, Plus, Theater, Pencil, Info } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllRead, getUnreadCount, getNotificationColor } from '@/lib/notifications';
import { formatRelativeTime } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types';
import { useNavigate } from 'react-router-dom';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  case_booked: <Plus size={12} />,
  case_completed: <CheckCircle2 size={12} />,
  priority_changed: <AlertTriangle size={12} />,
  in_theatre: <Theater size={12} />,
  edit: <Pencil size={12} />,
  system: <Info size={12} />,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  function refresh() {
    setNotifications(getNotifications());
    setUnread(getUnreadCount());
  }

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 10000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleClickNotif(n: AppNotification) {
    markNotificationRead(n.id);
    refresh();
    setOpen(false);
    if (n.caseId) {
      if (n.type === 'case_completed') navigate('/completed');
      else navigate('/');
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { refresh(); setOpen(!open); }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        <Bell size={18} className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={14} className="text-blue-600" /> Notifications
            </h3>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={() => { markAllRead(); refresh(); }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}
                >
                  <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(n.type)}`}>
                    {typeIcons[n.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={8} /> {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
