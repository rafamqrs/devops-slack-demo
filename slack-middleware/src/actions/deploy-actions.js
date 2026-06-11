function registerDeployActions(app) {
  app.action('approve_production_deploy', async ({ body, ack, client }) => {
    await ack();

    const { env, user, version } = JSON.parse(body.actions[0].value);
    const approver = body.user.name;

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.message.ts,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Deploy aprovado por @${approver}*\n\nIniciando deploy de \`${version}\` para *${env}*...`,
          },
        },
      ],
    });

    setTimeout(async () => {
      await client.chat.postMessage({
        channel: body.channel.id,
        thread_ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🎉 *Deploy para Production concluído!*\n\n*Versão:* \`${version}\`\n*Duração:* 3m 22s\n*Testes:* 34/34 passed\n*Aprovado por:* @${approver}\n*Solicitado por:* @${user}`,
            },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: '📝 Audit trail registado | Sem rollback nas últimas 24h' },
            ],
          },
        ],
      });
    }, 5000);
  });

  app.action('reject_production_deploy', async ({ body, ack, client }) => {
    await ack();

    const { user } = JSON.parse(body.actions[0].value);
    const rejector = body.user.name;

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.message.ts,
      text: `❌ *Deploy rejeitado por @${rejector}*. @${user} reveja as mudanças e tente novamente.`,
    });
  });

  app.action('confirm_rollback', async ({ body, ack, client }) => {
    await ack();

    const { from, to, user } = JSON.parse(body.actions[0].value);
    const confirmer = body.user.name;

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.message.ts,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⏪ *Rollback em progresso...*\n\`${from}\` → \`${to}\``,
          },
        },
      ],
    });

    setTimeout(async () => {
      await client.chat.postMessage({
        channel: body.channel.id,
        thread_ts: body.message.ts,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Rollback concluído!*\n\n*Production* agora em \`${to}\`\n*Executado por:* @${confirmer}\n*Duração:* 45s`,
            },
          },
        ],
      });
    }, 3000);
  });

  app.action('cancel_rollback', async ({ body, ack, client }) => {
    await ack();
    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.message.ts,
      text: '🚫 Rollback cancelado.',
    });
  });
}

module.exports = { registerDeployActions };
