# PromptShift — High-Authority Directory & Backlink Submission Kit

This document contains pre-filled, copy-paste submission forms and GitHub Pull Request templates to immediately generate high-authority backlinks (DoFollow), feed AI search crawlers (Perplexity, SearchGPT), and escape the Google Sandbox.

---

## 1. Cursor.directory (Primary Distribution for Cursor Devs)
- **Target URL**: https://cursor.directory / https://github.com/pontusab/cursor.directory
- **Submission Type**: Tool / Rule Transpiler Submission
- **Title**: PromptShift — 1-Click Universal AI Project Transpiler
- **URL**: https://promptshift.dev
- **Tagline**: Shift rules and instructions between Cursor (.mdc/.cursorrules), Claude Projects, and OpenAI
- **Category**: Developer Tools / Rules Converter
- **CLI Command**: `npx promptshift --to=cursor`
- **Markdown Listing Snippet**:
```markdown
- [PromptShift](https://promptshift.dev) - In-browser RAM transpiler between Cursor rules (.mdc/.cursorrules), Claude Projects, and Gemini with certified 98.5% AST parity and in-RAM secret sanitization. Supports CLI: `npx promptshift`.
```

---

## 2. GitHub Awesome Repositories (Instant DoFollow Backlinks & Indexing)

### A. `awesome-cursorrules` (PatrickJS / GitHub)
- **Repo URL**: https://github.com/PatrickJS/awesome-cursorrules
- **Action**: Submit Pull Request editing `README.md` under `Tools & Utilities`:
```markdown
- [PromptShift](https://promptshift.dev) - Instant 1-click bridge to convert `.cursorrules` and `.cursor/rules/*.mdc` to Claude Projects (`CLAUDE.md`) or Gemini workspaces with 98.5% AST parity. Zero server logs, in-RAM secret sanitizer. CLI: `npx promptshift`.
```

### B. `awesome-claude` / `awesome-claude-prompts`
- **Action**: Submit Pull Request editing `README.md` under `Converters & Migration`:
```markdown
- [PromptShift](https://promptshift.dev) - Sovereign in-RAM transpiler to migrate Cursor, OpenAI Custom GPT, and Gemini workspaces into Claude Projects and `CLAUDE.md` instructions.
```

---

## 3. Top AI Directories (Fast Approval Forms)

### A. There's An AI For That (TAAFT)
- **Submit URL**: https://theresanaiforthat.com/submit/
- **Tool Name**: PromptShift
- **Website URL**: https://promptshift.dev
- **Short Pitch**: Shift AI coding projects between Claude, Cursor, OpenAI & Gemini in 1 click.
- **Detailed Description**:
PromptShift is a sovereign developer tool designed to eliminate prompt drift and fragmentation across AI coding assistants. It translates master prompts, instruction files, and workspace rules between Cursor (.cursorrules / .mdc), Anthropic Claude Projects (CLAUDE.md), OpenAI Custom GPTs, and Google Gemini / Antigravity in one click. Features 100% in-RAM execution, zero persistent server storage, an automated secret sanitizer, and a zero-install CLI (`npx promptshift`).
- **Pricing**: Freemium (Free Starter up to 2 files; $1.99 Single Pass; $5.99/mo Pro Developer)
- **Tags**: Developer Tools, Coding Assistants, AI Rules, Prompt Engineering, Productivity

### B. Futurepedia
- **Submit URL**: https://www.futurepedia.io/submit-tool
- **Tool Name**: PromptShift
- **Website URL**: https://promptshift.dev
- **Pricing Model**: Freemium ($0 / $1.99 / $5.99)
- **Key Features**:
  1. 1-click cross-ecosystem transpiler (Claude, Cursor, OpenAI, Gemini)
  2. 100% In-RAM zero retention & active secret sanitizer
  3. Standalone CLI: `npx promptshift`
  4. Certified 98.5% AST semantic parity

### C. Toolify.ai
- **Submit URL**: https://www.toolify.ai/submit
- **Tool Name**: PromptShift
- **Category**: Code & Dev
- **Target URL**: https://promptshift.dev

---

## 4. Targeted Community Answers (Reddit / Discord / StackOverflow)
*Use these helpful, non-promotional responses when developers ask how to reuse their rules across tools:*

### Example: r/Cursor or r/ClaudeAI ("Can I use my .cursorrules in Claude Code?")
> Yes, you can port them directly. While Cursor uses `.cursorrules` or `.cursor/rules/*.mdc` with globs, Claude Code expects `CLAUDE.md` with markdown directives, and Claude Web Projects prefer structured XML (`<project_context><instructions>...</instructions></project_context>`).
> 
> If you don't want to rewrite your directives by hand, you can run `npx promptshift --to=claude` in your repository or drop your files on https://promptshift.dev. It runs 100% in-memory (zero server retention) and maps your Cursor rules into clean Claude markdown and XML with MCP configuration.
