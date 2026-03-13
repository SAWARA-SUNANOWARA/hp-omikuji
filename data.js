// スプレッドシートCSVのURL
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQeCDWU3HFKzOFTeTs15vBgCaGWHV1W66Y86Sul0RckAw9NkWrW4PZ37efkcJ6R3UmpPGbi_kBTsm7C/pub?output=csv";

// CSVをパースしてメンバー配列を返す
// 列: A=ID番号, B=名前, C=運勢メッセージ, D=現役フラグ(1=現役, 0=OG)
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const members = [];
  // 1行目はヘッダーなのでスキップ（ヘッダーがない場合も対応）
  const start = (lines.length > 0 && lines[0].match(/^["']?\d/)) ? 0 : 1;
  for (let i = start; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 4) continue;
    members.push({
      id: cols[0].trim(),
      name: cols[1].trim(),
      message: cols[2].trim(),
      active: cols[3].trim() === "1",
    });
  }
  return members;
}

// CSV行をカンマ分割（ダブルクォート対応）
function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// CSVを取得してメンバー配列を返す
async function fetchMembers() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  return parseCSV(text);
}
