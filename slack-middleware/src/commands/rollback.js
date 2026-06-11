function registerRollbackCommand(app) {
  app.command('/rollback', async ({ command, ack, client }) => {
    await ack();

    const user = command.user_name;

    await client.chat.postMessage({
      channel: command.channel_id,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '⏪ Rollback Solicitado', emoji: true },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*@${user}* solicitou rollback de *Production*\n\n*Versão actual:* \`v2.4.1\`\n*Reverter para:* \`v2.4.0\`\n*Razão:* Não especificada`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '⚠️ *Atenção:* Esta ação reverte todas as mudanças do último deploy.',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '⏪ Confirmar Rollback', emoji: true },
              style: 'danger',
              action_id: 'confirm_rollback',
              value: JSON.stringify({ from: 'v2.4.1', to: 'v2.4.0', user }),
              confirm: {
                title: { type: 'plain_text', text: 'Tens a certeza?' },
                text: { type: 'mrkdwn', text: 'Vais reverter Production para v2.4.0. Esta ação é imediata.' },
                confirm: { type: 'plain_text', text: 'Sim, reverter' },
                deny: { type: 'plain_text', text: 'Cancelar' },
              },
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '❌ Cancelar', emoji: true },
              action_id: 'cancel_rollback',
            },
          ],
        },
      ],
    });
  });
}

module.exports = { registerRollbackCommand };
