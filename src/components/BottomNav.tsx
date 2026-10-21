import { Link, useLocation } from 'react-router-dom';
import { Activity, PlusCircle, CheckCircle2, MessageCircle, Settings } from 'lucide-react';

const items = [
  { path: '/', icon: Activity, label: 'Dashboard' },
  { path: '/book', icon: PlusCircle, label: 'Book' },
  { path: '/completed', icon: CheckCircle2, label: 'Done' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/settings', icon: Settings, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb print:hidden">
      <div className="flex items-center justify-around h-16">
        {items.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}