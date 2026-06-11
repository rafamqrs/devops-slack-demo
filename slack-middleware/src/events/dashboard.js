let dashboardMessageTs = null;
let dashboardChannel = null;

function buildDashboardBlocks(state) {
  const now = new Date().toLocaleTimeString('pt-BR');

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🖥️ DevOps Pipeline — Live Dashboard', emoji: true },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${state.prod.emoji} *Production* — \`${state.prod.version}\`\n└ ${state.prod.status} — uptime ${state.prod.uptime}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${state.staging.emoji} *Staging* — \`${state.staging.version}\`\n└ ${state.staging.status}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${state.qa.emoji} *QA* — \`${state.qa.version}\`\n└ ${state.qa.status}`,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Open PRs:* ${state.prs.open}` },
        { type: 'mrkdwn', text: `*Awaiting Review:* ${state.prs.review}` },
        { type: 'mrkdwn', text: `*Deploys hoje:* ${state.deploys}` },
        { type: 'mrkdwn', text: `*Incidents:* ${state.incidents}` },
      ],
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `🔄 Auto-refresh | Última actualização: ${now}` },
      ],
    },
  ];
}

async function postOrUpdateDashboard(client, channel, state) {
  const blocks = buildDashboardBlocks(state);

  if (dashboardMessageTs && dashboardChannel === channel) {
    try {
      await client.chat.update({
        channel,
        ts: dashboardMessageTs,
        blocks,
        text: 'DevOps Pipeline Dashboard',
      });
      return dashboardMessageTs;
    } catch (e) {
      // Message may have been deleted, post new one
    }
  }

  const result = await client.chat.postMessage({
    channel,
    blocks,
    text: 'DevOps Pipeline Dashboard',
  });

  dashboardMessageTs = result.ts;
  dashboardChannel = channel;
  return dashboardMessageTs;
}

function getDefaultState() {
  return {
    prod: { emoji: '🟢', version: 'v2.4.0', status: 'Healthy', uptime: '99.98%' },
    staging: { emoji: '🟢', version: 'v2.4.1', status: 'Deployed 15 min ago — tests passing' },
    qa: { emoji: '🟡', version: 'v2.4.2-rc1', status: 'Deploy in progress (3/5 steps)' },
    prs: { open: 4, review: 2 },
    deploys: 3,
    incidents: 0,
  };
}

function startDashboardLoop(client, channel, intervalMs) {
  const state = getDefaultState();

  postOrUpdateDashboard(client, channel, state);

  const stages = [
    () => { state.qa.emoji = '🟢'; state.qa.status = 'Deploy complete — tests passing'; },
    () => { state.staging.version = 'v2.4.2'; state.staging.status = 'Deployed just now'; state.deploys = 4; },
    () => { state.prs.open = 3; state.prs.review = 1; },
    () => { state.prod.emoji = '🟡'; state.prod.status = 'Deploy in progress...'; },
    () => { state.prod.emoji = '🟢'; state.prod.version = 'v2.4.1'; state.prod.status = 'Healthy'; state.deploys = 5; },
  ];

  let step = 0;
  const interval = setInterval(async () => {
    if (step < stages.length) {
      stages[step]();
      step++;
    }
    await postOrUpdateDashboard(client, channel, state);
    if (step >= stages.length) {
      clearInterval(interval);
    }
  }, intervalMs || 10000);

  return interval;
}

module.exports = { postOrUpdateDashboard, startDashboardLoop, getDefaultState };
