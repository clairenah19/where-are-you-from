"""Keep the Supabase project from pausing.

Free Supabase projects are paused after about a week without activity. This makes one small read
request to the pins table, which counts as activity. It reads the project address and the *public*
anon key from js/config.js, so there is nothing to configure and no secret to store.

Exits 0 when the database answered, 1 when it did not, so a failed run shows up as a failed
GitHub Actions job (GitHub emails the repository owner about failed scheduled runs).
"""

import json
import re
import sys
import time
import urllib.error
import urllib.request

CONFIG = "js/config.js"
ATTEMPTS = 4
WAIT_SECONDS = 20  # a project that is just waking up can take a moment


def read_config():
    text = open(CONFIG, encoding="utf-8").read()
    url = re.search(r"SUPABASE_URL\s*=\s*'([^']*)'", text)
    key = re.search(r"SUPABASE_ANON_KEY\s*=\s*'([^']*)'", text)
    return (url.group(1).strip() if url else ""), (key.group(1).strip() if key else "")


def ping(url, key):
    request = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/pins?select=id&limit=1",
        headers={"apikey": key, "Authorization": f"Bearer {key}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        rows = json.load(response)
        return response.status, len(rows)


def main():
    url, key = read_config()
    if not url or not key:
        print("js/config.js has no Supabase URL / key (demo mode), so there is nothing to keep alive.")
        return 0

    host = re.sub(r"^https?://", "", url).rstrip("/")
    for attempt in range(1, ATTEMPTS + 1):
        try:
            status, count = ping(url, key)
            print(f"OK: {host} answered HTTP {status} (attempt {attempt}).")
            return 0
        except urllib.error.HTTPError as err:
            print(f"Attempt {attempt}/{ATTEMPTS}: {host} answered HTTP {err.code}.")
        except (urllib.error.URLError, TimeoutError, ValueError, OSError) as err:
            print(f"Attempt {attempt}/{ATTEMPTS}: could not reach {host} ({err}).")
        if attempt < ATTEMPTS:
            time.sleep(WAIT_SECONDS)

    print(
        f"FAILED: {host} did not answer. If the project is already paused, open the Supabase "
        "dashboard and click 'Restore project'."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
