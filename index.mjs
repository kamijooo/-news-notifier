import puppeteer from "puppeteer";
import axios from "axios";
import fs from "fs";

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";
const KEYWORDS = ["モバイルオーダー", "ダイニー", "funfo", "スマホ決済"];

const SENT_FILE = "./sent_articles.json";
const sentLinks = fs.existsSync(SENT_FILE)
  ? new Set(JSON.parse(fs.readFileSync(SENT_FILE)))
  : new Set();

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();
await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");

const allResults = [];

for (const keyword of KEYWORDS) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=nws&hl=ja`;
  console.log("アクセス中のURL:", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const results = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a[href^='/url?q=']"));
    return anchors.map(link => {
      const href = link.getAttribute("href");
      const match = href && href.includes("/url?q=")
        ? { 1: href.split("/url?q=")[1].split("&")[0] }
        : null;
      return {
        title: link.innerText.trim(),
        link: match ? decodeURIComponent(match[1]) : ""
      };
    }).filter(item => item.title && item.link);
  });

  allResults.push(...results.map(r => ({ ...r, keyword })));
}

await browser.close();

console.log("==== 全ての記事 ====");
console.log(allResults);

const newLinks = [];

for (const item of allResults) {
  if (sentLinks.has(item.link)) continue;

  const payload = {
    text: `📰 *ニュース通知*\n\n・*検索語:* ${item.keyword}\n・*タイトル:* ${item.title}\n・*リンク:* ${item.link}`
  };

  console.log("送信先:", SLACK_WEBHOOK_URL);
  console.log("ペイロード:", payload);

  try {
    await axios.post(SLACK_WEBHOOK_URL, payload);
    console.log("✅ 通知送信完了:", item.title);
    newLinks.push(item.link);
  } catch (err) {
    console.error("❌ Slack送信失敗:", err.message);
  }
}

if (newLinks.length > 0) {
  const updated = Array.from(new Set([...sentLinks, ...newLinks]));
  fs.writeFileSync(SENT_FILE, JSON.stringify(updated, null, 2));
}
