## Why

A demo de pré-vendas precisa de dar vida ao Agentforce como DevOps Lead Architect — o agente que orquestra revisão de PRs, aprovações no Slack e deploys autónomos. Sem a configuração formal dos prompts, role e ações, a demo não consegue demonstrar os dois cenários-chave (assistente e autónomo) de forma credível ao cliente.

## What Changes

- Introduzir a configuração do Agentforce Agent com role, ações associadas e dois comportamentos distintos.
- Definir o prompt do **Comportamento 1 (Assistente)**: análise de PRs com envio de mensagem Slack Block Kit e botões de aprovação.
- Definir o prompt do **Comportamento 2 (Autónomo)**: análise, merge, deploy e notificação automáticos para PRs com tag `[HOTFIX]`.
- Mapear as três ações do agente: `ReviewGitHubPullRequest`, `SendSlackMessage`, `TriggerGitHubAction`.

## Capabilities

### New Capabilities
- `agentforce-config`: Configuração do Agentforce Agent (role, ações e prompts dos dois comportamentos — assistente e autónomo)

### Modified Capabilities

## Impact

- Integra com o Slack middleware (`slack-middleware/`) que já implementa os endpoints de webhook e notificações.
- Integra com os GitHub Actions workflows (`.github/workflows/`) para triggering de deploys.
- Integra com o código Salesforce (`force-app/`) que é o alvo da análise de PRs.
- Nenhuma breaking change — aditivo apenas.
