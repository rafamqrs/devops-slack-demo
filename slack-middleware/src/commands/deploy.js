function registerDeployCommand(app) {
  app.command('/deploy', async ({ command, ack, client }) => {
    await ack();

    const env = command.text.trim().toLowerCase() || 'staging';
    const user = command.user_name;

    if (env === 'production') {
      await client.chat.postMessage({
        channel: command.channel_id,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: '🚀 Deploy para Production', emoji: true },
          },
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*@${user}* solicitou deploy para *Production*\n\n📦 Branch: \`main\`\n🏷️ Versão: \`v2.4.1\`\n📋 Commits: 3 desde último deploy`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '⚠️ *Requer aprovação de um manager para prosseguir.*',
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: '✅ Aprovar Deploy', emoji: true },
                style: 'primary',
                action_id: 'approve_production_deploy',
                value: JSON.stringify({ env, user, version: 'v2.4.1' }),
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: '❌ Rejeitar', emoji: true },
                style: 'danger',
                action_id: 'reject_production_deploy',
                value: JSON.stringify({ env, user }),
              },
            ],
          },
        ],
      });
    } else {
      await client.chat.postMessage({
        channel: command.channel_id,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `🚀 Deploy iniciado — ${env}`, emoji: true },
          },
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Ambiente:* ${env}\n*Iniciado por:* @${user}\n*Branch:* \`main\`\n*Versão:* \`v2.4.1\``,
            },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: '⏱️ Tempo estimado: ~2 minutos' },
            ],
          },
        ],
      });

      setTimeout(async () => {
        await client.chat.postMessage({
          channel: command.channel_id,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *Deploy concluído com sucesso!*\n\n*Ambiente:* ${env}\n*Versão:* \`v2.4.1\`\n*Duração:* 1m 47s\n*Testes:* 34/34 passed`,
              },
            },
            {
              type: 'context',
              elements: [
                { type: 'mrkdwn', text: `Deployed por @${user} | ${new Date().toLocaleString('pt-BR')}` },
              ],
            },
          ],
        });
      }, 5000);
    }
  });
}

module.exports = { registerDeployCommand };
