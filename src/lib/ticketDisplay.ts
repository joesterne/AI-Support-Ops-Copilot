export const DEFAULT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const DEFAULT_CLASSIFICATIONS = [
  'Billing',
  'Technical Support',
  'Feature Request',
  'Bug',
  'General Inquiry',
] as const;

export const UNTITLED_TICKET = 'Untitled Ticket';

export function getPriorityColorClasses(priority: string) {
  const normalizedPriority = priority?.toLowerCase() || '';

  if (normalizedPriority.includes('critical')) {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  if (normalizedPriority.includes('high')) {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }

  if (normalizedPriority.includes('medium')) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  if (normalizedPriority.includes('low')) {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }

  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export function withCustomOption(options: string[], selectedValue: string) {
  return options.includes(selectedValue) ? options : [selectedValue, ...options];
}
