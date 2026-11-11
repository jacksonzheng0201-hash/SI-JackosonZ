# De-Pollution — Version 1

## Run it

From this project folder, run:

```sh
./start.sh
```

Open http://127.0.0.1:4317. Stop with Ctrl+C. No package installation or database is needed. The launcher uses Node.js 22+ or the Node runtime already bundled with Qoder on this Mac. It handles this folder’s backslash using a temporary link, without renaming the folder.

## AI setup

OpenAI model: 

The model line above is deliberately blank: the existing NOTES.md and .env mentioned in the request were not present. The builder will supply them. Write the chosen model after `OpenAI model:`. Do not put a key here.

The key belongs only in this folder’s `.env` as `OPENAI_API_KEY=...`. Never paste it into chat. The server reads it only from that file, not from the browser or inherited environment. `.env` is ignored by Git and is never served to the browser. Model/key changes are read on the next request; refresh the page to update the setup label. OpenAI API usage may cost money.

## What’s done

- BRIEF.md is the original, unchanged project brief and guides the build.
- One goal at a time: collect litter, reuse materials, save food, save measured electricity, or avoid single-use items. “Prevent litter” is an item count, not an estimate of total pollution.
- A symbolic tree grows at 20%, 40%, 60%, 80%, and 100%. Only actions entered by the user count; the AI cannot add progress.
- Three made-up example goals contain no real people and start at zero when planted.
- All browser saving is in `public/storage.js`. Goals and privacy-warning counts are saved; chats are not.
- Saves on this computer only for now. More precisely, data stays in this browser and local address. Clearing browser data removes it. Browser data is not encrypted and people sharing the same browser profile can see it.
- All OpenAI requests are in `openai.mjs`, called only by the local server after the user submits a question with the check mark. Every request includes the complete “My AI’s instructions” section from BRIEF.md as system instructions, plus child-safety and factual rules.
- The brief’s “build and generate the website” wording is treated as the original builder task. Inside the finished website, the AI helps with environmental goals and honestly describes user-recorded progress; it does not claim to edit the website.
- While waiting, the app says “Thinking…” and disables another request. The server also blocks overlapping requests and limits requests per session.
- Replies are rendered as text, not executable HTML. Source links come from an allowlist of checked EPA and NOAA pages. The AI does not browse live sources.
- Common personal details are checked in the browser and server. First detection warns; a second closes the AI space. The tree still works. Known matches are not sent to OpenAI. These checks are imperfect; an AI-detected detail may already have reached OpenAI. The interface clearly warns not to enter personal details.
- The AI lock persists in this browser, with a matching server-session safeguard. Clearing browser data or using a new browser can bypass a prototype lock; this is not identity verification or a complete child-privacy compliance system.
- The app does not save chats, but submitted questions/goals are sent to OpenAI. `store: false` is used; this does not promise that OpenAI keeps no service logs. Have an adult review provider terms and COPPA requirements before children use a public version.
- No account, analytics, precise location, camera, microphone, purchases, or public rankings. The server listens only on this computer.

## Evidence and honest differences

The brief says no existing tools exist, but earlier research found Recycle Coach, EPA food-waste guidance, and other services. This app does not claim to be the first or better without testing. Its focus is a personal goal + AI next-step advice + a visible growing tree. National statistics show the larger problem, not proof that this app reduces pollution.

- EPA waste facts (2018): https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials
- EPA plastics (2018): https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data
- NOAA wildlife: https://marinedebris.noaa.gov/why-marine-debris-problem/ingestion
- EPA food waste: https://www.epa.gov/recycle/preventing-wasted-food-home
- Recycle Coach example: https://environment.westchestercountyny.gov/recycle-coach-app
- COPPA guidance: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business

## Short video / main-job check

1. Choose “Collect litter,” target 10, and press “Plant my goal.”
2. Choose “What’s one safe first step?” This fills the question only. Press the check mark to ask the real AI.
3. Show “Thinking…” and the answer with its source, if a factual source was used.
4. In a clearly labelled demonstration, enter 2 items: the tree reaches 20%. Only enter actual actions during real use.
5. Refresh: the goal and 20% progress remain, but the chat does not.
6. Add 2 at a time to see all five stages. You can change the goal after a confirmation.
7. Test safety separately using made-up details only. First input like “My address is 123 Example Street” warns; a second closes AI. Do not use real details. This locks that browser’s AI space, so do not do it in the same browser before filming the normal flow.

## Verification

Implementation is ready for local browser and automated testing. Real AI verification is waiting for the user-supplied .env and model name. No mock reply is used as a substitute for real AI in the app.

## Maybe Later

- The free article shop unlocked by completing the first tree; hopeful, factual articles and cosmetic rewards.
- More trees, goal history, optional reminders, and measured user testing against ordinary recycling information.
- School-approved local recycling rules and teacher-reviewed printable announcements.
- A database and optional accounts only after an adult reviews privacy, consent, access, retention, and deletion rules.
- Better privacy detection, independent safety review, and a clear supervised way to recover a locked AI space.
- A reviewed source library; no unsupported carbon or pollution conversions.
- Competition PDF and video support. Dates in BRIEF.md are supplied by the student, not independently verified.

## What’s next

Supply the missing local AI settings, finish automated/browser checks, and make a local Git save point after saving is verified. Keep all private .env files outside the save point.
