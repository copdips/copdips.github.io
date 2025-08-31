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
---

# Vibe coding cheat sheet

Some useful patterns for Vibe coding. This blog will be regularly updated with new tips and tricks.

<!-- more -->

## Github Copilot instructions

[Azure SDK for Python copilot instructions](https://github.com/Azure/azure-sdk-for-python/blob/main/.github/copilot-instructions.md)

## Claude Code rules

Chris Dzombak's [claude code rules](https://www.dzombak.com/blog/2025/08/getting-good-results-from-claude-code/)

## Other instructions

```markdown title="python instructions"
- **Critical**: This code will undergo review by Python core developers. Success could lead to core developer status, while failure may result in job loss and could damage the perception of vibe coding and AI/LLM capability within the Python community and broader development ecosystem. Ensure the highest possible code quality standards.

- How to enable venv: ...
- How to test and lint: ...

- Write code in Python 3.13+ syntax.
- Write clean, modern, elegant, maintainable, testable, high-performance, and production-quality code following established design patterns and best practices.
- Use modern Python features, such as pathlib over os.path, asyncio over multithreading, pytest over unittest, polars over pandas, fastapi over flask, etc.
- Use pydantic v2 if you need data validation and settings management.
- Use sqlalchemy v2 for database interactions.
- Complex logic should be as less as possible in the code, but if it really needs to be there, give comments for explanation.
```
