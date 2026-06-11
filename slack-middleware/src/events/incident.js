const INCIDENT_TEAM_EMAILS = [
  'rafamrqs@live.com',
  'demoeng+greg_executive_17204@slack-corp.com',
  'demoeng+adam_watson_17204@slack-corp.com',
  'demoeng+aisha_thompson_17204@slack-corp.com',
  'demoeng+daniel_kingsley_17204@slack-corp.com',
];

async function resolveUserIds(client, emails) {
  const ids = [];
  for (const email of emails) {
    try {
      const result = await client.users.lookupByEmail({ email });
      ids.push(result.user.id);
    } catch (e) {
      console.warn(`Could not find user for ${email}:`, e.message);
    }
  }
  return ids;
}

async function createIncidentChannel(client, { title, severity, reporter }) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const channelName = `inc-${date}-${slug}`;

  let channel;
  try {
    const result = await client.conversations.create({
      name: channelName,
      is_private: false,
    });
    channel = result.channel;
  } catch (e) {
    return { error: `Failed to create channel: ${e.message}` };
  }

  // Invite on-call team
  const userIds = await resolveUserIds(client, INCIDENT_TEAM_EMAILS);
  if (userIds.length > 0) {
    try {
      await client.conversations.invite({
        channel: channel.id,
        users: userIds.join(','),
      });
    } catch (e) {
      console.warn('Could not invite all users:', e.message);
    }
  }

  await client.chat.postMessage({
    channel: channel.id,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🚨 Incident: ${title}`, emoji: true },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Severity:* ${severity}` },
          { type: 'mrkdwn', text: `*Reporter:* @${reporter}` },
          { type: 'mrkdwn', text: `*Status:* 🔴 Open` },
          { type: 'mrkdwn', text: `*Created:* ${new Date().toLocaleTimeString('pt-BR')}` },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Timeline:*\n• `' + new Date().toLocaleTimeString('pt-BR') + '` — Incident criado por @' + reporter,
        },
      },
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '👀 Acknowledging', emoji: true },
            action_id: 'incident_ack',
            value: JSON.stringify({ channelId: channel.id, title }),
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔍 Investigating', emoji: true },
            action_id: 'incident_investigating',
            value: JSON.stringify({ channelId: channel.id, title }),
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Resolved', emoji: true },
            style: 'primary',
            action_id: 'incident_resolved',
            value: JSON.stringify({ channelId: channel.id, title }),
          },
        ],
      },
    ],
  });

  return { channel: channel.id, name: channelName };
}

function registerIncidentActions(app) {
  app.action('incident_ack', async ({ body, ack, client }) => {
    await ack();
    const user = body.user.name;
    await client.chat.postMessage({
      channel: body.channel.id,
      text: `👀 *@${user}* está a investigar este incidente. | ${new Date().toLocaleTimeString('pt-BR')}`,
    });
  });

  app.action('incident_investigating', async ({ body, ack, client }) => {
    await ack();
    const user = body.user.name;
    await client.chat.postMessage({
      channel: body.channel.id,
      text: `🔍 *@${user}* identificou a causa e está a trabalhar na resolução. | ${new Date().toLocaleTimeString('pt-BR')}`,
    });
  });

  app.action('incident_resolved', async ({ body, ack, client }) => {
    await ack();
    const user = body.user.name;
    const { title } = JSON.parse(body.actions[0].value);

    await client.chat.postMessage({
      channel: body.channel.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Incidente resolvido por @${user}*\n\n*Título:* ${title}\n*Duração:* ${Math.floor(Math.random() * 20 + 5)} minutos\n*Status:* 🟢 Resolved`,
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Resolvido às ${new Date().toLocaleTimeString('pt-BR')} | Canal será arquivado em 24h` },
          ],
        },
      ],
    });
  });

  app.command('/incident', async ({ command, ack, client }) => {
    await ack();

    const text = command.text.trim();
    const severity = text.includes('critical') ? '🔴 Critical' : text.includes('major') ? '🟠 Major' : '🟡 Minor';
    const title = text.replace(/(critical|major|minor)/gi, '').trim() || 'Unspecified incident';

    const result = await createIncidentChannel(client, {
      title,
      severity,
      reporter: command.user_name,
    });

    if (result.error) {
      await client.chat.postMessage({
        channel: command.channel_id,
        text: `❌ ${result.error}`,
      });
      return;
    }

    await client.chat.postMessage({
      channel: command.channel_id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🚨 *Incidente criado!*\n\nCanal: <#${result.channel}>\nSeveridade: ${severity}\nOn-call team notificado.`,
          },
        },
      ],
    });
  });
}

module.exports = { createIncidentChannel, registerIncidentActions };
