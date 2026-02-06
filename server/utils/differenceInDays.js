/**
 * Calculate the difference in days between two dates
 * @param {Date|string|number} laterDate - Later date
 * @param {Date|string|number} earlierDate - Earlier date
 * @returns {number} Number of days between the dates
 */
const differenceInDays = (laterDate, earlierDate) => {
  const d1 = new Date(laterDate);
  const d2 = new Date(earlierDate);

  // Get time difference in milliseconds
  const timeDiff = d1.getTime() - d2.getTime();

  // Convert milliseconds to days (1000ms * 60s * 60min * 24h)
  return timeDiff / (1000 * 60 * 60 * 24);
};

module.exports = {
  differenceInDays,
};
