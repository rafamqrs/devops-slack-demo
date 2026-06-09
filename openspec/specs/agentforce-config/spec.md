### Requirement: Agent Role Definition
The Agentforce Agent SHALL be configured with the role "DevOps Lead Architect" and SHALL have access to three actions: `ReviewGitHubPullRequest`, `SendSlackMessage`, and `TriggerGitHubAction`.

#### Scenario: Agent identity is correctly configured
- **WHEN** the agent is invoked in any context
- **THEN** it SHALL operate under the role "DevOps Lead Architect" with access to all three registered actions

### Requirement: Assistente Behaviour - PR Review with Human Approval
The agent SHALL analyse Pull Requests opened on development branches, summarise Apex and LWC changes, identify risks, and send a structured Slack Block Kit message to `#devops-approvals` with approval/rejection buttons. The agent SHALL wait for human interaction before proceeding.

#### Scenario: Standard PR opened triggers assistant review
- **WHEN** a Pull Request is opened on a development branch without the `[HOTFIX]` tag
- **THEN** the agent SHALL summarise code changes, identify risks, and send a Block Kit message to `#devops-approvals` with "Aprovar Deploy" and "Rejeitar" buttons

#### Scenario: User approves deploy via Slack button
- **WHEN** a user clicks "Aprovar Deploy" in the Slack message
- **THEN** the agent SHALL merge the PR via GitHub API and trigger the production deploy workflow

#### Scenario: User rejects deploy via Slack button
- **WHEN** a user clicks "Rejeitar" in the Slack message
- **THEN** the agent SHALL NOT merge the PR and SHALL post a rejection confirmation in the thread

### Requirement: Autonomous Behaviour - Hotfix Auto-Resolution
The agent SHALL have full autonomy when a PR contains the `[HOTFIX]` tag. It SHALL analyse the code, verify test coverage exceeds 90%, confirm zero PMD violations, merge the PR, trigger the deploy, and notify `#devops-logs` with the resolution details and time saved.

#### Scenario: Hotfix PR meets all quality gates
- **WHEN** a PR with tag `[HOTFIX]` is opened AND test coverage is above 90% AND PMD reports zero violations
- **THEN** the agent SHALL automatically merge the PR, trigger GitHub Actions deploy, and send a notification to `#devops-logs` reporting the autonomous resolution and time saved

#### Scenario: Hotfix PR fails quality gates
- **WHEN** a PR with tag `[HOTFIX]` is opened AND test coverage is below 90% OR PMD reports violations
- **THEN** the agent SHALL NOT merge the PR and SHALL escalate to `#devops-approvals` with a human review request explaining the failure reason

### Requirement: Agent Actions Configuration
Each agent action SHALL be implemented as a Salesforce Flow with HTTP Callout to the respective external service.

#### Scenario: ReviewGitHubPullRequest action invocation
- **WHEN** the agent needs to review a PR
- **THEN** it SHALL invoke the `ReviewGitHubPullRequest` action which calls the GitHub API to fetch PR diff and metadata

#### Scenario: SendSlackMessage action invocation
- **WHEN** the agent needs to communicate with the team
- **THEN** it SHALL invoke the `SendSlackMessage` action which calls the Slack middleware endpoint to post Block Kit messages

#### Scenario: TriggerGitHubAction action invocation
- **WHEN** the agent needs to initiate a deploy
- **THEN** it SHALL invoke the `TriggerGitHubAction` action which triggers the production workflow via GitHub API
