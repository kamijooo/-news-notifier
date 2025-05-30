import axios from "axios";

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

const payload = {
  text: "✅ 通知テスト（最小構成）"
};

try {
  await axios.post(SLACK_WEBHOOK_URL, payload);
  console.log("✅ Slackテスト通知送信成功");
} catch (err) {
  console.error("❌ Slack送信失敗:", err.message);
}
