import fs from 'fs';

const url = 'https://docs.google.com/spreadsheets/d/1zqGCmN84BNME_HmbDjYaDeE7cBxLInO-eBDzDAZPxs4/export?format=csv';

async function importData() {
  try {
    const response = await fetch(url);
    const data = await response.text();
    
    // Parse CSV
    const lines = data.split('\n').map(line => line.trim()).filter(line => line);
    console.log('Total lines:', lines.length);
    if (lines.length > 0) console.log('First line:', lines[0]);
    if (lines.length > 1) console.log('Second line:', lines[1]);
    
    const experiments = [];
    let currentExp = null;
    
    // Simple CSV parser to handle quotes
    function parseCSVLine(text) {
        let ret = [];
        let inQuote = false;
        let value = '';
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (inQuote) {
                if (char === '"') {
                    if (i < text.length - 1 && text[i+1] === '"') {
                        value += '"';
                        i++;
                    } else {
                        inQuote = false;
                    }
                } else {
                    value += char;
                }
            } else {
                if (char === '"') {
                    inQuote = true;
                } else if (char === ',') {
                    ret.push(value);
                    value = '';
                } else {
                    value += char;
                }
            }
        }
        ret.push(value);
        return ret;
    }

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      if (parts.length < 6) continue;
      
      const jenis = parts[0].trim();
      const tingkatan = parts[1].trim();
      const nombor = parts[2].trim();
      const tajuk = parts[3].trim();
      const bahan = parts[4].trim();
      const radas = parts[5].trim();
      
      if (nombor && tajuk) {
        currentExp = {
          id: `${tingkatan}-${jenis}-${nombor}-${i}`.replace(/\s+/g, '-').toLowerCase(),
          tingkatan: parseInt(tingkatan) || 0,
          jenis: jenis,
          nombor: nombor,
          tajuk: tajuk,
          senarai_bahan: [],
          senarai_radas: []
        };
        experiments.push(currentExp);
      }
      
      if (currentExp) {
        if (bahan && bahan !== 'Tiada') currentExp.senarai_bahan.push(bahan);
        if (radas && radas !== 'Tiada') currentExp.senarai_radas.push(radas);
      }
    }
    
    const tsContent = `export interface EksperimenData {
  id: string;
  tingkatan: number;
  jenis: string;
  nombor: string;
  tajuk: string;
  senarai_bahan: string[];
  senarai_radas: string[];
}

export const senaraiEksperimen: EksperimenData[] = ${JSON.stringify(experiments, null, 2)};
`;

    if (!fs.existsSync('src/data')) {
      fs.mkdirSync('src/data', { recursive: true });
    }
    fs.writeFileSync('src/data/senaraiEksperimen.ts', tsContent);
    console.log('Data imported successfully! Total experiments:', experiments.length);
  } catch (err) {
    console.error('Error: ', err.message);
  }
}

importData();
