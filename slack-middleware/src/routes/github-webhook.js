const { Router } = require('express');
const { buildPRReviewMessage } = require('../blocks/pr-review');
const { sendAutonomousNotification } = require('../notifications/autonomous');

function createGitHubWebhookRouter(app) {
  const router = Router();

  router.use(require('express').json());

  router.post('/pr', async (req, res) => {
    const payload = req.body;

    if (payload.action !== 'opened' && payload.action !== 'synchronize') {
      return res.json({ skipped: true, reason: `action=${payload.action}` });
    }

    const pr = payload.pull_request;
    const isHotfix = pr.title.includes('[HOTFIX]') || (pr.labels || []).some(l => l.name === 'hotfix');

    if (isHotfix) {
      await sendAutonomousNotification(app);
      return res.json({ mode: 'autonomous', pr: pr.number });
    }

    const prData = {
      number: pr.number,
      title: pr.title,
      user: pr.user.login,
      html_url: pr.html_url,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changed_files: pr.changed_files || 0,
      repo: payload.repository.full_name,
    };

    const message = buildPRReviewMessage(prData);

    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: message.channel,
      text: message.text,
      blocks: message.blocks,
    });

    res.json({ mode: 'assistant', pr: pr.number });
  });

  return router;
}

module.exports = { createGitHubWebhookRouter };
