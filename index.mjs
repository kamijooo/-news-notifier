import axios from "axios";

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

const payload = {
  text: "✅ Slack通知テスト（Webhook再発行済み）"
};

try {
  await axios.post(SLACK_WEBHOOK_URL, payload);
  console.log("✅ Slackテスト通知送信成功");
} catch (err) {
  console.error("❌ Slack送信失敗:", err.message);
}
