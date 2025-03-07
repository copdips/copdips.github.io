---
authors:
- copdips
categories:
- ollama
- ai
comments: true
date:
  created: 2025-03-07
---

# Installing Ollama without root

Inspired by [the official guide](https://github.com/ollama/ollama/blob/main/docs/linux.md#manual-install), here is my method for installing (or updating) Ollama without root access.

```bash
mkdir -p ~/src
cd ~/src
curl -L https://ollama.com/download/ollama-linux-amd64.tgz -o ollama-linux-amd64.tgz
mkdir -p ~/opt/ollama
tar -C ~/opt/ollama -xzf ollama-linux-amd64.tgz
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
