# Page Specs

## FL-HTML-01 First Launch

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Convert first open into trusted child setup.
- User Goal: Understand the product and begin setup within one tap.
- Pain: The parent needs proof this is child-safe before giving any data.
- Sitemap: Entry / onboarding
- Navigation: No bottom navigation; setup and login exits only.
- Journey: Download -> first open -> trust check -> setup
- User Flow: Open app, read one promise, inspect safety proof, start setup.
- Task Flow: Review value, confirm parent-managed model, tap Set up my child.
- Layout Family: Immersive welcome with trust strip
- Components: brand mark, story world preview, trust strip, primary CTA, login link
- Primary CTA: Set up my child
- Secondary CTA: I already have an account
- Copy: Stories, growth, and bedtime for ages 0-6. Parent managed. No child account.
- Illustration: Bright parent-and-child reading scene with gentle blocks and moon lamp.
- Interaction: CTA advances to parent login; login link opens returning parent flow.
- Animation: Hero art fades in once; reduced motion uses no transform.
- Accessibility: Single H1, CTA first after explanation, contrast above AA, touch target 56px.
- Child Safety: No direct child data entry; adult consent before child profile.
- Responsive: 320-412px single column; tablet centers the phone-width journey card.
- API: not applicable: no network before consent
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Parent sees value within 3 seconds. | No child account is requested. | Only two forward choices are visible.
- Test IDs: T-FIRST-001, T-A11Y-001, T-SAFE-001

## FL-HTML-02 Parent Login

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Create a consented parent session.
- User Goal: Log in without exposing adult credentials to the child.
- Pain: Parents need a fast but secure gate before managing child data.
- Sitemap: Entry / authentication
- Navigation: Back to first launch; continue to child profile.
- Journey: First open -> login -> child setup
- User Flow: Choose email or passkey, read privacy note, submit credentials.
- Task Flow: Enter email, enter password, log in, recover from validation errors.
- Layout Family: Secure form with consent panel
- Components: email field, password field, privacy summary, login CTA, help link
- Primary CTA: Log in
- Secondary CTA: Create parent account
- Copy: Parent account required for consent, privacy choices, and progress review.
- Illustration: Small lock and family notebook beside the form.
- Interaction: Inline validation; submit locks button and shows loading state.
- Animation: Field errors slide down 120ms; reduced motion shows instant message.
- Accessibility: Labels are explicit; errors use aria-live; tab order follows form order.
- Child Safety: Adult-only authentication; no child-facing encouragement to enter data.
- Responsive: Form fields remain full width; help content moves under form on narrow screens.
- API: POST /auth/session
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Invalid email shows inline error. | Password is never shown by default. | Privacy note links to parent policy.
- Test IDs: T-AUTH-001, T-ERROR-001, T-A11Y-002

## FL-HTML-03 Create Child

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Collect minimal child profile data for safe personalization.
- User Goal: Create a child profile with only necessary information.
- Pain: Parents dislike apps asking for excessive child data.
- Sitemap: Onboarding / child profile
- Navigation: Back to login; continue to age band.
- Journey: Login -> create child -> age input
- User Flow: Enter display name, choose avatar, confirm data minimization.
- Task Flow: Type nickname, select visual avatar, save profile.
- Layout Family: Profile builder with data minimization checklist
- Components: nickname field, avatar picker, data checklist, save CTA
- Primary CTA: Continue to age
- Secondary CTA: Skip avatar
- Copy: Use a nickname. We do not need a full name, photo, or birthday.
- Illustration: Friendly guide character with selectable color badges.
- Interaction: Avatar selection updates preview and save state.
- Animation: Selected avatar gently scales once; reduced motion uses outline only.
- Accessibility: Avatar choices have text labels; nickname field has helper text.
- Child Safety: No full name, photo, location, school, or contact request.
- Responsive: Avatar grid becomes two columns at 320px.
- API: POST /children
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Full legal name is not requested. | Save stays disabled until nickname exists. | Avatar has accessible name.
- Test IDs: T-CHILD-001, T-PRIVACY-001, T-STATE-001

## FL-HTML-04 Age Band

- Audience: Parent
- Age Band: 0-2, 3-4, 5-6 child bands
- Business Goal: Set the cognitive baseline for recommendations.
- User Goal: Choose the child's age band and understand why it matters.
- Pain: Parents need confidence that content matches development stage.
- Sitemap: Onboarding / age band
- Navigation: Back to child profile; continue to recommendation.
- Journey: Create child -> choose age -> recommendation
- User Flow: Compare age bands, read ability notes, select one band.
- Task Flow: Select 0-2, 3-4, or 5-6, review guidance, confirm.
- Layout Family: Age-specific comparison panels
- Components: age cards, ability notes, parent tip, confirm CTA
- Primary CTA: Use this age band
- Secondary CTA: Ask me later
- Copy: Age changes story length, visual cues, questions, and bedtime pacing.
- Illustration: Three developmental cards: look, name, tell.
- Interaction: Selecting a band updates recommendation explanation.
- Animation: Panel content crossfades; reduced motion swaps instantly.
- Accessibility: Cards are radio buttons; selected state has text and border.
- Child Safety: Age bands prevent reading-heavy UI for non-readers.
- Responsive: Cards stack vertically on phones and form columns on tablet.
- API: PATCH /children/:id/age-band
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: 2-year-old path states visual-first guidance. | Selection is screen-reader announced. | No precise birthdate required.
- Test IDs: T-AGE-001, T-COG-001, T-A11Y-003

## FL-HTML-05 AI Story Recommendation

- Audience: Parent
- Age Band: Selected child age band
- Business Goal: Start the first story with explainable personalization.
- User Goal: Pick a recommended story and know why it fits.
- Pain: Parents do not trust black-box AI recommendations for children.
- Sitemap: Home / today's story
- Navigation: Bottom nav appears; play or browse alternatives.
- Journey: Age band -> recommendation -> story player
- User Flow: Review recommended story, inspect fit reasons, start play.
- Task Flow: Read story card, verify age fit, tap Play story.
- Layout Family: Explainable recommendation card plus alternatives
- Components: story hero, fit reasons, skill chips, alternative list, play CTA
- Primary CTA: Play story
- Secondary CTA: See other stories
- Copy: Recommended because Mia chose age 3-4, calm animals, and bedtime-friendly pacing.
- Illustration: Forest story cover with soft animal characters.
- Interaction: Alternative cards preview fit reasons before selecting.
- Animation: Story card expands into player route; reduced motion uses fade.
- Accessibility: Recommendation reasons are text, not only color chips.
- Child Safety: No scary imagery, conflict, ads, or manipulative countdowns.
- Responsive: Recommendation remains first; alternatives scroll horizontally on H5.
- API: GET /recommendations?childId=:id
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Recommendation explains age fit. | Parent can reject recommendation. | Story start is one primary CTA.
- Test IDs: T-REC-001, T-PM-001, T-SAFE-002

## FL-HTML-06 Child Story Player

- Audience: Child with parent nearby
- Age Band: 0-6, adapted by selected band
- Business Goal: Deliver the core story experience safely.
- User Goal: Listen, look, pause, and follow the story without reading.
- Pain: Young children cannot use text-heavy playback controls.
- Sitemap: Story / playback
- Navigation: Back requires parent confirmation; finish leads to reflection.
- Journey: Recommendation -> playback -> story end
- User Flow: Listen to page, use large controls, reach story end.
- Task Flow: Tap play or pause, swipe page, adjust volume with parent gate.
- Layout Family: Immersive child player with oversized controls
- Components: story art, progress dots, large play button, sound toggle, parent gate
- Primary CTA: Play or pause
- Secondary CTA: Parent controls
- Copy: Look at the sleepy fox. Tap the big button to hear the next line.
- Illustration: Full-screen calm illustrated scene with one focal character.
- Interaction: Large central control toggles playback; swipe moves one story beat.
- Animation: Scene pans slowly; reduced motion uses still image.
- Accessibility: Audio captions available to parent; controls have labels.
- Child Safety: No external links, purchases, ads, chat, or adult settings in child UI.
- Responsive: Controls stay inside thumb zone and above device safe area.
- API: GET /stories/:id/pages and POST /progress/events
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Primary control is at least 72px. | Parent controls are gated. | Offline cached story can continue.
- Test IDs: T-PLAYER-001, T-OFFLINE-001, T-CHILD-UI-001

## FL-HTML-07 Story Complete

- Audience: Child and parent
- Age Band: 0-6, visual-first
- Business Goal: Convert completion into learning reflection.
- User Goal: Celebrate gently and answer one simple prompt.
- Pain: Overstimulating rewards can disrupt bedtime and attention.
- Sitemap: Story / completion
- Navigation: Ask together, next story, or bedtime path.
- Journey: Playback -> story complete -> reflection
- User Flow: See completion, answer one question, choose next step.
- Task Flow: Review visual recap, tap one feeling answer, continue.
- Layout Family: Calm completion with one reflection prompt
- Components: completion scene, single prompt, visual answer buttons, next CTA
- Primary CTA: Ask together
- Secondary CTA: Choose next story
- Copy: The fox found the quiet light. How did the fox feel?
- Illustration: Soft recap card showing the ending moment.
- Interaction: Answer buttons give gentle audio and visual confirmation.
- Animation: Small sparkle fade only; bedtime removes celebration motion.
- Accessibility: Prompt can be read aloud; visual answers include labels.
- Child Safety: No streak pressure, no variable reward loop, no social comparison.
- Responsive: Answer buttons form a two-by-two visual grid on phones.
- API: POST /progress/reflection
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Only one prompt is shown. | Reward is calm. | Parent can skip reflection.
- Test IDs: T-COMPLETE-001, T-REWARD-001, T-BEDTIME-SAFE-001

## FL-HTML-08 Next Recommendation

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Guide the next session without endless scrolling.
- User Goal: Choose continue, save, or stop confidently.
- Pain: Parents need boundaries after a child finishes content.
- Sitemap: Story / next step
- Navigation: Home, saved list, bedtime, or daily task.
- Journey: Story complete -> next recommendation -> task or bedtime
- User Flow: Review next option, inspect time estimate, decide.
- Task Flow: Choose next story, save for later, or start bedtime mode.
- Layout Family: Decision board with time and stimulation labels
- Components: next story card, time badge, calmness meter, save action, stop action
- Primary CTA: Save for later
- Secondary CTA: Start now
- Copy: Next best: The Little Rain Drum. 4 minutes. Calm pace.
- Illustration: Mini cover paired with time and energy indicators.
- Interaction: Selecting stop recommends bedtime or parent task.
- Animation: Cards slide less than 16px; reduced motion disables movement.
- Accessibility: Time and calmness are text; not color-only.
- Child Safety: No infinite autoplay; next story requires parent decision.
- Responsive: Decision cards stack; destructive stop is visually separated.
- API: GET /recommendations/next
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No autoplay chain. | Time estimate is visible. | Stop option is equal clarity.
- Test IDs: T-NEXT-001, T-DARKPATTERN-001, T-UX-001

## FL-HTML-09 Daily Parent Task

- Audience: Parent
- Age Band: Adult caregiver leading child
- Business Goal: Extend story into one realistic parent-child activity.
- User Goal: Complete a short daily task with the child.
- Pain: Parents need easy follow-up activities, not homework.
- Sitemap: Daily tasks
- Navigation: Task tab with back to home and completion route.
- Journey: Next recommendation -> daily task -> parent interaction
- User Flow: Read task, gather object, start with child, mark progress.
- Task Flow: Choose 3-minute task, follow steps, mark done or skip.
- Layout Family: Checklist activity with object cue
- Components: task card, object cue, three steps, timer, mark done CTA
- Primary CTA: Start with child
- Secondary CTA: Skip today
- Copy: Find something soft. Ask: What sound would it make in the rain story?
- Illustration: Soft object and rain drum activity visual.
- Interaction: Timer starts only after parent taps start; skip asks for reason.
- Animation: Timer ring progresses smoothly; reduced motion uses numeric timer.
- Accessibility: Steps are ordered text; timer does not rely on animation.
- Child Safety: Activity uses safe household object and adult supervision.
- Responsive: Checklist remains readable with 48px rows at 320px.
- API: GET /daily-tasks and POST /tasks/:id/start
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Task takes under 5 minutes. | Adult supervision is explicit. | Skip path exists.
- Test IDs: T-TASK-001, T-SUPERVISION-001, T-STATE-002

## FL-HTML-10 Parent Child Interaction

- Audience: Parent and child together
- Age Band: 3-6 with parent adaptation
- Business Goal: Increase parent-child engagement quality.
- User Goal: Guide a simple conversation without scripting the child.
- Pain: Parents want prompts that feel natural, not robotic.
- Sitemap: Daily tasks / interaction
- Navigation: From daily task; exit to progress dashboard.
- Journey: Daily task -> interaction -> progress
- User Flow: Read parent prompt, child responds visually or verbally, parent marks outcome.
- Task Flow: Ask, observe, choose response type, save note.
- Layout Family: Split-role interaction board
- Components: parent prompt, child visual choices, observation note, mark done CTA
- Primary CTA: Mark done
- Secondary CTA: Save note only
- Copy: Parent asks: Which sound was soft? Child can point, say, or tap.
- Illustration: Two-panel parent-child prompt with pointing choices.
- Interaction: Parent notes response; child choices are large and optional.
- Animation: Choice confirmation pulses once; reduced motion uses check mark.
- Accessibility: Parent instructions and child choices are separated semantically.
- Child Safety: Does not grade the child; accepts pointing, sound, or silence.
- Responsive: Parent panel appears before child choices on small screens.
- API: POST /interactions
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No wrong-answer language. | Multiple response modes are accepted. | Parent note can be saved privately.
- Test IDs: T-INTERACT-001, T-INCLUSION-001, T-NOTE-001

## FL-HTML-11 Parent Dashboard

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Show growth signals and next best parent action.
- User Goal: Review progress without over-measuring the child.
- Pain: Parents need insight but not pressure or comparison.
- Sitemap: Parent center / progress
- Navigation: Parent tab; links to privacy, export, settings, bedtime.
- Journey: Interaction -> progress review -> bedtime
- User Flow: Review week, read pattern, choose next action.
- Task Flow: Open dashboard, inspect signal cards, start bedtime or privacy action.
- Layout Family: Parent analytics with humane progress language
- Components: weekly summary, skill signals, privacy shortcuts, bedtime CTA
- Primary CTA: Review progress
- Secondary CTA: Start bedtime
- Copy: Mia listened calmly 4 times and answered with pointing twice this week.
- Illustration: Gentle progress cards, no leaderboard.
- Interaction: Cards expand for evidence; privacy actions require parent session.
- Animation: Charts fill once; reduced motion shows completed bars.
- Accessibility: Charts include text summaries and table fallback.
- Child Safety: No comparison, ranking, public sharing, or pressure metrics.
- Responsive: Cards become one-column and retain data labels.
- API: GET /progress/summary
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Progress is descriptive, not competitive. | Privacy shortcut is visible. | Chart has text equivalent.
- Test IDs: T-DASH-001, T-PRIVACY-002, T-A11Y-004

## FL-HTML-12 Bedtime Mode

- Audience: Parent and child
- Age Band: 0-6 bedtime context
- Business Goal: Support repeat usage in a calm nightly routine.
- User Goal: Start a low-stimulation story and end cleanly.
- Pain: Parents need the app to help bedtime, not extend screen time.
- Sitemap: Bedtime
- Navigation: From dashboard or next recommendation; exits to lock screen.
- Journey: Progress review -> bedtime -> end session
- User Flow: Dim interface, choose calm story, play, end with no autoplay.
- Task Flow: Set duration, start bedtime story, finish and lock next actions.
- Layout Family: Low-stimulation night routine
- Components: dim theme, duration picker, calm story card, night controls, end session CTA
- Primary CTA: Start bedtime story
- Secondary CTA: End tonight
- Copy: One calm story. No autoplay. Screen dims after the final page.
- Illustration: Moonlit room, soft blanket, single calm focal image.
- Interaction: Duration picker changes story length; end disables next-story prompts.
- Animation: No bounce; only slow opacity. Reduced motion uses static dimming.
- Accessibility: High contrast in dark mode; audio can continue with screen dimmed.
- Child Safety: No autoplay, no streak, no bright reward, no endless scroll.
- Responsive: Controls stay low in thumb zone; dark mode respects safe areas.
- API: POST /bedtime/session
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No next-story autoplay. | End state is obvious. | Brightness and motion are reduced.
- Test IDs: T-BEDTIME-001, T-MOTION-001, T-AUTOPLAY-001

