# FutureLight DE / UK / US Store Listing Copy And Screenshot Requirements

Created: 2026-06-01 14:52:00 +08:00
Status: Market copy and asset requirements draft, not final store/legal copy

This document turns `docs/store-metadata-draft.md` into localized listing copy and screenshot requirements for Germany, the United Kingdom, and the United States. Copy must be revised after production screenshots, privacy policy URL, and final mobile build permissions are available.

## Official Store Guidance Checked

- Apple localize app information: https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information
- Apple app information limits: https://developer.apple.com/help/app-store-connect/reference/app-information
- Apple screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
- Google Play custom store listings: https://support.google.com/googleplay/android-developer/answer/9867158
- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play target audience and content: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play Families Policy: https://support.google.com/googleplay/android-developer/answer/9893335

## Copy Guardrails

- Use only implemented claims: parent account, child profiles, market/English variant choice, consent gate, learning/practice attempts, progress/rewards, no ads, no third-party analytics SDK, no microphone/camera/location.
- Do not claim offline mode, speech recognition, AI tutor, native mobile polish, school curriculum alignment, teacher approval, medical/learning-disability support, or certified pedagogy.
- Avoid absolute safety claims. Use "parent-managed", "no ads in launch scope", and "privacy controls for parents".
- Avoid Google-prohibited promotional language in short descriptions, screenshots, feature graphics, or video text: no "#1", "best", "top", awards, pricing claims, or "download/install/play now" calls to action.
- Do not use "for kids" or "for children" in App Store metadata unless the final submission chooses and satisfies Apple's Kids category.
- Keep localized overlay text short. Screenshots should show real UI first, with overlay copy only when needed.

## Localization Matrix

| Market | Store Locales | Product Emphasis | English Variant | Privacy Emphasis |
| --- | --- | --- | --- | --- |
| Germany | `de-DE` | Elternbegleitetes Englischlernen, klare Fortschritte, Datensparsamkeit | Parent can select American or British English | GDPR Article 8 consent baseline, no ads, no tracking SDK |
| United Kingdom | `en-GB` | British English option, parent trust, gentle practice | British English default copy uses "colour" where relevant | UK high-privacy default, no adverts, parent controls |
| United States | `en-US` | COPPA-aware parent consent, playful practice, progress/rewards | American English default copy uses "color" where relevant | Parent consent before child learning data writes, no ads, no third-party analytics |

## Germany Draft Copy

| Field | Draft |
| --- | --- |
| App Store app name | FutureLight |
| App Store subtitle | Englisch mit Elternbegleitung |
| App Store promotional text | Kurze Englischübungen, Fortschritt und Belohnungen in einem werbefreien, von Eltern verwalteten Lernbereich. |
| Google Play short description | Englisch üben mit Elternprofil, Fortschritt und ohne Werbung |
| Keywords / Search Themes | Englisch lernen, Kinder Englisch, Vokabeln, Eltern, Grundschule, Lernspiel, Aussprache vorbereiten |

Long description draft:

```text
FutureLight hilft Kindern, erste englische Wörter und einfache Sätze in kurzen, ruhigen Übungen zu wiederholen.

Eltern erstellen ein Konto, legen ein Kinderprofil mit Altersgruppe, Marktregion und Englischvariante an und behalten Lernfortschritt, Einwilligung und Datenschutzeinstellungen im Blick.

Was heute umgesetzt ist:
- Wörterkurse zu Tieren, Farben, Zahlen, Familie, Essen und Begrüßungen
- Lernmodus mit Fortschritt und Belohnungen
- Übungsspiel mit Antwortprüfung
- Elternbereich mit Kinderprofilen, Fortschritt, Einwilligungen und Löschfunktion für Kinderdaten
- Keine Werbung, keine Drittanbieter-Analytics, kein Mikrofon, keine Kamera und keine Standortabfrage im aktuellen Launch-Umfang

FutureLight ist noch im Aufbau. Neue Inhalte, Sprachaufnahmen und weitere Kursbilder werden erst nach Prüfung ergänzt.
```

Germany screenshot overlay lines:

| Screen | Overlay Copy |
| --- | --- |
| Child setup | Profil, Region und Englischvariante festlegen |
| Course library | Erste Wörter in kurzen Themenkursen |
| Learning card | Ruhig üben, Schritt für Schritt |
| Practice | Antworten prüfen und Fortschritt speichern |
| Parent progress | Fortschritt und Belohnungen im Blick |
| Privacy controls | Einwilligung und Kinderdaten verwalten |

## United Kingdom Draft Copy

| Field | Draft |
| --- | --- |
| App Store app name | FutureLight |
| App Store subtitle | Parent-guided English practice |
| App Store promotional text | Gentle word practice, British English options, progress, and parent privacy controls in one calm learning space. |
| Google Play short description | Parent-guided English practice with progress and no adverts |
| Keywords / Search Themes | English words, British English, phonics preparation, parent controls, vocabulary, child learning, practice |

Long description draft:

```text
FutureLight gives children a calm place to practise early English words with a parent-managed account.

Parents create child profiles, choose the market and English variant, review progress, and manage privacy choices. The learning flow supports British English copy where content has been reviewed, such as colour spelling in the colours course.

Current features:
- Short word courses for animals, colours, numbers, family, food, and greetings
- Learning sessions that save progress
- Practice questions with rewards for mastery
- Parent centre for child profiles, progress, consent, data export requests, and child data deletion
- No adverts, no third-party analytics SDK, no microphone, no camera, and no location access in the current launch scope

FutureLight is still expanding its reviewed lessons, images, and audio. Store copy will stay aligned with what is implemented.
```

UK screenshot overlay lines:

| Screen | Overlay Copy |
| --- | --- |
| Child setup | Choose age, region and British English |
| Course library | Short courses for early vocabulary |
| Learning card | Practise words with calm prompts |
| Practice | Check answers and build confidence |
| Parent progress | See progress without adverts |
| Privacy controls | Parent controls for consent and data |

## United States Draft Copy

| Field | Draft |
| --- | --- |
| App Store app name | FutureLight |
| App Store subtitle | Parent-guided word practice |
| App Store promotional text | Short English word lessons, progress rewards, and parent privacy controls for early learners. |
| Google Play short description | Parent-guided English word practice with progress and no ads |
| Keywords / Search Themes | English for kids, vocabulary, parent controls, COPPA, progress, rewards, language learning, practice |

Long description draft:

```text
FutureLight is a parent-managed English learning space for early word practice.

Parents create a child profile, choose age band, market region, and American or British English, then manage consent and privacy controls before supported child learning data is recorded.

Current features:
- Draft word courses for animals, colors, numbers, family, food, and greetings
- Learning sessions that save attempts and progress
- Practice questions with rewards
- Parent center for child profiles, progress summaries, consent, export requests, and child data deletion
- No ads, no third-party analytics SDK, no microphone, no camera, and no location access in the current launch scope

FutureLight is built to keep parents in control while the lesson library grows.
```

US screenshot overlay lines:

| Screen | Overlay Copy |
| --- | --- |
| Child setup | Set age, region and English variant |
| Course library | Early words in simple courses |
| Learning card | Practice color, food and animal words |
| Practice | Answer, learn and earn rewards |
| Parent progress | Progress summaries for parents |
| Privacy controls | Consent and data controls for parents |

## Screenshot Set Requirements

Create the same six real UI captures for each market, with localized overlay text and no unimplemented features shown.

| Order | Required UI State | Route / Source | Must Show | Must Not Show |
| --- | --- | --- | --- | --- |
| 1 | Parent-managed child setup | `/parent` child form | age band, market region, English variant, consent option | email/password values, real child names |
| 2 | Course library | `/courses` | courses from PostgreSQL, cover asset where available | draft/debug warnings or local-only URLs |
| 3 | Learning activity | `/learn` | selected child, selected course, activity prompt, start/session controls | fake microphone or speech scoring |
| 4 | Practice flow | `/practice` | real choices, answer feedback, reward/progress refresh | paid upsells, ads, unsupported games |
| 5 | Parent progress | `/parent` signed-in summary | progress/reward cards and child profile controls | personal emails or test secrets |
| 6 | Privacy controls | `/parent` consent/export/delete area | consent status, parent gate, delete/export request controls | claims of completed export package |

Market-specific capture states:

- Germany: child profile `market_region=DE`, `english_variant=british` or `american`; overlay copy in German.
- United Kingdom: child profile `market_region=UK`, `english_variant=british`; show British copy where available.
- United States: child profile `market_region=US`, `english_variant=american`; show American copy where available.

Apple asset requirements:

- Upload one to ten screenshots per supported device display.
- If launching iPhone only, prepare the current 6.9-inch iPhone portrait sizes from Apple's screenshot specification.
- If supporting iPad, prepare current 13-inch iPad screenshots as well.
- Each localization needs screenshots in matching dimensions before it can become primary language later.

Google Play asset requirements:

- App icon: 512 x 512 px, 32-bit PNG with alpha, max 1024 KB.
- Feature graphic: 1024 x 500 px, JPEG or 24-bit PNG with no alpha.
- Phone screenshots: provide at least four high-resolution portrait screenshots for promotion eligibility, target 1080 x 1920 px or larger, JPEG or 24-bit PNG with no alpha.
- Store listing can have up to eight screenshots per supported device type.
- Screenshot taglines should not exceed 20% of the image and should not include rankings, awards, price claims, or call-to-action text.
- Add alt text for each screenshot, 140 characters or less.

## Feature Graphic Direction

| Market | Graphic Message | Text Overlay |
| --- | --- | --- |
| DE | Warm parent-managed English learning with progress and no ads | Englisch üben. Eltern behalten den Überblick. |
| UK | British English option and parent trust | Gentle English practice, parent managed |
| US | Playful vocabulary practice with consent-aware parent controls | English word practice, parent managed |

Use real FutureLight art assets only after final review. Do not use store badges, competitor logos, ranking text, or device-frame mockups that can become obsolete.

## Remaining Blockers

- Capture real native/mobile screenshots after the app shell exists; current Vite desktop/web screenshots are not final store evidence.
- Create production reviewer accounts outside git.
- Finalize privacy policy URL, deletion URL/process, and support URL.
- Generate app icon, Google feature graphics, and App Store screenshot variants using reviewed art assets.
- Legal/product review must approve whether Apple Kids category is selected and which Kids age band is used.
