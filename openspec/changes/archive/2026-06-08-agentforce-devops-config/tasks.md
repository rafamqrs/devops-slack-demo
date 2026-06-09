## 1. Named Credentials & External Services

- [x] 1.1 Criar Named Credential para GitHub API (endpoint: api.github.com, auth: token)
- [x] 1.2 Criar Named Credential para Slack Middleware (endpoint: URL do middleware, auth: none/custom header)
- [x] 1.3 Configurar External Service para GitHub com schema OpenAPI simplificado

## 2. Agent Actions (Flows)

- [x] 2.1 Criar Flow `ReviewGitHubPullRequest` — HTTP callout ao GitHub para obter diff e metadata do PR
- [x] 2.2 Criar Flow `SendSlackMessage` — HTTP callout ao middleware para enviar Block Kit message
- [x] 2.3 Criar Flow `TriggerGitHubAction` — HTTP callout ao GitHub para dispatch workflow de deploy

## 3. Agent Configuration no Agent Builder

- [x] 3.1 Criar Agent com role "DevOps Lead Architect" no Agent Builder
- [x] 3.2 Configurar Topic "PR Review" (Comportamento Assistente) com prompt e instruções
- [x] 3.3 Configurar Topic "Hotfix Resolution" (Comportamento Autónomo) com prompt e instruções
- [x] 3.4 Associar as três ações (Flows) ao Agent

## 4. Prompts & Instruções

- [x] 4.1 Redigir prompt do Topic Assistente: resumir mudanças Apex/LWC, identificar riscos, enviar mensagem com botões, aguardar clique
- [x] 4.2 Redigir prompt do Topic Autónomo: analisar código, verificar cobertura >90%, confirmar 0 violações PMD, merge, deploy, notificar com tempo economizado
- [x] 4.3 Definir guardrails do agente (quando escalar vs. agir autonomamente)

## 5. Validação & Demo Prep

- [x] 5.1 Testar fluxo assistente end-to-end: PR aberto → mensagem Slack → clique Aprovar → merge → deploy
- [x] 5.2 Testar fluxo autónomo end-to-end: PR com [HOTFIX] → análise → merge automático → deploy → notificação
- [x] 5.3 Testar fallback: PR com [HOTFIX] que falha quality gates → escalação para #devops-approvals
- [x] 5.4 Preparar dados de demo (PR de exemplo, tokens configurados, canais Slack criados)
