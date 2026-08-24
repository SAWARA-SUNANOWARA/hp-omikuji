// 2人専用ホットライン用のフロントエンドAPIラッパー
//
// デプロイ後、Apps ScriptのウェブアプリURLをここに設定してください。
const HOTLINE_API_URL = "https://script.google.com/macros/s/AKfycbz3pxOEU92RnpQ7mwFeRujDd23A1Fu4DGZ01FSSAfwB1-4yLsNf7R-UGzyvfDmFP4gQeQ/exec";

const HOTLINE_KEY_STORAGE = "hotlineKey";
const HOTLINE_NAME_STORAGE = "hotlineMyName";

// 合言葉: URLの ?key=... を優先し、なければ保存済みのものを使う
function getHotlineKey() {
  const params = new URLSearchParams(location.search);
  return params.get("key") || localStorage.getItem(HOTLINE_KEY_STORAGE) || "";
}

function saveHotlineKey(key) {
  localStorage.setItem(HOTLINE_KEY_STORAGE, key);
}

function getHotlineName() {
  return localStorage.getItem(HOTLINE_NAME_STORAGE) || "";
}

function saveHotlineName(name) {
  localStorage.setItem(HOTLINE_NAME_STORAGE, name);
}

async function fetchHotlineMessages(key) {
  const url = HOTLINE_API_URL + "?key=" + encodeURIComponent(key);
  const res = await fetch(url, { redirect: "follow" });
  return res.json();
}

// Apps Scriptとのやり取りでブラウザのプリフライト(CORS)を避けるため
// Content-Type は text/plain で送り、本文はJSON文字列にする
async function postHotlineMessage(key, author, message) {
  const res = await fetch(HOTLINE_API_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ key: key, author: author, message: message }),
  });
  return res.json();
}
