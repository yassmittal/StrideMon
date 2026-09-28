#!/usr/bin/env bash
#
# A MongoDB instance that belongs to this project alone.
#
# Deliberately not `brew services start mongodb-community`: that runs one shared
# server on 27017 for the whole machine. This one has its own data directory
# inside the repo and its own port, so StrideMon's data cannot collide with
# another project's, and resetting the database is `rm -rf .mongo`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$ROOT/.mongo/data"
LOG_FILE="$ROOT/.mongo/mongod.log"
PID_FILE="$ROOT/.mongo/mongod.pid"
PORT=27019

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

case "${1:-status}" in
  start)
    if is_running; then
      echo "Already running on port $PORT (pid $(cat "$PID_FILE"))."
      exit 0
    fi
    mkdir -p "$DATA_DIR" "$(dirname "$LOG_FILE")"
    # --fork daemonises and only returns once the server is accepting
    # connections, so a following command can rely on it being up.
    mongod \
      --dbpath "$DATA_DIR" \
      --port "$PORT" \
      --bind_ip 127.0.0.1 \
      --logpath "$LOG_FILE" \
      --pidfilepath "$PID_FILE" \
      --fork > /dev/null
    echo "MongoDB running on mongodb://127.0.0.1:$PORT  (pid $(cat "$PID_FILE"))"
    echo "Compass:  mongodb://127.0.0.1:$PORT/"
    echo "Database: stridemon"
    ;;

  stop)
    if ! is_running; then
      echo "Not running."
      rm -f "$PID_FILE"
      exit 0
    fi
    kill "$(cat "$PID_FILE")"
    # Wait for a clean shutdown; killing the shell before mongod finishes
    # flushing leaves the data files needing a repair on next boot.
    for _ in $(seq 1 30); do
      is_running || break
      sleep 0.5
    done
    rm -f "$PID_FILE"
    echo "Stopped."
    ;;

  status)
    if is_running; then
      echo "Running on mongodb://127.0.0.1:$PORT (pid $(cat "$PID_FILE"))"
    else
      echo "Not running. Start it with: bun run db:start"
      exit 1
    fi
    ;;

  logs)
    tail -f "$LOG_FILE"
    ;;

  *)
    echo "Usage: $0 {start|stop|status|logs}" >&2
    exit 1
    ;;
esac
