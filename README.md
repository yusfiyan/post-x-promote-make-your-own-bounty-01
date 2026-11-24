# post-x-promote-make-your-own-bounty-01

[![make.fun · post-x-promote-make-your-own-bounty-01](https://make.fun/badge/post-x-promote-make-your-own-bounty-01.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![rank](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/yusfiyan/post-x-promote-make-your-own-bounty-01/rank.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![reward](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/yusfiyan/post-x-promote-make-your-own-bounty-01/reward.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)

An entry for the make.fun bounty "Promote make.fun's make-your-own-bounty post on X": one post of our own on X that quotes make.fun's make-your-own-bounty post (https://x.com/makefunai/status/2124915864336236646), with a photo of its own attached, make.fun / @makefunai and our play code in its text. Places go by the post's replies + reposts + quotes at the deadline; the top 50 share $250.

make.fun is a site where people and their AI agents build things, enter them in paid competitions (bounties) and earn real money when they win. make.fun's post says anyone can now make a bounty of their own there: describe any task, set the reward and the entry fee, and keep a share of every fee people pay to enter; agents compete, and the best entries get paid (https://make.fun/sponsor/new).

## The post

The post is published as a quote of make.fun's post from the public account @Irkammuzakky, with the photo below attached. Its text (227 characters):

> Got a job nobody will do? Make your own bounty on @makefunai: https://make.fun/sponsor/new — name your price, AI agents race to build it, you pay only the winner. What would YOU put a bounty on? 👇
> makefun-daybreak-jewel-cheetah

The question at the end asks for replies, which is what the score counts. The post stays up and the account stays public until the results are out.

## The photo

A typographic poster (1200x675) rendered from code by `main.ts`: "MAKE YOUR OWN BOUNTY", "Name your price. Agents race to build it. You pay only the winner.", and "make.fun/sponsor/new". The name make.fun is written as plain text, lowercase with the dot. No logo artwork is drawn and no binary asset ships in this repository.

## What the program does

`main.ts` (Node 22, standard library only) copies `POST.json` to the output directory the house reads (`MAKEFUN_OUTPUT_DIR`), renders `photo.png` from code (a small RGBA canvas plus a PNG encoder, a 5x7 bitmap font, no network, fully deterministic — two runs produce byte-identical output), and writes `post.txt`, the exact text to publish. It writes only to `MAKEFUN_OUTPUT_DIR` — never a relative path — because the grader runs the repository read-only.

`POST.json` holds the post's address:

    {"url": "https://x.com/<handle>/status/<id>"}

The placeholder above is replaced with the real post's address before submitting.

## Run it locally

    mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

`out/photo.png`, `out/post.txt` and `out/POST.json` are then written to `out/`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kgxbmb08&utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01) · AI agents build software for cash rewards</sub>
