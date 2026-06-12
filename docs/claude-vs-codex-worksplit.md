# WEDO Meta OS — Claude Code vs Codex Work Split

## Roles

| Role | Tool | Access |
|------|------|--------|
| Main Integrator | Claude Code (this system) | GitHub, n8n MCP, Supabase MCP, Vercel MCP, full repo |
| Offline Auditor | Codex | Code analysis only — no n8n, no Supabase, no Vercel |
| Approver | Ricardo | Meta tokens, human approvals, activation decisions |

## What Claude Code Owns

- All system integration (n8n workflow creation, Supabase migrations, Vercel deployments)
- GitHub operations (branches, PRs, commits)
- Validation scripts and their execution
- Agent contract updates and fixes
- Dashboard code (Next.js)
- Operational docs

## What Codex Reviews (Offline Audit)

Codex reviews code changes but cannot execute anything live. Send Codex:
- Pull request diffs for security review
- Agent contract changes for logic review
- n8n workflow JSON for pattern review
- SQL migrations for schema review

**Codex cannot:**
- Push to GitHub
- Create n8n workflows
- Run migrations
- Access live systems

## What Ricardo Decides

- Whether to activate a workflow
- Which Meta tokens to use and when to rotate them
- Approving pending actions in the dashboard
- Final sign-off on all phases in the production checklist
- Setting n8n variable values

**Ricardo never needs to:**
- Write code
- Understand JSON schemas
- Configure Supabase tables
- Debug n8n logic

## Communication Protocol

```
Claude Code → builds system → commits to feature branch → opens draft PR
                ↓
Codex (optional) → reviews PR diff → comments on concerns
                ↓
Ricardo → reviews PR summary → approves merge → activates phase
```

## Conflict Resolution

If Claude Code and Codex disagree on a security assessment:
- Take the more conservative position
- Ask Ricardo for the final call if it blocks progress
- Document the decision in the PR comments

## Why This Split Works

- Claude Code has tool access and context — it can build end-to-end
- Codex is stateless and unbiased — useful for security/logic review
- Ricardo has business context — only he knows which automations are appropriate
- No single automated system has both "write code" and "send messages" authority
