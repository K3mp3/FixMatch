/**
 * Calculate the difference in months between two dates
 * @param {Date|string|number} laterDate - Later date
 * @param {Date|string|number} earlierDate - Earlier date
 * @returns {number} Number of months between the dates
 */
const differenceInMonths = (laterDate, earlierDate) => {
  const d1 = new Date(laterDate);
  const d2 = new Date(earlierDate);
  const months1 = d1.getFullYear() * 12 + d1.getMonth();
  const months2 = d2.getFullYear() * 12 + d2.getMonth();
  let monthDiff = months1 - months2;

  // Adjustment for partial months
  if (d1.getDate() < d2.getDate()) {
    monthDiff -= 1;
  }

  return monthDiff;
};

// CommonJS export
module.exports = {
  differenceInMonths,
};
