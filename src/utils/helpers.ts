export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDaysUntil(date: Date): number {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatPrize(amount: number): string {
  if (amount <= 0) return "No monetary prize";
  return `$${amount.toLocaleString()}`;
}

export function isActionableStatus(status: string): boolean {
  const actionableKeywords = ['research', 'preparing', 'not applicable'];
  return actionableKeywords.some(keyword => status.toLowerCase().includes(keyword));
}

export function isHighPriority(priorityLevel: string): boolean {
  return priorityLevel.toLowerCase().includes('🔥 high');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
