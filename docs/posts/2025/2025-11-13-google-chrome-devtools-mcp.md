---
authors:
- copdips
categories:
- ai-coding
- vscode
- mcp
- frontend
- debug
comments: true
date:
    created: 2025-11-13
---

# Google Chrome DevTools MCP

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp?tab=readme-ov-file#chrome-devtools-mcp) (Model Context Protocol) allows you to interact with Google Chrome programmatically through AI coding agents like Claude Code, Copilot, Codex, etc. This enables automated testing, debugging, and inspection of web applications directly from the command line.

<!-- more -->

## Option 1 - Use Chrome installed on Windows

### Start Chrome in debug mode in Windows machine

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-address=0.0.0.0 `
  --remote-debugging-port=9222 `
  --user-data-dir=c:/temp/chrome-debug-profile `
  --no-first-run `
  --no-default-browser-check `
  --disable-extensions

# check if Chrome is listening on port 9222
netstat -an | findstr "9222"

curl http://localhost:9222/json/version
```

### Set reverse port forwarding from WSL to Windows

Open an elevated admin Powershell:

1. Identify the WSL interface IP address:

    ```powershell
    # https://github.com/ChromeDevTools/chrome-devtools-mcp/issues/131#issuecomment-3447890859

    Get-NetIPAddress -AddressFamily IPv4 `
        | Where-Object {  $_.InterfaceAlias -like "vEthernet (WSL*)" } `
        | Select-Object IPAddress


      # or from `ipconfig` then search for WSL part
    ```

2. Set up port forwarding from Windows port 9222 to WSL port 9223:

    ```powershell
    netsh interface portproxy add v4tov4 `
        listenaddress=<WSL_IP_ADDRESS> `
        listenport=9223 `
        connectaddress=127.0.0.1 `
        connectport=9222
    ```

3. Verify the port proxy is set up:

    ```powershell
    netsh interface portproxy show all
    ```

4. Open firewall for port 9223:

    ```powershell
    New-NetFirewallRule -DisplayName "WSL Chrome DevTools Debug proxy" `
        -Direction Inbound `
        -LocalPort 9223 `
        -Protocol TCP `
        -Action Allow
    ```

### Setup Chrome DevTools MCP in WSL/Linux

1. Node.js v22+ and npm installed
2. Verify the port forwarding is working by running:

    ```bash
    curl http://<WSL_IP_ADDRESS>:9223/json/version
    ```

    !!! note "Get WSL IP Address"
        Check [set-reverse-port-forwarding-from-wsl-to-windows](#set-reverse-port-forwarding-from-wsl-to-windows) for how to get `<WSL_IP_ADDRESS>`.

3. Use `http://<WSL_IP_ADDRESS>:9223` as the Chrome DevTools endpoint in WSL/Linux.

    ```json title="file ~/.claude.json"
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--browserUrl",
        "http://<WSL_IP_ADDRESS>:9223"
      ],
      "env": {}
    }
    ```

### Use Chrome DevTools MCP Server with Claude Code

The MCP server is already installed if you're using Claude Code. Verify it:

```bash
claude mcp list

# You should see (172.27.0.1 is my WSL host IP):
# chrome-devtools: npx -y chrome-devtools-mcp@latest --browserUrl http://172.27.0.1:9223 - ✓ Connected
```

If not, you can add it:

```bash
# use default stdio MCP transport
claude mcp add chrome-devtools --
  npx \
  -y \
  chrome-devtools-mcp@latest \
  --browserUrl http://<WSL_IP_ADDRESS>:9223
```

There're [three types of MCP transports](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports):

```bash
$ claude --version
2.0.27 (Claude Code)

$ claude mcp add -h | grep transport
  claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
  claude mcp add --transport sse asana https://mcp.asana.com/sse
  claude mcp add --transport stdio airtable --env AIRTABLE_API_KEY=YOUR_KEY -- npx -y airtable-mcp-server
  -t, --transport <transport>  Transport type (stdio, sse, http). Defaults to stdio if not specified.
```

1. **stdio**: The default Claude to MCP is using `stdio` MCP transport. Which is for our use case, as From Claude's perspective, it just spawns a local `npx` command inside WSL as a subprocess and communicates through stdin/stdout. The MCP itself then uses HTTP to talk to remote Chrome started in Windows, but that's internal to the MCP, not part of the MCP transport type.
2. **http**: Claude talks to a remote MCP over HTTP endpoints, you give it a base URL. The server must implement MCP protocol over plain HTTP requests.
3. **sse** (Server-Sent Events): Claude opens a long-lived SSE channel to a remote MCP (useful for push events, live updates, or long-running tasks). Often used by cloud MCPs (e.g. `claude-mcp-github`, `claude-mcp-google`).

!!! note "In newer MCP spec, `https` and `sse` transports has been unified into `Streamable HTTP`"

## Option 2 - Use Chrome installed by apt in WSL

### Install Google Chrome in WSL

<https://learn.microsoft.com/en-us/windows/wsl/tutorials/gui-apps#install-google-chrome-for-linux>

```bash
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

sudo apt update

sudo apt install google-chrome-stable

google-chrome --version

# Expected output:
Google Chrome 141.0.7390.122
```

### Start Chrome in WSL with Remote Debugging

Chrome must be started with special flags to enable remote debugging:

```bash
# Create a directory for Chrome debug profile
mkdir -p /tmp/chrome-debug-profile

# Start Chrome with remote debugging enabled
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  --no-sandbox \
  > /tmp/chrome.log 2>&1 &
```

**Important flags explained:**

- `--remote-debugging-port=9222` - Enables Chrome DevTools Protocol on port 9222
- `--user-data-dir=/tmp/chrome-debug-profile` - Required for remote debugging; uses separate profile
- `--no-sandbox` - Needed in WSL environment (Chrome can't use sandboxing in WSL)
- `> /tmp/chrome.log 2>&1 &` - Runs in background and logs output

### Configure Chrome DevTools MCP

```json title="file ~/.claude.json"
"chrome-devtools": {
  "command": "npx",
  "args": [
    "-y",
    "chrome-devtools-mcp@latest",
    "--browserUrl",
    "http://localhost:9222"
  ],
  "env": {}
}
```

### Verify Chrome Debugging is Working

Check that Chrome is listening on port 9222:

```bash
ss -tuln | grep 9222
```

Test the debugging API:

```bash
# Get Chrome version
curl -s http://localhost:9222/json/version

# List all pages
curl -s http://localhost:9222/json/list
```

### Test MCP Connection

List open pages:

```bash
# In Claude Code, this tool will be available
mcp__chrome-devtools__list_pages
```

### Troubleshooting

#### Stopping Chrome

```bash
# Kill Chrome processes
pkill -f 'chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile --no-sandbox'

# Or kill specific PID
ps faux | grep 'chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile --no-sandbox'
kill <PID>
```

#### Check Chrome logs

```bash
tail -f /tmp/chrome.log
```

## Option 3 - Use Chromium installed by npx puppeteer/browsers in WSL

Ref: https://github.com/ChromeDevTools/chrome-devtools-mcp/issues/281#issuecomment-3417556091

### Install Chromium using Puppeteer Browsers

```bash
npx -y @puppeteer/browsers install chrome@stable --path ~/chrome

# note the chrome installation path or use find ~/chrome -name chrome -type f
```

### Configure Chrome DevTools MCP for option 3

```json title="file ~/.claude.json"
"chrome-devtools": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "chrome-devtools-mcp@latest",
    "--executablePath",
    "{chrome path from above, or use find ~/chrome -name chrome -type f to find the path}",
    "--no-sandbox",
    "--disable-setuid-sandbox"
  ],
  "env": {}
}
```

### Test MCP Connection for option 3

Don't need to start Chrome separately, MCP will launch it.
