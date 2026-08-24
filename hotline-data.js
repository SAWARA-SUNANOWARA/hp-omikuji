// 2人専用ホットライン用のフロントエンドAPIラッパー
//
// デプロイ後、Apps ScriptのウェブアプリURLをここに設定してください。
const HOTLINE_API_URL = "https://script.google.com/macros/s/AKfycbz3pxOEU92RnpQ7mwFeRujDd23A1Fu4DGZ01FSSAfwB1-4yLsNf7R-UGzyvfDmFP4gQeQ/exec";

// sessionStorageに保存する(=タブを閉じると自動的に消える)。
// 毎回fortune.html側でのジェスチャー認証をやり直させるための仕組み。
const HOTLINE_SESSION_KEY = "hotlineSessionKey";
const HOTLINE_SESSION_IDENTITY = "hotlineSessionIdentity";

function getHotlineKey() {
  return sessionStorage.getItem(HOTLINE_SESSION_KEY) || "";
}

function saveHotlineKey(key) {
  sessionStorage.setItem(HOTLINE_SESSION_KEY, key);
}

function getHotlineIdentity() {
  return sessionStorage.getItem(HOTLINE_SESSION_IDENTITY) || "";
}

function saveHotlineIdentity(identity) {
  sessionStorage.setItem(HOTLINE_SESSION_IDENTITY, identity);
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
