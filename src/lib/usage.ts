export const MAX_FREE_REQUESTS = 10;

export async function checkAndIncrementUsage(userId: string | undefined, isAdmin: boolean, subscription: string | undefined): Promise<boolean> {
  if (isAdmin || subscription === 'monthly' || subscription === 'yearly') {
    return true; // Unlimited
  }

  const today = new Date().toISOString().split('T')[0];
  const storageKey = userId ? `usage_${userId}` : 'anon_usage';
  const localUsageStr = localStorage.getItem(storageKey);
  let localUsage = localUsageStr ? JSON.parse(localUsageStr) : { date: today, count: 0 };
  
  if (localUsage.date !== today) {
    localUsage = { date: today, count: 0 };
  }

  if (localUsage.count >= MAX_FREE_REQUESTS) {
    throw new Error(`Bạn đã hết ${MAX_FREE_REQUESTS} lượt yêu cầu miễn phí hôm nay. Vui lòng nâng cấp gói để tiếp tục sử dụng.`);
  }

  localUsage.count += 1;
  localStorage.setItem(storageKey, JSON.stringify(localUsage));
  return true;
}
