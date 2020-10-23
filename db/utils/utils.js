/**
 * Formats the specified keys in a collection of data to a valid Date object
 * @param {Object[]} data - The data objects
 * @param {string} key - The date key to format
 * @returns {Object[]} The formatted objects
 */
exports.formatDates = (data, key) => {
  const formattedData = data.map((dataItem) => {
    let updatedDataItem;

    if (Object.prototype.hasOwnProperty.call(dataItem, key)) {
      updatedDataItem = {
        ...dataItem,
        [key]: new Date(dataItem[key]),
      };
    } else {
      updatedDataItem = {
        ...dataItem,
      };
    }

    return updatedDataItem;
  });

  return formattedData;
};
