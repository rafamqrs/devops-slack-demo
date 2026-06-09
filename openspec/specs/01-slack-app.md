# Fase 1: Slack App & Webhooks (Middleware)

**Objetivo:** Criar o orquestrador que recebe eventos do GitHub e interage via Slack.

**Instruções de Geração:**
1. Crie uma pasta `/slack-middleware` com um projeto Node.js (`@slack/bolt` e `express`).
2. **Cenário 1 (Assistente):** Crie um endpoint `/webhook/github/pr` que receba eventos do GitHub. Ao receber um PR aberto, envie uma mensagem no canal `#devops-approvals` usando o Slack Block Kit. A mensagem deve fingir ser o Agentforce:
   - *Seção:* Resumo da análise do código (ex: "Analisei o PR #42. Boas práticas seguidas, cobertura de 95%.").
   - *Ações:* Botões "Aprovar Deploy" (Verde) e "Rejeitar" (Vermelho).
   - Ao clicar em Aprovar, o app deve chamar a API do GitHub para dar merge no PR e disparar o Action.
3. **Cenário 2 (Autônomo):** Crie um método separado que envie uma notificação informativa (sem botões) para o canal `#devops-logs`:
   - *Mensagem:* "🚨 Fix Crítico detectado. Eu, Agentforce, já analisei o código, executei os testes no GitHub Actions, certifiquei a segurança e fiz o deploy em Produção. Time economizou 45 minutos."

**Critério de Aceitação:** JSONs do Block Kit devem ser ricos visualmente (usar emojis, divisores e markdown).
