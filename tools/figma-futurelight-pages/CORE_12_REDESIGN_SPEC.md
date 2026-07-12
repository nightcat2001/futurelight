# FutureLight Core 12 High-Fidelity Redesign Spec

## Status

TASK STATUS: IN PROGRESS

The previous 79-screen output is rejected. Rebuild starts with 12 core high-fidelity product screens. Do not expand to 79 screens until these 12 pass review.

## Required User Flow

```text
Download / open
-> first launch
-> parent sign in
-> create child
-> enter age
-> AI recommends story
-> start playback
-> story ends
-> recommend next action
-> daily task
-> parent-child interaction
-> bedtime mode
```

## Core 12 Screens

### FL-HF-01 First Launch

- Audience: parent
- User goal: understand within 3 seconds that this is a parent-managed 0-6 story and growth app.
- Layout family: first-run product orientation
- UI structure: immersive illustrated welcome, parent trust strip, single setup CTA, privacy reassurance below fold.
- Primary CTA: Set up my child
- Must not look like: generic landing page, feature card grid, page spec card.

### FL-HF-02 Parent Login

- Audience: parent
- User goal: securely access parent-managed child profiles.
- Layout family: parent authentication
- UI structure: compact form, parent-only security explanation, recovery path, account creation secondary action.
- Primary CTA: Log in
- States: loading, invalid password, network error, account not found, success.

### FL-HF-03 Create Child

- Audience: parent
- User goal: create one child profile without exposing adult setup to the child.
- Layout family: parent setup form
- UI structure: profile card preview, name field, avatar selector, parent-only explanation.
- Primary CTA: Continue to age
- Child safety: no child independent account.

### FL-HF-04 Age Selection

- Audience: parent
- User goal: choose age band and understand how it changes UI complexity.
- Layout family: age-band decision
- UI structure: three large age panels with cognitive design differences, recommended indicator, parent explanation.
- Primary CTA: Use this age band
- Must prove: 0-2 no reading, 3-4 picture choices, 5-6 short recall.

### FL-HF-05 AI Story Recommendation

- Audience: parent
- User goal: trust why the first story is recommended.
- Layout family: recommendation explanation
- UI structure: story cover, age-fit reason, learning signal tags, duration, parent choice controls.
- Primary CTA: Play story
- Must not be: black-box AI card.

### FL-HF-06 Child Story Player

- Audience: child with parent nearby
- User goal: listen and interact using visual/audio controls, not reading.
- Layout family: child playback
- UI structure: full-screen illustrated story scene, oversized play/pause, progress dots, parent exit, voice cue.
- Primary CTA: large play/pause control
- States: play, pause, buffer, offline cached, complete.

### FL-HF-07 Story Complete

- Audience: child
- User goal: understand the story ended and see one gentle next step.
- Layout family: child completion
- UI structure: calm celebration, no addictive streak wall, one visual prompt, parent handoff.
- Primary CTA: Ask together
- Child safety: no endless autoplay.

### FL-HF-08 Next Recommendation

- Audience: parent
- User goal: choose whether to continue, stop, or save next story.
- Layout family: parent decision after child session
- UI structure: one recommended story, reason, stop option, bedtime guardrail.
- Primary CTA: Save for later
- Secondary CTA: Play next

### FL-HF-09 Daily Task

- Audience: parent
- User goal: start a short growth activity tied to the story.
- Layout family: parent-led task
- UI structure: prep time, prompt script, accepted child responses, start button, skip/save.
- Primary CTA: Start with child
- States: not started, in progress, skipped, completed.

### FL-HF-10 Parent-Child Interaction

- Audience: parent and child
- User goal: do one shared prompt with visual child response.
- Layout family: shared interaction
- UI structure: parent script top, child visual choices center, parent confirmation bottom.
- Primary CTA: Mark done
- Role separation: parent reads, child taps.

### FL-HF-11 Parent Center

- Audience: parent
- User goal: manage privacy, progress, limits, child profiles, and support.
- Layout family: parent dashboard
- UI structure: profile switcher, progress summary, controls, privacy actions, support entry.
- Primary CTA: Review progress
- Must not expose: child-facing controls.

### FL-HF-12 Bedtime Mode

- Audience: parent and child
- User goal: enter low-stimulation playback and stop safely after one story.
- Layout family: bedtime environment
- UI structure: dim theme, soft sound controls, timer, one story, no autoplay, parent exit.
- Primary CTA: Start bedtime story
- Motion: slow fade, no sudden movement, reduced-motion fallback.

## Design System Requirements

- Separate parent and child visual systems.
- Parent UI: clear hierarchy, small dense controls allowed, trust and privacy visible.
- Child UI: large tap targets, image/audio/action first, no reading dependency.
- Bedtime UI: dim, low contrast movement, no surprise audio, no autoplay chain.
- Every core screen needs unique component tree and layout family.

## Validation Rules For Core 12

- Max layout similarity: 45%.
- No repeated Hero + Cards template.
- No SVG poster or catalog output.
- Each screen must have actual app chrome or intentional full-screen mode.
- Each screen must show loading, empty, error, success, or offline state strategy.
- Each screen must pass PM, UX, UI, child safety, accessibility, responsive, and content review before expansion.

## Next Implementation Step

Replace the current 79-page renderer with a `core12Specs` driven renderer first. Generate only these 12 high-fidelity screens, validate, inspect, then expand.
