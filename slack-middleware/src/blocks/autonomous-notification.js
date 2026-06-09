function buildAutonomousNotification() {
  return {
    channel: '#devops-logs',
    text: 'Agentforce — Fix Crítico deployed autonomamente',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 Agentforce — Ação Autónoma Concluída',
          emoji: true,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '🚨 *Fix Crítico detectado e resolvido autonomamente.*',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Eu, *Agentforce*, executei o seguinte pipeline de forma autónoma:\n\n1️⃣ Analisei o código do PR com tag `[HOTFIX]`\n2️⃣ Validei a classe de teste — cobertura *97%*\n3️⃣ Verifiquei regras PMD — *0 violações*\n4️⃣ Merge automático realizado\n5️⃣ Deploy em Produção via GitHub Actions — *✅ Sucesso*\n6️⃣ Smoke tests pós-deploy — *✅ Passed*',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '⏱️ Tempo total: *3 min 22s* | Tempo estimado manual: *48 min*',
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '💰 *O time economizou ~45 minutos.* Nenhuma intervenção humana foi necessária.',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '🔒 Modo: Autónomo | Confiança: 99.2% | Agentforce DevOps Lead Architect',
          },
        ],
      },
    ],
  };
}

module.exports = { buildAutonomousNotification };
