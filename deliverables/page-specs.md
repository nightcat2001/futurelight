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
- Layout Family: Immersive first-run trust strip
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

## FL-HTML-13 Splash

- Audience: Parent and child nearby
- Age Band: 0-6 family entry
- Business Goal: Confirm app identity and load cached session safely.
- User Goal: Recognize FutureLight and continue without confusion.
- Pain: First launch can feel untrusted if branding and loading are unclear.
- Sitemap: Entry / launch
- Navigation: Auto advances only after session check; parent can open help.
- Journey: App open -> identity -> session check -> next route
- User Flow: Launch, verify brand, wait for session result.
- Task Flow: Open app, read brand, wait for route decision.
- Layout Family: Launch identity with session status rail
- Components: brand identity, session status, safe loading, help action
- Primary CTA: Continue
- Secondary CTA: Help
- Copy: FutureLight opens with a calm identity screen and checks whether a parent session exists.
- Illustration: Soft light mark with reading guide and child-safe loading rail.
- Interaction: Auto route waits for session result; help opens parent support.
- Animation: Brand mark breathes once; reduced motion uses static mark.
- Accessibility: Brand text has readable contrast; loading status is announced.
- Child Safety: No child input, no tracking prompt, no external link.
- Responsive: Keeps a centered mark at 320 and expands status rail on tablet.
- API: GET /session/status
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No session routes to onboarding; valid session routes to child home. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-SPLASH-001, FL-HTML-13-NAV, FL-HTML-13-RECOVERY

## FL-HTML-14 Onboarding

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Explain the product model before account creation.
- User Goal: Understand story, growth, privacy, and bedtime value.
- Pain: Parents reject vague AI products that do not explain control.
- Sitemap: Entry / onboarding
- Navigation: Back to splash; next to consent.
- Journey: Splash -> onboarding -> consent
- User Flow: Read three concrete product promises, continue to consent.
- Task Flow: Swipe or tap through concise cards, then continue.
- Layout Family: Three-panel product promise carousel
- Components: promise cards, progress dots, parent control note, continue CTA
- Primary CTA: Review consent
- Secondary CTA: Back
- Copy: Stories are recommended by age, parent controls privacy, bedtime ends without autoplay.
- Illustration: Three cards: story, growth, bedtime with concrete child-safe visuals.
- Interaction: Dots and next button move one card; final CTA goes to consent.
- Animation: Cards slide 120ms; reduced motion swaps instantly.
- Accessibility: Cards use headings and are reachable by keyboard.
- Child Safety: No AI claim without parent control explanation.
- Responsive: One card per view on phones; three columns on tablet.
- API: not applicable: local onboarding content
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Final card unlocks consent route. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-ONBOARD-001, FL-HTML-14-NAV, FL-HTML-14-RECOVERY

## FL-HTML-15 Parent Register

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Create a parent account for consent and data rights.
- User Goal: Register with minimal required information.
- Pain: Parents need account setup without unnecessary child data.
- Sitemap: Entry / authentication
- Navigation: Back to login; next to consent or create child.
- Journey: Onboarding -> register -> consent
- User Flow: Enter parent email, create passphrase, accept account terms.
- Task Flow: Fill parent fields, submit, recover from validation errors.
- Layout Family: Parent registration form with privacy promise
- Components: email field, passphrase field, privacy promise, submit CTA
- Primary CTA: Create parent account
- Secondary CTA: Use existing account
- Copy: Parent email is used for consent, deletion, export, and support.
- Illustration: Secure parent notebook illustration.
- Interaction: Validation appears inline; success routes to consent.
- Animation: Error messages reveal below fields; reduced motion is instant.
- Accessibility: Labels, errors, and password rules are explicit.
- Child Safety: Adult-only form; no child name or age requested here.
- Responsive: Full-width form on phones; support panel on tablet.
- API: POST /parents
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Email already used shows recovery path. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-REGISTER-001, FL-HTML-15-NAV, FL-HTML-15-RECOVERY

## FL-HTML-16 Consent

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Collect informed parental consent before personalization.
- User Goal: Understand and approve child data use.
- Pain: Consent can be skipped or hidden in low-quality child apps.
- Sitemap: Entry / consent
- Navigation: Back to onboarding/register; next to create child.
- Journey: Register -> consent -> create child
- User Flow: Review child data summary, toggle permissions, accept.
- Task Flow: Read data use, open details, accept or decline.
- Layout Family: Consent ledger with explicit toggles
- Components: data summary, permission toggles, policy links, accept CTA
- Primary CTA: Accept and continue
- Secondary CTA: Decline for now
- Copy: We use nickname, age band, story progress, and parent notes to personalize safely.
- Illustration: Parent consent ledger with check marks and data categories.
- Interaction: Toggles update summary; decline offers local-only explanation.
- Animation: Toggle feedback uses check mark; reduced motion no slide.
- Accessibility: Toggles have labels and state text.
- Child Safety: No personalization starts before adult consent.
- Responsive: Toggles stack on mobile; details open as bottom sheet.
- API: POST /consent
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Decline routes to limited mode explanation. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-CONSENT-001, FL-HTML-16-NAV, FL-HTML-16-RECOVERY

## FL-HTML-17 Interest Selection

- Audience: Parent with child input
- Age Band: 0-6 child preferences through parent
- Business Goal: Improve recommendations without asking unsafe personal questions.
- User Goal: Choose safe story interests quickly.
- Pain: Parents need personalization that does not profile sensitive data.
- Sitemap: Onboarding / preferences
- Navigation: Back to age; next to child home.
- Journey: Age -> interests -> child home
- User Flow: Pick safe themes and avoid scary content.
- Task Flow: Select themes, set avoid list, continue.
- Layout Family: Visual interest board with safety avoid list
- Components: theme tiles, avoid scary toggle, age fit note, continue CTA
- Primary CTA: Build Mia's home
- Secondary CTA: Skip interests
- Copy: Choose calm animals, music, bedtime, colors, or nature. Avoid scary stories by default.
- Illustration: Tile grid with safe theme icons and parent avoid controls.
- Interaction: Tiles toggle selected state; avoid list remains parent-controlled.
- Animation: Tile selection pops subtly; reduced motion uses border.
- Accessibility: Tiles have labels and selected text.
- Child Safety: No sensitive categories, no ads, no adult profiling.
- Responsive: Two columns at 320; wider grid at tablet.
- API: PATCH /children/:id/interests
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Empty interests still allows age-based recommendations. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-INTEREST-001, FL-HTML-17-NAV, FL-HTML-17-RECOVERY

## FL-HTML-18 Child Home

- Audience: Child with parent nearby
- Age Band: 0-6 visual-first
- Business Goal: Anchor daily use around one clear next action.
- User Goal: Know what to do next without reading-heavy UI.
- Pain: Children and parents get lost when home is a feature dump.
- Sitemap: Child area / home
- Navigation: Bottom nav: Home, Stories, Task, Parent gate.
- Journey: Interests -> child home -> story or task
- User Flow: See today's story, task, bedtime shortcut.
- Task Flow: Tap visual story card or parent-led task.
- Layout Family: Visual-first home with one primary story
- Components: today story, large play CTA, daily task, parent gate
- Primary CTA: Play today's story
- Secondary CTA: Do today's task
- Copy: Mia's calm story is ready. Parent controls are behind the grown-up gate.
- Illustration: Large story card with guide and calm animal cover.
- Interaction: Card starts story; parent gate opens PIN.
- Animation: Card lift on press; reduced motion uses color.
- Accessibility: Large labels and aria names for controls.
- Child Safety: No settings, purchase, or external link in child area.
- Responsive: Primary card remains above fold at 320.
- API: GET /home?childId=:id
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No content uses cached favorite and retry banner. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-HOME-001, FL-HTML-18-NAV, FL-HTML-18-RECOVERY

## FL-HTML-19 Story Explore

- Audience: Parent and child
- Age Band: 0-6 with parent guidance
- Business Goal: Let families browse safe story options without overwhelming choice.
- User Goal: Find a story by age-safe theme.
- Pain: Too many categories create cognitive load.
- Sitemap: Story / explore
- Navigation: Story tab; detail route; back to child home.
- Journey: Child home -> explore -> story detail
- User Flow: Browse curated story shelves.
- Task Flow: Pick shelf, inspect story, open detail.
- Layout Family: Curated shelves with age-fit labels
- Components: shelf tabs, story cards, age labels, filter chip
- Primary CTA: Open story
- Secondary CTA: Back home
- Copy: Explore calm, music, nature, and bedtime stories selected for Mia's age band.
- Illustration: Shelf of child-safe covers with visible age-fit badges.
- Interaction: Shelf chips filter cards; story card opens detail.
- Animation: Shelf changes fade; reduced motion swaps instantly.
- Accessibility: Filter chips expose selected state.
- Child Safety: No frightening themes, violence, ads, or infinite scroll pressure.
- Responsive: Horizontal shelves on phone; grid on tablet.
- API: GET /stories
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Empty shelf offers different theme and retry. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-EXPLORE-001, FL-HTML-19-NAV, FL-HTML-19-RECOVERY

## FL-HTML-20 Category

- Audience: Parent and child
- Age Band: 0-6 category browsing
- Business Goal: Organize stories by safe developmental themes.
- User Goal: Browse one category with clear boundaries.
- Pain: Generic categories do not explain age value.
- Sitemap: Story / category
- Navigation: From explore; opens story detail.
- Journey: Explore -> category -> detail
- User Flow: Select category and review suitable stories.
- Task Flow: Open category, scan age notes, choose story.
- Layout Family: Category lane with developmental rationale
- Components: category header, age rationale, story list, back CTA
- Primary CTA: View story detail
- Secondary CTA: Change category
- Copy: Nature stories practice noticing, naming, and calm listening.
- Illustration: Nature shelf with leaf trail and soft story covers.
- Interaction: Story rows open detail; category change opens selector.
- Animation: Rows rise 6px on focus; reduced motion uses outline.
- Accessibility: Rows have text labels and age rationale.
- Child Safety: No unsafe or overstimulating stories appear in category results.
- Responsive: Rows stack at 320; grid appears at 768.
- API: GET /stories?category=nature
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No stories shows parent-safe alternate category. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-CATEGORY-001, FL-HTML-20-NAV, FL-HTML-20-RECOVERY

## FL-HTML-21 Search

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Help parents find known content safely.
- User Goal: Search by story, theme, or bedtime need.
- Pain: Search can expose unsafe or irrelevant results if uncontrolled.
- Sitemap: Story / search
- Navigation: From explore; result opens detail.
- Journey: Child home -> search -> detail
- User Flow: Enter query, inspect safe results, recover from no match.
- Task Flow: Type query, use safe suggestions, open detail.
- Layout Family: Parent search with guarded suggestions
- Components: search field, safe suggestions, result list, empty recovery
- Primary CTA: Open result
- Secondary CTA: Clear search
- Copy: Search only returns child-safe stories and parent help content.
- Illustration: Search card with suggestion chips and safe result rows.
- Interaction: Typing updates suggestions; empty results show recovery.
- Animation: Result update is instant; reduced motion no shimmer.
- Accessibility: Search field has label and clear button.
- Child Safety: No open web search and no child-generated free text path.
- Responsive: Input remains visible at small widths.
- API: GET /search?q=
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No result suggests category browse and retry. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-SEARCH-001, FL-HTML-21-NAV, FL-HTML-21-RECOVERY

## FL-HTML-22 Story Detail

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Explain story fit before playback.
- User Goal: Know length, age fit, skills, and safety before play.
- Pain: Parents need context before handing a player to a child.
- Sitemap: Story / detail
- Navigation: From recommendation/explore/search; play route.
- Journey: Story selection -> detail -> player
- User Flow: Review story summary and start or save.
- Task Flow: Inspect fit, preview skill, tap play.
- Layout Family: Story evidence sheet
- Components: cover, summary, age fit, skill tags, play CTA
- Primary CTA: Start story
- Secondary CTA: Save favorite
- Copy: A 4-minute calm story about rain sounds, naming soft/loud, and ending quietly.
- Illustration: Story cover with fit and duration labels.
- Interaction: Play starts child player; save updates favorites.
- Animation: Cover shared transition; reduced motion uses fade.
- Accessibility: Summary has text equivalent for cover.
- Child Safety: No scary elements; parent sees safety notes first.
- Responsive: Cover top, evidence below on phone; split on tablet.
- API: GET /stories/:id
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Missing story opens recovery with safe alternatives. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-DETAIL-001, FL-HTML-22-NAV, FL-HTML-22-RECOVERY

## FL-HTML-23 Bedtime Player

- Audience: Parent and child
- Age Band: 0-6 bedtime
- Business Goal: Deliver low-stimulation playback with hard stop.
- User Goal: Listen to one bedtime story and end calmly.
- Pain: Autoplay and bright rewards disrupt sleep.
- Sitemap: Bedtime / playback
- Navigation: From bedtime mode; ends to lock screen.
- Journey: Bedtime -> bedtime player -> end session
- User Flow: Play calm story, dim, finish, stop.
- Task Flow: Start audio, follow dim page, end session.
- Layout Family: Dimmed audio-first player
- Components: dim art, audio progress, end session, no autoplay notice
- Primary CTA: End session
- Secondary CTA: Pause
- Copy: The screen dims while the story continues. No next story starts automatically.
- Illustration: Moonlit audio player with no bright reward.
- Interaction: End session stops route; pause keeps dim mode.
- Animation: Slow opacity only; reduced motion static.
- Accessibility: Contrast is AA in dark mode and labels remain visible.
- Child Safety: No autoplay, no streak, no bright reward.
- Responsive: Controls stay in lower safe area.
- API: POST /bedtime/session/events
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Audio error offers replay or end tonight. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-BEDPLAYER-001, FL-HTML-23-NAV, FL-HTML-23-RECOVERY

## FL-HTML-24 Favorites

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Let parents reuse trusted stories.
- User Goal: Find saved stories without re-searching.
- Pain: Saved content must not become endless autoplay.
- Sitemap: Library / favorites
- Navigation: From story detail or parent dashboard.
- Journey: Detail -> favorite -> favorites -> player/detail
- User Flow: Save story, open favorites, choose one.
- Task Flow: Review saved list, open story, remove if needed.
- Layout Family: Saved story library with parent controls
- Components: saved list, age labels, remove action, play detail CTA
- Primary CTA: Open saved story
- Secondary CTA: Remove saved story
- Copy: Saved stories keep age-fit labels and do not autoplay.
- Illustration: Library shelf with small covers and parent actions.
- Interaction: Remove asks confirmation; open goes to detail.
- Animation: Remove row fades; reduced motion instant.
- Accessibility: Remove buttons have clear labels.
- Child Safety: No public sharing or child social features.
- Responsive: List rows are 56px minimum.
- API: GET /favorites
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Empty list suggests explore stories. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-FAVORITES-001, FL-HTML-24-NAV, FL-HTML-24-RECOVERY

## FL-HTML-25 History

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Show past use without pressuring streaks.
- User Goal: Review what was played and resume safely.
- Pain: Parents need history without gamified pressure.
- Sitemap: Library / history
- Navigation: From parent center or favorites.
- Journey: Player -> history -> detail/replay
- User Flow: Open history, inspect played story, choose replay.
- Task Flow: Scan recent sessions, open detail, clear entry.
- Layout Family: Calm history timeline
- Components: timeline, session cards, replay action, privacy note
- Primary CTA: Replay story
- Secondary CTA: Clear entry
- Copy: History shows story title, date, and calm progress notes, without streaks.
- Illustration: Soft timeline with story cards.
- Interaction: Replay opens detail; clear entry requires parent confirmation.
- Animation: Timeline draw once; reduced motion static.
- Accessibility: Timeline has text order and dates.
- Child Safety: No comparison, ranking, or pressure metric.
- Responsive: Timeline becomes simple list at 320.
- API: GET /history
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Empty history explains first story path. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-HISTORY-001, FL-HTML-25-NAV, FL-HTML-25-RECOVERY

## FL-HTML-26 Parent Entry

- Audience: Parent gate
- Age Band: Adult-only gate
- Business Goal: Protect adult controls from child access.
- User Goal: Enter parent area intentionally.
- Pain: Child UI must not expose adult settings.
- Sitemap: Parent center / entry
- Navigation: From bottom nav parent tab; next to PIN.
- Journey: Child home -> parent entry -> PIN
- User Flow: Read grown-up gate and continue to PIN.
- Task Flow: Tap parent-only entry, confirm adult action.
- Layout Family: Grown-up gate with intent confirmation
- Components: adult notice, reason list, continue CTA, child-safe exit
- Primary CTA: Continue to PIN
- Secondary CTA: Back to child home
- Copy: Grown-up area includes privacy, settings, progress, and screen time.
- Illustration: Adult gate card separated from child UI.
- Interaction: Continue opens PIN; back returns child home.
- Animation: Gate appears as bottom sheet; reduced motion static.
- Accessibility: Adult-only labels are explicit.
- Child Safety: Child cannot change settings without parent gate.
- Responsive: Sheet is full width at 320.
- API: not applicable: local gate before PIN
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Back always returns to child-safe home. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-PARENTENTRY-001, FL-HTML-26-NAV, FL-HTML-26-RECOVERY

## FL-HTML-27 PIN Verification

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Verify adult before sensitive controls.
- User Goal: Unlock parent center quickly and safely.
- Pain: A weak gate lets children access settings.
- Sitemap: Parent center / PIN
- Navigation: Back to parent entry; success to dashboard.
- Journey: Parent entry -> PIN -> dashboard
- User Flow: Enter PIN, recover from invalid or timeout.
- Task Flow: Type PIN, submit, handle invalid code.
- Layout Family: PIN keypad with lockout feedback
- Components: PIN dots, number pad, forgot PIN, unlock CTA
- Primary CTA: Unlock parent center
- Secondary CTA: Forgot PIN
- Copy: Enter your parent PIN. After 5 failed tries, use email recovery.
- Illustration: Large keypad with secure dots.
- Interaction: PIN digits fill dots; invalid code shows recovery.
- Animation: Dots update instantly; reduced motion no shake.
- Accessibility: Keypad buttons have accessible labels.
- Child Safety: Adult-only; lockout prevents child guessing.
- Responsive: Keypad remains thumb reachable.
- API: POST /parent-gate/verify
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Invalid PIN shows retry and email recovery. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-PIN-001, FL-HTML-27-NAV, FL-HTML-27-RECOVERY

## FL-HTML-28 Screen Time

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Let parents set healthy session boundaries.
- User Goal: Set daily duration and bedtime limits.
- Pain: Without boundaries, story apps can overextend usage.
- Sitemap: Parent center / screen time
- Navigation: From dashboard; save returns dashboard.
- Journey: Dashboard -> screen time -> save
- User Flow: Adjust session limit and bedtime stop.
- Task Flow: Set duration, set bedtime mode, save.
- Layout Family: Boundary settings panel
- Components: duration stepper, bedtime stop, save CTA, explanation
- Primary CTA: Save limits
- Secondary CTA: Reset to recommended
- Copy: Recommended: one story or five minutes at bedtime, no autoplay.
- Illustration: Limit sliders with calm explanation.
- Interaction: Save persists settings; reset restores age recommendation.
- Animation: Slider feedback is immediate; reduced motion none.
- Accessibility: Inputs have labels and numeric text.
- Child Safety: No dark patterns; adult limits support child wellbeing.
- Responsive: Stepper replaces slider at 320.
- API: PATCH /settings/screen-time
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Save failure keeps local changes and retry. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-SCREENTIME-001, FL-HTML-28-NAV, FL-HTML-28-RECOVERY

## FL-HTML-29 Growth Report

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Translate usage into humane learning signals.
- User Goal: Understand growth without comparing the child.
- Pain: Metrics can become pressure or false precision.
- Sitemap: Parent center / growth
- Navigation: From dashboard; links to history and privacy.
- Journey: Dashboard -> growth report -> action
- User Flow: Review signals, read evidence, choose next activity.
- Task Flow: Open report, expand signal, start activity.
- Layout Family: Humane growth signal report
- Components: signal cards, evidence rows, activity suggestion, privacy note
- Primary CTA: Try suggested activity
- Secondary CTA: View history
- Copy: Mia often points to sound choices and prefers calm animal stories this week.
- Illustration: Soft report cards with evidence rows.
- Interaction: Signal expands evidence; CTA opens task.
- Animation: Cards expand 120ms; reduced motion instant.
- Accessibility: Charts have text summaries.
- Child Safety: No ranking, diagnosis, or social comparison.
- Responsive: Report stacks at 320 and becomes columns at 768.
- API: GET /growth-report
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: No data suggests first story path. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-GROWTH-001, FL-HTML-29-NAV, FL-HTML-29-RECOVERY

## FL-HTML-30 Privacy

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Provide child data rights and transparency.
- User Goal: Export, delete, or review child data.
- Pain: Privacy controls hidden behind support create distrust.
- Sitemap: Parent center / privacy
- Navigation: From dashboard/settings; actions require PIN.
- Journey: Dashboard -> privacy -> export/delete
- User Flow: Review data map, export, delete, or contact support.
- Task Flow: Choose privacy action, confirm, recover from API error.
- Layout Family: Privacy action center
- Components: data map, export CTA, delete CTA, support CTA
- Primary CTA: Export data
- Secondary CTA: Delete child profile
- Copy: Parent controls data export, deletion, and consent records.
- Illustration: Data map with categories and parent actions.
- Interaction: Delete opens confirmation; export starts request.
- Animation: Confirmation sheet fades; reduced motion instant.
- Accessibility: Actions are labelled and destructive action is separated.
- Child Safety: Parent-only; no child-facing deletion prompt.
- Responsive: Destructive actions stay below explanatory text.
- API: POST /privacy/export and DELETE /children/:id
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: API failure keeps request status and support path. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-PRIVACY-003, FL-HTML-30-NAV, FL-HTML-30-RECOVERY

## FL-HTML-31 Settings

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Centralize account, audio, language, and safety settings.
- User Goal: Adjust product behavior without searching.
- Pain: Settings can become a confusing dump.
- Sitemap: Parent center / settings
- Navigation: From dashboard; links to notification/privacy/screen time.
- Journey: Dashboard -> settings -> save
- User Flow: Open settings, change one preference, save.
- Task Flow: Change audio, language, notifications, or privacy link.
- Layout Family: Grouped settings list
- Components: audio row, language row, notification row, privacy link
- Primary CTA: Save settings
- Secondary CTA: Cancel
- Copy: Settings are grouped by child experience, parent account, and privacy.
- Illustration: Quiet settings list with clear grouping.
- Interaction: Rows open focused controls; save commits changes.
- Animation: Row press uses subtle color; reduced motion none.
- Accessibility: Rows are keyboard reachable and labelled.
- Child Safety: No child-accessible settings; parent gate is required.
- Responsive: Rows stay 52px minimum at 320.
- API: PATCH /settings
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Save failure shows retry and preserves changes. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-SETTINGS-001, FL-HTML-31-NAV, FL-HTML-31-RECOVERY

## FL-HTML-32 Notification

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Let parents choose reminder timing and quiet hours.
- User Goal: Control reminders without child pressure.
- Pain: Notifications can manipulate families if unclear.
- Sitemap: Parent center / notifications
- Navigation: From settings; save returns settings.
- Journey: Settings -> notification -> save
- User Flow: Choose reminders and quiet hours.
- Task Flow: Toggle reminders, set quiet hours, save.
- Layout Family: Reminder consent and quiet hours
- Components: reminder toggle, quiet hours, preview, save CTA
- Primary CTA: Save reminder settings
- Secondary CTA: Turn off reminders
- Copy: Reminders are parent-facing only and stay silent during bedtime quiet hours.
- Illustration: Calendar and moon reminder preview.
- Interaction: Toggle updates preview; save persists.
- Animation: Preview fades; reduced motion instant.
- Accessibility: Toggles expose on/off text.
- Child Safety: No child-directed push pressure or streak reminders.
- Responsive: Controls stack with clear labels.
- API: PATCH /notifications
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Permission denied explains OS settings. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-NOTIFY-001, FL-HTML-32-NAV, FL-HTML-32-RECOVERY

## FL-HTML-33 Offline

- Audience: Parent and child
- Age Band: 0-6 safe fallback
- Business Goal: Keep safe cached content available when network drops.
- User Goal: Families need graceful offline behavior.
- Pain: Network drops can leave families unsure whether progress is lost.
- Sitemap: System / offline
- Navigation: Appears over current route; retry or cached story.
- Journey: Any route -> offline -> recovery
- User Flow: Show offline status, offer cached story or retry.
- Task Flow: Detect offline, keep prior content, retry.
- Layout Family: Offline recovery panel
- Components: offline banner, cached story, retry CTA, status text
- Primary CTA: Use cached story
- Secondary CTA: Retry connection
- Copy: No internet. You can play the saved calm story or try again.
- Illustration: Cloud-offline card with cached story option.
- Interaction: Retry checks network; cached story opens player.
- Animation: Banner appears instantly; reduced motion static.
- Accessibility: Status is text, not color-only.
- Child Safety: No child blame or scary error language.
- Responsive: Panel fits above bottom nav.
- API: GET /health/reconnect
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Retry failure keeps offline panel. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-OFFLINE-001, FL-HTML-33-NAV, FL-HTML-33-RECOVERY

## FL-HTML-34 Reconnect

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Recover from dropped API calls predictably.
- User Goal: Reconnect and resume without data loss.
- Pain: Dropped calls can lose parent choices.
- Sitemap: System / reconnect
- Navigation: From offline/error; returns previous route.
- Journey: Offline -> reconnect -> previous route
- User Flow: Check connection, sync queued events, return.
- Task Flow: Tap reconnect, watch sync, resume.
- Layout Family: Reconnect progress with queued changes
- Components: connection status, queued events, sync progress, resume CTA
- Primary CTA: Resume
- Secondary CTA: Stay offline
- Copy: Connection restored. Two progress events will sync before returning.
- Illustration: Sync rail with queued event chips.
- Interaction: Resume disabled until sync completes.
- Animation: Progress bar fills; reduced motion numeric only.
- Accessibility: Progress has text percentage.
- Child Safety: No silent sync; queued child data is parent-readable.
- Responsive: Progress rail stays within phone width.
- API: POST /sync
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: Sync failure routes to offline with retry. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-RECONNECT-001, FL-HTML-34-NAV, FL-HTML-34-RECOVERY

## FL-HTML-35 Error Recovery

- Audience: Parent
- Age Band: Adult caregiver
- Business Goal: Recover from app, content, token, or audio failures.
- User Goal: Understand what failed and what to do next.
- Pain: Generic errors destroy trust.
- Sitemap: System / error
- Navigation: From any failed route; retry, support, or safe home.
- Journey: Any route -> error -> retry/recovery
- User Flow: Read issue, retry, use safe fallback, or contact support.
- Task Flow: Identify error type, choose recovery, return safe route.
- Layout Family: Structured error recovery center
- Components: error type, recovery options, support path, safe home CTA
- Primary CTA: Retry now
- Secondary CTA: Go to child home
- Copy: Story audio could not load. Retry, use cached story, or return to child home.
- Illustration: Calm error card with specific recovery options.
- Interaction: Retry repeats request; safe home always works.
- Animation: No shaking or alarming motion.
- Accessibility: Error heading is explicit and aria-live.
- Child Safety: No frightening visuals or blame language.
- Responsive: Recovery actions remain visible at 320.
- API: varies by failed route
- States: default, loading, empty, error, success, offline, apiDelay, apiFailure, disabled, permissionDenied
- Acceptance: 500, timeout, missing story, token invalid, and audio error all map to recovery choices. | Primary and secondary CTA are visible. | Back and recovery path are defined.
- Test IDs: T-ERROR-001, FL-HTML-35-NAV, FL-HTML-35-RECOVERY

