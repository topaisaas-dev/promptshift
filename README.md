# PromptShift ⚡ Universal AI Coding Agent Transpiler & Drift Guard

[![PromptShift Certified](https://promptshift.dev/api/badge?score=98.5)](https://promptshift.dev)
[![GitHub release](https://img.shields.io/github/v/release/topaisaas-dev/promptshift?color=emerald&label=version)](https://github.com/topaisaas-dev/promptshift/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![AST Parity](https://img.shields.io/badge/AST%20Semantic%20Parity-98.5%25-cyan.svg)](https://promptshift.dev)
[![PromptShift MCP server](https://glama.ai/mcp/servers/topaisaas-dev/promptshift/badge)](https://glama.ai/mcp/servers/topaisaas-dev/promptshift)
[![Zero-Data-Retention](https://img.shields.io/badge/Privacy-Zero--Data--Retention-green.svg)](https://promptshift.dev/security)
[![MCP Compatible](https://img.shields.io/badge/MCP-JSON--RPC%202.0-purple.svg)](https://modelcontextprotocol.io)

> **Deterministic AST transpilation and secret sanitation between Cursor (`.mdc`), Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`), GitHub Copilot, Cline, and Roo Code.**

🌐 **Web Application:** [https://promptshift.dev](https://promptshift.dev)  
📦 **CLI Package:** `npx promptshift`  
🤖 **MCP Server:** `npx promptshift --mcp`  
🔄 **GitHub Action:** `topaisaas-dev/promptshift@v1`

---

## The Problem: AI Rule Fragmentation & Multi-IDE Drift

Modern engineering teams often collaborate across multiple AI-assisted developer environments:
- **Cursor** uses granular frontmatter-annotated markdown rules (`.cursor/rules/*.mdc`) and `.cursorrules`.
- **Claude Code** expects a unified root instruction context (`CLAUDE.md`).
- **Windsurf** relies on `.windsurfrules`.
- **GitHub Copilot** looks for `.github/copilot-instructions.md`.
- **Aider, Cline & Roo Code** each define custom agent boundaries.

When an engineer updates `CLAUDE.md` but forgets to synchronize `.cursor/rules/`, AI coding agents develop conflicting behaviors, hallucinate mismatched constraints, and accidentally commit sensitive API keys.

**PromptShift** eliminates fragmentation with certified **98.5% AST semantic parity**, **OWASP In-RAM secret sanitization**, and **instant CI/CD drift guards**.

---

## ⚡ Quick Start

### 1. One-Command Continuous CI/CD Guard
Bootstrap automated PR parity verification and secret scanning in 2 seconds:

```bash
npx promptshift --init-ci
```

### 2. Zero-Install CLI (NPX)
Transpile rules locally without permanent installation:

```bash
# Real-time watcher: automatically syncs rules across Cursor & Claude on every Ctrl+S (0.02s)
npx promptshift --watch

# Audit workspace for rules drift and exposed secrets
npx promptshift --check

# Transpile from current project to Claude Code
npx promptshift --to=claude

# Transpile from current project to GitHub Copilot
npx promptshift --to=copilot

# Transpile from current project to Windsurf
npx promptshift --to=windsurf

# Get official certified badge for your README.md
npx promptshift --badge
```

### 2. Model Context Protocol (MCP) Integration
PromptShift includes a native STDIO JSON-RPC 2.0 MCP server compatible with **Claude Desktop**, **Cursor**, **Glama.ai**, and **Smithery.ai**.

#### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "promptshift": {
      "command": "npx",
      "args": ["-y", "promptshift", "--mcp"]
    }
  }
}
```

#### Docker Container Execution (Glama Firecracker & Local MicroVMs)
```bash
# Build and run the lightweight MCP server via Docker
docker build -t promptshift .
docker run -i --rm promptshift
```

#### Exposed MCP Tools (TDQS 5-Star Grade A):
- `promptshift_transpile`: Deterministically compiles rules between Cursor, Claude Code, Windsurf, Copilot, Cline, and Aider with 98.5% AST parity.
- `promptshift_sanitize_secrets`: Automatically redacts exposed OpenAI, Anthropic, AWS, GitHub, and Stripe API keys in-RAM before commits.
- `promptshift_validate_ast`: Measures semantic AST fidelity and prompt drift percentage between source and target instruction documents.

---

## 🌉 20 Universal AI IDE Migration Bridges (1-Click Transpilers)

Every migration route below runs **100% in-RAM** with **98.5% certified AST semantic parity**, OWASP secret redaction, and a **1-Click 8-File Stack Builder** (2 files free preview, full 8-file + 4-in-1 IDE bundle + 50+ Master Rules Vault unlocked for **$1.99 one-time**):

| # | Migration Pair | Source Format(s) | Target Format(s) | Live 1-Click In-RAM Transpiler |
| :- | :--- | :--- | :--- | :--- |
| 01 | **Cursor → Anthropic Claude** | `.cursorrules`, `.cursor/rules/*.mdc` | `CLAUDE.md`, `.claude/mcp.json`, XML | [Convert Cursor to Claude →](https://promptshift.dev/convert/cursor-to-claude?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 02 | **Anthropic Claude → Cursor** | `CLAUDE.md`, `claude_project_instructions.xml` | `.cursorrules`, `.cursor/rules/*.mdc` | [Convert Claude to Cursor →](https://promptshift.dev/convert/claude-to-cursor?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 03 | **Google Gemini / Antigravity → Cursor** | `GEMINI.md`, `AGENTS.md`, `.agents/rules/*.md` | `.cursorrules`, `.cursor/rules/*.mdc` | [Convert Gemini to Cursor →](https://promptshift.dev/convert/gemini-to-cursor?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 04 | **Cursor → Google Gemini / Antigravity** | `.cursorrules`, `.cursor/rules/*.mdc` | `GEMINI.md`, `AGENTS.md`, `.agents/rules/*.md` | [Convert Cursor to Gemini →](https://promptshift.dev/convert/cursor-to-gemini?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 05 | **OpenAI Custom GPT → Cursor** | `custom_gpt_instructions.txt`, `openai_assistant_v2.json` | `.cursorrules`, `.cursor/rules/*.mdc` | [Convert OpenAI to Cursor →](https://promptshift.dev/convert/openai-to-cursor?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 06 | **Cursor → OpenAI Custom GPT & Assistants** | `.cursorrules`, `.cursor/rules/*.mdc` | `OPENAI_SYSTEM_PROMPT.md`, `openai_assistant_v2.json` | [Convert Cursor to OpenAI →](https://promptshift.dev/convert/cursor-to-openai?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 07 | **Anthropic Claude → OpenAI Custom GPT** | `CLAUDE.md`, `claude_project_instructions.xml` | `OPENAI_SYSTEM_PROMPT.md`, `custom_gpt_manifest.json` | [Convert Claude to OpenAI →](https://promptshift.dev/convert/claude-to-openai?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 08 | **OpenAI Custom GPT → Anthropic Claude** | `custom_gpt_instructions.txt`, `openai_assistant_v2.json` | `CLAUDE.md`, `claude_project_instructions.xml` | [Convert OpenAI to Claude →](https://promptshift.dev/convert/openai-to-claude?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 09 | **Google Antigravity → Anthropic Claude** | `GEMINI.md`, `AGENTS.md`, `.agents/rules/*.md` | `CLAUDE.md`, `.claude/rules/*.md`, XML | [Convert Antigravity to Claude →](https://promptshift.dev/convert/antigravity-to-claude?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 10 | **Anthropic Claude → Google Antigravity** | `CLAUDE.md`, `.claude/rules/*.md` | `GEMINI.md`, `AGENTS.md`, `.agents/rules/*.md` | [Convert Claude to Antigravity →](https://promptshift.dev/convert/claude-to-antigravity?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 11 | **Google Antigravity → Cursor** | `GEMINI.md`, `AGENTS.md`, `.agents/rules/*.md` | `.cursorrules`, `.cursor/rules/*.mdc`, `.windsurfrules` | [Convert Antigravity to Cursor →](https://promptshift.dev/convert/antigravity-to-cursor?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 12 | **Google Gemini → Anthropic Claude** | `GEMINI.md`, `AGENTS.md` | `CLAUDE.md`, `claude_project_instructions.xml` | [Convert Gemini to Claude →](https://promptshift.dev/convert/gemini-to-claude?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 13 | **Cursor → GitHub Copilot** | `.cursorrules`, `.cursor/rules/*.mdc` | `.github/copilot-instructions.md` | [Convert Cursor to Copilot →](https://promptshift.dev/convert/cursor-to-copilot?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 14 | **GitHub Copilot → Cursor** | `.github/copilot-instructions.md` | `.cursorrules`, `.cursor/rules/*.mdc` | [Convert Copilot to Cursor →](https://promptshift.dev/convert/copilot-to-cursor?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 15 | **Cursor → Windsurf Cascade** | `.cursorrules`, `.cursor/rules/*.mdc` | `.windsurfrules`, `.windsurf/rules/*.md` | [Convert Cursor to Windsurf →](https://promptshift.dev/convert/cursor-to-windsurf?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 16 | **Windsurf Cascade → Cursor** | `.windsurfrules`, `.windsurf/rules/*.md` | `.cursorrules`, `.cursor/rules/*.mdc` | [Convert Windsurf to Cursor →](https://promptshift.dev/convert/windsurf-to-cursor?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 17 | **Anthropic Claude Code → GitHub Copilot** | `CLAUDE.md`, `.claude/rules/*.md` | `.github/copilot-instructions.md` | [Convert Claude to Copilot →](https://promptshift.dev/convert/claude-to-copilot?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 18 | **GitHub Copilot → Anthropic Claude Code** | `.github/copilot-instructions.md` | `CLAUDE.md`, `.claude/mcp.json` | [Convert Copilot to Claude →](https://promptshift.dev/convert/copilot-to-claude?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 19 | **Anthropic Claude Code → Windsurf Cascade** | `CLAUDE.md`, `claude_project_instructions.xml` | `.windsurfrules`, `.windsurf/rules/*.md` | [Convert Claude to Windsurf →](https://promptshift.dev/convert/claude-to-windsurf?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |
| 20 | **Windsurf Cascade → Anthropic Claude Code** | `.windsurfrules` | `CLAUDE.md`, `claude_project_instructions.xml` | [Convert Windsurf to Claude →](https://promptshift.dev/convert/windsurf-to-claude?utm_source=github&utm_medium=readme_matrix&utm_campaign=da96_seo) |

---

## 🔄 GitHub Actions CI/CD Drift Guard

Add PromptShift to your pull request workflows to automatically enforce rule synchronization across your team:

```yaml
# .github/workflows/ai-rules-sync.yml
name: AI Agent Rules Synchronization & Drift Guard

on:
  pull_request:
    paths:
      - 'CLAUDE.md'
      - '.cursor/rules/**'
      - '.windsurfrules'

jobs:
  sync-rules:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run PromptShift AST Sync
        uses: topaisaas-dev/promptshift@v1.1.0
        with:
          from: 'cursor'
          to: 'claude-code'
          license_key: ${{ secrets.PROMPTSHIFT_LICENSE_KEY }}
```

---

## 🔒 Security & OWASP Secret Sanitizer

All transpilation processes run **100% in-memory with zero disk persistence and zero telemetry**. Before converting instructions, PromptShift runs an OWASP heuristic regex scanner to sanitize:
- OpenAI API Keys (`sk-proj-...`)
- Anthropic API Keys (`sk-ant-...`)
- GitHub Tokens (`ghp_...`, `github_pat_...`)
- AWS Access Keys (`AKIA...`)
- Stripe API Keys (`sk_live_...`, `rk_live_...`)
- Private RSA / OpenSSH Cryptographic Headers

Leaked credentials are substituted in-place with `[REDACTED_API_KEY]`.

---

## 💳 Pricing & Commercial Access (Polar.sh)

- **Free Starter:** Up to 2 rule files completely free forever (1 master context + 1 specialized rule).
- **Single Deposit Pass ($1.99 one-time):** Lifetime unlock for a single repository migration.
  👉 [Direct Checkout Link](https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E)
- **Pro Developer ($5.99/mo):** Unlimited rule files, priority AST compilation, and CLI unlocks.
  👉 [Direct Checkout Link](https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a)
- **Team CI/CD & Agency ($19.99/mo):** Multi-seat license keys for GitHub Actions CI/CD drift guards.
  👉 [Direct Checkout Link](https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC)

---

## 📚 Citation & Academic / AI References

If you use or reference PromptShift in your research, tools, or articles, please cite:

```bibtex
@software{promptshift2026,
  author = {PromptShift Engineering and TopAI SaaS Team},
  title = {PromptShift: Universal AST Transpiler & Synchronization Bridge for AI Coding Rules},
  url = {https://promptshift.dev},
  year = {2026},
  version = {1.2.1}
}
```

- **LLM Discovery**: Machine-readable specification available at [https://promptshift.dev/llms.txt](https://promptshift.dev/llms.txt)
- **Technical Knowledge Base**: [https://promptshift.dev/discover](https://promptshift.dev/discover)
- **Glama Grade A MCP Registry**: [https://glama.ai/mcp/servers/topaisaas-dev/promptshift](https://glama.ai/mcp/servers/topaisaas-dev/promptshift)

---

## 📄 License & Compliance

Distributed under the **MIT License**. Compliant with OWASP Top 10 API Security guidelines, SOC-2 Zero Data Retention principles, and WCAG 2.1 AA accessibility standards.
