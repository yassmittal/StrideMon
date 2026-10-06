# Deployment (Phase 8.6)

Every step to host the API at **`https://stridemon-api.yashmittal.xyz`** and build the demo app,
in order, in one file (D-028, D-034). You run the steps yourself. Each one says what you should
see. If a step doesn't match, stop there and send the step number, the command and its output.

How it fits on the instance, next to `meAsAgent` and the others:

```text
phone ──HTTPS──▶ nginx :443 (stridemon-api.yashmittal.xyz, Let's Encrypt)
                   └──▶ 127.0.0.1:3020  PM2 "stridemon-api" (Bun)
                                          ├──▶ MongoDB Atlas, database "stridemon"
                                          └──▶ Monad testnet RPC
```

Nothing that already runs on the instance changes. StrideMon gets its own subdomain, nginx
server block, certificate, port, PM2 process and database user.

> **One rule from step 7 on:** never run the local API (`bun run dev:api`) while the hosted one is
> live. Both send transactions with the same game-server key, and their nonces would collide.

---

## 0. The existing setup (done, 2026-10-05)

Read from the instance, so the steps below match it:

- nginx uses `/etc/nginx/sites-enabled/`, one file per domain named after it
  (`measagent-api.yashmittal.xyz` proxies to `127.0.0.1:3010`). Port 3020 isn't used.
- certbot is installed, with one certificate per domain.
- The shared Bun is 1.3.14. StrideMon gets its own 1.4.2 in step 3, so the other projects'
  Bun is never touched (D-034).
- The public IP is `100.55.119.114`.
- DNS for `yashmittal.xyz` is on **Vercel**, with a wildcard record: until step 1,
  `stridemon-api.yashmittal.xyz` resolves to Vercel, not to the instance.

## 1. DNS record (Vercel)

vercel.com → your account → **Domains** → `yashmittal.xyz` → **DNS Records** → **Add**:

| Name | Type | Value | TTL |
|------|------|-------|-----|
| `stridemon-api` | `A` | `100.55.119.114` | default |

It overrides the wildcard for this one name only; everything else on `yashmittal.xyz` is unchanged.

- [X] After a few minutes, on your Mac: `dig +short stridemon-api.yashmittal.xyz` prints only
      `100.55.119.114` (not `cname.vercel-dns.com`). Don't run step 5's certbot before this.

## 2. Atlas: database user and network access

Same `meAsAgent` cluster, its own user (`cloud.mongodb.com` → Project 0):

1. **Security → Database & Network Access → Database Users → Add New Database User**
   - Username `stridemon`, password: **Autogenerate** and copy it somewhere safe.
   - **Database User Privileges → Specific Privileges → `readWrite`** on database
     **`stridemon`** (leave collection empty). Not "Read and write to any database".
2. **Network Access**: the instance's public IP (or `0.0.0.0/0`) should already be listed, because
   meAsAgent's API connects from the same instance. If it isn't, add the IP from step 0.
3. **Clusters → Connect → Drivers**: copy the `mongodb+srv://…` string. Step 4 uses it with the
   user and database filled in:

   ```text
   mongodb+srv://stridemon:<password>@<cluster-host>/stridemon?retryWrites=true&w=majority
   ```

   The `/stridemon` before the `?` is the database name, and the API refuses a URI without one.

- [ ] The user exists with `readWrite@stridemon` only. The database itself appears once the API
      first writes to it (step 7).

## 3. Bun 1.4.2 and the code on the server

StrideMon's own Bun, in its own folder. Unzipping a release changes nothing else: no shell profile
edits, and the shared `~/.bun` (1.3.14) stays as it is for the other projects.

```bash
which unzip || sudo apt install -y unzip
case "$(uname -m)" in
  x86_64) BUN_TARGET=linux-x64 ;;
  aarch64) BUN_TARGET=linux-aarch64 ;;
esac
curl -fsSL -o /tmp/bun-1.4.2.zip \
  "https://github.com/oven-sh/bun/releases/download/bun-v1.4.2/bun-$BUN_TARGET.zip"
mkdir -p ~/.bun-1.4.2/bin
unzip -j -o /tmp/bun-1.4.2.zip -d ~/.bun-1.4.2/bin && rm /tmp/bun-1.4.2.zip
~/.bun-1.4.2/bin/bun --version     # 1.4.2
bun --version                      # still 1.3.14
```

Then the code. Commit and push your changes first, so the clone has them, and clone it the same
way you cloned `meAsAgent` (a private repo needs that SSH key or token):

```bash
cd ~/projects
git clone <the StrideMon repo URL> stridemon
cd stridemon
~/.bun-1.4.2/bin/bun install --frozen-lockfile --filter '@stridemon/api'
```

`--filter` installs only the API and the two packages it uses, not the mobile app's packages.

- [ ] The two version lines print `1.4.2` and `1.3.14`.
- [ ] The install ends without an error.

## 4. The API's `.env` on the server

```bash
cd ~/projects/stridemon/apps/api
cp .env.example .env
vim .env
```

Set these values. Every other line stays as in `.env.example`:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` (JSON logs, no API docs page, listens on `127.0.0.1` only) |
| `API_PORT` | `3020` |
| `MONGODB_URI` | the string from step 2 |
| `JWT_ACCESS_TOKEN_SECRET` | a new one: run `openssl rand -hex 64` and paste the output |
| `GAME_SERVER_PRIVATE_KEY` | the same key as in your laptop's `apps/api/.env` |
| `SIWE_DOMAIN` | keep `stridemon.com`. It's the name inside the sign-in message, not the API's host |
| `WAITLIST_ALLOWED_ORIGINS` | `https://stridemon.yashmittal.xyz`, the landing page, the only browser origin the waitlist accepts (D-037) |

```bash
chmod 600 .env
```

- [ ] `grep -cE "^[A-Z_]+=" .env` prints the same number as for `.env.example`, so no variable is missing.

## 5. nginx and HTTPS

Like the other domains on the instance, the file is named after the domain:

```bash
sudo vim /etc/nginx/sites-available/stridemon-api.yashmittal.xyz
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name stridemon-api.yashmittal.xyz;

    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        # The API reads the player's IP from this for its rate limit (D-034).
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Activity-session uploads carry batches of location samples.
        client_max_body_size 2m;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/stridemon-api.yashmittal.xyz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d stridemon-api.yashmittal.xyz
```

certbot adds the `listen 443 ssl` lines and the certificate to this file, sets up the HTTP → HTTPS
redirect if you pick it (do), and renews the certificate on its own.

- [ ] `nginx -t` says `syntax is ok` and `test is successful`.
- [ ] certbot ends with `Successfully deployed certificate`.

## 6. Start it with PM2

```bash
cd ~/projects/stridemon/apps/api
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs stridemon-api --lines 30
```

PM2 starts it with `~/.bun-1.4.2/bin/bun` (set in `ecosystem.config.cjs`), not the shared Bun.

- [X] `pm2 list` shows `stridemon-api` **online**, and its ↺ count stays at 0 over a minute.
- [X] `pm2 describe stridemon-api | grep "script path"` shows `.bun-1.4.2/bin/bun`.
- [X] The logs show JSON lines with `"msg":"Server listening at http://127.0.0.1:3020"` and no error.
- [X] `curl -s http://127.0.0.1:3020/health` on the server prints `{"status":"ok","mongo":"connected"}`.
- [X] From your Mac: `curl -s https://stridemon-api.yashmittal.xyz/health` gives the same answer,
      over HTTPS.

If it shows `errored`, the first log lines name the missing or wrong `.env` variable.

## 7. Switch from the laptop API

1. On the Mac, stop the local API (Ctrl+C in its terminal) and don't start it again.
2. From now on the hosted API sends every game-server transaction (starter mints, gas drips,
   settlements).
3. To use the development build with the hosted API, set
   `EXPO_PUBLIC_API_BASE_URL=https://stridemon-api.yashmittal.xyz` in `apps/mobile/.env` and restart
   Metro with `bunx expo start --clear` (the value is compiled into the bundle). Metro still serves
   the JavaScript, so the phone and the Mac still share Wi-Fi; only the API calls go to the
   instance. The demo build in step 8 needs none of this.

What carries over: everything on-chain. Wallets A and B keep their Sneakers, levels and SOLE, and
they aren't minted a new starter Sneaker (the app reads that from the chain). What doesn't: the
**History** tab starts empty, because past runs live in your laptop's database.

## 8. The demo build

On the Mac, from `apps/mobile`:

```bash
bunx eas-cli build --profile demo --platform android
```

The `demo` profile in `eas.json` bundles the JavaScript and points at
`https://stridemon-api.yashmittal.xyz`. Its `EXPO_PUBLIC_*` values live on the profile, because
`.env` files never reach EAS.

- It waits in the free EAS queue for 10 to 80 minutes, like the development build
  (`device-testing.md` §2). If EAS asks you to commit first, commit, then run it again.
- [X] It finishes with an APK link and a QR code.
- [X] Install it on the phone from that link. It uses the same package as the development build,
      so it **replaces** it. To go back to developing, reinstall the development build from its
      own EAS link. No rebuild is needed.

## 9. On the phone, without the laptop

Turn the laptop off (or close it) and turn the phone's Wi-Fi off, so it uses mobile data.

- [X] Open StrideMon. The welcome screen shows the API as healthy. No development launcher, no
      Metro.
- [X] Sign in with Account 1 (A): Home shows #2 at level 2. No "Minting your Sneaker…".
- [X] Walk 3 minutes and STOP: the summary settles with a reward, and History lists the run.
- [X] On the server, `pm2 logs stridemon-api` shows the requests and the settlement.

## 10. The outdoor checks (Phase 4, D-025)

All on the demo build and the hosted API. Details are in `device-testing.md` §9.

- [X] **Locked-phone walk:** about 10 minutes of laps on a 400 m track, phone locked in a
      pocket. The distance is within 10% of laps × 400 m.
- [ ] **Car:** as a passenger, run for at least 3 minutes. The summary shows 0 active minutes.
- [X] **Kill and reopen:** start a walk, swipe the app away, keep walking a minute, reopen it,
      walk a bit more, STOP. No samples are lost: the distance covers the whole walk.

Then one full rehearsal of [`demo-script.md`](demo-script.md) on this build. Send me the ticked
list.

---

## Updating the API later

```bash
cd ~/projects/stridemon
git pull
~/.bun-1.4.2/bin/bun install --frozen-lockfile --filter '@stridemon/api'
pm2 restart stridemon-api
```

A new variable in `.env.example` must be added to the server's `.env` before the restart, or
the API refuses to boot and names it (`pm2 logs stridemon-api`).

## When something goes wrong

| What you see | Check |
|---|---|
| `curl` to the domain fails, but `127.0.0.1:3020` works | DNS (step 1: `dig` must print `100.55.119.114`), or the nginx file isn't enabled (`sudo nginx -T \| grep stridemon`) |
| certbot fails its challenge | DNS still points at Vercel: wait until step 1's `dig` passes |
| `bun install` fails on the lockfile | It ran with the shared Bun: use `~/.bun-1.4.2/bin/bun` |
| `502 Bad Gateway` | The API isn't running: `pm2 logs stridemon-api` |
| PM2 restarts it in a loop | A `.env` value is wrong. The log's first line names it |
| `MongoServerError: bad auth` / `not authorized` | The user or password in `MONGODB_URI`, or its role isn't `readWrite` on `stridemon` |
| Mongo connection times out | Atlas Network Access doesn't list the instance's IP |
| The app says the API is offline | The demo build's URL (`eas.json` → `demo`), or `/health` from the Mac |
| Runs stay on "Settling…" | `pm2 logs stridemon-api` for outbox errors. Is the game-server key funded, and the game unpaused? |
