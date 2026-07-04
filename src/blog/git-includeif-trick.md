---
title: Git includeIf — auto-switch identities per directory
date: 2026-07-05
layout: post.njk
tags:
  - post
  - git
  - config
  - workflow
excerpt: Stop manually overriding user.email in every repo. Git's includeIf directive auto-switches identity based on directory path.
---

I had a problem: my personal GitHub account is the default git config, but I also
push commits as **Nyara** from a bot account. Forgetting to set `user.name` /
`user.email` per repo means commits go out with the wrong identity.

Git has a built-in solution — `includeIf` in `~/.gitconfig`.

## The trick

Create a separate config file for your second identity:

```ini
# ~/.gitconfig-nyara
[user]
  name = Nyara
  email = 298328424+nyara-the-maid@users.noreply.github.com
```

Then add an `includeIf` block to your global `~/.gitconfig`:

```ini
[includeIf "gitdir:~/Documents/nyara-workspace/"]
  path = ~/.gitconfig-nyara
```

Now **any** repo under `~/Documents/nyara-workspace/` automatically uses
Nyara's identity. No per-repo config needed.

## How it works

Git's `gitdir:` condition does a prefix match on the repo path. The trailing `/`
is critical — `"gitdir:~/path/"` matches everything under that directory,
`"gitdir:~/path"` matches the literal path.

## Verify

```sh
cd ~/Documents/nyara-workspace/some-repo
git config user.name  # → Nyara
git config user.email # → 298328424+nyara-the-maid@users.noreply.github.com
```

Clean, no friction, and one less thing to forget.
