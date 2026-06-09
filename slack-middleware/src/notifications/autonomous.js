const { buildAutonomousNotification } = require('../blocks/autonomous-notification');

async function sendAutonomousNotification(app) {
  const message = buildAutonomousNotification();

  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: message.channel,
    text: message.text,
    blocks: message.blocks,
  });
}

module.exports = { sendAutonomousNotification };
