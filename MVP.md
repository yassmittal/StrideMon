# Monad Move-to-Earn — MVP

## 1. Project Idea

A simplified move-to-earn game inspired by STEPN, built around the Monad ecosystem.

The user owns a **Sneaker NFT**, uses it while walking or running, earns rewards based on their activity, and uses those rewards to improve their Sneaker.

The MVP focuses on one core loop:

> **Own Sneaker → Get Energy → Move → Earn → Upgrade Sneaker → Move Again**

The blockchain component is centered around **Monad**, with the Sneaker represented as an NFT.

---

# 2. End-to-End User Journey

```text
User
 │
 ├── Connects wallet
 │
 ├── Enters the game
 │
 ├── Receives / acquires a Sneaker NFT
 │
 ├── Sees Sneaker + Energy
 │
 ├── Starts a walking/running session
 │
 ├── Moves in the real world
 │
 ├── Activity is tracked
 │
 ├── Session ends
 │
 ├── Reward is calculated
 │
 ├── User receives game rewards
 │
 ├── Sneaker durability decreases
 │
 ├── User repairs / upgrades Sneaker
 │
 ├── Sneaker NFT becomes more valuable/useful
 │
 └── User starts another session
```

---

# 3. Step 1 — User Enters the Game

The user opens the application.

The first screen explains the basic concept:

> Walk. Earn. Upgrade your Sneaker.

The user connects their Monad-compatible wallet.

After connecting, the application recognizes the user's wallet as their game identity.

The user can see:

* Wallet
* Sneaker
* Energy
* Reward balance
* Sneaker level
* Sneaker attributes
* Sneaker durability

---

# 4. Step 2 — User Gets a Sneaker NFT

The user needs a Sneaker to participate.

For the hackathon MVP, the user can receive a **starter Sneaker NFT**.

The Sneaker is minted on Monad and belongs to the user's wallet.

The user can see:

```text
My Sneaker

Sneaker #001

Level: 1

Efficiency: 10
Durability: 100

Owner:
User's wallet
```

The important part is:

> The Sneaker is not just an item stored inside the game database. It is an NFT owned by the user's wallet on Monad.

---

# 5. Step 3 — Sneaker NFT

Every Sneaker has its own identity.

A Sneaker can have:

* Unique ID
* Level
* Efficiency
* Durability
* Other game attributes

For the MVP, keep the attributes simple.

Example:

```text
Sneaker #001

Level
1

Efficiency
10

Durability
100
```

The Sneaker NFT represents the user's in-game asset.

The user should be able to view the Sneaker's ownership and NFT information through the Monad ecosystem.

---

# 6. Step 4 — User Gets Energy

The user doesn't earn rewards forever.

The Sneaker provides a limited amount of Energy.

Example:

```text
Energy

10 / 10
```

Energy represents the amount of time the user can participate in reward-generating activity.

For the MVP:

```text
1 Energy = 1 minute of activity
```

Therefore:

```text
10 Energy
=
10 minutes of reward-generating activity
```

Energy can replenish over time.

The purpose is to prevent unlimited reward generation.

---

# 7. Step 5 — User Starts a Session

The user presses:

> START

The application begins an activity session.

The user sees:

```text
RUNNING

Time
03:42

Distance
0.72 km

Speed
6.1 km/h

Energy
7 / 10

Estimated Reward
+18
```

The application tracks the user's movement during the session.

The user can walk or run.

---

# 8. Step 6 — Movement Is Verified

The application receives movement information from the user's device.

The system checks whether the user is actually moving.

For the hackathon MVP, the goal is not to build a sophisticated anti-cheat system.

The MVP only needs basic validation such as:

* Reasonable movement speed
* Reasonable distance
* Valid activity duration
* Valid session
* Sufficient Energy

Obviously invalid movement can be rejected.

---

# 9. Step 7 — User Finishes the Session

The user presses:

> STOP

The application shows a session summary.

Example:

```text
SESSION COMPLETE

Duration
10 minutes

Distance
1.2 km

Average Speed
7.2 km/h

Reward
+50

Durability
-3
```

The user now receives their reward.

---

# 10. Step 8 — User Receives Rewards

The user receives the game's reward token/currency.

For the MVP, the reward can be represented as a simple game token.

Example:

```text
Reward Balance

250
```

The reward is generated based on factors such as:

* Distance
* Activity duration
* Sneaker Efficiency
* Available Energy

A simple conceptual formula can be used:

```text
Activity
   ↓
Distance + Duration
   ↓
Sneaker Efficiency
   ↓
Reward Calculation
   ↓
User Reward
```

---

# 11. Step 9 — Sneaker Durability Decreases

Using the Sneaker consumes some of its durability.

Example:

Before activity:

```text
Durability: 100
```

After activity:

```text
Durability: 97
```

This creates an important game loop.

The user cannot simply earn rewards without spending anything.

Eventually, the user needs to repair the Sneaker.

---

# 12. Step 10 — User Repairs the Sneaker

The user opens the Sneaker screen.

They see:

```text
Sneaker #001

Durability
72 / 100

Repair Cost
20 Rewards

[ REPAIR ]
```

The user confirms the repair.

Their reward balance decreases.

The Sneaker's durability increases.

```text
Before

Rewards: 250
Durability: 72


After

Rewards: 230
Durability: 100
```

This creates a reward sink.

---

# 13. Step 11 — User Upgrades the Sneaker

The user can spend rewards to upgrade their Sneaker.

Example:

```text
Sneaker #001

Level
1 → 2

Efficiency
10 → 12

Upgrade Cost
50 Rewards

[ UPGRADE ]
```

The user confirms the upgrade.

The Sneaker becomes stronger.

The user now has:

```text
Sneaker #001

Level: 2
Efficiency: 12
Durability: 100
```

The upgraded Sneaker can potentially generate better rewards during future activity.

---

# 14. Step 12 — The Sneaker NFT Reflects the User's Asset

The Sneaker is the central NFT of the game.

The user owns it through their wallet.

The NFT represents:

```text
User's ownership
        +
Sneaker identity
        +
Sneaker attributes
        +
Game progression
```

The user can view their Sneaker as an NFT associated with their Monad wallet.

---

# 15. Step 13 — Sneaker Ownership

The ownership relationship is:

```text
User Wallet
     │
     │ owns
     ↓
Sneaker NFT
     │
     ├── Sneaker ID
     ├── Level
     ├── Efficiency
     └── Durability
```

This means the Sneaker is not simply an account entry belonging to the user.

It is an on-chain asset.

---

# 16. Step 14 — Sneaker Transfer

Because the Sneaker is an NFT, it can be transferred.

Example:

```text
User A
  │
  │ owns
  ↓
Sneaker #001
```

User A can transfer the Sneaker.

```text
User A
  │
  │ transfer
  ↓
Sneaker #001
  │
  ↓
User B
```

After the transfer:

```text
User A
does not own Sneaker #001

User B
owns Sneaker #001
```

This demonstrates the actual NFT ownership aspect of the project.

---

# 17. Step 15 — Basic Marketplace Concept

For the hackathon MVP, a complete marketplace is optional.

If included, the user can list their Sneaker.

Example:

```text
MY SNEAKER

Sneaker #001
Level: 5
Efficiency: 25
Durability: 94

Price:
10 MON

[ LIST FOR SALE ]
```

Another user can purchase it.

The flow becomes:

```text
Seller
  ↓
Lists Sneaker
  ↓
Marketplace
  ↓
Buyer
  ↓
Purchases Sneaker
  ↓
NFT ownership changes
```

The important demonstration is:

> A game item can move between users as an actual Monad NFT.

---

# 18. Complete User Economy

The complete MVP loop becomes:

```text
              USER
                │
                ↓
          Connect Wallet
                │
                ↓
           Own Sneaker
                │
                ↓
             Energy
                │
                ↓
          Walk / Run
                │
                ↓
        Activity Validation
                │
                ↓
         Reward Calculation
                │
                ↓
             Rewards
                │
        ┌───────┴────────┐
        ↓                ↓
      Repair           Upgrade
        │                │
        └───────┬────────┘
                ↓
         Better Sneaker
                │
                ↓
         More Activities
                │
                ↓
             Rewards
                │
                ↓
             Repeat
```

---

# 19. Where Monad Fits

Monad is used for the blockchain-owned part of the experience.

The key blockchain relationship is:

```text
User Wallet
     │
     ↓
   Monad
     │
     ↓
Sneaker NFT
```

The user interacts with the game through the application, while the Sneaker represents a real blockchain asset.

The hackathon demonstration should make it clear that:

> The Sneaker is an NFT on Monad, owned by the user's wallet.

---

# 20. What Happens During a Complete Session

A complete session can be presented like this:

```text
1. User opens game

        ↓

2. Wallet is connected

        ↓

3. User owns Sneaker #001

        ↓

4. User has 10 Energy

        ↓

5. User presses START

        ↓

6. User walks/runs

        ↓

7. Movement is tracked

        ↓

8. Activity is validated

        ↓

9. User presses STOP

        ↓

10. Reward is calculated

        ↓

11. User receives rewards

        ↓

12. Sneaker loses durability

        ↓

13. User repairs Sneaker

        ↓

14. User upgrades Sneaker

        ↓

15. Sneaker becomes stronger

        ↓

16. User starts another session
```

---

# 21. Hackathon Demo Flow

For the actual hackathon presentation, the entire project can be demonstrated in a few minutes.

### Demo 1 — Connect Wallet

Show the user connecting their Monad wallet.

```text
Wallet Connected
```

---

### Demo 2 — Show Sneaker NFT

Show:

```text
Sneaker #001

Level: 1
Efficiency: 10
Durability: 100

Owner:
Connected Wallet
```

Show that the Sneaker exists as an NFT on Monad.

---

### Demo 3 — Start Activity

Press:

```text
START
```

Show:

```text
Distance
Time
Speed
Energy
```

---

### Demo 4 — Finish Activity

Press:

```text
STOP
```

Show:

```text
SESSION COMPLETE

Reward: +50
Durability: -3
```

---

### Demo 5 — Upgrade

Use the earned reward.

```text
Level 1 → Level 2

Efficiency
10 → 12
```

Confirm the upgrade.

---

### Demo 6 — Show NFT

Return to the Sneaker.

Show that the user still owns the Sneaker NFT and that it represents their in-game asset.

---

### Demo 7 — Optional Transfer

Transfer the Sneaker to another wallet.

Show:

```text
Before:

Wallet A
   ↓
Sneaker #001


After:

Wallet B
   ↓
Sneaker #001
```

This is a strong demonstration of the blockchain component because the game asset actually changes ownership.

---

# 22. MVP Scope

The hackathon version should focus on:

```text
CORE

✓ Wallet connection
✓ Monad network
✓ Sneaker NFT
✓ Sneaker ownership
✓ Energy
✓ Walking/running session
✓ Activity tracking
✓ Reward calculation
✓ Rewards
✓ Durability
✓ Repair
✓ Sneaker upgrade
✓ NFT transfer
```

Optional:

```text
OPTIONAL

○ Marketplace
○ Sneaker buying/selling
○ Multiple Sneaker types
○ Multiple attributes
○ Leaderboard
○ Achievement system
```

Avoid for the first hackathon version:

```text
NOT NEEDED

✗ Multiple reward tokens
✗ Complex tokenomics
✗ Minting multiple generations of Sneakers
✗ Gems
✗ Mystery Boxes
✗ DAO
✗ Governance
✗ Complex marketplace
✗ Multiple chains
✗ Advanced anti-cheat
✗ Complex NFT breeding
```

---

# 23. The Core Product in One Sentence

> **A move-to-earn game where users own a Sneaker NFT on Monad, use it to participate in real-world walking/running activities, earn rewards, and spend those rewards to maintain and upgrade their on-chain Sneaker.**

---

# 24. The Complete MVP Loop

```text
                    ┌─────────────┐
                    │    USER     │
                    └──────┬──────┘
                           │
                           ↓
                   ┌───────────────┐
                   │ CONNECT WALLET│
                   └───────┬───────┘
                           │
                           ↓
                   ┌───────────────┐
                   │  MONAD NFT    │
                   │   SNEAKER     │
                   └───────┬───────┘
                           │
                           ↓
                     ┌───────────┐
                     │  ENERGY   │
                     └─────┬─────┘
                           │
                           ↓
                 ┌──────────────────┐
                 │   WALK / RUN     │
                 └────────┬─────────┘
                          │
                          ↓
                 ┌──────────────────┐
                 │ ACTIVITY TRACKED │
                 └────────┬─────────┘
                          │
                          ↓
                 ┌──────────────────┐
                 │ REWARD CALCULATED│
                 └────────┬─────────┘
                          │
                          ↓
                    ┌───────────┐
                    │  REWARDS  │
                    └─────┬─────┘
                          │
                ┌─────────┴─────────┐
                ↓                   ↓
          ┌───────────┐       ┌───────────┐
          │   REPAIR  │       │  UPGRADE  │
          └─────┬─────┘       └─────┬─────┘
                │                   │
                └─────────┬─────────┘
                          ↓
                  ┌───────────────┐
                  │ BETTER SNEAKER│
                  └───────┬───────┘
                          │
                          ↓
                    WALK / RUN
                          │
                          ↓
                         LOOP
```

---

# 25. What the Hackathon Judges Should Understand

The project demonstrates three things in one simple loop:

### Real-world activity

The user actually walks/runs.

### Game progression

The user earns rewards and improves their Sneaker.

### Blockchain ownership

The Sneaker is an actual NFT on Monad that belongs to the user's wallet and can be transferred.

The blockchain is therefore not just being used as a database.

The **core game asset is actually owned by the player.**

---

# 26. Final MVP Definition

The project is complete when a new user can:

```text
Connect Monad Wallet
        ↓
Receive/own a Sneaker NFT
        ↓
See their Sneaker
        ↓
Receive Energy
        ↓
Start a walking/running session
        ↓
Complete the session
        ↓
Receive rewards
        ↓
Lose Sneaker durability
        ↓
Spend rewards to repair
        ↓
Spend rewards to upgrade
        ↓
See their upgraded Sneaker
        ↓
Transfer the Sneaker to another wallet
```

That is the entire hackathon MVP.

Everything else can be built later around this core loop.
