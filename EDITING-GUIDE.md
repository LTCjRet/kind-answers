# Editing these pages by hand

Written for editing sessions in Notepad++, with the evidence logs kept in step.

---

## Notepad++ — set these once

Open any page and check the **status bar at the bottom right**. It must read:

| Setting | Required | If it's wrong |
|---|---|---|
| Encoding | **UTF-8** | Encoding menu → *Convert to UTF-8* — **not** *UTF-8-BOM* |
| Line ending | **Unix (LF)** | Edit → EOL Conversion → *Unix (LF)* |

Neither breaks the site if wrong, but both make **every line of the file show as
changed**, which buries your real edits in noise and makes the review useless.

Two settings worth turning on: **View → Show Symbol → Show All Characters** while
you're working (so you can see what you're actually deleting), and **Language → H →
HTML** for syntax colouring.

---

## The loop

```
1.  Edit ONE page in Notepad++ and save
2.  Checkpoint.bat "what you changed"        ← local restore point, nothing published
3.  Repeat for the next page
    ...
4.  Review.bat                               ← writes REVIEW.txt
5.  Hand REVIEW.txt to Claude                ← evidence logs reconciled
6.  Check.bat  and  Check-Spoilers.bat       ← full verification
7.  Publish.bat "Rev 4: ..."                 ← goes live
```

**Checkpoint after every page.** It costs five seconds and it means a bad edit on page
nine costs you page nine, not the whole session. Nothing becomes public until step 7.

---

## What each tool does

| Command | What it does | Changes anything? |
|---|---|---|
| `Checkpoint.bat "note"` | Saves a local restore point. Checks page structure first. | Commits locally. **Never pushes.** |
| `Review.bat` | Writes `REVIEW.txt` — a sentence-level list of what a *reader* would see change. | No |
| `Check.bat` | Full pre-flight: links, images, leaked identifiers, file integrity | No |
| `Check-Spoilers.bat` | Confirms nothing before chapter 7 gives away the ending | No |
| `Publish.bat "msg"` | Runs the pre-flight, then commits and pushes | **Publishes** |

`Review.bat` compares against your last checkpoint by default. To see everything not yet
published:

```
powershell -NoProfile -ExecutionPolicy Bypass -File .\Review-Changes.ps1 -Since origin/main
```

---

## Undoing things

| Situation | Command |
|---|---|
| Undo the last checkpoint, keep the file edits | `git reset --soft HEAD~1` |
| Throw away edits to one page since last checkpoint | `git checkout -- 7-october.html` |
| Throw away **everything** since the last checkpoint | `git checkout -- .` |
| See a page as it was at the last checkpoint | `git show HEAD:7-october.html` |
| Go back to the published version of one page | `git checkout origin/main -- 7-october.html` |

**`git reset --hard` is not on that list deliberately.** It discards uncommitted work
with no warning and no recovery. It destroyed several hours of work on this project once
already. If you think you need it, checkpoint first.

---

## Things that must not change

`Checkpoint.bat` checks for these because they fail *silently* — the page still looks
right in a browser.

- **`<nav class="top">` … `</nav>`** — the navigation block. Present and identical on
  every narrative page.
- **`<footer class="site">` … `</footer>`** — carries the licence and the redistribution
  link.
- **`<meta charset="utf-8">`** — without it the accented names break.
- **`<meta name="robots" content="noindex, nofollow">`** — keeps the account out of
  search engines.
- **`</html>` at the end of the file** — its absence means the file was truncated.

If you change the navigation, change it on **all fourteen pages** or the reader gets a
different menu depending on where they are.

---

## The withholding — the one rule that isn't obvious

Chapters **1 to 6 must not reveal that Alexander was killed.** The reader is meant to
stand where a twelve-year-old stood, not knowing.

Before chapter 7, do not introduce:

- the words *killed in action*, *grave*, *cemetery*, *burial*, *buried*, *headstone*,
  *memorial*, *posthumous*
- the date **7 October 1918** with any explanation attached to it
- **Alexander's portrait**, or the words ***Soldiers of the Great War*** — that volume is
  a roll of the dead, so naming it is the same as saying it

`Check-Spoilers.bat` enforces all of this. It has three documented exceptions; if you add
a fourth, say why in the script's `$allowed` list rather than loosening a pattern.

The **Sources** chapter deliberately withholds nothing and says so at the top. Facts
belong there whole.

---

## Keeping the records in step

This is the part git can't do for you.

The narrative and the four evidence logs — `RECORDS-LOG`, `RESEARCH-LOG`,
`NEGATIVE-SEARCHES`, `EVIDENCE-LEDGER` — have to say the same thing. Git will faithfully
record that you changed "seventy-six" to "seventy-five" and will have no idea that a
claim in the ledger now disagrees with the site.

**So: `Review.bat`, then hand over `REVIEW.txt`.** It lists every sentence a reader would
see appear or disappear, which is exactly what's needed to spot a factual change hiding
inside a rewrite. Claude reconciles the ledger, the corrections table on the Sources page,
and `CHANGELOG.md`.

Three kinds of edit need that reconciliation:

1. **A fact changed** — a date, a number, a name, a rank, a place.
2. **A claim strengthened or weakened** — anything moving between "probably", "is
   recorded as", and "is not known".
3. **A source added or dropped** — including images, which are records too.

Pure prose — rhythm, word choice, cutting a sentence you dislike — needs nothing.

---

## If you hand work back mid-session

Checkpoint first. Claude re-reads every file before touching it, but an uncommitted edit
that nobody has recorded is the one thing that can be lost without trace.
