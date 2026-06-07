---
authors:
- copdips
categories:
- ollama
- ai
comments: true
date:
  created: 2025-03-07
  updated: 2026-06-10
---

# Installing Ollama without root

Inspired by [the official guide](https://github.com/ollama/ollama/blob/main/docs/linux.md#manual-install), here is my method for installing (or updating) Ollama without root access.

!!! note "Ollama Archive Format Change: .tar.zst Requires zstd"
    Previously, Ollama provided archives in `.tar.gz` format, but now only `.tar.zst` is available, which requires [zstd](https://github.com/facebook/zstd).

    Therefore, if we don't have root access, we need to prepare the `zstd` binary in a user-local directory beforehand and add it to `$PATH`.

```bash
mkdir -p ~/src
cd ~/src
curl -L https://ollama.com/download/ollama-linux-amd64.tar.zst -o ollama-linux-amd64.tar.zst
mkdir -p ~/opt/ollama

# With zstd **binary** available in $PATH,
# modern tar can automatically detect and use it to decompress .tar.zst archives.
tar -C ~/opt/ollama -xf ollama-linux-amd64.tar.zst
```

Add Ollama to $PATH:

```bash
echo 'export PATH=$PATH:~/opt/ollama' >> ~/.bashrc
. ~/.bashrc
```

Then you can run `ollama` in your terminal:

```bash
nohup ollama serve &

ollama -v
ollama list

# Pull the embeddings model for AnythingLLM RAG
ollama pull nomic-embed-text

# Run the smallest deepseek model
ollama run deepseek-r1:5b
```

To stop the Ollama server:

```bash
killall ollama

# or
killall -u $USER ollama
```
