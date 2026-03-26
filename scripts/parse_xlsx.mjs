import xlsx from 'xlsx';
import * as fs from 'fs';

const file = process.argv[2];
const workbook = xlsx.readFile(file);
const result = {};

for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(sheet);
    result[sheetName] = data;
}

fs.writeFileSync('extracted_data.json', JSON.stringify(result, null, 2));
console.log('Extracted sheets:', workbook.SheetNames);
