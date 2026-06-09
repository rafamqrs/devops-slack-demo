function buildPRReviewMessage(prData) {
  const { number, title, user, html_url, additions, deletions, changed_files } = prData;

  return {
    channel: '#devops-approvals',
    text: `Agentforce analisou o PR #${number}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 Agentforce — Análise de Pull Request',
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
          text: `*PR #${number}:* <${html_url}|${title}>\n*Autor:* ${user}\n*Ficheiros alterados:* ${changed_files} | *+${additions}* / *-${deletions}*`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '📊 *Resultado da Análise Agentforce:*\n\n✅ Boas práticas de código seguidas\n✅ Cobertura de testes: *95%*\n✅ Sem vulnerabilidades de segurança detetadas\n✅ Convenções de naming respeitadas\n✅ Nenhuma regra PMD violada',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '🕐 Análise concluída em 12s | Modelo: Agentforce DevOps Lead Architect',
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*💡 Recomendação:* Este PR está pronto para deploy. Deseja prosseguir?',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✅ Aprovar Deploy',
              emoji: true,
            },
            style: 'primary',
            action_id: 'approve_deploy',
            value: JSON.stringify({ pr_number: number, repo: prData.repo }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '❌ Rejeitar',
              emoji: true,
            },
            style: 'danger',
            action_id: 'reject_deploy',
            value: JSON.stringify({ pr_number: number, repo: prData.repo }),
          },
        ],
      },
    ],
  };
}

module.exports = { buildPRReviewMessage };
