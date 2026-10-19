# Story Journey Implementation

## Product flow

`Parent sign-in -> child profile and age -> age-based story recommendation -> story session -> persisted page progress -> completion -> next story -> daily family task -> bedtime mode`

## Traceability

| Product surface | Frontend route/component | API | PostgreSQL data | Automated evidence |
| --- | --- | --- | --- | --- |
| Story recommendations | `/stories`, `StoryExperience` dashboard | `GET /api/stories/recommendations` | `stories`, `children` | `story_journey_integration`, `playwright-story-journey.js` |
| Story playback | `/stories`, `StoryExperience` reader | `GET /api/stories/{story_id}`, `POST /api/story-sessions` | `stories.pages`, `story_sessions` | Start and first-page assertions in browser E2E |
| Persisted progress | `StoryExperience.moveToPage` | `PATCH /api/story-sessions/{id}/progress` | `story_sessions.current_page`, `last_progress_at` | Last-page persistence assertion in backend integration test |
| Completion gate | `StoryExperience.finishStory` | `PATCH /api/story-sessions/{id}/complete` | `story_sessions.completed_at` | Premature completion rejection and successful completion tests |
| Next story | Completion screen | Existing recommendation response | `stories` | Completion screen and next-story CTA in browser E2E |
| Daily family task | Story dashboard and completion screen | `GET /api/children/{id}/daily-family-task`, `POST /api/family-tasks/{id}/complete` | `daily_family_tasks`, `family_task_completions` | Complete and reload assertions in backend/browser tests |
| Bedtime mode | `/bedtime`, bedtime variant of `StoryExperience` | Story APIs with `mode=bedtime` | `stories.mode`, `story_sessions.mode` | Bedtime recommendation, start, copy, screenshot, mobile overflow check |
| Read aloud | Story reader | Browser Web Speech API | No child voice is collected or stored | UI control available on every page |

## Validation performed

- PostgreSQL migration applied and seed counts checked.
- Rust full test suite passed, including story ownership, consent, age selection, progress, completion, and daily task persistence.
- React TypeScript production build and ESLint passed.
- Existing full Playwright product flow passed after the story changes.
- Story Playwright flow passed from parent registration through bedtime playback.
- Browser flow fails on console error, non-aborted request failure, broken image, or mobile horizontal overflow.
- Desktop story dashboard and 390px bedtime reader screenshots were visually inspected.

## Known product boundary

This implementation closes the story journey slice. It does not by itself make the entire repository production-ready: Android packaging, offline media delivery, editorial review for a larger story catalog, licensed narration, and legal/store release work remain separate release gates.
