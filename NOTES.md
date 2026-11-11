# De-Pollution — Version 1

## Run it

From this project folder, run:

```sh
./start.sh
```

Open http://127.0.0.1:4317. Stop with Ctrl+C. No package installation or database is needed. The launcher uses Node.js 22+ or the Node runtime already bundled with Qoder on this Mac. It handles this folder’s backslash using a temporary link, without renaming the folder.

## AI setup

OpenAI model: gpt-5.6-luna

Use the exact model name from OpenAI's model list on that line: no spaces, no extra words. The app reads only this one line, so a name typed with spaces (for example "gpt 5.0 Luna") is read as empty and the AI stays off. The chosen model is GPT-5.6 Luna, whose API name is `gpt-5.6-luna`. If OpenAI ever says this model is not available for your account, ask a trusted adult to check the exact name in your OpenAI account and update this line.

The key belongs only in this folder’s `.env` as `OPENAI_API_KEY=...`. Never paste it into chat. The server reads it only from that file, not from the browser or inherited environment. `.env` is ignored by Git and is never served to the browser. Model/key changes are read on the next request; refresh the page to update the setup label. OpenAI API usage may cost money.

## Security alert from 2026-11-10

A key was pasted directly into chat. Treat it as compromised: revoke/delete it in OpenAI’s dashboard with a trusted adult, create a new key, and put only the new key in `.env`. Never paste a key into chat, email, screenshots, video, or NOTES.md. This repository does not contain that file or key.

## What’s done

- BRIEF.md is the original, unchanged project brief and guides the build.
- One goal at a time: collect litter, reuse materials, save food, save measured electricity, or avoid single-use items. “Prevent litter” is an item count, not an estimate of total pollution.
- A symbolic tree grows at 20%, 40%, 60%, 80%, and 100%. Only actions entered by the user count; the AI cannot add progress.
- Three made-up example goals contain no real people and start at zero when planted.
- The free Growth Shop unlocks permanently when the first tree reaches 100%. It has three source-linked articles, one goal-focused first, and no purchases, accounts, or personal-information requests.
- Every AI question is classified as `goal` or `off_topic` using the active goal label and safety hint. On-topic answers respond to the actual question; off-topic answers are brief and warmly invite a goal-related question. Safety rules take precedence.
- All browser saving is in `public/storage.js`. Goals, privacy-warning counts, and permanent Growth Shop unlock are saved; chats are not.
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
6. Add progress until 100%. Show all five tree stages, then scroll to the Growth Shop as it changes from Locked to Open. Open one article and show its source link.
7. Press “Ask your guide about this,” then press the check mark. Show the classification label and answer.
8. Refresh: the goal/shop unlock remains, but the chat does not.
9. Test safety separately using made-up details only. First input like “My address is 123 Example Street” warns; a second closes AI. Do not use real details. This locks that browser’s AI space, so do not do it in the same browser before filming the normal flow.

## Verification

Implementation is ready for local browser and automated testing. 22/22 tests pass, and browser testing confirmed planting, 100% progress, persistence, shop unlocking, article reading, article question handoff, privacy warning/lock, and setup unavailable handling. The app’s OpenAI adapter uses a real API request path; it has not yet been called with a live key because this folder still has no `.env` file. The model name is now set to `gpt-5.6-luna`, and the page shows the exact model name it read. No mock reply is used as a substitute for real AI in the app.

A local Git save point was created after browser saving passed. The private `.env` is ignored and was not committed.

## Maybe Later

- More Growth Shop articles, teacher/student review, cosmetic plant accessories, and research on whether article reading increases goal completion.
- More trees, goal history, optional reminders, and measured user testing against ordinary recycling information.
- School-approved local recycling rules and teacher-reviewed printable announcements.
- A database and optional accounts only after an adult reviews privacy, consent, access, retention, and deletion rules.
- Better privacy detection, independent safety review, and a clear supervised way to recover a locked AI space.
- A reviewed source library; no unsupported carbon or pollution conversions.
- Competition PDF and video support. Dates in BRIEF.md are supplied by the student, not independently verified.

## What’s next

1. With a trusted adult, revoke the leaked OpenAI key and create a new one.
2. Copy `.env.example` to `.env`, then paste only the new key into `.env`.
3. Check that the `OpenAI model:` line above still matches the exact model name shown in your OpenAI account.
4. Restart the app and test one on-topic question, one off-topic question, one article question, and one unsafe/personal-information question using made-up data.
5. Make another local Git save point after real AI works. Never commit `.env`.
