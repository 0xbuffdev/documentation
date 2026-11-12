---
title: AI Memory Belongs in Files
description: A manifesto for AI memory that people can inspect, correct, and take with them.
date: 2026-10-19
author: Christopher S. Aondona
---

# AI Memory Belongs in Files

AI agents are beginning to carry decisions across sessions, projects, and teams. A remembered preference can save hours. An outdated constraint can waste them. An invented fact can become the premise for the next decision, then the next.

The more responsibility we give agents, the more important it becomes to know what they remember, where it came from, and whether it still deserves to be believed.

**We believe AI memory should belong to the people and teams whose work created it.** They should be able to open it, challenge it, correct it, and take it elsewhere. No model provider, search index, or hosted service should have to remain in the picture for that memory to survive.

This is the conviction behind MemoFS.

## Keep the record in the open

Memory belongs in readable files, with a format that can be understood without a running service. A person should be able to inspect the record using familiar tools and recover it on another machine.

Search matters. Keywords, embeddings, and other indexes can help an agent find the right passage among years of notes. But an index is a way to reach the record; it cannot become the only copy of what was remembered. We want indexes to be replaceable without losing accepted memory or its history.

Plain files do not make a statement true. They make it possible to see the statement, question it, and discover how it changed.

## Let memory have a history

People revise decisions. Sources change. Agents make mistakes.

A correction should explain what it replaces. Under normal runtime operations, the earlier record should remain available as history rather than quietly disappear from the account of what an agent once believed. When two corrections conflict, we want the disagreement exposed, not decided by whichever write arrived last.

People must also be able to retract information from active use. Retraction is different from physical erasure: copies may remain in Git history, backups, or other machines. We will describe those limits plainly and treat deletion as a separate responsibility that needs verifiable procedures.

## Make every claim answerable

A useful memory tells us more than what was said. It tells us who or what supplied it, when it was recorded, and whether it is a direct statement, an observation, or an inference.

Those distinctions affect authority. A webpage cannot silently rewrite a person's preferences. An agent's guess cannot promote itself into a verified fact. A convincing passage retrieved from a document is still evidence to assess, not an instruction the agent is obliged to follow.

Provenance cannot guarantee truth. It gives people the information needed to investigate a claim and decide whether to rely on it.

## Remember with doubt where doubt is due

Finding a relevant memory is not the same as finding a reliable one.

A similarity score measures a match to a query. A timestamp tells us when something was recorded. A source hash can reveal that particular bytes changed. None of them settles whether the underlying claim is correct today.

MemoFS should distinguish a verified source from one that has changed, disappeared, or cannot be checked. It should preserve conflicting evidence and show uncertainty rather than hide it behind a confident answer. Old memories must remain discoverable; age alone is not proof that they are wrong.

The agent's context window is limited, so recall needs judgment. Keep a small, accountable core close at hand and retrieve the rest when it is useful. When space or host capabilities prevent that, report the limitation. Putting text into a prompt is not a guarantee that an agent will obey or even use it.

## Protect what is remembered

Persisted memory can carry secrets, personal details, and malicious instructions far beyond the interaction where they appeared. Admission deserves as much care as retrieval.

We commit to screening proposed memories, keeping their sources visible, and refusing to let untrusted material grant itself authority. Models may help extract or organize information, but their proposals still require the same scrutiny as any other input.

No filter catches every secret. No provenance label makes prompt injection harmless. Security claims must be supported by tests and accompanied by the limits of those tests.

## Make independence practical

A memory system should work on a person's machine without requiring a cloud account or remote model. Network access and hosted processing should be explicit choices. If an optional provider becomes unavailable, local memory should remain usable.

The portable format and the rules for interpreting it must outlive any one SDK. We are building a language-neutral contract so independent implementations can share records and be checked against the same expectations.

A hosted service may offer coordination or compute. It must not become the owner of the only usable version of someone's memory.

## Keep the evidence behind the conclusion

A recording, document, or image is not the same thing as a memory drawn from it.

When people choose to retain original evidence, a memory should be able to point back to the relevant passage, moment, page, or region. Transcripts and embeddings help with discovery, but they are interpretations and indexes, not substitutes for the original. Retention choices must remain visible, especially when an original is no longer available.

We will not pretend every medium can be handled with the same fidelity or risk. Capabilities should be added and qualified one at a time.

## Earn trust through working systems

Readable files are a starting point. Trust also depends on what happens when a write is interrupted, two processes disagree, an index fails, or a machine has to be rebuilt from its surviving records.

Those cases deserve recovery tests, conformance tests, and clear failure reports. Retrieval benchmarks cannot by themselves prove that memory improved an agent's decisions. A passing security check cannot prove that manipulation is impossible.

These are commitments for the MemoFS rebuild, not an announcement that every capability already exists. Published releases must distinguish what works from what remains to be built. When evidence contradicts a design, we will change the design.

We invite developers to inspect the format, test the recovery path, and challenge the claims we make. We want users to have the same freedom over the information their agents retain.

**Memory worth keeping should also be memory you can question.**
