import * as XLSX from 'xlsx';

/**
 * Generate and send an xlsx file as HTTP response
 * @param {object} res - Express response object
 * @param {Array} data - Array of plain objects (rows)
 * @param {Array} headers - Array of { key, label } defining column order and display names
 * @param {string} sheetName - Name of the Excel sheet
 * @param {string} fileName - Downloaded file name (without extension)
 */
export function sendXlsx(res, data, headers, sheetName, fileName) {
  // Map data to use label-keyed rows
  const rows = data.map(row => {
    const mapped = {};
    headers.forEach(h => {
      mapped[h.label] = row[h.key] !== undefined && row[h.key] !== null ? row[h.key] : '';
    });
    return mapped;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
}
