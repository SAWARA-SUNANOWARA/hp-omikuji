// 2人専用ホットライン用のバックエンド (Google Apps Script)
//
// セットアップ手順は ../HOTLINE_SETUP.md を参照してください。
// 1. Google スプレッドシートを新規作成
// 2. 拡張機能 > Apps Script を開き、このファイルの内容を貼り付ける
// 3. SECRET を自分たちだけの合言葉(長めのランダム文字列)に書き換える
// 4. デプロイ > 新しいデプロイ > ウェブアプリ
//    - 実行するユーザー: 自分
//    - アクセスできるユーザー: 全員
// 5. 発行されたURLを hotline-data.js の HOTLINE_API_URL に設定する

const SECRET = "REPLACE_WITH_YOUR_OWN_SECRET"; // 必ず自分たちだけの合言葉に変更する(このリポジトリは公開なので、ここには実際の値を書かないこと)
const SHEET_NAME = "Messages";
const MAX_MESSAGES = 200; // 返却する最大件数

function doGet(e) {
  const key = e.parameter.key || "";
  if (key !== SECRET) {
    return jsonOutput({ error: "unauthorized" });
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonOutput({ messages: [] });
  }

  const numRows = lastRow - 1;
  const startRow = Math.max(2, lastRow - MAX_MESSAGES + 1);
  const values = sheet
    .getRange(startRow, 1, lastRow - startRow + 1, 3)
    .getValues();

  const messages = values.map(function (row) {
    return {
      timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      author: String(row[1]),
      message: String(row[2]),
    };
  });

  return jsonOutput({ messages: messages });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ error: "invalid_body" });
  }

  if (body.key !== SECRET) {
    return jsonOutput({ error: "unauthorized" });
  }

  const author = String(body.author || "").trim().slice(0, 20);
  const message = String(body.message || "").trim().slice(0, 1000);
  if (!author || !message) {
    return jsonOutput({ error: "invalid" });
  }

  const sheet = getSheet();
  sheet.appendRow([new Date(), author, message]);

  return jsonOutput({ ok: true });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["timestamp", "author", "message"]);
  }
  return sheet;
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
