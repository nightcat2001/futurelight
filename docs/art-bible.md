# FutureLight Art Bible

Created: 2026-06-01 13:27:03 +08:00
Status: Required visual direction for generated and hand-authored assets

This art bible defines the visual rules for FutureLight course covers, word cards, rewards, character expressions, and short animations. It must be checked before any Image2.0/imagegen/Seedance batch is accepted into `assets/asset_manifest.json`.

## Product Feel

FutureLight should feel calm, bright, safe, and capable. It is a parent-trusted child learning product, not a noisy arcade or a generic stock-illustration app.

Core traits:

- Friendly, direct, and readable at mobile sizes.
- Warm but not babyish.
- Playful motion and reward moments without gambling, pressure, or exaggerated urgency.
- Real learning objects should be clear enough that children can inspect them quickly.
- UI illustrations should support the lesson, not compete with it.

## Character Proportions

Primary guide character:

- Height: about 3 heads tall for child-friendly readability.
- Head: 36-40% of total height.
- Body: simple rounded torso with clear arm gestures.
- Eyes: large but not glossy or uncanny; no hyper-real reflections.
- Hands: mitten-like or simple 4-finger cartoon hands.
- Expressions: neutral happy, encouraging, surprised, thinking, celebrating, gentle correction.
- Pose language: open palms, pointing to learning objects, waving, clapping, holding a card.

Do not use:

- Photorealistic children or teacher avatars.
- Overly thin limbs, sharp claws, sharp teeth, or scary silhouettes.
- Characters imitating real public figures, celebrities, brands, or copyrighted mascots.
- Stereotyped clothing or cultural shorthand as the main identity signal.

## Color System

Use a balanced, multi-hue palette so the product does not collapse into a single color family.

| Role | Color | Usage |
| --- | --- | --- |
| Ink | `#1D2733` | Primary text, icon strokes |
| Paper | `#FFFDF7` | Warm page surfaces |
| Sky | `#2F80ED` | Primary action, learning focus |
| Leaf | `#2FBF71` | Correct answers, growth, safe success |
| Coral | `#FF6B6B` | Friendly attention and soft error accents |
| Sunshine | `#F2C94C` | Rewards, stars, positive highlights |
| Lavender | `#9B8CF2` | Secondary badges and gentle magic moments |
| Slate | `#607087` | Metadata and quiet labels |

Rules:

- Do not make a whole scene mostly one hue.
- Avoid dominant dark blue/slate, beige/tan, purple gradients, or brown/orange palettes.
- Keep contrast high for text and learning objects.
- Use color to distinguish choices, but never rely only on color for correctness.

## Illustration Style

Preferred style:

- Clean 2D illustration with soft geometric shapes.
- Slight paper-grain or very subtle texture is allowed; no heavy noise.
- Rounded corners and clear silhouettes.
- Simple lighting from upper left; soft shadows under objects.
- Backgrounds are light, spacious, and classroom/storybook-adjacent.
- Objects should be centered and recognizable without needing tiny details.

Avoid:

- Dark cinematic lighting.
- Busy backgrounds behind word cards.
- Tiny labels inside generated images.
- Stock-photo realism.
- Over-cropped objects.
- Bokeh/orb decoration as the main visual idea.

## Age-Band Differences

| Age Band | Visual Density | Character Use | Activity Card Style |
| --- | --- | --- | --- |
| `3-5` | Very low density, one object per card, big shapes | Frequent guide character support | Large object, minimal scene, no extra props |
| `6-8` | Moderate density, simple scenes with 2-3 props | Character appears as coach or helper | Object plus context, clear answer choices |
| `9-11` | More detail and realistic context while staying illustrated | Character appears less often, more mission-like | Themed scene, still readable on mobile |

## Word Card Layout

Required card format:

- Base aspect ratio: `4:3` for cards, `16:9` for course covers.
- Safe margin: 8% on all sides.
- Main object occupies 45-65% of card height.
- App-rendered text should remain outside generated artwork whenever possible.
- If embedded text is unavoidable, it must be large, simple, and manually checked.
- Object background should be light enough for dark UI overlays.
- Keep one primary concept per card.

Word card zones:

| Zone | Rule |
| --- | --- |
| Main object | Center or slight upper-center, no crop |
| Context props | Optional, max 2 for `6-8`, max 3 for `9-11` |
| Character | Optional side helper, never blocking object |
| Text | Prefer app text overlay, not baked into image |
| Badge/reward | Use separate asset, not baked into lesson object |

## Course Cover Layout

Required cover format:

- Size target: `1600x900`.
- Main theme signal must be visible in the center third.
- Leave room for app title overlay in the top-left or lower-left safe area.
- Use 3-5 lesson objects maximum.
- Include guide character only if it does not reduce object clarity.
- No fake app UI inside the cover.

## Rewards And Badges

Reward visuals:

- Stars: rounded five-point or soft sparkle, not casino-like.
- Badges: simple shield/circle/ribbon with clear icon.
- Mission complete: celebratory but calm; no confetti overload.
- Use Sunshine, Leaf, Sky, and Lavender as reward accents.

Do not use:

- Coins, loot boxes, slot-machine imagery, roulette, card gambling, countdown pressure.
- Paid currency visuals in the child flow.

## Prohibited Visual Content

Never ship child-facing assets containing:

- Horror, gore, weapons, threats, injury, bullying, or humiliation.
- Ads, brand logos, social media logos, app store badges, QR codes, or external URLs.
- Payment prompts, coins as purchasable currency, subscriptions, or scarcity pressure.
- Real children's faces, biometric-like face data, school names, addresses, phone numbers, or personal documents.
- Medical advice, unsafe food/allergy claims, dangerous stunts, or unsupervised risky behavior.
- Stereotypes tied to ethnicity, disability, gender, family structure, nationality, religion, or income.
- Political persuasion or religious instruction.
- Copyrighted characters, celebrity likenesses, or trademarked toys.

## Asset Manifest Requirements

Every accepted visual asset must record:

- `id`
- `type`
- `path`
- `status`
- `source`
- `prompt_summary`
- intended course/lesson/activity if applicable
- reviewer or review status before `published`

Status rules:

- `planned`: no file yet, not child-visible.
- `draft`: file exists but not reviewed.
- `review`: awaiting human review.
- `approved`: accepted for internal app use.
- `published`: allowed in child-facing published course.
- `blocked`: rejected and not usable.

## Prompt Template

Use this as a base for generated image prompts:

```text
FutureLight child language learning illustration, [asset type], [age band], [topic word/theme].
Clean 2D storybook style, rounded friendly shapes, bright multi-hue palette with sky blue, leaf green, coral, and sunshine accents.
Main object clearly visible, centered, no crop, light uncluttered background, safe 8 percent margin, app text will be overlaid separately.
No logos, no ads, no external links, no scary elements, no photoreal children, no copyrighted characters.
```

## Review Checklist

- [ ] The asset teaches one clear concept.
- [ ] It matches the target age band.
- [ ] It follows the palette without becoming one-hue.
- [ ] It has enough contrast for mobile.
- [ ] It avoids prohibited content.
- [ ] It has no unwanted text, watermark, logo, or signature.
- [ ] It has a manifest entry and real file path.
- [ ] It has prompt/source provenance.
- [ ] It is not marked `published` until human review is complete.
