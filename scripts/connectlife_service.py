"""Small HTTP service that fronts the ConnectLife cloud for the dashboard.

Hisense ACs have no local protocol: control goes out to ConnectLife's servers.
That API needs a Gigya login, an OAuth2 exchange and RSA-signed requests, so we
use the maintained Python library rather than reimplementing it in JavaScript.

It runs as a service rather than a per-request subprocess because authenticating
takes ~4 seconds; done once at startup, later calls are fast enough for a button
press. Node talks to it over plain HTTP on localhost (see lib/hisense.js):

    GET  /appliances          -> {"appliances": [...]}
    POST /set {"puid":..., "properties": {...}}

Credentials come from the environment, never from arguments or the URL.
Bind to 127.0.0.1 (the default): this endpoint is unauthenticated, and it holds
a logged-in session to your account.

    python scripts/connectlife_service.py            # serve
    python scripts/connectlife_service.py --once     # print appliances and exit
"""
import asyncio
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

from connectlife.api import ConnectLifeApi

HOST = os.environ.get("CONNECTLIFE_BIND", "127.0.0.1")
PORT = int(os.environ.get("CONNECTLIFE_PORT", "8787"))

# One event loop on a background thread owns the API session, so the HTTP
# handler threads never touch asyncio state directly.
_loop = asyncio.new_event_loop()
_api = None
_lock = threading.Lock()


def _run_loop():
    asyncio.set_event_loop(_loop)
    _loop.run_forever()


def _call(coro):
    return asyncio.run_coroutine_threadsafe(coro, _loop).result(timeout=30)


async def _connect():
    username = os.environ.get("CONNECTLIFE_USERNAME")
    password = os.environ.get("CONNECTLIFE_PASSWORD")
    if not username or not password:
        raise RuntimeError("CONNECTLIFE_USERNAME / CONNECTLIFE_PASSWORD are not set")
    api = ConnectLifeApi(username, password)
    await api.authenticate()
    return api


async def _api_get():
    global _api
    if _api is None:
        _api = await _connect()
    return _api


async def _appliances():
    api = await _api_get()
    return await api.get_appliances()


def _serialise(a):
    return {
        "puid": a.puid,
        "name": a.device_nickname or a.device_type_name,
        "room": getattr(a, "room_name", None),
        "type": a.device_type_code,
        # The unit reports offline_state=1 while plainly responding, so 1 is
        # taken as online. Undocumented, hence treated as a hint only.
        "online": getattr(a, "offline_state", 1) == 1,
        "status": a.status_list,
    }


async def _list():
    return {"appliances": [_serialise(a) for a in await _appliances()]}


async def _set(puid, properties):
    api = await _api_get()
    await api.update_appliance(puid, properties)
    # Report what the unit actually holds, not what was asked for.
    match = next((a for a in await api.get_appliances() if a.puid == puid), None)
    return {"puid": puid, "status": match.status_list if match else None}


# A stale session shows up as an exception on use; drop it and retry once.
def _with_retry(coro_factory):
    global _api
    try:
        return _call(coro_factory())
    except Exception:
        with _lock:
            _api = None
        return _call(coro_factory())


class Handler(BaseHTTPRequestHandler):
    def _reply(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.rstrip("/") not in ("/appliances", ""):
            return self._reply(404, {"error": "not found"})
        try:
            self._reply(200, _with_retry(lambda: _list()))
        except Exception as err:
            self._reply(502, {"error": f"{type(err).__name__}: {err}"})

    def do_POST(self):
        if self.path.rstrip("/") != "/set":
            return self._reply(404, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(length) or "{}")
            puid, props = body.get("puid"), body.get("properties") or {}
            if not puid or not props:
                return self._reply(400, {"error": "puid and properties are required"})
            self._reply(200, _with_retry(lambda: _set(puid, props)))
        except Exception as err:
            self._reply(502, {"error": f"{type(err).__name__}: {err}"})

    def log_message(self, *args):
        pass  # the dashboard's own log is enough


def main():
    threading.Thread(target=_run_loop, daemon=True).start()

    if "--once" in sys.argv:
        print(json.dumps(_call(_list()), indent=2))
        return

    # Authenticate at startup so the first button press is not the slow one.
    try:
        _call(_api_get())
        print(f"connectlife: authenticated, serving on {HOST}:{PORT}", flush=True)
    except Exception as err:
        print(f"connectlife: startup auth failed ({err}); will retry per request", flush=True)

    HTTPServer((HOST, PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
