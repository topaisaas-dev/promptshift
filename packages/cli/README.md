# promptshift

> **Deterministic AST transpiler & STDIO MCP Server for AI Coding Agents (Cursor, Claude Code, Windsurf, Copilot, Cline, Roo Code, Aider).**

[![Version](https://img.shields.io/npm/v/promptshift.svg)](https://www.npmjs.com/package/promptshift)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Parity](https://img.shields.io/badge/AST%20Parity-98.5%25-cyan.svg)](https://promptshift.dev)

🌐 **Official Web App:** [https://promptshift.dev](https://promptshift.dev)  
📚 **Documentation:** [https://promptshift.dev/cli](https://promptshift.dev/cli)

---

## ⚡ Features
- **Deterministic Multi-Agent Transpilation**: Convert between Cursor (`.mdc`, `.cursorrules`), Claude Code (`CLAUDE.md`), Windsurf (`.windsurfrules`), GitHub Copilot, Cline, and Aider.
- **OWASP Secret Sanitizer**: In-RAM regex engine redacting OpenAI, Anthropic, AWS, GitHub, and Stripe API keys before saving.
- **Native STDIO Model Context Protocol (MCP)**: Run `npx promptshift --mcp` to register as a local MCP server for Claude Desktop, Cursor, Smithery.ai, and Glama.ai.
- **Zero Data Retention**: 100% local in-RAM processing. Zero cloud telemetry.

---

## 🚀 Installation & Usage

### 1. NPX CLI Usage
```bash
# Transpile from Claude Code to Cursor
npx promptshift --from=claude-code --to=cursor

# Preview without writing to disk
npx promptshift --from=cursor --to=claude-code --dry-run

# Transpile Windsurf rules to Copilot
npx promptshift --from=windsurf --to=copilot --dir=.
```

### 2. Model Context Protocol (MCP) Mode
```bash
npx promptshift --mcp
```

Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "promptshift": {
      "command": "npx",
      "args": ["promptshift", "--mcp"]
    }
  }
}
```

---

## 🌉 20 Universal AI IDE Migration Bridges (1-Click Transpilers)

| Migration Pair | Live 1-Click In-RAM Studio |
| :--- | :--- |
| **Cursor → Anthropic Claude** | [promptshift.dev/convert/cursor-to-claude](https://promptshift.dev/convert/cursor-to-claude?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Anthropic Claude → Cursor** | [promptshift.dev/convert/claude-to-cursor](https://promptshift.dev/convert/claude-to-cursor?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Google Gemini / Antigravity → Cursor** | [promptshift.dev/convert/gemini-to-cursor](https://promptshift.dev/convert/gemini-to-cursor?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Cursor → Google Gemini / Antigravity** | [promptshift.dev/convert/cursor-to-gemini](https://promptshift.dev/convert/cursor-to-gemini?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **OpenAI Custom GPT → Cursor** | [promptshift.dev/convert/openai-to-cursor](https://promptshift.dev/convert/openai-to-cursor?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Cursor → OpenAI Custom GPT** | [promptshift.dev/convert/cursor-to-openai](https://promptshift.dev/convert/cursor-to-openai?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Anthropic Claude → OpenAI Custom GPT** | [promptshift.dev/convert/claude-to-openai](https://promptshift.dev/convert/claude-to-openai?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **OpenAI Custom GPT → Anthropic Claude** | [promptshift.dev/convert/openai-to-claude](https://promptshift.dev/convert/openai-to-claude?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Google Antigravity → Anthropic Claude** | [promptshift.dev/convert/antigravity-to-claude](https://promptshift.dev/convert/antigravity-to-claude?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Anthropic Claude → Google Antigravity** | [promptshift.dev/convert/claude-to-antigravity](https://promptshift.dev/convert/claude-to-antigravity?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Google Antigravity → Cursor** | [promptshift.dev/convert/antigravity-to-cursor](https://promptshift.dev/convert/antigravity-to-cursor?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Google Gemini → Anthropic Claude** | [promptshift.dev/convert/gemini-to-claude](https://promptshift.dev/convert/gemini-to-claude?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Cursor → GitHub Copilot** | [promptshift.dev/convert/cursor-to-copilot](https://promptshift.dev/convert/cursor-to-copilot?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **GitHub Copilot → Cursor** | [promptshift.dev/convert/copilot-to-cursor](https://promptshift.dev/convert/copilot-to-cursor?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Cursor → Windsurf Cascade** | [promptshift.dev/convert/cursor-to-windsurf](https://promptshift.dev/convert/cursor-to-windsurf?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Windsurf Cascade → Cursor** | [promptshift.dev/convert/windsurf-to-cursor](https://promptshift.dev/convert/windsurf-to-cursor?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Anthropic Claude Code → GitHub Copilot** | [promptshift.dev/convert/claude-to-copilot](https://promptshift.dev/convert/claude-to-copilot?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **GitHub Copilot → Anthropic Claude Code** | [promptshift.dev/convert/copilot-to-claude](https://promptshift.dev/convert/copilot-to-claude?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Anthropic Claude Code → Windsurf Cascade** | [promptshift.dev/convert/claude-to-windsurf](https://promptshift.dev/convert/claude-to-windsurf?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |
| **Windsurf Cascade → Anthropic Claude Code** | [promptshift.dev/convert/windsurf-to-claude](https://promptshift.dev/convert/windsurf-to-claude?utm_source=npmjs&utm_medium=readme_matrix&utm_campaign=da93_seo) |

---

## 💳 Commercial Access & Quotas
- **Free Starter**: Up to 2 rule files completely free forever.
- **Single Deposit Pass ($1.99 one-time)**: [Instant Checkout](https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E)
- **Pro Developer ($5.99/mo)**: [Instant Checkout](https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a)
- **Team CI/CD ($19.99/mo)**: [Instant Checkout](https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC)

Unlock via CLI:
```bash
npx promptshift --to=cursor --key=<YOUR_POLAR_ORDER_ID>
```

---

## 📄 License
MIT © PromptShift Engineering Team
