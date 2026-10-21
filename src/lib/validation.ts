export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(16);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function getPriorityColor(p: string): string {
  switch (p) {
    case 'routine': return 'bg-gray-100 text-gray-700';
    case 'urgent': return 'bg-amber-100 text-amber-700';
    case 'emergency': return 'bg-red-100 text-red-700';
    case 'life-threatening': return 'bg-red-600 text-white';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function getPriorityLabel(p: string): string {
  switch (p) {
    case 'routine': return 'Routine';
    case 'urgent': return 'Urgent';
    case 'emergency': return 'Emergency';
    case 'life-threatening': return 'Life-Threatening';
    default: return p;
  }
}
