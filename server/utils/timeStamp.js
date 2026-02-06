/**
 * Convert a timestamp to a Date object, handling various timestamp formats
 * @param {any} timestamp - Timestamp in various formats (Date, Firestore timestamp, string, number)
 * @returns {Date|null} A JavaScript Date object or null if conversion is not possible
 */
const getDateFromTimestamp = (timestamp) => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp === "string") {
    return new Date(timestamp);
  }
  if (timestamp && typeof timestamp === "number") {
    return new Date(timestamp);
  }
  return null;
};

// CommonJS export
module.exports = {
  getDateFromTimestamp,
};
