# @stridemon profile

Set this up before the first post (`docs/social-plan.md` §3–§4). Yash does every step in X's own
settings.

## Copy

| Field | Value |
|---|---|
| Name | `StrideMon` |
| Bio (136 / 160) | `A walking game on Monad testnet. Own a Sneaker NFT, walk to earn STRIDE, upgrade it. STRIDE has no monetary value. Built by @yash_mittal_dev` |
| Location | leave empty |
| Website | `stridemon.yashmittal.xyz` |
| Pinned post | the launch thread's Post 1, from launch day |

## Images

Both files are in the gitignored `social/media/`. Rebuild them from the repo root:

| File | Size | From |
|---|---|---|
| `avatar-400.png` | 400 × 400 | `website/src/app/icon.svg`, the site's mark. The circle crop hides its rounded corners |
| `header-1500x500.png` | 1500 × 500 | The real level-2 Sneaker art (`website/public/sneaker-art/`) on black, with the headline in Satoshi. The bottom-left stays empty for the avatar, and nothing sits within 60 px of the top or bottom edge |

```bash
rsvg-convert -w 400 -h 400 website/src/app/icon.svg -o social/media/avatar-400.png

rsvg-convert -w 380 -h 380 website/public/sneaker-art/sneaker-0002-level-02.svg -o /tmp/art380.png
ffmpeg -y -f lavfi -i color=c=black:s=1500x500 -i /tmp/art380.png -filter_complex \
  "[0][1]overlay=1060:60,\
drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Regular.ttf:text='Walk. Earn. Upgrade.':fontcolor=white:fontsize=72:x=330:y=170,\
drawtext=fontfile=apps/mobile/assets/fonts/Satoshi-Medium.ttf:text='STRIDEMON  •  MONAD TESTNET  •  ANDROID DEMO':fontcolor=0x999999:fontsize=22:x=334:y=276" \
  -frames:v 1 social/media/header-1500x500.png
```

After uploading, check both on a phone and on desktop. The avatar overlaps the header differently
on each.

## Security, before the first post

- [ ] The account uses its own email (Yash has it; it isn't written here because the repo is public)
- [ ] 2FA with an authenticator app, not SMS
- [ ] Phone number verified, so a crypto-post lock can be cleared quickly (`docs/social-plan.md`, research §4)
- [ ] Backup codes saved somewhere that isn't this repo
- [ ] No third-party apps connected (Settings → Security → Connected apps)

## @yash_mittal_dev

Optional, and Yash's call: add "Building @stridemon" to the bio for launch week, so people who find
the build stories can get to the product.
