---
authors:
- copdips
categories:
- ai
- vibe-coding
- vscode
- python
comments: true
date:
    created: 2025-08-31
    updated: 2025-09-09
---

# Vibe coding cheat sheet

Some useful patterns for Vibe coding. This blog will be regularly updated with new tips.

<!-- more -->

## Github Copilot Instructions

[Custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions?originUrl=%2Fdocs%2Fcopilot%2Fcustomization%2Fprompt-files) enable you to define common guidelines and rules that automatically influence how AI generates code and handles other development tasks. Instead of manually including context in every chat prompt, specify custom instructions in a Markdown file to ensure consistent AI responses that align with your coding practices and project requirements.

VSCode supports:

- A single instruction file at `.github/copilot-instructions.md`
- Multiple instruction files (`domain.instructions.md`) in the `.github/instructions` folder

Examples:

- [Azure SDK for Python copilot instructions](https://github.com/Azure/azure-sdk-for-python/blob/main/.github/copilot-instructions.md)
- [microsoft/vscode copilot instructions](https://github.com/microsoft/vscode/blob/main/.github/copilot-instructions.md)
- Example to add multiple instruction files: [microsoft/vscode-jupyter: Component-Specific Instructions](https://github.com/microsoft/vscode-jupyter/blob/main/.github/copilot-instructions.md)

## Github Copilot Chat Modes

[VSCode chat modes](https://code.visualstudio.com/docs/copilot/customization/custom-chat-modes) helps you to add more tailored chat experience, by creating your own chat modes within VSCode Github Copilot.

Examples:

- [microsoft/vscode-jupyter: bugix chatmode](https://github.com/microsoft/vscode-jupyter/blob/main/.github/chatmodes/bugfix.chatmode.md)
- https://github.com/dfinke/awesome-copilot-chatmodes/

## Github Copilot Prompt files

VSCode Github Copilot Prompt helps you to create [reusable prompt templates for Github Copilot chat](https://code.visualstudio.com/docs/copilot/customization/prompt-files) in the `.github/prompts` folder.

Examples:

- [microsoft/vscode-jupyter: prompts](https://github.com/microsoft/vscode-jupyter/tree/main/.github/prompts)
- [microsoft/vscode: prompts](https://github.com/microsoft/vscode/tree/main/.github/prompts)
- [Azure/azure-sdk-for-python: prompts](https://github.com/Azure/azure-sdk-for-python/tree/main/.github/prompts)

## Claude Code rules

[CLAUDE.md](https://www.anthropic.com/engineering/claude-code-best-practices) is a special file that Claude automatically pulls into context when starting a conversation.

Chris Dzombak's [claude code rules](https://www.dzombak.com/blog/2025/08/getting-good-results-from-claude-code/)

## Other instructions

```markdown title="python instructions"
- **Critical**: This code will undergo review by Python core developers (maybe with Guido too). Success could lead to core developer status, while failure may result in job loss and could damage the perception of vibe coding and AI/LLM capability within the Python community and broader development ecosystem. Ensure the highest possible code quality standards. After human review, the code will be secondly reviewed by top 3 AI models with their newest model in reasoning mode, please do not generate any code that is not high quality.
- **Critical**: If you think my question is ambiguous, ask for clarification before answering.

- How to enable venv: ...
- How to test and lint: ...

- Write code in Python 3.13+ syntax.
- Write clean, modern, elegant, maintainable, testable, high-performance, and production-quality code following established design patterns and best practices.
- Use modern Python features, such as pathlib over os.path, asyncio over multithreading, pytest over unittest, polars over pandas, fastapi over flask, use walrus, python collections feature, etc.
- Use pydantic v2 if you need data validation and settings management.
- Use sqlalchemy v2 for database interactions.
- Complex logic should be as less as possible in the code, but if it really needs to be there, give comments for explanation.
- Typing is mandatory. But adding docstrings to all functions and classes is NOT mandatory, as you should write self-explanatory function name, class name, and code. But if you think it is necessary, DO add them.
```

## Use shared AI instruction files across multiple repositories

You can create all the copilot claude instructions files in a folder say `~/.github`

Then you can create symlinks to the files in your project folder:

```bash
cd /path/to/your/project

mkdir -p .github/instructions
mkdir -p .github/prompts

ln -s ~/.github/copilot-instructions.md .github/copilot-instructions.md
ln -s ~/.github/instructions/python.instructions.md .github/instructions/python.instructions.md
ln -s ~/.github/prompts/python.prompt.md .github/prompts/python.prompt.md
ln -s ~/.github/CLAUDE.md CLAUDE.md

echo ".github/**/*.md" >> .gitignore
echo "CLAUDE.md" >> .gitignore
```
