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

The key belongs only in this folder’s `.env`, which holds one line: `OPENAI_API_KEY=paste-your-key-here`. Replace only the words `paste-your-key-here` with the real key and save. Placeholder wording such as “paste your key here” is counted as empty on purpose, so the app never claims to be ready or sends a doomed request. Never paste the key into chat, and the app never prints it. The server reads the key only from that file, not from the browser or inherited environment. `.env` is ignored by Git (`.gitignore` line 1) and is never served to the browser; only the blank `.env.example` is tracked. Model/key changes are read on the next request; refresh the page to update the setup label. While the key is empty the app says exactly which file is still empty and charges nothing. OpenAI API usage may cost money.

## Security alert from 2026-11-10, again on 2026-11-16

A key was pasted directly into chat twice. Treat both as compromised: revoke/delete them in OpenAI’s dashboard with a trusted adult, create a new key, and put only the new key in `.env`. The chat history on this computer keeps those messages, so deleting the text here is not enough — revoking the key is the real fix. Never paste a key into chat, email, screenshots, video, or NOTES.md. The builder’s own instructions say the key must never be printed, so the assistant will not copy a chat-pasted key into `.env` either.

Extra protection added 2026-11-16: a local save-point guard (`.git/hooks/pre-commit`) refuses to commit any file containing key-shaped text and never echoes the match. This guard is local to this folder; a pasted key still has to be revoked. The repository contains neither the `.env` file nor any key.

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
- Common personal details are checked in the browser and server. First detection warns; a second closes the AI space. The tree still works. Known matches are not sent to OpenAI. The checks look for identifying patterns (a real name after “my name is”, an address, a phone-shaped number, a named school, a key), so ordinary questions with numbers, ages, or kWh amounts are not treated as personal information. They are still imperfect; an AI-detected detail may already have reached OpenAI. The interface clearly warns not to enter personal details.
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

Implementation is ready for local browser and automated testing. 24/24 tests pass, and browser testing confirmed planting, 100% progress, persistence, shop unlocking, article reading, article question handoff, privacy warning/lock, and setup unavailable handling. The app’s OpenAI adapter uses a real API request path; it has not yet been called with a live key because `.env` still holds the placeholder text instead of a key. The model name is now set to `gpt-5.6-luna`, and both the label and the answer area name the exact file that is still empty. No mock reply is used as a substitute for real AI in the app.

A local Git save point was created after browser saving passed. The private `.env` is ignored and was not committed.

Privacy check tuning on 2026-11-10: some ordinary questions were wrongly called personal information (“I live in a small apartment building”, “2018 2019”, “1 2 3 4 5 6 7 8”, “a good 1 way to reuse bags”, “the secret is…”). The checks now need a stronger signal, and both directions were re-tested: 21 personal-information examples still blocked, 22 ordinary goal questions pass. In the browser, a previously mis-flagged question now reaches the normal setup message with zero warnings, while a made-up address still warns on the first try.

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
2. Open `.env` in this folder, replace `paste-your-key-here` with the new key, and save. Nothing else needs changing.
3. Confirm the page label turns “OpenAI gpt-5.6-luna ready · only answers when you ask”.
4. Restart the app and test one on-topic question, one off-topic question, one article question, and one unsafe/personal-information question using made-up data.
5. Make another local Git save point after real AI works. Never commit `.env`.
