# Instagram profile

Yash does every step in the Instagram app. Set it up before the first post.

## Copy

| Field | Value |
|---|---|
| Username | `stridemon`, to match X. If it's taken, `stridemon.xyz` or `stridemon_app` |
| Name (24 / 30, searchable) | `StrideMon · Walking game` |
| Category | Video game |
| Pronouns, gender | leave empty |

**Bio** (143 / 150, three lines):

```text
A walking game on Monad testnet. Own a Sneaker NFT, walk to earn STRIDE, upgrade it.
STRIDE has no monetary value.
Founding Pass waitlist below
```

It's the X bio with the builder's handle swapped for where the link goes, because a bio's own
link sits right under it.

**Links** (Edit profile → Links; the first one shows under the bio):

| Title | URL |
|---|---|
| Founding Pass and waitlist | `https://stridemon.xyz/pass?source=ig-stridemon` |
| StrideMon | `https://stridemon.xyz/?source=ig-stridemon` |
| Code | `https://github.com/yassmittal/StrideMon` |

Not the Android build page itself: it changes with every `demo` build (D-052), and the website's
"Get the app" buttons always point at the current one.

## Images

| File | Size | From |
|---|---|---|
| `social/media/instagram/avatar-1080.png` | 1080 × 1080 | `website/src/app/icon.svg`, the same mark as on X. The circle crop hides its rounded corners |
| `social/media/instagram/highlight-*.png` | 1080 × 1920 | `design/highlight-*.html`, five covers (`stories.md`) |

## Account settings

- [ ] **Professional account → Business**, category Video game. It adds insights for each post,
      which `results` in the post files is filled from.
- [ ] **Contact options:** email, the site's support address (`supportEmail` in
      `website/src/content/site.ts`). Optional.
- [ ] **Two-factor authentication** with an authenticator app, not SMS. Save the backup codes
      somewhere that isn't this repo.
- [ ] **No connected third-party apps**, and no Meta Business Suite scheduling: posting is by hand.
- [ ] **Threads and Facebook cross-posting off** for now, so each post goes where it's meant to.
- [ ] Check the profile on a phone once the first three posts are up: the avatar, the bio's line
      breaks, the link and the top row of the grid.
