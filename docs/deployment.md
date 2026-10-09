# Deployment (Phase 8.6)

Every step to host the API at **`https://stridemon-api.yashmittal.xyz`** and build the demo app,
in order, in one file (D-028, D-034). Step 11 moves everything to **`stridemon.xyz`** (D-040): the
API moves to `https://api.stridemon.xyz`. You run the steps yourself. Each one says what you should
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

What carries over: everything on-chain. Wallets A and B keep their Sneakers, levels and STRIDE, and
they aren't minted a new starter Sneaker (the app reads that from the chain). What doesn't: the
**History** tab starts empty, because past runs live in your laptop's database.

## 8. The demo build

On the Mac, from `apps/mobile`:

```bash
bunx eas-cli build --profile demo --platform android
```

The `demo` profile in `eas.json` bundles the JavaScript and points at
`https://stridemon-api.yashmittal.xyz` (`https://api.stridemon.xyz` since D-040). Its `EXPO_PUBLIC_*` values live on the profile, because
`.env` files never reach EAS.

- It waits in the free EAS queue for 10 to 80 minutes, like the development build
  (`device-testing.md` §2). If EAS asks you to commit first, commit, then run it again.
- [X] It finishes with an APK link and a QR code.
- [X] Install it on the phone from that link. It uses the same package as the development build,
      so it **replaces** it. To go back to developing, reinstall the development build from its
      own EAS link. No rebuild is needed.

## 9. On the phone, without the laptop

Turn the laptop off (or close it) and turn the phone's Wi-Fi off, so it uses mobile data.

- [X] Open StrideMon. The welcome screen shows the API as healthy (since D-039: no error panel
      above Connect wallet). No development launcher, no Metro.
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

## 11. The `stridemon.xyz` domain (D-040)

`stridemon.xyz` (Namecheap) becomes the main domain: the site at `https://stridemon.xyz`, the API
at `https://api.stridemon.xyz`. `www.stridemon.xyz` and `stridemon.yashmittal.xyz` redirect
(308) to the site, path and `?source=` kept. The old API name is removed once the new app build is
out (11.6): builds made before then stop working.
Do the steps in order: the API must accept the new origin before the site moves.

- [X] (done 2026-10-07) `stridemon.xyz` and `www.stridemon.xyz` are domains of the `stridemon`
      Vercel project (`vercel domains add <name> stridemon`). `stridemon.yashmittal.xyz` stays
      attached too.
- [X] (done 2026-10-07) `www.stridemon.xyz` and `stridemon.yashmittal.xyz` are set to **Redirect
      to `stridemon.xyz` (308)** (Project → Settings → Domains, or `vercel api` as in D-040).

### 11.1 DNS (Namecheap)

namecheap.com → **Domain List** → `stridemon.xyz` → **Manage**. Keep **Nameservers: Namecheap
BasicDNS** (its free email forwarding needs it). **Advanced DNS** → **Host Records**: delete the
parking records (`URL Redirect Record @` and `CNAME www → parkingpage.namecheap.com`), then add:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| `A` | `@` | `216.198.79.1` | Automatic |
| `A` | `@` | `64.29.17.1` | Automatic |
| `CNAME` | `www` | `db99236d6ab969ef.vercel-dns-017.com.` | Automatic |
| `A` | `api` | `100.55.119.114` | Automatic |

The first three are what `vercel domains verify stridemon.xyz` asked for on 2026-10-07. If Vercel
shows other values later, use those.

- [X] `dig +short stridemon.xyz` prints the two Vercel IPs, `dig +short api.stridemon.xyz` prints
      `100.55.119.114`.
- [X] `vercel domains verify stridemon.xyz` and `vercel domains verify www.stridemon.xyz` say
      `"ok": true`.
- [X] `https://stridemon.xyz` has a certificate. Vercel hadn't issued it on its own 20 minutes
      after DNS was right (the browser said "Not secure"), so it was requested by hand:
      `vercel certs issue stridemon.xyz www.stridemon.xyz`.

### 11.2 Email: `support@stridemon.xyz`

Optional until the Play listing. Forwarding is free with BasicDNS; it's not Namecheap's paid
Private Email. Same page → **Mail Settings** → **Email Forwarding** → add `support` →
`yashmittalmm@gmail.com`.
Namecheap adds its own `MX` and SPF `TXT` records. Add one more record in **Host Records** so no
one can send mail as `@stridemon.xyz` (nothing sends from it; forwarding only receives):

| Type | Host | Value |
|------|------|-------|
| `TXT` | `_dmarc` | `v=DMARC1; p=reject;` |

- [ ] An email from another account to `support@stridemon.xyz` arrives in Gmail (check spam).
- [ ] Then set `supportEmail` in `website/src/content/site.ts` to `support@stridemon.xyz`. Use it
      for Google Play's contact email too.

If you later want Gmail to *send* as `support@stridemon.xyz`, change the DMARC policy to
`p=none` first, or those emails get rejected.

### 11.3 The API at `api.stridemon.xyz`

Nothing that runs stops: the same PM2 process answers both names, and the old nginx file and
certificate stay. On the server, a second nginx file. Don't copy the old one: certbot added its
certificate lines to it.

```bash
sudo vim /etc/nginx/sites-available/api.stridemon.xyz
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.stridemon.xyz;

    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 2m;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/api.stridemon.xyz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.stridemon.xyz
```

certbot asks whether to redirect HTTP to HTTPS: pick redirect. Then update the code (this also
ships D-039's `DELETE /v1/me`) and allow the new site in `.env` (keep the old origin):

```bash
cd ~/projects/stridemon
git pull
~/.bun-1.4.2/bin/bun install --frozen-lockfile --filter '@stridemon/api'
vim apps/api/.env
```

```text
WAITLIST_ALLOWED_ORIGINS=https://stridemon.xyz,https://stridemon.yashmittal.xyz
```

```bash
pm2 restart stridemon-api
pm2 logs stridemon-api --lines 20
```

Bun reads `.env` when the process starts, so the restart picks the change up.

Leave `SIWE_DOMAIN` as it is until 11.5.

- [X] From your Mac: `curl -s https://api.stridemon.xyz/health` prints
      `{"status":"ok","mongo":"connected"}` (2026-10-07).
- [X] `curl -si -X OPTIONS https://api.stridemon.xyz/v1/waitlist -H 'Origin: https://stridemon.xyz' -H 'Access-Control-Request-Method: POST' | grep -i access-control-allow-origin`
      prints `https://stridemon.xyz`.

### 11.4 Deploy the website

Push the change (`siteUrl` and the waitlist URL). Vercel builds it like any other push. (Pushed
2026-10-07 before 11.3, so the waitlist fails until 11.3 is done.)

- [ ] `https://stridemon.xyz` loads with a valid certificate, and the waitlist form accepts an
      email (then delete that row from `waitlistSignups`).
- [ ] `curl -sI 'https://stridemon.yashmittal.xyz/privacy?source=x-stridemon'` answers `308` with
      `location: https://stridemon.xyz/privacy?source=x-stridemon`.
- [ ] `curl -sI https://www.stridemon.xyz` answers `308` with `location: https://stridemon.xyz/`.
- [ ] `curl -s https://stridemon.xyz | grep -o '<link rel="canonical"[^>]*>'` shows
      `https://stridemon.xyz`, and `curl -s https://stridemon.xyz/sitemap.xml` lists only
      `stridemon.xyz` URLs.

### 11.5 The app

1. Build the `demo` profile (step 8). It now points at `https://api.stridemon.xyz`, links the
   privacy policy on `stridemon.xyz` and tells the wallet its site is `https://stridemon.xyz`.
2. Install it, and put its APK link in `README.md` (the two links to the old APK, under the
   title and in "Try it").
3. On the server, set `SIWE_DOMAIN=stridemon.xyz` in the `.env` and `pm2 restart stridemon-api`.
   (Done 2026-10-07: `apps/mobile/.env` already points development at `https://api.stridemon.xyz`.)

- [ ] Sign out, then sign in again on the phone: the wallet's sign-in request names
      `stridemon.xyz`, and Home loads.

### 11.6 Remove the old API name

Right after 11.5. From here, every build made before it stops working (D-040).

On the server:

```bash
sudo rm /etc/nginx/sites-enabled/stridemon-api.yashmittal.xyz /etc/nginx/sites-available/stridemon-api.yashmittal.xyz
sudo nginx -t && sudo systemctl reload nginx
sudo certbot delete --cert-name stridemon-api.yashmittal.xyz
vim ~/projects/stridemon/apps/api/.env
```

```text
WAITLIST_ALLOWED_ORIGINS=https://stridemon.xyz
```

```bash
pm2 restart stridemon-api
```

Then vercel.com → **Domains** → `yashmittal.xyz` → **DNS Records**: delete the `stridemon-api`
`A` record. (Without it the name falls back to the `*.yashmittal.xyz` wildcard, which Vercel
answers with a 404.)

- [ ] `curl -s https://api.stridemon.xyz/health` still prints `{"status":"ok","mongo":"connected"}`.
- [ ] `curl -s -m 5 https://stridemon-api.yashmittal.xyz/health` no longer prints it.
- [ ] `sudo certbot certificates` no longer lists `stridemon-api.yashmittal.xyz`.
- [ ] A waitlist sign-up on `https://stridemon.xyz` still works.

### 11.7 Search engines and links

1. **Google Search Console** (search.google.com/search-console) → **Add property** → **Domain** →
   `stridemon.xyz`. Copy the `google-site-verification=…` value and add it in Namecheap as a
   `TXT` record on host `@` (it sits next to the SPF record). Verify.
2. **Sitemaps** → submit `https://stridemon.xyz/sitemap.xml`. **URL inspection** →
   `https://stridemon.xyz/` → **Request indexing**.
3. **Bing Webmaster Tools** (bing.com/webmasters) → **Import from Google Search Console**. Bing
   also feeds DuckDuckGo and ChatGPT search.
4. The old address was public for two days, so the 308 redirects are enough to move it. If
   Search Console lists `stridemon.yashmittal.xyz` anywhere, leave it: it fades out on its own.
5. Change the website link everywhere it's set by hand: the @stridemon and @yash_mittal_dev X
   profiles (`social/profile.md`), the GitHub repo's **About → Website**, the DeltaV profile, the
   Metropolis submission, and the Play listing when there is one.
6. **Reown** (dashboard.reown.com → the project): if it has a domain set, change it to
   `stridemon.xyz` (and verify it if it offers to), so wallets don't flag a mismatch with the
   app's metadata.

## 12. The Founding Pass settings (Part 3, D-043)

The API built from Part 3 on refuses to boot without these. Add them to the server's `.env`
**before** `pm2 restart stridemon-api` (`vim ~/projects/stridemon/apps/api/.env`):

| Variable | Value on the server |
|---|---|
| `EARLY_ACCESS_REQUIRED` | `false` until Metropolis judging ends (2026-10-27). `true` when the preview week starts (Part 10) |
| `PASS_WAITLIST_WINDOW_STARTS_AT` | `2026-11-28T14:30:00Z` for now. Part 10 sets the real time |
| `PASS_WAITLIST_WINDOW_HOURS` | `48` |
| `PASS_BACKUP_OPENING_AT` | `2026-12-14T14:30:00Z` for now (14 days after the open mint starts) |
| `TURNSTILE_SECRET_KEY` | the secret from Cloudflare → Turnstile → the `stridemon.xyz` site. Production refuses Cloudflare's test secrets |
| `EMAIL_PROOF_SECRET` | a new `openssl rand -hex 64`, not the JWT secret |
| `EMAIL_SENDER_ADDRESS` | `hello@stridemon.xyz` |
| `BREVO_API_KEY` | the Brevo key (the same one as the laptop's `apps/api/.env`) |

- [ ] `pm2 logs stridemon-api` shows no `Invalid environment variables` after the restart.
- [ ] `curl -s https://api.stridemon.xyz/v1/pass/collection | head -c 300` prints the schedule.

**Email DNS (Namecheap):** Brevo's `brevo-code` TXT and its two DKIM CNAMEs (`brevo1._domainkey`,
`brevo2._domainkey`) are in. The brief's §15 said to keep `_dmarc` at `p=reject` (§11.2) and not add
Brevo's DMARC record. On 2026-10-08 `_dmarc` read `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`.
Brevo's mail passes DMARC either way, because its DKIM signs for `stridemon.xyz`. `p=none` only
stops other servers rejecting forged mail that claims to be from `stridemon.xyz`. To go back:
`v=DMARC1; p=reject; rua=mailto:rua@dmarc.brevo.com`.

**Brevo's authorised IPs:** this Brevo account only takes API calls from listed IPs
(<https://app.brevo.com/security/authorised_ips>). Add the instance's IP, `100.55.119.114`, or
every code email from the hosted API fails with `EMAIL_SEND_FAILED` (Brevo answers `401 unrecognised
IP address`). The instance's IP is fixed. The laptop's isn't: the home connection goes out through
more than one public IP (Brevo saw two on 2026-10-08), so a send from the laptop can need another
entry. Brevo's error names the IP to add.

**The deliverability check:** from the laptop, `cd apps/api && bun run pass:send-test-email
you@gmail.com`. In Gmail, open it → ⋮ → **Show original**: DKIM and DMARC must say `PASS`.

### 12.1 The website's mint (Part 5, D-045)

The mint on `stridemon.xyz/pass` needs the API above (redeployed from this tree) and three public
settings on the website side:

- [x] **Turnstile site key:** `0x4AAAAAAFRleBaVJ9eZuqBJ`, in `website/src/content/site.ts`
  (2026-10-09). Its **secret** goes in the server's `.env` as `TURNSTILE_SECRET_KEY` (§12). The
  API also checks each token's hostname against `WAITLIST_ALLOWED_ORIGINS`, so on the server that
  list must be the site's real origins only (`https://stridemon.xyz`), never `localhost`.
- [ ] **Reown:** <https://cloud.reown.com> → the app's project → **Domain**. If the allowlist has
  entries, add `stridemon.xyz`; otherwise wallets refuse to connect from the website.
- [ ] **The pass contract:** `foundingPassContract` in `website/src/content/contracts.ts` must be
  the `foundingPass` address the hosted API uses (`deployments/10143.json`). Part 10 deploys a
  fresh one.
- [ ] Deploy the website after the API, then on the live site: Get ready → mint is only open in the
  waitlist window and the open mint, so check the steps, and leave the mint itself to the
  rehearsal (Part 9) or the window.

## 13. The help chatbot (Part 8, D-048)

The API built from Part 8 on refuses to boot without `HELP_CHAT_MONTHLY_CAP_USD`. Add both lines
to the server's `.env` before `pm2 restart stridemon-api`:

| Variable | Value on the server |
|---|---|
| `BEDROCK_API_KEY` | the Bedrock API key (AWS console → Amazon Bedrock → API keys, `us-east-1`). Without it the chatbot says it can't answer and points at `/help` |
| `HELP_CHAT_MONTHLY_CAP_USD` | `5` |

- [ ] `curl -s -X POST https://api.stridemon.xyz/v1/help/chat -H 'content-type: application/json'
  -d '{"messages":[{"role":"visitor","text":"Is it free?"}]}'` prints an answer.
- [ ] A free backstop for the cap: AWS → Billing → Budgets → a monthly cost budget of $5 with an
  email alert, in case the list prices change.
- [ ] After any change to `website/src/content/help.ts`: `bun run help:export-knowledge`, then
  redeploy the API, so the chatbot reads the same words as the page.

To see this month's spend: `db.helpChatUsage.find()` on the Atlas `stridemon` database (token
counts; multiply by the prices in `apps/api/src/lib/help-chat/help-chat-cost.ts`).

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
