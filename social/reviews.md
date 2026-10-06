# Weekly reviews

Fifteen minutes on the changelog day, newest first (`docs/social-plan.md` §10).

For each account, compare posts by **replies, profile visits and follows per 1,000 impressions**
(rates, not raw counts). Then note GitHub traffic (views, `t.co` referrals), starter Sneakers
minted that week, and waitlist sign-ups by `source`. End with **one** change for next week.

```js
// Waitlist sign-ups by source (mongosh, Atlas `stridemon`, read-only)
db.waitlistSignups.aggregate([{ $group: { _id: '$source', signups: { $sum: 1 } } }])
```

<!-- Template
## Week of YYYY-MM-DD

| Account | Posts | Best post (why) | Replies / 1k | Profile visits / 1k | Follows / 1k |
|---|---|---|---|---|---|
| @stridemon | | | | | |
| @yash_mittal_dev | | | | | |

Off X: GitHub views … (t.co …) · starter Sneakers … · waitlist: x-stridemon …, x-yash …, none …

Change for next week: …
-->
