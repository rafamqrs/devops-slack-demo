require('dotenv').config();
const { App, ExpressReceiver } = require('@slack/bolt');
const { createGitHubWebhookRouter } = require('./routes/github-webhook');
const { registerActions } = require('./actions/approve-reject');
const { sendAutonomousNotification } = require('./notifications/autonomous');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

registerActions(app);

receiver.router.use('/webhook/github', createGitHubWebhookRouter(app));

receiver.router.get('/health', (req, res) => {
  res.json({ status: 'ok', agent: 'Agentforce DevOps' });
});

receiver.router.post('/notify/autonomous', async (req, res) => {
  try {
    await sendAutonomousNotification(app);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;

(async () => {
  await app.start(port);
  console.log(`⚡ Agentforce DevOps Middleware running on port ${port}`);
})();
