# Kind Answers

*Uncle Dave Bryant, his brothers, and the war a boy didn't know to ask about.*

By **John Gladin**, with the written recollections of **Jodie Sweat**.

A boy of twelve and a girl of eleven met their great-grand-uncle at his fireplace in
Chase City, Virginia, in about 1970. He had been wounded in the First World War. He
answered what he was asked, kindly and briefly, and did not mention that he had had a
brother who went to France with him and did not come back.

This account follows the order in which those facts were found out, not the order in
which they happened.

A static site. No build step, no dependencies, no JavaScript, no external calls.
Open `index.html`.

---

## Please read before sharing

Compiled for **family and fellow researchers**. Most of it rests on federal records
that belong to everyone. The material concerning **Sergeant William Kokos** — a man
outside this family who left no descendants to consult — does not. Please do not
repost or circulate that part outside private research correspondence.

Every page carries `noindex`, and `robots.txt` asks search engines to stay away. That
is a courtesy, not a control.

## A note on structure

**The narrative pages withhold the events of 7 October 1918 until the October
chapter.** This is deliberate and is explained on the start page. The
[Sources](10-sources.html) page does *not* withhold, and says so at the top — the
evidence must stay auditable even when the storytelling doesn't.

If you are checking facts rather than reading, start at Sources.

## Companion account

An earlier telling of the same evidence, organised around the three sergeants and
stating the outcome from the first page, is at
[three-sergeants-site](https://github.com/LTCjRet/three-sergeants-site). Nothing in it
contradicts this; it starts in a different place.

## Structure

```
index.html               The fireplace, about 1970 — and the distribution notice
1-chase-city.html        Caldwell County, Chase City, W. J. Bryant & Sons
2-june-1917.html         Three brothers, one table, one registrar
3-crossings.html         The Mongolia and the Pastores
4-sergeants-job.html     What a sergeant actually was
5-two-companies.html     Company D, Company L, and William Kokos
6-october.html           4–7 October 1918  ← the reveal
7-afterward.html         Three burials, 1918–1921
8-1919-1973.html         The rest of their lives
9-fireplace.html         Back to Chase City, now knowing
10-sources.html          Every record, correction and open question
company-organization.html  Reference chart: the AEF rifle company
assets/                  47 images
```

## Editing by hand

See **[EDITING-GUIDE.md](EDITING-GUIDE.md)** for the full workflow. The short version:

```
Checkpoint.bat "what you changed"   # local restore point after each page, never pushes
Review.bat                          # writes REVIEW.txt - what a reader would see change
Check.bat / Check-Spoilers.bat      # verify
Publish.bat "Rev 4: ..."            # go live
```

`REVIEW.txt` is what keeps the narrative and the evidence logs from drifting apart. Git
records that a word changed; it cannot know that a claim in the ledger now disagrees.

## Publishing

```powershell
.\Check-Site.ps1     # pre-flight, read-only, safe any time
.\Publish-Site.ps1 -Message "Rev 2: what changed"
```

`Publish-Site.ps1` refuses to push unless the pre-flight passes. The check looks for
leaked identifiers, zero-byte and NUL-corrupted files, broken or wrong-case asset
references, and stray research files.

**Additionally, run `Check-Spoilers.ps1`** before publishing narrative changes. It
verifies that no page before the October chapter reveals the outcome.

## GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → `main` → `/ (root)`.
