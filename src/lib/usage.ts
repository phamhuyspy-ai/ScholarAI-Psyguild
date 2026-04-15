
export async function checkAndIncrementUsage(userId: string | undefined, isAdmin: boolean, subscription: string | undefined): Promise<boolean> {
  if (isAdmin) return true;

  const freeLimit = parseInt(localStorage.getItem('LIMIT_FREE') || '10');
  const monthlyLimit = parseInt(localStorage.getItem('LIMIT_MONTHLY') || '1000');
  const yearlyLimit = parseInt(localStorage.getItem('LIMIT_YEARLY') || '10000');

  let limit = freeLimit;
  if (subscription === 'monthly') limit = monthlyLimit;
  if (subscription === 'yearly') limit = yearlyLimit;

  const today = new Date().toISOString().split('T')[0];
  const storageKey = userId ? `usage_${userId}` : 'anon_usage';
  const localUsageStr = localStorage.getItem(storageKey);
  let localUsage = localUsageStr ? JSON.parse(localUsageStr) : { date: today, count: 0 };
  
  if (localUsage.date !== today) {
    localUsage = { date: today, count: 0 };
  }

  if (localUsage.count >= limit) {
    throw new Error(`Bạn đã hết ${limit} lượt yêu cầu trong gói hiện tại. Vui lòng nâng cấp gói để tiếp tục sử dụng.`);
  }

  localUsage.count += 1;
  localStorage.setItem(storageKey, JSON.stringify(localUsage));
  return true;
}
