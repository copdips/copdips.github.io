#!/usr/bin/env python3
"""
Reload the Chrome browser page for local development.
This script triggers a page reload after assets (CSS/JS) are updated.
"""
import json
import sys
import urllib.request
import urllib.error

def find_chrome_page():
    """Find the Chrome DevTools debugging port and page."""
    try:
        # Try common Chrome debugging ports
        for port in [9222, 9223, 9224]:
            try:
                url = f"http://localhost:{port}/json/list"
                with urllib.request.urlopen(url, timeout=2) as response:
                    pages = json.loads(response.read().decode())
                    # Find localhost:8000 page (MkDocs server)
                    for page in pages:
                        if "localhost:8000" in page.get("url", ""):
                            return page["webSocketDebuggerUrl"], port
            except (urllib.error.URLError, ConnectionRefusedError):
                continue
        return None, None
    except Exception as e:
        print(f"✗ Error finding Chrome page: {e}", file=sys.stderr)
        return None, None

def reload_chrome_page():
    """
    Trigger a page reload using Chrome DevTools Protocol.
    """
    ws_url, port = find_chrome_page()

    if not ws_url:
        print("⚠ Could not find Chrome debugging page on localhost:8000", file=sys.stderr)
        print("  Tip: Open Chrome with --remote-debugging-port=9222", file=sys.stderr)
        print("  Or manually reload the browser page", file=sys.stderr)
        return 0  # Don't fail the make command

    try:
        # Use websocket to send reload command
        import websocket
        ws = websocket.create_connection(ws_url, timeout=5)
        ws.send(json.dumps({
            "id": 1,
            "method": "Page.reload",
            "params": {"ignoreCache": True}
        }))
        ws.recv()
        ws.close()
        print(f"✓ Chrome page reloaded successfully (port {port})")
        return 0
    except ImportError:
        print("⚠ websocket-client not installed, skipping auto-reload", file=sys.stderr)
        print("  Run: pip install websocket-client", file=sys.stderr)
        print("  Or manually reload the browser page", file=sys.stderr)
        return 0  # Don't fail the make command
    except Exception as e:
        print(f"⚠ Could not reload Chrome page: {e}", file=sys.stderr)
        print("  Manually reload the browser page", file=sys.stderr)
        return 0  # Don't fail the make command

if __name__ == "__main__":
    print("📦 Assets copied successfully")
    sys.exit(reload_chrome_page())
