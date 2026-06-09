# Demo Setup Checklist

## Pre-requisitos

### Slack
- [ ] Criar Slack App em api.slack.com/apps
- [ ] Ativar Socket Mode (para dev local) ou configurar Request URL
- [ ] Bot Token Scopes: `chat:write`, `channels:read`
- [ ] Criar canais: `#devops-approvals` e `#devops-logs`
- [ ] Instalar o bot em ambos os canais

### GitHub
- [ ] Criar repositório de demo (ou usar este)
- [ ] Gerar Personal Access Token com scopes: `repo`, `workflow`
- [ ] Configurar webhook no repo: URL = `<middleware-url>/webhook/github/pr`, Events = Pull Requests

### Salesforce (Org: devops-demo)
- [ ] Configurar Named Credential `GitHub_API` com endpoint real
- [ ] Configurar Named Credential `Slack_Middleware` com URL do middleware
- [ ] Adicionar `api.github.com` e URL do middleware ao Remote Site Settings
- [ ] No Agent Builder: criar Agent "Agentforce DevOps" com role "DevOps Lead Architect"
- [ ] Adicionar Topic "PR Review" com prompt do ficheiro genAiPlugins/DevOps_PR_Review
- [ ] Adicionar Topic "Hotfix Resolution" com prompt do ficheiro genAiPlugins/DevOps_Hotfix_Resolution
- [ ] Associar os 3 Flows como Agent Actions

### Middleware (.env)
```
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
GITHUB_TOKEN=ghp_...
PORT=3000
```

## Testar a Demo

### Cenário 1 (Assistente)
1. Criar branch: `git checkout -b feat/churn-risk`
2. Abrir PR com título: "feat: Add ChurnRiskIndicator component"
3. Webhook dispara → mensagem aparece em #devops-approvals
4. Clicar "Aprovar Deploy" → PR merged → GitHub Actions deploys

### Cenário 2 (Autónomo)
1. Criar branch: `git checkout -b hotfix/null-pointer`
2. Abrir PR com título: "[HOTFIX] Fix critical null pointer in ChurnRiskController"
3. Webhook dispara → Agentforce analisa autonomamente
4. Notificação aparece em #devops-logs (sem botões)

### Cenário 3 (Fallback)
1. Abrir PR com título: "[HOTFIX] Untested emergency fix"
2. Simular falha de cobertura < 90%
3. Agentforce escala para #devops-approvals com explicação
