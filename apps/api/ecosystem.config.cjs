// PM2 process file for the hosted API (D-028, D-034). Secrets stay in apps/api/.env, which Bun
// loads from this working directory, so nothing in here is sensitive.

// StrideMon's own Bun, pinned to bun.lock's version, so the instance's shared ~/.bun (used by the
// other projects) is never upgraded for it (D-034). docs/deployment.md step 3 installs it.
const STRIDEMON_BUN_PATH = `${process.env.HOME}/.bun-1.4.2/bin/bun`

module.exports = {
  apps: [
    {
      name: 'stridemon-api',
      cwd: __dirname,
      script: STRIDEMON_BUN_PATH,
      // The entry file directly, not `bun run start`, whose inner `bun` would come from PATH.
      args: 'src/index.ts',
      interpreter: 'none',
      // One instance: the outbox and the other background jobs run on timers inside it.
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      restart_delay: 3000,
      max_memory_restart: '512M',
      // Matches the API's own shutdown grace period (src/index.ts).
      kill_timeout: 10000,
    },
  ],
}
