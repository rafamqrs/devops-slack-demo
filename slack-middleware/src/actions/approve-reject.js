const axios = require('axios');

function registerActions(app) {
  app.action('approve_deploy', async ({ body, ack, client }) => {
    await ack();

    const { pr_number, repo } = JSON.parse(body.actions[0].value);
    const user = body.user.name;

    try {
      await axios.put(
        `https://api.github.com/repos/${repo}/pulls/${pr_number}/merge`,
        {
          commit_title: `Deploy approved by ${user} via Agentforce`,
          merge_method: 'squash',
        },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      await client.chat.postMessage({
        channel: body.channel.id,
        thread_ts: body.message.ts,
        text: `✅ *Deploy aprovado por @${user}!*\nPR #${pr_number} merged com sucesso. GitHub Actions irá iniciar o deploy para Produção.`,
      });
    } catch (error) {
      await client.chat.postMessage({
        channel: body.channel.id,
        thread_ts: body.message.ts,
        text: `⚠️ Erro ao fazer merge do PR #${pr_number}: ${error.message}`,
      });
    }
  });

  app.action('reject_deploy', async ({ body, ack, client }) => {
    await ack();

    const { pr_number } = JSON.parse(body.actions[0].value);
    const user = body.user.name;

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.message.ts,
      text: `❌ *Deploy rejeitado por @${user}.*\nPR #${pr_number} não será merged. Reveja o código e submeta novamente.`,
    });
  });
}

module.exports = { registerActions };
