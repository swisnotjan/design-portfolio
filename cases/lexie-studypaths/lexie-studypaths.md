# Lexie × StudyPaths

How a self-learning thesis project became a live product used by 150K people

**Role:** Product Designer
**Team:** Solo → embedded in the product team (2 founders, 3 designers, and their dev team)
**Timeline:** Winter 2025 → Summer 2025

Lexie turns anything you feed it — a one-word prompt, a semester of lecture slides, or an entire textbook — into a gamified course with an AI tutor that remembers your strengths and weak spots. It started as a thesis project for students and young professionals teaching themselves outside a formal curriculum.

I defended it with honors and finished my master's — but the interesting part came after: a startup with 150K users offered to buy the app.

Instead, I joined the team to redesign their product. The hard part was rebuilding the core without breaking the experience for existing users. It worked so well the company renamed the product.

[hero illustration]

## The gap nobody was closing

If you've ever tried to teach yourself something, you know the problem usually isn't a lack of information — it's a lack of guidance.

By late 2024, LLMs were finally good enough to be a genuine learning companion, not just a chatbot — that's where the thesis idea came from.

Fourteen of the fifteen people I interviewed named the same three problems:

It's hard to start. It's hard to track progress. It's hard to stay focused and actually understand the material.

A survey of nearly 200 said the same: 92% ranked these three above all others, and most had quit a self-learning attempt at least once — half more than three times.

The existing tools didn't help much. StudyFetch and Knowt turn any material into flashcards and quizzes but leave setup, structure, and progress up to you; Duolingo and Mimo offer polished, gamified paths you can't bring your own material into. The obvious fix: combine both sides into one product. That became the brief.

[product comparison table]
[caption: There were also education platforms with AI features, but those lean toward formal education — not quite what I was after.]

## Hard to start

The first problem: cut the number of actions and decisions, and get people learning fast.

First up is onboarding. The conventional move is to make it long — easy questions that get people invested and more likely to stick around. But every extra question raises expectations, and with AI products those are still shaky, so better to let people just try something themselves.

[onboarding]
[caption: Onboarding stays short — just enough to get out of the way.]

Next comes the course. Apps that let you upload your own material make you configure everything yourself — scope, difficulty, the format of each task — with no sense of progression. So I had Lexie build the course automatically, turning anything you upload into a progressive learning path — editable in plain language if you need.

[course creation]
[caption: You can start a course from a single word — someone new to a subject shouldn't be expected to know its topics or terminology yet.]

There's a tradeoff: control shifts from the interface toward the material you pick and the prompt you write. But lowering the barrier to entry mattered more — deeper tuning could come later.

## Hard to track progress

The survey showed most self-learning happened in short phone sessions — on a commute, or right before or after sleep. So instead of building yet another throwaway quiz generator, I focused on a long-term relationship with the user and a real sense of progress. How?

Duolingo was the obvious reference. Digging into the research, I understood why it's built that way — it's grounded in science:

**Chunking.** Short levels, five to fifteen minutes each, so they fit in working memory and actually get finished.

**Retrieval practice.** Using an exercise not to test knowledge but as the learning itself — the feedback of success or failure helps you retain material far better than rereading it.

**Spacing.** Every chunk mixes new and old material, so you review what you've covered without getting overwhelmed by what's new.

I built Lexie on the same principles, with tweaks: passive "review the concept" and "flashcard" steps — no answers required, but room for harder concepts — alongside active formats like choose the correct answer, match the pairs, and highlight the mistake. Every level ends on encouragement, whatever the result, with the numbers to back it up.

[review the concept]
[caption: Breaking a concept into cards makes memorization a little more focused and active.]

[level result]
[caption: The result screen stays positive, whatever the score.]

## Hard to stay focused and understand the material

This was the one I set out to solve with AI — an assistant reachable from any step of any level, but not a simple chatbot. Its AI carries memory across all your courses and within each one: it remembers what you studied, what came easily, and where you stumbled. Over time it becomes a genuine tutor, pulling examples from what you know well and going deeper on what you find hard.

But memory alone isn't enough. Research on tutoring systems shows the students who need help most ask for it least, while those constantly asking for hints are just farming answers. So the hint had to appear only when actually needed.

[hint button in the fill-in-the-blanks task]
[caption: The button appears on any active level and essentially opens the same AI chat — except it requests a hint right away.]

I spent weeks on this feature alone, running dozens of tests to find the right moment for it to appear without interrupting someone still thinking. What worked: 45 seconds of inactivity after a wrong attempt, or 90 seconds with no attempt at all — and never the first time new material appears.

That way, answer-farmers have to wait the button out or ask in the chat every time — enough friction to make it not worth it — while anyone genuinely stuck gets it right when they need it.

## The finishing touches

The last details: a simple daily streak so the material doesn't fade between sessions, plus smart reminders you can pin to a part of the day in onboarding or settings — or leave entirely up to the app.

[reminders]
[caption: Lexie learns when you tend to open it and gradually gets more precise about sending reminders at the right time.]

## When the scale changed dramatically

That's when StudyPal came into the picture — the old name for StudyPaths. It was a live product built on exactly what Lexie was rethinking: flashcards and quizzes with no single path or sense of progress. The overlap was so close that the founders offered to acquire Lexie before I'd even defended my thesis. Rather than sell, I joined their team to do the redesign myself.

StudyPal had 150K+ active users, but it was still a startup — no budget for long migrations or expensive rebuilds. Whatever I did had to be careful.

## Starting with an audit

With weeks of research already behind me, I went straight into a product audit: mapping the architecture, cleaning up flows, going through the interfaces. Then, to see whether these users wanted change, I ran a similar survey — asking, among other things, about a separate game-like path mode and an option to call the AI.

[in-app banner]
[caption: We ran a small but noticeable banner across every platform.]

About 6% responded, overwhelmingly positive about the game-path mode — so we got to work, teasing it in parallel:

[StudyPaths teaser]
[caption: Yes — StudyPaths was originally just the name of the mode.]

## Building on top, not tearing down

Lexie was built from scratch; here, hundreds of thousands of users relied on the existing tools, so I couldn't just rip them out. I turned that into an advantage: the game path became a separate, optional mode running on those same tools, which stayed for the people already used to them.

This was essentially my second time building the same mode, so I could have gone all in — branching courses, new step types, detailed stats. But I moved iteratively, rather than shift the whole development focus or spend on things that might never get adopted.

[main path screen]
[caption: So the new mode stayed fairly simple — a single-line game path with sequential levels and a preview of your progress.]

Much of the rest was inherited almost unchanged — the proactive AI with memory (now with a few personalities to choose from), smart reminders, and the daily-streak system.

[streak and level widgets]
[caption: We also added levels on top of streaks so long-term progress would feel more tangible.]

## What didn't make it

Not everything we planned made it to production. We figured a detailed course map would sharpen the sense of progress and give better context, but in testing almost no one found it useful.

[course map]
[caption: It might have come down to how the map was presented, but we decided to focus on polishing the more essential pieces instead.]

And the call with the AI from the survey? The feedback was positive, but not exactly enthusiastic. I designed it anyway — a call that looks like an ordinary video call, using animated sprites for emotions to avoid real-time video generation in the test. But once we ran the numbers, the whole stack — the product's AI, an AI for fast text generation, and a real-time voice model — was too expensive to maintain and too complex to build for a feature nobody was really asking for. So we killed that one too, before it ever shipped.

[call with AI]
[caption: The call with the AI was designed to feel like a normal video call.]

## Outcome

The redesign rolled out gradually to all 150K+ users. With almost no analytics in the product, the strongest adoption signal came from support tickets: within three or four weeks, questions and feedback about the game path outnumbered those about the standalone tools.

Most weren't complaints — they were clarifying questions, even thank-yous. Users said it was easier to just start a game course — everything decided for them, new and old material mixed in — and to drop into the familiar tools for a specific topic when needed. Adoption was so clear that before long the founders symbolically renamed StudyPal to StudyPaths.

## What I'd do differently

There's no point pretending otherwise — it was a big stroke of luck to come across a product tackling the exact problem I'd already spent so long on. But two things I'd do differently.

First, I'd go deeper on the technical side of working with AI: what input counts as legitimate, how to keep output consistent, reduce hallucinations, handle context once there's too much of it. We solved it all by trial and error, but I'd have saved real time and energy understanding it upfront.

Second, I'd push harder for basic analytics before rolling things out. The redesign worked, but I can't put exact numbers on how well.

Still, there's something great about having moved on from the team while the game path is still there.
