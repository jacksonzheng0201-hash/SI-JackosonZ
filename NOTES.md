# De-Pollution — Version 1

## Run it

From this project folder, run:

```sh
./start.sh
```

Open http://127.0.0.1:4317. Stop with Ctrl+C. No package installation or database is needed. The launcher uses Node.js 22+ or the Node runtime already bundled with Qoder on this Mac. It handles this folder’s backslash using a temporary link, without renaming the folder.

## AI setup

OpenAI model: gpt-5.6-luna

Use the exact model name from OpenAI's model list on that line: no spaces, no extra words. The app reads only this one line, so a name typed with spaces (for example "gpt 5.0 Luna") is read as empty and the AI stays off. The chosen model is GPT-5.6 Luna, whose API name is `gpt-5.6-luna`. If OpenAI ever says this model is not available for your account, ask a trusted adult to check the exact name in your OpenAI account and update this line. On 2026-11-22 `getKey()` reached OpenAI's model list successfully and the six usable models contained exactly one name with “luna” in it, which confirms `gpt-5.6-luna` rather than guessing it.

The AI connects to OpenAI through the server-only `getKey()` function in `keygen.mjs`. It signs in to MindDo with Vercel environment variables, or locally with `KEYGEN_URL` and `KEYGEN_TOKEN` in `.env`; `keygen.mjs` reads the environment first and then `.env`. The browser never receives either value or the temporary OpenAI key. MindDo returns JSON with `apiKey` and `expiresAt`; the server reuses that key until it expires. If OpenAI rejects it with 401 or 403, the server drops only that cached key, asks `getKey()` once for a replacement, and retries the answer once. A failed MindDo lookup is attempted only once: its `error.message` is shown on the page and its `error.fix` is written to the server log.

Placeholder wording such as “paste here” or “paste your key here” is counted as empty, so the app never claims to be ready or sends a doomed request. Never paste either setting into chat, and the app never prints them. `.env` is ignored by Git on line 1; only the placeholder `.env.example` is tracked. Model and `.env` changes are read on the next request; refresh the page to update the setup label. The older `PASTE-KEY-HERE.txt` file is now obsolete and is not read by the app, so the builder should delete it locally with a trusted adult. OpenAI API usage may cost money.

## Security alert from 2026-11-10, again on 2026-11-16

A key was pasted directly into chat twice. Treat both as compromised: revoke/delete them in OpenAI’s dashboard with a trusted adult, create a new key, and put only the new key in `.env`. The chat history on this computer keeps those messages, so deleting the text here is not enough — revoking the key is the real fix. Never paste a key into chat, email, screenshots, video, or NOTES.md. The builder’s own instructions say the key must never be printed, so the assistant will not copy a chat-pasted key into `.env` either.

Extra protection added 2026-11-16: a local save-point guard (`.git/hooks/pre-commit`) refuses to commit any file containing key-shaped text and never echoes the match. This guard is local to this folder; a pasted key still has to be revoked. The repository contains neither the `.env` file nor any key.

Because the hidden `.env` file is easy to miss in the editor, the app also accepts a visible `PASTE-KEY-HERE.txt` in this folder (ignored by Git on line 2, same as `.env`). The builder pastes the key into either file and saves; `.env` wins if both hold a key. Nothing is ever copied between them by the assistant — Qoder’s own safety rules block the assistant from moving a secret file, which is a protection, not a failure. The key text is never printed on screen or sent into chat, and placeholder wording such as “paste your key here” counts as empty so the app never claims to be ready.

New finding on 2026-11-16 while getting the GitHub repo ready: that repo’s existing `main` branch (one commit named “Add files via upload”) already holds a file called `PASTE-KEY-HERE.txt` that is exactly the same size as the local file carrying the real key. The repo is public, so anyone on the internet could read it. That upload was made outside this folder, so it is not a Git save-point mistake — the file was added through GitHub’s own website. Fix order matters: (1) revoke the key in OpenAI with a trusted adult, because deleting the file later does not undo the exposure, (2) delete that file from the repo on GitHub, (3) only then push code. No local save point on `master` has ever contained `.env` or `PASTE-KEY-HERE.txt`, which was checked commit by commit before any push. The remote `main` and local `master` have unrelated histories, so pushing over `main` would either be refused or erase the already-uploaded files; the safe plan is a separate branch first, and no force-push.

## What’s done

- BRIEF.md is the original, unchanged project brief and guides the build.
- One goal at a time: collect litter, reuse materials, save food, save measured electricity, or avoid single-use items. “Prevent litter” is an item count, not an estimate of total pollution.
- A symbolic tree grows at 20%, 40%, 60%, 80%, and 100%. Only actions entered by the user count; the AI cannot add progress.
- Three made-up example goals contain no real people and start at zero when planted.
- The Growth Shop unlocks permanently when the first tree reaches 100%. It has three free, source-linked articles and three eco comics that can be collected with leaves earned from recorded progress. There are no real-money purchases, accounts, or personal-information requests.
- Every AI question is classified as `goal` or `off_topic` using the active goal label and safety hint. On-topic answers respond to the actual question; off-topic answers are brief and warmly invite a goal-related question. Safety rules take precedence.
- All browser saving is in `public/storage.js`. Goals, privacy-warning counts, permanent Growth Shop unlock, earned leaves, and owned comics are saved; chats are not.
- Saves on this computer only for now. More precisely, data stays in this browser and local address. Clearing browser data removes it. Browser data is not encrypted and people sharing the same browser profile can see it.
- All OpenAI requests are in `openai.mjs`, called only by the local server after the user submits a question with the check mark. The server obtains the temporary AI key only through `getKey()` in `keygen.mjs`; browser code never imports or receives it. Every request includes the complete “My AI’s instructions” section from BRIEF.md as system instructions, plus child-safety and factual rules.
- The brief’s “build and generate the website” wording is treated as the original builder task. Inside the finished website, the AI helps with environmental goals and honestly describes user-recorded progress; it does not claim to edit the website.
- While waiting, the app says “Thinking…” and disables another request. The server also blocks overlapping requests and limits requests per session.
- Replies are rendered as text, not executable HTML. Source links come from an allowlist of checked EPA and NOAA pages. The AI does not browse live sources.
- Common personal details are checked in the browser and server. First detection warns; a second closes the AI space. The tree still works. Known matches are not sent to OpenAI. The checks look for identifying patterns (a real name after “my name is”, an address, a phone-shaped number, a named school, a key), so ordinary questions with numbers, ages, or kWh amounts are not treated as personal information. They are still imperfect; an AI-detected detail may already have reached OpenAI. The interface clearly warns not to enter personal details.
- The AI lock persists in this browser, with a matching server-session safeguard. Clearing browser data or using a new browser can bypass a prototype lock; this is not identity verification or a complete child-privacy compliance system.
- The app does not save chats, but submitted questions/goals are sent to OpenAI. `store: false` is used; this does not promise that OpenAI keeps no service logs. Have an adult review provider terms and COPPA requirements before children use a public version.
- No account, analytics, precise location, camera, microphone, real-money purchases, or public rankings. The server listens only on this computer.

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
6. Add progress until 100%. Show all five tree stages and the leaf balance reaching 10, then scroll to the Growth Shop as it changes from Locked to Open. Open one free article and show its source link. Buy one eco comic with earned leaves, read all three panels, and show that it can be reopened from the collection.
7. Press “Ask your guide about this,” then press the check mark. Show the classification label and answer.
8. Refresh: the goal/shop unlock remains, but the chat does not.
9. Test safety separately using made-up details only. First input like “My address is 123 Example Street” warns; a second closes AI. Do not use real details. This locks that browser’s AI space, so do not do it in the same browser before filming the normal flow.

## Verification

Implementation is ready for local browser use, with 40/40 automated tests passing. Browser testing confirmed planting, exact progress, persistence, leaf rewards, shop unlocking, comic purchases and reading, free articles, article question handoff, privacy warning/lock, and setup unavailable handling. The app’s OpenAI adapter uses a real API request path and now reports the setup as ready with a saved key; the assistant has not sent a question itself, because only the builder presses the check mark and each answer may cost money. The model name is set to `gpt-5.6-luna`. No mock reply is used as a substitute for real AI in the app.

A local Git save point was created after browser saving passed. The private `.env` is ignored and was not committed.

## Green-goal MVP re-check, 2026-11-25

The requested goal feature works fully. A clean-browser test planted a 10-item litter goal, recorded 2 items at a time, saw the tree reach 20%, 40%, 60%, 80%, and 100%, and confirmed the Growth Shop opened only at 100%. Refreshing kept the goal and progress. All three article buttons unlocked, and the wildlife article opened with its real NOAA source link. Starting another goal kept the shop open. A separate 0.3 kWh electricity goal accepted 0.1 kWh steps and reached 100%. The real local app also loaded the builder’s existing completed goal with a full tree and open shop, without changing that saved progress. No production repair was needed; regression tests now cover every goal type reaching full bloom through valid steps.

## 20% tree-growth re-check, 2026-11-26

The requested progress-and-tree feature works fully. An isolated browser test planted a 10-item litter goal and recorded 2 items at a time. At 20%, 40%, 60%, 80%, and 100%, the custom bar, accessible value, milestone markers, stage badge, and tree artwork all matched the recorded percentage. The seed changed to a sprout at 20%, the growing tree enlarged through the middle stages, and fruit appeared at 100%. The Growth Shop stayed locked until 100%. A fresh page load kept the completed goal, 10 earned leaves, and open shop. All 44 automated tests pass, the page had no console errors or warnings, and no AI question was sent. Test progress was isolated from the builder’s real browser save. No production repair was needed.

## Progress display and comic removal (historical), 2026-11-25

The large percentage-number display was removed so it can no longer look out of line with the bar. The goal label, action count, and milestone percentages remain. The custom bar eases to the recorded percentage over 0.35 seconds, then matches it exactly; its accessible value and text report that same percentage.

The leaf-powered comic shop was removed at this point, leaving the Growth Shop with only its three free, source-linked articles. That removal was reversed on 2026-11-26; see the restoration section below. At the time, version-2 saves still loaded the goal, privacy-warning count, and permanent shop unlock, then saved as version 1 without leaf or comic-ownership data.

Verification on 2026-11-25: 36/36 tests pass. Reloading the real app kept the saved completed goal and open shop, showed the bar at exactly 100% of its track, showed no large percentage number or comic controls, and opened the NOAA article with its real source link. The current page had no console errors or warnings. The saved version-2 data was not rewritten during this check.

## Smoother growth transitions, 2026-11-26

Each recorded addition now eases the progress fill and milestone markers. The seed, sprout, and growing tree cross-fade, later tree stages scale smoothly, and fruit fades in at full bloom. Reduced-motion settings turn these transitions off immediately.

Verification on 2026-11-26: 36/36 tests pass. Deterministic browser checks at 20%, 40%, 60%, 80%, and 100% confirmed the bar moved partway through each transition and finished at the exact percentage; tree stages, fruit, ARIA values, and the open article shop also stayed correct. The current page had no console errors or warnings.

## Comic shop restored, 2026-11-26

The original leaf-powered eco comic shop from commit `e16113b` is back. It includes “The Bag That Came Back” (4 leaves), “The Lunch-Box Rescue” (5 leaves), and “The Litter Detective” (6 leaves), each with three panels, a safe action, and a real EPA or NOAA source. One leaf is earned for each 10-percentage-point boundary recorded. The custom progress bar, removed number line, smooth growth transitions, reduced-motion support, free articles, and version-2 save data are all preserved. Version-1 saves load with zero leaves and an empty comic collection.

Verification on 2026-11-26: 40/40 tests pass. An isolated browser-storage check planted a 10-item goal, confirmed exact bar widths and ARIA values at every 10% step, earned 10 leaves, and saw the shop open only at 100%. It bought and reopened all three comics, confirmed all panels and source links, rejected an unaffordable purchase without spending leaves, and kept the goal, leaves, shop, and collection after reload. A new 0.3 kWh electricity goal kept the open shop and collection, accepted 0.1 and 0.2 kWh additions, and reached exact 33% and 100% displays. Free articles still opened. There were no console errors or warnings and no AI question requests; the real browser save was not used or changed. The in-app browser was hidden and in reduced-motion mode, so this run verified interaction and exact layout measurements rather than intermediate animation or a screenshot.

Privacy check tuning on 2026-11-10: some ordinary questions were wrongly called personal information (“I live in a small apartment building”, “2018 2019”, “1 2 3 4 5 6 7 8”, “a good 1 way to reuse bags”, “the secret is…”). The checks now need a stronger signal, and both directions were re-tested: 21 personal-information examples still blocked, 22 ordinary goal questions pass. In the browser, a previously mis-flagged question now reaches the normal setup message with zero warnings, while a made-up address still warns on the first try.

## GitHub Pages fix, 2026-11-16

The repo already has GitHub Pages turned on, so the live site is https://jacksonzheng0201-hash.github.io/SI-JackosonZ/. It looked blank, unstyled and unclickable for two separate reasons: (1) the page asked for `/style.css` and `/app.js` from the site root, but Pages serves this project under the `/SI-JackosonZ/` path, so both requests returned 404, and (2) GitHub was showing only the `public/` folder of an earlier upload, so the folder layout did not match. Now every asset is referenced relative to the page (`./style.css`, `./app.js`, `./favicon.svg`, brand link `./`) and the repository root holds one tiny forwarding page that opens `./public/`, so Pages finds the app wherever the project path is.

GitHub Pages only serves plain files. It cannot run `server.mjs`, so the hosted copy has no AI: the guide says plainly that the AI lives in the local app, the question box and quick prompts are disabled there, and nothing is ever sent or charged. Everything else works online — planting a goal, recording progress, the five tree stages, saving in that browser, reading free Growth Shop articles, earning leaves, and collecting eco comics with those leaves. The AI still runs from the project folder with `./start.sh`, which is the version to film. No key is uploaded: Pages serves the whole repository to anyone, so `.env` and `PASTE-KEY-HERE.txt` stay ignored, and the repository's own copy of `PASTE-KEY-HERE.txt` must still be deleted from GitHub and the key revoked in OpenAI.

Push landed 2026-11-16: remote `main` moved `cdaa50c` → `d82bc3d` as an ordinary fast-forward on top of both earlier uploads, so nothing was overwritten and no history was rewritten. The visible file list is now the 20 project files (root `index.html`, `public/`, `tests/`, `.gitignore`, `.env.example`) and no key file. Checked in the live site: `https://jacksonzheng0201-hash.github.io/SI-JackosonZ/` forwards to `public/`, the style sheet and all five scripts return 200, 220 rules apply, planting a 3-item goal, recording it to 100%, opening the Growth Shop and reading the NOAA article all work, the guide says the AI lives in the local app, and the test progress was cleared afterwards so her first visit looks brand new. The key file is still readable inside the two earlier commits, so revoking it in OpenAI stays step 1.

## Maybe Later

- More Growth Shop articles, teacher/student review, cosmetic plant accessories, and research on whether article reading increases goal completion.
- More trees, goal history, optional reminders, and measured user testing against ordinary recycling information.
- School-approved local recycling rules and teacher-reviewed printable announcements.
- A database and optional accounts only after an adult reviews privacy, consent, access, retention, and deletion rules.
- Better privacy detection, independent safety review, and a clear supervised way to recover a locked AI space.
- A reviewed source library; no unsupported carbon or pollution conversions.
- Competition PDF and video support. Dates in BRIEF.md are supplied by the student, not independently verified.

## What’s next

1. With a trusted adult, revoke the leaked OpenAI key and create a new one — the file is gone from the list, but the two older commits still show it.
2. With a trusted adult, delete `PASTE-KEY-HERE.txt` from inside those older commits on GitHub, or keep the repository private until the key is revoked.
3. Open `PASTE-KEY-HERE.txt` in this folder, replace the old key with the new one, and save. Nothing else needs changing.
4. Confirm http://127.0.0.1:4317 shows “OpenAI gpt-5.6-luna ready · only answers when you ask”.
5. Test one on-topic question, one off-topic question, one article question, and one unsafe/personal-information question using made-up data, then make another local save point. Never commit `.env` or `PASTE-KEY-HERE.txt`.
