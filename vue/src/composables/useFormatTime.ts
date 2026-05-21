/**
 * 时间格式化 composable
 * 提供相对时间（x分钟前）和绝对时间格式化
 */
export function useFormatTime() {
  /**
   * 格式化为相对时间（刚刚、x分钟前、x小时前...）
   */
  const formatRelativeTime = (time?: string | Date): string => {
    if (!time) return '刚刚';
    const date = typeof time === 'string' ? new Date(time) : time;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;
    return date.toLocaleDateString('zh-CN');
  };

  /**
   * 格式化为完整日期时间
   */
  const formatDateTime = (time?: string | Date): string => {
    if (!time) return '';
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 格式化为日期
   */
  const formatDate = (time?: string | Date): string => {
    if (!time) return '';
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleDateString('zh-CN');
  };

  return {
    formatRelativeTime,
    formatDateTime,
    formatDate,
  };
}
