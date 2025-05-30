import axios from "axios";

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/ここにあなたのURL";

const payload = {
  text: "✅ Webhookテスト通知（SlackURL貼り直し確認）"
};

try {
  await axios.post(SLACK_WEBHOOK_URL, payload);
  console.log("✅ Slackテスト通知送信成功");
} catch (err) {
  console.error("❌ Slackテスト通知失敗:", err.message);
}
