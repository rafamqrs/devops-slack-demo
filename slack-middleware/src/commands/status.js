function registerStatusCommand(app) {
  app.command('/status-pipeline', async ({ command, ack, client }) => {
    await ack();

    await client.chat.postMessage({
      channel: command.channel_id,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '📊 Pipeline Status', emoji: true },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🟢 *Production*\n└ `v2.4.0` — deployed 2h ago — uptime 99.98%',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🟢 *Staging*\n└ `v2.4.1` — deployed 15 min ago — tests passing',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🟡 *QA*\n└ `v2.4.2-rc1` — deploy in progress (3/5 steps)',
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Open PRs:* 4 | *Awaiting Review:* 2 | *Ready to Merge:* 1',
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Último refresh: ${new Date().toLocaleTimeString('pt-BR')} | /deploy <env> para iniciar deploy` },
          ],
        },
      ],
    });
  });
}

module.exports = { registerStatusCommand };
