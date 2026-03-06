# NextNest — App Store Connect Metadata

Use this information when creating your app listing in App Store Connect.

---

## App Identity

| Field | Value |
|-------|-------|
| Platform | iOS |
| App Name | NextNest |
| Bundle ID | com.nextnest.app |
| SKU | nextnest-ios-v1 |
| Primary Language | English (U.S.) |
| Category | Lifestyle |
| Secondary Category | Productivity |
| Content Rating | 4+ |

---

## Version 1.0 Metadata

### App Name (30 characters max)
```
NextNest
```

### Subtitle (30 characters max)
```
Your Personalized Move Plan
```

### Description (4000 characters max)
```
NextNest transforms the chaos of moving into a clear, actionable plan — personalized to your timeline, budget, and life situation.

Whether you're buying, renting, or relocating for work, NextNest guides you through every step of the process with a structured timeline, budget estimates, and milestone tracking.

HOW IT WORKS

1. Complete a quick 3-minute intake about your move — where you're going, when, and what matters most to you.

2. NextNest generates a personalized relocation plan with a structured timeline, budget guidance, and monthly priorities.

3. Track your progress on your dashboard with a move countdown, readiness score, and milestone checklist. Mark tasks complete as you go.

WHAT YOU GET

- Move Countdown: See exactly how many days until your move and stay on track.

- Relocation Timeline: A structured list of milestones tailored to your move type (buying, renting, or selling), timeline flexibility, and household size.

- Monthly Priorities: Know exactly what to focus on each month so nothing falls through the cracks.

- Budget Guidance: Estimated costs for moving companies, travel, temporary housing, closing costs, utilities, and more.

- Readiness Score: A real-time measure of how prepared you are, updated as you complete milestones.

- Smart Reminders: Receive timely email reminders about upcoming deadlines, with frequency increasing as your move date approaches.

NextNest is built for real people making real moves. No clutter, no upsells — just a calm, organized experience that helps you feel in control.

Start planning your move today.
```

### Keywords (100 characters max, comma-separated)
```
moving,relocation,move planner,moving checklist,move countdown,home buying,renting,moving budget
```

### Promotional Text (170 characters max, can be updated without a new version)
```
Plan your move with confidence. NextNest creates a personalized timeline, budget, and milestone tracker — so you can focus on your next chapter.
```

---

## URLs

| Field | Value |
|-------|-------|
| Privacy Policy URL | https://nextnest-web-production.up.railway.app/privacy |
| Support URL | https://nextnest-web-production.up.railway.app |
| Marketing URL | https://nextnest-web-production.up.railway.app |

> Note: The privacy policy page must be accessible (currently returning 404 — redeploy needed).

---

## App Review Information

### Review Notes
```
NextNest is a relocation planning platform. After completing a 3-minute intake questionnaire, users receive a personalized move plan with timeline milestones, budget estimates, and a readiness score.

Authentication uses passwordless magic link sign-in — enter an email address and click the link sent to that email.

The app loads content from our production web server (https://nextnest-web-production.up.railway.app) and uses native iOS capabilities including push notifications, haptic feedback, and deep linking.
```

### Demo Account
```
Email: review@nextnest.app
```
> You will need to create this account and ensure a magic link can be sent to it, OR provide App Review with a direct dashboard URL that bypasses auth.

---

## App Privacy Details (Data Collection)

### Data Types Collected

| Data Type | Collected | Linked to User | Used for Tracking |
|-----------|-----------|-----------------|-------------------|
| Email Address | Yes | Yes | No |
| Usage Data (milestone completions) | Yes | Yes | No |
| Diagnostics | No | — | — |
| Precise Location | No | — | — |
| Financial Info | No | — | — |
| Health & Fitness | No | — | — |
| Contacts | No | — | — |
| Photos or Videos | No | — | — |
| Search History | No | — | — |
| Browsing History | No | — | — |
| Identifiers | No | — | — |
| Purchases | No | — | — |
| Sensitive Info | No | — | — |

### Purposes
- **Email Address**: App Functionality (authentication via magic link, sending move reminders)
- **Usage Data**: App Functionality (tracking milestone progress, calculating readiness score)

---

## Screenshots Required

### iPhone 6.9" Display (required)
Resolution: 1320 x 2868 or 1290 x 2796 pixels

Suggested screenshots (5-10):
1. Landing page with "Build My Move Plan" CTA
2. Intake flow — first question
3. Plan generation loading screen
4. Dashboard overview with countdown and readiness score
5. Timeline view with milestones
6. Budget overview

### iPad 13" Display (if supporting iPad)
Resolution: 2064 x 2752 pixels

> Take screenshots from the iOS Simulator once Xcode is installed.
> In Simulator: File > Save Screen (Cmd+S) or use `xcrun simctl io booted screenshot`

---

## Age Rating Questionnaire Answers

| Question | Answer |
|----------|--------|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Violence | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | None |
| Alcohol, Tobacco, or Drug Use | None |
| Simulated Gambling | None |
| Sexual Content or Nudity | None |
| Unrestricted Web Access | No |
| Gambling with Real Currency | No |

Result: **Rated 4+**

---

## Export Compliance

Already handled in Info.plist:
- `ITSAppUsesNonExemptEncryption` = `NO`

The app uses HTTPS (standard TLS) which is exempt from export compliance documentation.
