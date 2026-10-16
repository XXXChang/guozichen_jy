// ============================================
// 时间计算公共方法
// ============================================

/**
 * 计算从指定日期到今天的天数（+1，当天算第 1 天）
 * @param {string} dateStr - 起始日期，格式 'YYYY-MM-DD'
 * @returns {number} 天数
 */
function calculateDaysSince(dateStr) {
    const start = new Date(dateStr);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = today - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 下一个"百整数天"的天数（按当前天数向上取整到 100 的倍数）
 * @param {number} days - 当前已累计的天数
 * @returns {number} 下一个百整数天的值（如 100、200、300...）
 */
function nextHundredDay(days) {
    return Math.ceil(days / 100) * 100;
}

/**
 * 距离下一个"百整数天"还差几天
 * @param {number} days - 当前已累计的天数
 * @returns {number} 剩余天数
 */
function daysToNextHundredDay(days) {
    return nextHundredDay(days) - days;
}

/**
 * 下一个周年日期（按"起始年 + N"计算，自动跳过已过去的）
 * @param {string} dateStr - 起始日期，格式 'YYYY-MM-DD'
 * @returns {Date} 下一个周年的 Date 对象
 */
function nextAnniversaryDate(dateStr) {
    const start = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextYear = start.getFullYear() + 1;
    let next = new Date(nextYear, start.getMonth(), start.getDate());
    while (next <= today) {
        nextYear += 1;
        next = new Date(nextYear, start.getMonth(), start.getDate());
    }
    return next;
}

/**
 * 距离下一个周年还差几天
 * @param {string} dateStr - 起始日期，格式 'YYYY-MM-DD'
 * @returns {number} 剩余天数
 */
function daysToNextAnniversary(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next = nextAnniversaryDate(dateStr);
    const diff = next - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 下一个周年是第几周年
 * @param {string} dateStr - 起始日期，格式 'YYYY-MM-DD'
 * @returns {number} 周年的数字（如 1、2、3...）
 */
function nextAnniversaryNumber(dateStr) {
    const start = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return nextAnniversaryDate(dateStr).getFullYear() - start.getFullYear();
}
