require('dotenv').config();
const { App } = require('@slack/bolt');
const express = require('express');
const axios = require('axios');
const { registerActions } = require('./actions/approve-reject');
const { registerDeployActions } = require('./actions/deploy-actions');
const { registerDeployCommand } = require('./commands/deploy');
const { registerStatusCommand } = require('./commands/status');
const { registerRollbackCommand } = require('./commands/rollback');
const { registerIncidentActions } = require('./events/incident');
const { startDashboardLoop } = require('./events/dashboard');
const { sendAutonomousNotification } = require('./notifications/autonomous');
const { buildPRReviewMessage } = require('./blocks/pr-review');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Register all interactions
registerActions(app);
registerDeployActions(app);
registerDeployCommand(app);
registerStatusCommand(app);
registerRollbackCommand(app);
registerIncidentActions(app);

// Express server for webhook endpoints
const server = express();
server.use(express.json());

server.get('/health', (req, res) => {
  res.json({ status: 'ok', agent: 'Agentforce DevOps' });
});

server.post('/webhook/github/pr', async (req, res) => {
  const payload = req.body;

  if (payload.action !== 'opened' && payload.action !== 'synchronize') {
    return res.json({ skipped: true, reason: `action=${payload.action}` });
  }

  const pr = payload.pull_request;
  let decision = null;

  const sfInstanceUrl = process.env.SF_INSTANCE_URL;
  const sfAccessToken = process.env.SF_ACCESS_TOKEN;

  if (sfInstanceUrl && sfAccessToken) {
    try {
      const sfResponse = await axios.post(
        `${sfInstanceUrl}/services/apexrest/devops/webhook`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${sfAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      decision = JSON.parse(sfResponse.data);
      console.log('→ Salesforce decision:', decision);
    } catch (error) {
      console.error('→ Salesforce callout failed, deciding locally:', error.message);
    }
  }

  if (!decision) {
    const isHotfix = pr.title.includes('[HOTFIX]') || (pr.labels || []).some(l => l.name === 'hotfix');
    decision = { status: 'published', pr: pr.number, isHotfix };
  }

  if (decision.isHotfix) {
    await sendAutonomousNotification(app);
    console.log('→ Slack: Autonomous notification sent to #devops-logs');
    return res.json({ mode: 'autonomous', decidedBy: sfInstanceUrl ? 'salesforce' : 'local', pr: pr.number });
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

  console.log('→ Slack: PR review sent to #devops-approvals');
  res.json({ mode: 'assistant', decidedBy: sfInstanceUrl ? 'salesforce' : 'local', pr: pr.number });
});

server.post('/notify/autonomous', async (req, res) => {
  try {
    await sendAutonomousNotification(app);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start live dashboard (auto-updating message)
server.post('/dashboard/start', async (req, res) => {
  const channel = req.body.channel || '#devops-pipeline';
  const interval = req.body.interval || 10000;
  startDashboardLoop(app.client, channel, interval);
  res.json({ success: true, channel, interval });
});

const port = process.env.PORT || 3000;

(async () => {
  await app.start();
  server.listen(port, () => {
    console.log('');
    console.log('⚡ Agentforce DevOps Middleware — Slack Command Center');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Slack:    Socket Mode (no public URL needed)`);
    console.log(`  HTTP:     http://localhost:${port}`);
    const sfMode = process.env.SF_INSTANCE_URL ? 'Salesforce (real)' : 'Local (fallback)';
    console.log(`  Engine:   ${sfMode}`);
    console.log('');
    console.log('  Slash Commands (configure in Slack App):');
    console.log('    /deploy <env>    — Deploy to staging/production');
    console.log('    /status          — Pipeline status');
    console.log('    /rollback        — Rollback production');
    console.log('    /incident <desc> — Create incident channel');
    console.log('');
    console.log('  Demo endpoints:');
    console.log(`    curl -X POST http://localhost:${port}/webhook/github/pr -H "Content-Type: application/json" -d @test-webhook-payload.json`);
    console.log(`    curl -X POST http://localhost:${port}/webhook/github/pr -H "Content-Type: application/json" -d @test-webhook-hotfix.json`);
    console.log(`    curl -X POST http://localhost:${port}/dashboard/start -H "Content-Type: application/json" -d '{"channel":"#devops-pipeline"}'`);
    console.log('');
  });
})();
