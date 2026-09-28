# Phase 9 — Marketplace (optional)

**Goal:** list a Sneaker for a price in MON, and another wallet buys it. This is
`MVP.md` §17. It's optional for the hackathon, so only start it once Phase 8 is done.

## Design sketch (finalise in `smart-contracts.md` before building)

- A new `SneakerMarketplace` contract, separate from `SneakerGame`.
  - `listSneaker(tokenId, priceWei)`: the seller approves the marketplace for the
    token, and the listing stores `{ seller, priceWei }`. The NFT stays in the
    seller's wallet (non-custodial).
  - `cancelListing(tokenId)`.
  - `buySneaker(tokenId)` payable: checks the listing is still valid (the seller
    still owns it and it's still approved), transfers the NFT, and pays the seller.
  - A listing becomes invalid automatically if the seller transfers the Sneaker
    elsewhere, so every read must check it's still valid.
  - Pull-payments or checks-effects-interactions with `nonReentrant`.
- No marketplace fee in the MVP. Add it later as a `GameConfig`-style parameter.
- Listing discovery: `SneakerListed` / `SneakerSold` events. The first version
  reads events directly. An indexer that mirrors them into Mongo
  (`marketplaceListings`, a cache only) comes when the listing count makes that
  slow.
- The app gets a new `features/marketplace/`, reusing `useSneakerGameTransaction`
  (rename it to `usePlayerTransaction` at this point, since it's no longer
  game-only). That's the third caller, so the rename is justified by
  `coding-standards.md` §4.

## Definition of done
- [ ] List → buy → ownership and MON both move → the listing disappears.
- [ ] Transferring a listed Sneaker invalidates the listing.
- [ ] The contract has full Foundry tests, including reentrancy and stale-listing cases.
