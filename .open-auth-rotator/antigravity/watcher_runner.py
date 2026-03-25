#!/opt/homebrew/bin/python3
import sys
import json
import time
import signal
from collections import deque
from pathlib import Path

_shutdown_requested = False


def _signal_handler(signum, frame):
    global _shutdown_requested
    _shutdown_requested = True
    print(f"[SIGNAL] Received signal {signum}, shutting down gracefully...")
    sys.exit(0)


signal.signal(signal.SIGTERM, _signal_handler)
signal.signal(signal.SIGINT, _signal_handler)

sys.path.insert(0, "/Users/jeremy/.open-auth-rotator/antigravity")
from core.watcher import Watcher
from core.plugin_check import assert_plugin_installed
from core.main_ensure import _ensure_setup
from core.utils_log import log

_ROTATE_TIMEOUT = 300
_MAX_CONSECUTIVE_FAILS = 5  # FIXED: was 3 — more lenient before flood protection
_FAIL_COOLDOWN = 120  # FIXED: was 300 — 2min pause instead of 5min
_ADAPTIVE_WINDOW = 3600
_ADAPTIVE_MAX_ROTATIONS = (
    10  # FIXED: was 3 — rate limit hits every 2-4min, need many rotations/hour
)
_ADAPTIVE_COOLDOWN = 60  # FIXED: was 300 — 1min pause instead of 5min

_FAIL_STATE_PATH = (
    Path.home() / ".config" / "openAntigravity-auth-rotator" / "fail_state.json"
)
_fail_state = {"count": 0, "cooldown_until": 0}
_rotation_times: deque = deque()


def _load_fail_state() -> None:
    try:
        if _FAIL_STATE_PATH.exists():
            data = json.loads(_FAIL_STATE_PATH.read_text())
            _fail_state["count"] = int(data.get("count", 0))
            _fail_state["cooldown_until"] = float(data.get("cooldown_until", 0))
    except Exception:
        pass


def _save_fail_state() -> None:
    try:
        _FAIL_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        tmp = _FAIL_STATE_PATH.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(_fail_state, indent=2))
        tmp.replace(_FAIL_STATE_PATH)
    except Exception:
        pass


def _adaptive_cooldown_active(now: float) -> bool:
    while _rotation_times and now - _rotation_times[0] > _ADAPTIVE_WINDOW:
        _rotation_times.popleft()
    if len(_rotation_times) >= _ADAPTIVE_MAX_ROTATIONS:
        log(
            f"[rotate_callback] Adaptive cooldown: {_ADAPTIVE_MAX_ROTATIONS} rotations in {_ADAPTIVE_WINDOW}s — pausing {_ADAPTIVE_COOLDOWN}s",
            "WARN",
        )
        try:
            from core.utils_notify import notify

            notify(
                "Antigravity Rotator",
                f"Adaptive cooldown: {_ADAPTIVE_MAX_ROTATIONS}x in 1h — paused 5min",
            )
        except Exception:
            pass
        return True
    return False


def rotate_callback():
    import asyncio
    from core.main_rotate import rotate_account
    from core.login.login_chrome import close_debug_chrome
    from core.watcher_config import LOCK_FILE

    now = time.time()
    if now < _fail_state["cooldown_until"]:
        remaining = int(_fail_state["cooldown_until"] - now)
        log(
            f"[rotate_callback] Flood-protection active — {remaining}s remaining, skipping",
            "WARN",
        )
        return

    if _adaptive_cooldown_active(now):
        return

    async def _run_with_timeout():
        try:
            await asyncio.wait_for(rotate_account(), timeout=_ROTATE_TIMEOUT)
        except asyncio.TimeoutError:
            log(
                f"[rotate_callback] TIMEOUT after {_ROTATE_TIMEOUT}s — killing Chrome and aborting",
                "ERROR",
            )
            try:
                close_debug_chrome()
            except Exception:
                pass
            raise

    success = False
    try:
        asyncio.run(_run_with_timeout())
        success = True
    except asyncio.TimeoutError:
        log(
            "[rotate_callback] Rotation aborted due to timeout — watcher will retry on next trigger",
            "WARN",
        )
        LOCK_FILE.unlink(missing_ok=True)
    except Exception as e:
        log(f"rotate_callback FAILED: {e}", "ERROR")

    if success:
        _rotation_times.append(time.time())
        _fail_state["count"] = 0
        _fail_state["cooldown_until"] = 0
    else:
        _fail_state["count"] += 1
        if _fail_state["count"] >= _MAX_CONSECUTIVE_FAILS:
            _fail_state["cooldown_until"] = time.time() + _FAIL_COOLDOWN
            log(
                f"[rotate_callback] {_MAX_CONSECUTIVE_FAILS} consecutive failures — pausing rotation for {_FAIL_COOLDOWN}s",
                "ERROR",
            )
            try:
                from core.utils_notify import notify

                notify(
                    "Antigravity Rotator",
                    f"CRITICAL: {_MAX_CONSECUTIVE_FAILS}x fail — paused 5min",
                )
            except Exception:
                pass
    _save_fail_state()


import threading


def _workspace_daemon():
    import time

    while True:
        try:
            from core.workspace_cleanup import cleanup_workspace_accounts

            cleanup_workspace_accounts()
        except Exception:
            pass
        time.sleep(1800)


threading.Thread(target=_workspace_daemon, daemon=True).start()
try:
    from core.workspace_cleanup import cleanup_workspace_accounts

    cleanup_workspace_accounts()
except:
    pass
if __name__ == "__main__":
    from core.accounts_path import OPENCODE_AUTH_PATH, ACCOUNTS_PATH
    import json

    # Startup health-check
    try:
        if not OPENCODE_AUTH_PATH.exists():
            log("[HEALTH] FATAL: auth.json not found!", "ERROR")
            sys.exit(1)
        auth = json.loads(OPENCODE_AUTH_PATH.read_text())
        if "google" not in auth:
            log("[HEALTH] FATAL: google key missing from auth.json!", "ERROR")
            sys.exit(1)
        if not ACCOUNTS_PATH.exists():
            log("[HEALTH] FATAL: antigravity-accounts.json not found!", "ERROR")
            sys.exit(1)
        accounts = json.loads(ACCOUNTS_PATH.read_text())
        if not accounts.get("accounts"):
            log("[HEALTH] FATAL: no accounts in antigravity-accounts.json!", "ERROR")
            sys.exit(1)
        log(f"[HEALTH] OK: auth.json and accounts.json valid")
    except Exception as e:
        log(f"[HEALTH] FATAL: startup check failed: {e}", "ERROR")
        sys.exit(1)

    _load_fail_state()
    _ensure_setup()
    assert_plugin_installed()
    log("Starting Antigravity rate-limit watcher...")
    w = Watcher(rotate_callback, poll_interval=8.0)
    w.run()
