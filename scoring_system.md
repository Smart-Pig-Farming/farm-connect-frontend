# Scoring System Proposal

## Guiding Principles

**Quality over Quantity:** Reward is tied to community validation (upvotes, moderator approval), not just the act of posting.

**Fair & Transparent Justice:** The penalty system is corrective, not just punitive, with clear, escalating consequences.

**Endless Progression:** The journey doesn't end at the "max level," creating long-term goals for the most dedicated users.

## Part 1: The Dynamic Scoring System

This model replaces static point values with a system that responds to community feedback.

| **Action / Event**                          | **Points Awarded**                                   | **Rationale & Details**                                                                                        |
| ------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Create a New Post                           | +2                                                   | Small reward for starting a conversation.                                                                      |
| Receive Upvotes on Your Post/Reply          | +1 per upvote                                        | Core quality incentive determined by community.                                                                |
| Give a reaction on a post (upvote/downvote) | +1                                                   | Encourages engagement without enabling vote-trading.                                                           |
| Receive a "Moderator Approved" Stamp        | +15                                                  | Significant bonus for exceptional content.                                                                     |
| Reply to a Post                             | +1 to the replier, +1 to the parent                  | Minimal reward; further points from upvotes. Promotes engagement; parent gets rewarded for drawing discussion. |
| Receive Downvote on Your Post/Reply         | -1                                                   | Immediate feedback for low-quality contributions.                                                              |
| Complete a quiz                             | with passing grade(70%) +5, without passing grade +1 |
| Read an unread practice                     | +1                                                   |                                                                                                                |

### Nested Reply Trickle-Down Voting

When a reply is voted on, points **cascade upwards** through the chain (max 3 levels deep) with **fractional trickle** based on distance.

- **Immediate Parent (1 level up):** ±1
- **Grandparent (2 levels up):** ±0.5
- **Root Post (3 levels up):** ±0.25

AI semantic check decides whether reply is **supportive** or **contradictory** to parent.

#### Rules for Voting on Replies

- **Supportive Reply**

  - **Upvote:** Replier +1, Parent +1, Grandparent +0.5, Root +0.25
  - **Downvote:** Replier -1 (no trickle-up effects)

- **Contradictory Reply**
  - **Upvote:** Replier +1, Parent -1, Grandparent -0.5, Root -0.25
  - **Downvote:** Replier -1, Parent +1, Grandparent +0.5, Root +0.25

### Growth Streak System

Rewards consistent daily logins with modest bonuses. Implementation highlights:

- Each successful login on a new calendar day extends the streak; a gap of 2+ days resets it to 1.
- Same-day repeat logins are idempotent (no double increment).
- Milestone bonuses are awarded once at exact lengths: 7 / 30 / 90 / 180 / 365.
- After surpassing 365, streak continues counting (no extra bonuses yet) for future expansion.
- API exposes: `current`, `best`, `lastDay`, plus (soon) `nextMilestone` & `daysToNext` for UI progress bars.
- Idempotency is enforced with a unique `(user_id, event_type, ref_id)` partial index so a milestone bonus can't be double-applied under race conditions.
- Timezone currently defaults to UTC; future work: store user timezone & evaluate day boundaries in that zone.

| **Streak Length (Exact)** | **Bonus Points** | **Notes**              |
| ------------------------- | ---------------- | ---------------------- |
| 7                         | +5               | First week consistency |
| 30                        | +10              | One month              |
| 90                        | +15              | Quarter year           |
| 180                       | +20              | Half year              |
| 365                       | +25              | Full year              |

Future extensions under consideration: grace tokens (freeze), repeating annual bonuses, timezone personalization.

## Part 2: The Fair Penalty & Moderation System

| **Event**                  | **Consequence**     | **Rationale & Details**                              |
| -------------------------- | ------------------- | ---------------------------------------------------- |
| Content Reported by User   | No immediate change | Prevents abuse via report bombing.                   |
| Report Confirmed Violation | -5 points           | Applied only after moderator confirmation.           |
| Report Confirmed Violation | +1 points           | To the person that reported the post.                |
| Report Rejected            | +1 point            | Compensates for false reports and discourages abuse. |
| Receive Downvote           | -1 point            | Direct feedback on content quality.                  |

## Part 3: The Leveling & Prestige System

Ensures ongoing goals for power users.

### Core Levels

- **Level 1:** Newcomer (0-20 pts)
- **Level 2:** Amateur (21-149 pts)
- **Level 3:** Contributor (150-299 pts)
- **Level 4:** Knight (300-599 pts)
- **Level 5:** Expert (600+ pts) — Gateway to endgame

### Prestige Ranks

- **Expert I (Bronze):** Expert + 1,000 pts & 10 Moderator Approved posts
- **Expert II (Silver):** Expert I + 2,500 pts & 50 Moderator Approved posts
- **Expert III (Gold):** Expert II + 10,000 pts
- **Moderator:** Expert III + Admin approval; full moderation rights (except user management)

Let me know if you also want similar real-time updates for reply votes or refactoring reaction constants.
