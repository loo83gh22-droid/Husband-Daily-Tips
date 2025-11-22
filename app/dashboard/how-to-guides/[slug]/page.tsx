import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import { supabase } from '@/lib/supabase';

// Guide data - in the future this could come from a database
const guides: Record<string, any> = {
  // Communication guides
  'share-your-feelings': {
    id: 20,
    title: 'Share Your Feelings (Without Making It About You)',
    category: 'Communication',
    difficulty: 'Medium',
    time: 'Ongoing',
    excerpt: 'Learn how to open up and be vulnerable in a way that builds connection, not walls. Express what you\'re feeling without turning it into a problem she needs to solve.',
    content: `## Why This Matters

Sharing your feelings creates emotional intimacy. But if you do it wrong, it becomes a burden she has to carry. Learn how to express yourself in ways that build connection instead of creating distance.

## The Secret: Share, Don't Dump

There's a difference between sharing your feelings and dumping your problems on her. Sharing is about connection. Dumping is about making her responsible for fixing how you feel.

## How to Share Your Feelings

### 1. Start Small

You don't have to share everything at once. Start with smaller feelings:
- "I'm feeling a bit stressed about work today."
- "I'm excited about this weekend."
- "I'm worried about [something specific]."

### 2. Use "I" Statements

"I feel [emotion] about [situation]."

Not: "You make me feel..." or "This situation is making me..."

### 3. Don't Make It Her Problem

Share what you're feeling, but don't expect her to fix it. She can listen and support you, but you're responsible for managing your emotions.

### 4. Be Specific

"I'm feeling overwhelmed" is vague. "I'm feeling overwhelmed because I have three big deadlines this week" is specific and helps her understand.

### 5. Ask for What You Need

If you want something specific, ask for it:
- "I just need you to listen."
- "I'd love a hug."
- "I need some space to process this."

Don't expect her to read your mind.

## What Not to Do

- **Don't use your feelings to manipulate:** "I feel hurt when you..." (if you're just trying to get her to do something)
- **Don't dump everything at once:** Share gradually, not all at once
- **Don't make it about her:** "I feel bad because you..." is not sharing—it's blaming
- **Don't expect her to fix it:** She can support you, but you're responsible for your feelings

## Examples

**Good sharing:**
"I'm feeling stressed about this work project. I'm worried I won't meet the deadline. I think I just need to talk through it."

**Dumping:**
"I'm so stressed and you're not helping and everything is terrible and I don't know what to do!"

**Good sharing:**
"I'm feeling disconnected lately. I miss spending quality time together. Can we plan something this weekend?"

**Dumping:**
"You never spend time with me and I'm lonely and you don't care!"

## The Win

You shared your feelings. She understood. You felt closer. That's a win.`,
  },
  'daily-check-in': {
    id: 21,
    title: 'Do a Real Daily Check-In',
    category: 'Communication',
    difficulty: 'Easy',
    time: '10-15 min',
    excerpt: 'Move beyond "how was your day?" Learn how to have meaningful daily conversations that show you care and help you stay connected.',
    content: `## Why This Matters

Daily check-ins keep you connected. They prevent small issues from becoming big problems. They show you care about her day and what's going on with her.

## The Secret: Make It a Ritual

Don't make it random. Make it a regular thing. Same time every day. Same place. It becomes something you both look forward to.

## How to Do a Real Check-In

### 1. Pick a Time

Choose a time that works for both of you:
- Morning coffee
- After work
- Before bed
- During dinner

**The key:** Make it consistent. Same time, every day.

### 2. Put Everything Away

No phones. No TV. No distractions. Just the two of you, talking.

### 3. Ask Better Questions

Move beyond "how was your day?" Ask:
- "What was the best part of your day?"
- "What was the hardest part?"
- "What are you looking forward to?"
- "What's on your mind?"

### 4. Actually Listen

Don't just wait for your turn to talk. Listen. Ask follow-up questions. Show you're interested.

### 5. Share Your Day Too

It's not just about her. Share your day. What went well? What was hard? What are you thinking about?

### 6. Check In About Your Relationship

Every few days, check in about how things are going between you:
- "How are we doing?"
- "Is there anything you need from me?"
- "What's working well for us right now?"

## What Makes It "Real"

- **Consistency:** Same time, every day
- **Presence:** No distractions, just you two
- **Curiosity:** Actually interested in her answers
- **Vulnerability:** Share your own stuff too
- **Connection:** It's about staying connected, not just checking a box

## Common Mistakes

- **Making it transactional:** "Did you do X? Did you remember Y?"
- **Not listening:** Asking questions but not paying attention to answers
- **Making it about you:** Turning it into a chance to talk about your problems
- **Skipping it:** "We're too busy" is how you drift apart

## The Win

You checked in. You stayed connected. You know what's going on with each other. That's a win.`,
  },
  'plan-perfect-date-night': {
    id: 5,
    title: 'Plan the Perfect, No-Pressure Date Night',
    category: 'Relationship',
    difficulty: 'Easy',
    time: '30 min planning',
    excerpt: 'Skip the "what do you want to do?" conversation. Plan a date that actually works, doesn\'t stress her out, and shows you put thought into it.',
    content: `## Why This Matters

The "what do you want to do?" conversation is a trap. It puts pressure on her to plan, and then you're just along for the ride. When you plan the date, you're taking initiative. You're showing you thought about what she'd actually enjoy. That matters way more than how much you spend.

## The Secret: Think About Her, Not You

This isn't about what you want to do. It's about what she'd enjoy. What does she like? What relaxes her? What makes her feel special? Start there.

**The rule:** If you're not sure, pay attention. What does she talk about? What does she get excited about? Use that.

## Step-by-Step Planning

### 1. Pick the Day (But Be Flexible)

Don't spring it on her last minute. Give her a heads up: "Hey, I want to plan something for us Friday night. Are you free?" If she's not, be flexible. The goal is connection, not a rigid schedule.

**Pro tip:** Check her calendar if you share one. Don't plan something when she's already stressed or busy.

### 2. Consider Her Energy Level

Is she exhausted from work? Plan something low-key. Is she energized? Maybe something more active. Read the room. A fancy dinner when she's dead tired isn't thoughtful—it's tone-deaf.

**Low-energy options:**
- Takeout and a movie at home
- A quiet restaurant she likes
- A walk somewhere pretty
- Coffee and conversation

**Higher-energy options:**
- A concert or show
- Trying a new restaurant
- An activity she's mentioned wanting to try
- A day trip somewhere

### 3. Handle the Logistics

You plan it. You handle:
- Reservations (if needed)
- Directions
- Parking
- Timing

Don't make her think about any of it. The whole point is to take something off her plate, not add to it.

### 4. Keep It Simple

You don't need to plan an elaborate multi-stop evening. One good thing is better than three mediocre things. A nice dinner. A walk. A movie. Pick one and do it well.

**Common mistake:** Overthinking it. A simple, thoughtful date beats a complicated one every time.

### 5. Be Present

When you're on the date, actually be there. Put your phone away. Listen. Engage. Ask questions. This isn't about checking a box—it's about connecting.

## What Makes a Date "No Pressure"

- **No expectations:** It's not about getting something in return. It's about spending time together.
- **No stress:** She doesn't have to plan anything, think about anything, or worry about anything.
- **No pressure to perform:** You're not trying to impress. You're trying to connect.
- **Flexibility:** If something isn't working, adjust. Be willing to change plans.

## Common Mistakes

- **Planning what you want:** This isn't about you. It's about her.
- **Last-minute planning:** "What do you want to do tonight?" is not planning.
- **Overcomplicating it:** Simple and thoughtful beats elaborate and stressful.
- **Having an agenda:** This isn't transactional. It's about connection.
- **Ignoring her energy:** If she's exhausted, don't plan something that requires energy.

## The Win

You planned something. She didn't have to think about it. You spent quality time together. She felt seen and cared for. That's a win.`,
  },
  'help-hosting-party': {
    id: 6,
    title: 'Help When You\'re Hosting the Party',
    category: 'Relationship',
    difficulty: 'Easy',
    time: 'Party duration',
    excerpt: 'Don\'t be the husband who disappears when guests arrive. Actually help. Know what to do, when to do it, and how to make hosting easier for her.',
    content: `## Why This Matters

Hosting is stressful. There's cleaning, cooking, setup, and then managing everything during the party. If you disappear or "help" by asking "what do you need?" every five minutes, you're making it worse. Actually help. Know what to do without being asked.

## The Secret: Anticipate, Don't Ask

Don't wait for her to tell you what to do. Look around. What needs to be done? Do it. If you're not sure, think about what you'd want help with if you were hosting.

## Before the Party

### 1. Clean Without Being Asked

The house needs to be clean. Don't wait for her to ask. Just do it:
- Vacuum
- Clean the bathrooms (especially the guest bathroom)
- Wipe down surfaces
- Take out trash
- Clear clutter

**Pro tip:** Do this the day before, not the day of. Last-minute cleaning adds stress.

### 2. Handle Setup

- Set up extra seating if needed
- Clear space for coats/bags
- Set out extra toilet paper, hand towels
- Check that everything works (lights, music, etc.)

### 3. Prep Food/Drinks

If you're cooking, help. If she's cooking, handle drinks, appetizers, or whatever she assigns you. Don't wait for instructions—ask what you can take off her plate.

## During the Party

### 1. Greet Guests

When people arrive, actually greet them. Take coats. Offer drinks. Make them feel welcome. Don't disappear into another room.

### 2. Keep Things Stocked

- Refill drinks
- Restock appetizers
- Empty trash if it's getting full
- Check bathrooms (toilet paper, towels)

**The rule:** If you see something that needs doing, do it. Don't announce it. Just do it.

### 3. Engage, But Stay Aware

Talk to guests, but keep an eye on her. Is she stressed? Does she need something? Can you take something off her plate?

**Watch for signals:**
- Is she in the kitchen alone while everyone else is socializing?
- Does she look overwhelmed?
- Is she doing cleanup while guests are still there?

### 4. Handle Problems

Something breaks? Spill? Handle it. Don't make her deal with it. You're a team. Act like it.

## After the Party

### 1. Help Clean Up

Don't wait until the next day. Help clean up that night:
- Load the dishwasher
- Put away food
- Take out trash
- Wipe down surfaces

**The rule:** Don't go to bed until cleanup is done. She shouldn't wake up to a disaster zone.

### 2. Don't Complain

Even if you're tired, don't complain about cleaning up. Just do it. She's probably more tired than you are.

## What "Actually Help" Looks Like

- **You see something that needs doing, you do it.** No asking.
- **You anticipate needs.** If drinks are low, refill them. If trash is full, empty it.
- **You stay present.** You're not on your phone or in another room.
- **You handle problems.** You don't make her deal with everything.
- **You clean up.** Without being asked, without complaining.

## Common Mistakes

- **Asking "what do you need?" constantly:** Look around. Figure it out.
- **Disappearing:** Don't vanish when guests arrive. Actually help.
- **Half-helping:** Don't start something and leave it for her to finish.
- **Complaining:** Don't complain about helping. Just help.
- **Waiting for instructions:** Anticipate. Don't wait to be told.

## The Win

You actually helped. The party went smoothly. She didn't have to stress about everything. She felt supported. That's a win.`,
  },
  'give-genuine-compliment': {
    id: 7,
    title: 'Give a Genuine Compliment That Actually Lands',
    category: 'Relationship',
    difficulty: 'Easy',
    time: '30 seconds',
    excerpt: 'Move beyond "you look nice." Learn how to give compliments that feel real, specific, and actually make her feel seen and appreciated.',
    content: `## Why This Matters

Generic compliments don't land. "You look nice" is better than nothing, but it's not memorable. A genuine, specific compliment shows you're actually paying attention. It makes her feel seen, not just noticed.

## The Secret: Be Specific

The difference between a generic compliment and a genuine one is specificity. Instead of "you look nice," say what specifically looks nice. Instead of "you're great," say what specifically is great about her.

## What Makes a Compliment Land

### 1. Be Specific

**Generic:** "You look nice."
**Specific:** "That color really brings out your eyes. You look amazing."

**Generic:** "You're a good mom."
**Specific:** "I love how patient you were with the kids earlier when they were being difficult. That was impressive."

**Generic:** "You're smart."
**Specific:** "The way you handled that situation at work—you were so strategic. I'm impressed."

### 2. Notice Character, Not Just Appearance

Appearance compliments are fine, but character compliments hit deeper. Notice:
- How she handles stress
- How she treats other people
- How she solves problems
- How she shows up for you

**Examples:**
- "I love how you always make people feel welcome."
- "You have such a good heart. I see how you care about people."
- "You're so resilient. I admire how you handle challenges."

### 3. Notice Effort

When she does something, notice the effort:
- "I can tell you put thought into this. Thank you."
- "You worked really hard on this. I see that."
- "I appreciate how much effort you put into making this nice."

### 4. Be Genuine

Don't compliment just to compliment. If you don't mean it, she'll know. Pay attention. Notice things. When you genuinely appreciate something, say it.

## When to Give Compliments

- **In the moment:** When you notice something, say it. Don't wait.
- **When she's stressed:** A genuine compliment can lift her up.
- **When she does something well:** Acknowledge it.
- **Randomly:** Don't only compliment when you want something. Compliment because you notice.

## How to Give Them

### 1. Look Her in the Eye

When you give a compliment, actually look at her. Don't say it while looking at your phone or the TV.

### 2. Be Sincere

Your tone matters. Say it like you mean it. Because you should mean it.

### 3. Don't Follow It with a Request

Don't give a compliment and then ask for something. That makes it feel transactional.

### 4. Don't Overdo It

Too many compliments can feel insincere. One genuine compliment is better than five generic ones.

## Examples That Actually Work

**Appearance:**
- "That dress looks incredible on you. The way it fits—wow."
- "Your hair looks really good today. Did you do something different?"
- "You have the best smile. It lights up your whole face."

**Character:**
- "I love how you always see the best in people. That's a gift."
- "You're so good at making people feel comfortable. I've noticed that about you."
- "You have such a strong sense of what's right. I respect that about you."

**Effort:**
- "This meal is amazing. I can tell you put a lot of thought into it."
- "The house looks great. I know you worked hard on it."
- "Thank you for handling that. I know it wasn't easy."

**Actions:**
- "The way you handled that situation was really impressive."
- "I love how you always remember the little things."
- "You're so good at [specific thing]. I'm always impressed."

## Common Mistakes

- **Being generic:** "You look nice" doesn't land like "that color looks amazing on you."
- **Only complimenting appearance:** Notice her character, effort, and actions too.
- **Complimenting to get something:** Don't make it transactional.
- **Not meaning it:** If you don't mean it, don't say it.
- **Overdoing it:** One genuine compliment beats five generic ones.

## The Win

You gave a compliment that actually landed. She felt seen and appreciated. You noticed something specific about her. That's a win.`,
  },
  'be-present-quality-time': {
    id: 8,
    title: 'Be Present During Quality Time (Actually)',
    category: 'Relationship',
    difficulty: 'Medium',
    time: 'Ongoing',
    excerpt: 'Put the phone down. Actually listen. Be there mentally, not just physically. Learn how to give her your full attention without it feeling forced.',
    content: `## Why This Matters

Being physically present but mentally checked out is worse than not being there at all. She knows when you're not really there. When you're on your phone, thinking about work, or just waiting for the conversation to end, she feels it. Actually being present—giving her your full attention—is one of the most valuable things you can give her.

## The Secret: Put Everything Else Away

Your phone. Your work thoughts. Your to-do list. All of it. Put it away. For this moment, there's nothing else. Just her. Just this conversation. Just this time together.

## What "Actually Present" Looks Like

### 1. Put Your Phone Away

Not face down on the table. Not in your pocket where you'll check it. Actually away. In another room if you need to. Out of sight, out of mind.

**The rule:** If you can't go 30 minutes without checking your phone, that's a problem. Fix it.

### 2. Make Eye Contact

When she's talking, look at her. Not at the TV. Not at your phone. Not past her. At her. Eye contact shows you're actually listening.

### 3. Listen to Understand, Not to Respond

Don't listen waiting for your turn to talk. Listen to actually understand what she's saying. What's she really saying? What's she feeling? What does she need?

**The difference:**
- **Listening to respond:** You're thinking about what you'll say next.
- **Listening to understand:** You're focused on what she's saying and what it means.

### 4. Ask Follow-Up Questions

Show you're actually listening by asking questions:
- "Tell me more about that."
- "How did that make you feel?"
- "What happened next?"

This shows you're engaged, not just waiting for her to finish.

### 5. Don't Try to Fix Everything

Sometimes she just needs to vent. She doesn't need you to solve it. She needs you to listen. Don't jump to solutions. Just be there.

**The rule:** Unless she asks for advice, don't give it. Just listen and validate.

## When to Be Present

- **During conversations:** Actually listen. Don't multitask.
- **During meals:** Put the phone away. Talk. Connect.
- **During activities together:** Be there. Don't just go through the motions.
- **When she's stressed:** Give her your full attention. Don't half-listen.

## How to Actually Do It

### 1. Set Boundaries

- "I'm putting my phone away for the next hour. Just us."
- Turn off notifications.
- Let work wait.

### 2. Practice Active Listening

- Nod. Show you're listening.
- Make eye contact.
- Don't interrupt.
- Ask questions.
- Reflect back what you heard: "So what you're saying is..."

### 3. Notice When You Drift

Your mind will wander. That's normal. When you notice it, bring it back. Focus on her. On what she's saying. On this moment.

### 4. Put Away Distractions

- Phone in another room
- TV off (unless you're watching together)
- Work thoughts can wait
- To-do list can wait

## Common Mistakes

- **Phone on the table:** Even if you're not using it, it's a distraction. Put it away.
- **Multitasking:** You can't listen and do something else. Pick one.
- **Waiting for your turn:** You're not having a debate. You're having a conversation.
- **Trying to fix everything:** Sometimes she just needs you to listen.
- **Half-listening:** She knows when you're not really there.

## The Challenge

Try this: For one conversation, put everything away. Phone, distractions, everything. Just be there. Listen. Engage. See how different it feels.

## The Win

You were actually present. She felt heard and seen. You connected. That's a win.`,
  },
  'handle-surprise-right': {
    id: 9,
    title: 'Plan a Surprise That Doesn\'t Stress Her Out',
    category: 'Relationship',
    difficulty: 'Medium',
    time: '1-2 hours planning',
    excerpt: 'Surprises can backfire if you don\'t think them through. Learn how to plan something that feels thoughtful, not overwhelming or inconvenient.',
    content: `## Why This Matters

Surprises can be amazing—or they can be stressful. The difference is in the planning. A good surprise shows you thought about her. A bad surprise shows you only thought about the gesture. Think it through. Make it about her, not about you.

## The Secret: Consider Her, Not the Gesture

This isn't about how impressive the surprise is. It's about whether she'll actually enjoy it. Will it stress her out? Will it be inconvenient? Will she feel pressured? Think about that first.

## What Makes a Surprise Good

### 1. It Fits Her Schedule

Don't surprise her with something that conflicts with her plans. Check her calendar. Make sure she's free. If you're not sure, give her a heads up: "I have something planned for us Saturday. Are you free?"

**The rule:** A surprise that forces her to cancel something is a bad surprise.

### 2. It Matches Her Energy

Is she exhausted? Don't plan something that requires energy. Is she stressed? Don't add more stress. Read the room. Match her energy level.

**Low-energy surprises:**
- Her favorite takeout
- A massage appointment
- A quiet evening at home
- Something that takes pressure off, not adds it

**Higher-energy surprises:**
- Tickets to something she wants to see
- A day trip somewhere
- An activity she's mentioned wanting to try

### 3. It's Something She'd Actually Want

This is the most important part. Is this something she'd actually enjoy? Or is it something you think she should enjoy?

**Think about:**
- What does she talk about wanting to do?
- What does she get excited about?
- What relaxes her?
- What makes her feel special?

### 4. It Doesn't Create Work for Her

A surprise that creates more work for her is a bad surprise. Don't:
- Surprise her with guests when the house is a mess
- Plan something that requires her to get ready when she's exhausted
- Create a situation where she has to scramble

### 5. It's Thoughtful, Not Just Expensive

Expensive doesn't mean thoughtful. A small, well-thought-out surprise beats an expensive, tone-deaf one every time.

## How to Plan It

### 1. Think About Her

What would she actually enjoy? What would make her feel special? What would take pressure off, not add it?

### 2. Consider Logistics

- Is she free?
- Does it fit her schedule?
- Will it stress her out?
- Does it create work for her?

### 3. Plan the Details

Handle everything:
- Reservations
- Timing
- Logistics
- Everything

Don't make her think about any of it.

### 4. Give a Heads Up (If Needed)

Some surprises need a heads up:
- "I have something planned for us Friday. Can you keep it free?"
- "Wear something nice Saturday. I have a surprise."

This isn't ruining the surprise—it's making sure it actually works.

## Examples of Good Surprises

**Low-key, thoughtful:**
- Her favorite meal delivered
- A massage appointment booked
- A clean house when she gets home
- Her favorite show queued up with snacks ready

**More involved, but still thoughtful:**
- Tickets to something she's mentioned wanting to see
- A day trip somewhere she'd enjoy
- An activity she's talked about wanting to try
- A weekend away (with plenty of notice)

## Examples of Bad Surprises

**Don't do these:**
- Surprise guests when the house is a mess
- A fancy dinner when she's exhausted
- Something that requires her to cancel plans
- A surprise that creates more work for her
- Something you want to do, not something she'd want

## Common Mistakes

- **Not considering her schedule:** Don't surprise her when she's busy or has plans.
- **Not matching her energy:** Don't plan something energetic when she's exhausted.
- **Thinking about the gesture, not her:** Make it about what she'd enjoy, not what's impressive.
- **Creating work for her:** Don't make her scramble or stress.
- **Not giving a heads up when needed:** Some surprises need advance notice.

## The Win

You planned a surprise that actually worked. She felt thought about, not stressed out. She enjoyed it. That's a win.`,
  },
  'write-love-note': {
    id: 10,
    title: 'Write a Love Note That Doesn\'t Sound Cheesy',
    category: 'Romance',
    difficulty: 'Easy',
    time: '10 min',
    excerpt: 'Skip the Hallmark card. Write something real that actually means something. Learn how to express yourself without it feeling forced or fake.',
    content: `## Why This Matters

Hallmark cards are generic. They say nothing. A real note—something you wrote—shows you actually thought about her. It's personal. It's meaningful. And it doesn't have to be poetry. It just has to be real.

## The Secret: Be Specific, Not Generic

Don't write "you're amazing" and call it a day. Be specific. What specifically do you appreciate? What specifically do you love about her? What specifically made you think of her?

## What Makes a Note Real

### 1. Be Specific

**Generic:** "You're the best wife ever."
**Specific:** "I love how you always remember the little things—like how I take my coffee, or that I hate when the house is too cold. You pay attention. That matters to me."

**Generic:** "I love you."
**Specific:** "I love how you handle stress. When things get crazy, you stay calm and figure it out. I admire that about you."

### 2. Notice the Little Things

What does she do that you appreciate? Notice it. Write about it.
- How she takes care of you
- How she handles the kids
- How she makes you feel
- How she shows up for you

### 3. Be Honest

Don't write what you think you should write. Write what you actually feel. If you're not great with words, that's fine. Simple and honest beats flowery and fake every time.

### 4. Don't Make It About You

This isn't about how great you are or what you do. It's about her. Focus on her. What you appreciate about her. What you love about her.

## How to Write It

### 1. Start with What You Notice

What did you notice about her recently? What did she do that you appreciated? Start there.

### 2. Be Specific

Don't say "you're great." Say what specifically is great. Don't say "I love you." Say what specifically you love.

### 3. Keep It Simple

You don't need to write a novel. A few sentences that are real and specific are better than a page of generic stuff.

### 4. Write It by Hand

If you can, write it by hand. It's more personal. It shows you took the time.

## Examples That Work

**Short and specific:**
"I noticed how you handled that situation with the kids earlier. You were patient when I would have lost it. I'm grateful for that. You make me better."

**Appreciation:**
"Thank you for everything you do. I know I don't always say it, but I see it. I see how hard you work, how much you care, how you show up. I appreciate you."

**What you love:**
"I love how you laugh at my stupid jokes. I love how you make me feel at home. I love how you see the best in me even when I don't."

## Common Mistakes

- **Being generic:** "You're amazing" doesn't land like something specific.
- **Making it about you:** Focus on her, not yourself.
- **Trying too hard:** Simple and honest beats flowery and fake.
- **Not being specific:** Specificity is what makes it real.

## The Win

You wrote something real. She felt seen and appreciated. You expressed yourself without it feeling forced. That's a win.`,
  },
  'plan-weekend-getaway': {
    id: 11,
    title: 'Plan a Weekend Getaway She\'ll Actually Enjoy',
    category: 'Romance',
    difficulty: 'Medium',
    time: '2-3 hours planning',
    excerpt: 'Not just any trip—one that she\'ll actually want to go on. Think through the details, match her energy, and make it about connection, not just a destination.',
    content: `## Why This Matters

A weekend away can be amazing—or it can be stressful. The difference is in the planning. Think it through. Make it about her, not about checking a box. Make it about connection, not just getting away.

## The Secret: Think About Her, Not the Trip

This isn't about how cool the destination is. It's about whether she'll actually enjoy it. Will it stress her out? Will it be relaxing? Will it feel like a break or more work?

## What Makes a Getaway Good

### 1. It Fits Her Schedule

Don't plan a trip when she's already stressed or busy. Check her calendar. Make sure she can actually go. Give her plenty of notice.

**The rule:** A trip that forces her to cancel things or scramble is a bad trip.

### 2. It Matches What She Needs

Does she need rest? Plan something relaxing. Does she need adventure? Plan something active. Does she need connection? Plan something focused on time together.

**Think about:**
- What does she need right now?
- What would actually feel like a break?
- What would she enjoy?

### 3. You Handle the Logistics

You plan it. You handle:
- Reservations
- Directions
- Packing list (if needed)
- Everything

Don't make her think about any of it. The whole point is to take something off her plate.

### 4. It's Not About the Destination

The destination matters less than the experience. A simple trip done well beats a fancy trip done poorly.

## How to Plan It

### 1. Think About What She Needs

What does she need right now? Rest? Adventure? Connection? Start there.

### 2. Consider Her Energy

Is she exhausted? Plan something low-key. Is she energized? Maybe something more active.

### 3. Handle Everything

You plan it. You book it. You handle logistics. Don't make her think about any of it.

### 4. Give Her a Heads Up

Don't surprise her with a trip next weekend. Give her notice. "I'm planning something for us in a few weeks. Can you keep that weekend free?"

## Examples of Good Getaways

**Relaxing:**
- A cabin in the woods
- A beach house
- A spa weekend
- Somewhere quiet where you can just be together

**Active:**
- A hiking trip
- A city you've both wanted to visit
- An activity she's mentioned wanting to try
- Somewhere with things to do

**Connection-focused:**
- Somewhere without distractions
- Somewhere you can actually talk and connect
- Somewhere that's about time together, not activities

## Common Mistakes

- **Not considering her schedule:** Don't plan a trip when she's busy or stressed.
- **Not matching her energy:** Don't plan something active when she needs rest.
- **Making her plan it:** You plan it. Handle everything.
- **Not giving notice:** Give her plenty of time to prepare.
- **Focusing on destination over experience:** The experience matters more than where you go.

## The Win

You planned a trip she actually enjoyed. She felt relaxed and connected. You spent quality time together. That's a win.`,
  },
  'handle-morning-routine': {
    id: 12,
    title: 'Take Over the Morning Routine (Without Being Asked)',
    category: 'Partnership',
    difficulty: 'Easy',
    time: 'Morning routine',
    excerpt: 'Give her a break. Handle breakfast, kids, whatever needs doing. Show up without her having to ask or manage you.',
    content: `## Why This Matters

Mornings are chaos. Kids need to be fed, dressed, and out the door. Breakfast needs to happen. Lunches need to be packed. If she's handling all of it while you're just getting ready, that's not partnership. Take over. Give her a break.

## The Secret: Do It Without Being Asked

Don't wait for her to ask. Don't wait for her to tell you what to do. Just do it. Look around. See what needs doing. Do it.

## What "Taking Over" Looks Like

### 1. Get Up Earlier

If you're sleeping in while she's handling everything, that's the problem. Get up. Be part of the solution, not part of the problem.

### 2. Handle Breakfast

Make breakfast. For everyone. Don't just make your own. Make it for the family. Handle it.

### 3. Handle the Kids

Get them dressed. Get them fed. Get them ready. Don't make her manage you while she's managing them.

### 4. Pack Lunches

If lunches need to be packed, pack them. Don't wait to be asked.

### 5. Clean Up

After breakfast, clean up. Don't leave a mess for her to deal with.

## The System

### Day 1: Just Do It

Pick a day. Just do it. Handle everything. Don't ask what to do. Just do it.

### Day 2: Do It Again

Do it again. Make it a habit. Not a one-time thing.

### Day 3: Own It

This is yours now. You own the morning routine. She doesn't have to think about it.

## Common Mistakes

- **Waiting to be asked:** Don't wait. Just do it.
- **Making her manage you:** Don't ask what to do. Figure it out.
- **Doing it once:** Make it a habit, not a gesture.
- **Expecting credit:** Don't do it for credit. Do it because it needs doing.
- **Half-doing it:** Don't start something and leave it for her to finish.

## The Win

You took over the morning routine. She got a break. She didn't have to ask or manage you. That's a win.`,
  },
  'notice-what-needs-doing': {
    id: 13,
    title: 'Notice What Needs Doing (And Do It)',
    category: 'Partnership',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Stop waiting to be told. Look around. See what needs doing. Do it. This is what being a partner actually looks like.',
    content: `## Why This Matters

If you're waiting to be told what to do, you're not being a partner. You're being managed. A partner sees what needs doing and does it. They don't wait for instructions. They don't need to be asked.

## The Secret: Look Around

Stop and look. What needs doing? What's not done? What would make her life easier? Do that.

## What to Notice

### 1. The Obvious Stuff

- Dishes in the sink
- Trash that needs to go out
- Laundry that needs to be done
- Things that are out of place

### 2. The Stuff That's Her Job

If there's something that's "her job," do it anyway. Don't wait for her to ask. Just do it.

### 3. The Stuff That Would Help

What would make her life easier? What would take something off her plate? Do that.

## How to Actually Do It

### 1. Look Around

Take 30 seconds. Look around. What needs doing?

### 2. Do It

Don't ask. Don't announce it. Just do it.

### 3. Make It a Habit

Do this regularly. Not just once. Make it how you operate.

## Common Mistakes

- **Waiting to be told:** Don't wait. Just do it.
- **Asking what to do:** Look around. Figure it out.
- **Doing it for credit:** Don't announce it. Just do it.
- **Only doing obvious stuff:** Think about what would actually help.

## The Win

You noticed what needed doing and did it. She didn't have to ask. You were a partner, not someone to be managed. That's a win.`,
  },
  'help-when-shes-stressed': {
    id: 14,
    title: 'Help When She\'s Stressed (The Right Way)',
    category: 'Partnership',
    difficulty: 'Medium',
    time: 'Varies',
    excerpt: 'Don\'t try to fix it. Don\'t make it about you. Actually help. Learn what she needs when she\'s overwhelmed and how to provide it.',
    content: `## Why This Matters

When she's stressed, your instinct might be to fix it or make it about you. That's not helpful. Actually helping means understanding what she needs and providing it—not what you think she needs, but what she actually needs.

## The Secret: Ask What She Needs

Don't assume. Don't try to fix it. Ask: "What do you need right now?" Then do that.

## What "Actually Help" Looks Like

### 1. Take Something Off Her Plate

What can you take off her plate? What can you handle so she doesn't have to?

- Handle dinner
- Take care of the kids
- Handle something she's worried about
- Just give her space

### 2. Don't Try to Fix It

Unless she asks for solutions, don't offer them. She might just need to vent. She might just need you to listen.

### 3. Don't Make It About You

This isn't about how her stress affects you. This is about her. Focus on her.

### 4. Give Her What She Needs

Ask what she needs. Then do that. It might be:
- Space
- Help with something specific
- Just to be listened to
- Something else entirely

## Common Mistakes

- **Trying to fix it:** Don't offer solutions unless she asks.
- **Making it about you:** Focus on her, not yourself.
- **Assuming what she needs:** Ask. Don't assume.
- **Adding to her stress:** Don't make things more complicated.

## The Win

You helped when she was stressed. You gave her what she actually needed. She felt supported. That's a win.`,
  },
  'handle-household-tasks': {
    id: 15,
    title: 'Own Household Tasks (Without Resentment)',
    category: 'Partnership',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Pick something and own it. Don\'t do it for credit. Don\'t do it to be thanked. Do it because it needs doing and you\'re a partner.',
    content: `## Why This Matters

If you're doing household tasks for credit or to be thanked, you're missing the point. These things need doing. You're a partner. Own them. Do them because they need doing, not because you want recognition.

## The Secret: Own It

Pick something. Own it. It's yours now. You do it. Not because you're asked. Not because you want credit. Because it needs doing.

## What to Own

### 1. Pick Something Specific

- Taking out the trash
- Doing the dishes
- Handling laundry
- Cleaning the bathrooms
- Mowing the lawn
- Whatever needs doing

### 2. Own It Completely

It's yours. You do it. You don't wait to be asked. You don't do it sometimes. You own it.

### 3. Do It Without Resentment

Don't do it and then complain. Don't do it and expect credit. Just do it. It needs doing. You're doing it.

## How to Actually Do It

### 1. Pick Something

Look around. What needs doing regularly? Pick something.

### 2. Own It

This is yours now. You do it. Not sometimes. Always.

### 3. Do It Without Fanfare

Don't announce it. Don't expect credit. Just do it.

## Common Mistakes

- **Doing it for credit:** Don't do it to be thanked. Do it because it needs doing.
- **Doing it sometimes:** Own it. Do it consistently.
- **Complaining about it:** Don't do it and then complain. Just do it.
- **Waiting to be asked:** Don't wait. Just do it.

## The Win

You own a household task. You do it consistently. You don't do it for credit. You do it because it needs doing. That's a win.`,
  },
  'listen-without-fixing': {
    id: 16,
    title: 'Listen Without Trying to Fix Everything',
    category: 'Communication',
    difficulty: 'Medium',
    time: 'Varies',
    excerpt: 'Sometimes she just needs to vent. She doesn\'t need solutions. She needs you to listen. Learn the difference and when to just be there.',
    content: `## Why This Matters

Your instinct when she's upset is probably to fix it. That's not always what she needs. Sometimes she just needs to vent. Sometimes she just needs you to listen. Learn the difference.

## The Secret: Listen First, Fix Later

Unless she asks for solutions, don't offer them. Just listen. Be there. Validate what she's feeling.

## What "Just Listening" Looks Like

### 1. Don't Offer Solutions

Unless she asks, don't try to fix it. Don't offer advice. Just listen.

### 2. Validate Her Feelings

"I can see why that's frustrating."
"That sounds really hard."
"I understand why you feel that way."

### 3. Ask Questions

Show you're listening by asking questions:
- "Tell me more about that."
- "How did that make you feel?"
- "What happened next?"

### 4. Be Present

Actually be there. Don't be thinking about what you'll say. Just listen.

## When to Fix vs. When to Listen

**Listen when:**
- She's venting
- She's processing something
- She's expressing feelings
- She hasn't asked for solutions

**Fix when:**
- She asks for advice
- She asks what you think
- She's looking for solutions
- She explicitly wants help

## Common Mistakes

- **Trying to fix everything:** Don't offer solutions unless she asks.
- **Not validating feelings:** Acknowledge what she's feeling.
- **Making it about you:** Focus on her, not yourself.
- **Not actually listening:** Be present. Don't just wait for your turn to talk.

## The Win

You listened without trying to fix it. She felt heard. She got to process what she needed to process. That's a win.`,
  },
  'have-hard-conversation': {
    id: 17,
    title: 'Have a Hard Conversation (Without It Becoming a Fight)',
    category: 'Communication',
    difficulty: 'Hard',
    time: '30-60 min',
    excerpt: 'Difficult conversations don\'t have to turn into arguments. Learn how to communicate about tough topics without defensiveness or escalation.',
    content: `## Why This Matters

Hard conversations are inevitable. How you handle them determines whether you work through things or make them worse. Learn how to have difficult conversations without them turning into fights.

## The Secret: Focus on Understanding, Not Winning

This isn't a debate. You're not trying to win. You're trying to understand each other and work through something.

## How to Have a Hard Conversation

### 1. Pick the Right Time

Don't have a hard conversation when:
- You're both stressed
- You're both tired
- You're both angry
- There's no time to actually talk

Pick a time when you can both focus and actually talk.

### 2. Use "I" Statements

Don't say "you always" or "you never." Say "I feel" or "I notice."

**Instead of:** "You never help around the house."
**Say:** "I feel overwhelmed when I'm handling everything by myself."

### 3. Listen to Understand

Don't listen waiting for your turn to talk. Listen to actually understand what she's saying.

### 4. Don't Get Defensive

If she says something that's hard to hear, don't get defensive. Listen. Try to understand where she's coming from.

### 5. Focus on Solutions

Once you both understand each other, focus on solutions. What can you both do differently? How can you work through this?

## Common Mistakes

- **Getting defensive:** Don't defend yourself. Listen and try to understand.
- **Making it about winning:** This isn't a debate. You're trying to work through something.
- **Using "you" statements:** Use "I" statements instead.
- **Having it at the wrong time:** Pick a time when you can both actually talk.

## The Win

You had a hard conversation without it becoming a fight. You understood each other. You worked through it. That's a win.`,
  },
  'ask-better-questions': {
    id: 18,
    title: 'Ask Questions That Actually Matter',
    category: 'Communication',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Move beyond "how was your day?" Learn how to ask questions that show you\'re actually interested and help you understand what\'s going on with her.',
    content: `## Why This Matters

"How was your day?" is fine, but it's generic. It doesn't show you're actually interested. Better questions show you're paying attention and actually want to understand what's going on with her.

## The Secret: Be Specific and Follow Up

Don't ask generic questions. Ask specific ones. And when she answers, follow up. Show you're actually listening.

## What Makes a Good Question

### 1. Be Specific

**Generic:** "How was your day?"
**Specific:** "How did that meeting go that you were worried about?"

**Generic:** "What's up?"
**Specific:** "You seemed stressed earlier. What's going on?"

### 2. Show You're Paying Attention

Ask about things she's mentioned:
- "How did that thing you were working on turn out?"
- "Did you talk to your friend about that situation?"
- "How are you feeling about that decision you were making?"

### 3. Ask About Feelings

Don't just ask what happened. Ask how she felt about it.
- "How did that make you feel?"
- "What was that like for you?"
- "How are you feeling about that?"

### 4. Follow Up

When she answers, follow up. Ask more questions. Show you're actually interested.

## Examples of Better Questions

**Instead of "how was your day?":**
- "What was the best part of your day?"
- "What was the hardest part of your day?"
- "What are you looking forward to this week?"

**Instead of "what's up?":**
- "You seem [stressed/happy/excited]. What's going on?"
- "What's on your mind?"
- "How are you feeling today?"

**Instead of generic questions:**
- Ask about specific things she's mentioned
- Ask about how she's feeling
- Ask about what she's thinking about

## Common Mistakes

- **Asking generic questions:** Be specific. Show you're paying attention.
- **Not following up:** When she answers, ask more questions.
- **Not asking about feelings:** Ask how she feels, not just what happened.
- **Asking to be polite:** Actually be interested. Actually listen.

## The Win

You asked a question that actually mattered. She felt heard and understood. You connected. That's a win.`,
  },
  'apologize-right-way': {
    id: 19,
    title: 'Apologize the Right Way (Without Excuses)',
    category: 'Communication',
    difficulty: 'Medium',
    time: '5-10 min',
    excerpt: 'A real apology doesn\'t include "but" or excuses. Learn how to take responsibility, acknowledge impact, and actually make things right.',
    content: `## Why This Matters

A bad apology makes things worse. A good apology actually fixes things. Learn the difference. Learn how to apologize the right way—without excuses, without "but," without making it about you.

## The Secret: Take Responsibility

A real apology is about taking responsibility. Not explaining why you did it. Not making excuses. Just taking responsibility and acknowledging the impact.

## What Makes a Good Apology

### 1. Take Responsibility

"I'm sorry I [specific thing you did]."

Don't say "I'm sorry you feel that way." Say "I'm sorry I did that."

### 2. Acknowledge the Impact

"I know that [how it affected her]."

Acknowledge how what you did affected her. Show you understand the impact.

### 3. Don't Make Excuses

Don't say "I'm sorry, but..." Don't explain why you did it. Just take responsibility.

### 4. Commit to Doing Better

"I'll [specific thing you'll do differently]."

Don't just say you're sorry. Say what you'll do differently.

## Examples of Good Apologies

**Bad:** "I'm sorry you got upset, but I was just trying to help."
**Good:** "I'm sorry I didn't listen when you told me what you needed. I know that made you feel unheard. I'll listen better next time."

**Bad:** "I'm sorry, but I was stressed."
**Good:** "I'm sorry I snapped at you. I know that hurt you. I'll handle my stress better so I don't take it out on you."

**Bad:** "I'm sorry if I offended you."
**Good:** "I'm sorry I said that. I know it was hurtful. I shouldn't have said it, and I won't say things like that again."

## Common Mistakes

- **Including "but":** Don't make excuses. Just apologize.
- **Saying "I'm sorry you feel that way":** That's not an apology. That's blaming her for feeling that way.
- **Not acknowledging impact:** Show you understand how it affected her.
- **Not committing to change:** Say what you'll do differently.

## The Win

You apologized the right way. You took responsibility. You acknowledged the impact. You committed to doing better. That's a win.`,
  },
  // Additional Communication guides
  'express-gratitude-to-partner': {
    id: 22,
    title: 'Express Gratitude to Your Partner',
    category: 'Communication',
    difficulty: 'Easy',
    time: '1 min',
    excerpt: 'Learn how to thank your partner for specific things in ways that feel genuine and meaningful, not like you\'re checking a box.',
    content: `## Why This Matters

Gratitude strengthens bonds. When you express genuine gratitude, you're showing you notice what she does and you appreciate it. This creates a positive atmosphere and makes her feel valued.

## The Secret: Be Specific

Generic "thanks" doesn't land. Specific gratitude shows you're paying attention and you actually appreciate what she did.

## How to Express Gratitude

### 1. Be Specific

**Generic:** "Thanks for dinner."
**Specific:** "Thanks for making that pasta dish. I know you were tired, and it meant a lot that you still cooked."

### 2. Notice the Effort

Acknowledge the work she put in, not just the result:
- "I appreciate how much thought you put into planning this."
- "Thank you for handling that stressful situation. I know that wasn't easy."

### 3. Notice Character

Thank her for who she is, not just what she does:
- "I'm grateful for how patient you are with me."
- "Thank you for always being so thoughtful."

### 4. Do It Regularly

Don't wait for big moments. Express gratitude for small things too:
- "Thanks for making coffee this morning."
- "I appreciate you taking care of that."

## When to Express Gratitude

- When she does something for you
- When she handles something stressful
- When she shows up for you
- When she makes an effort
- Just because (gratitude for who she is)

## Common Mistakes

- **Being generic:** "Thanks" is better than nothing, but specific is better
- **Only thanking for big things:** Notice and appreciate the small things too
- **Making it transactional:** Don't only thank her when you want something
- **Forgetting to thank:** If you notice it, say it

## The Win

You expressed genuine gratitude. She felt seen and appreciated. You strengthened your bond. That's a win.`,
  },
  'practice-5-1-ratio': {
    id: 23,
    title: 'Practice the 5:1 Ratio',
    category: 'Communication',
    difficulty: 'Medium',
    time: 'Ongoing',
    excerpt: 'Healthy relationships need way more positive moments than negative ones. Learn how to build this ratio and rebuild connection.',
    content: `## Why This Matters

Here's the thing: if you're criticizing, complaining, or being negative more than you're being positive, you're slowly killing your connection. Healthy relationships need way more positive interactions than negative ones. Think 5 to 1. That's the ratio that works.

## The Secret: Focus on What's Working

It's easy to notice what's wrong. It takes effort to notice what's right. Make that effort. Build the positive interactions.

## How to Build the 5:1 Ratio

### 1. Count Your Interactions

For one day, notice:
- How many positive things you say or do
- How many negative things you say or do

**The goal:** 5 positives for every 1 negative.

### 2. Increase Positives

Find ways to add positive interactions:
- Compliments
- Appreciation
- Physical affection
- Acts of service
- Quality time
- Words of affirmation

### 3. Reduce Negatives

Notice when you're being negative:
- Criticism
- Complaints
- Sarcasm
- Defensiveness
- Stonewalling

**The rule:** If you can't say something positive, at least don't say something negative.

### 4. Make It a Habit

This isn't a one-time thing. Make it a daily practice. Notice what's working. Express appreciation. Build the positive.

## Examples of Positive Interactions

- "I appreciate you doing that."
- "You handled that really well."
- A hug or kiss
- Doing something helpful without being asked
- Asking about her day
- A genuine compliment

## Examples of Negative Interactions

- Criticism: "You always..."
- Complaints: "Why didn't you..."
- Sarcasm: "Oh, great..."
- Defensiveness: "That's not my fault..."
- Stonewalling: Ignoring or shutting down

## Common Mistakes

- **Only focusing on negatives:** What's wrong is easy to see. What's right takes effort.
- **Not counting:** You probably have more negatives than you think.
- **Faking it:** Positives need to be genuine, not forced.
- **Giving up:** Building this ratio takes time. Keep at it.

## The Win

You built the 5:1 ratio. You're focusing on what's working. Your relationship feels more positive. That's a win.`,
  },
  // Additional Intimacy guides
  'practice-acts-of-service': {
    id: 24,
    title: 'Practice Acts of Service as a Love Language',
    category: 'Intimacy',
    difficulty: 'Easy',
    time: 'Varies',
    excerpt: 'Learn how to show love through actions. Do things for her that make her life easier and show you care.',
    content: `## Why This Matters

For some people, actions speak louder than words. When acts of service are her love language, doing things for her shows love in a way words can't.

## The Secret: Do Things That Matter to Her

It's not about what you think she needs. It's about what actually makes her life easier or better.

## How to Practice Acts of Service

### 1. Notice What She Does

Pay attention to:
- What tasks stress her out
- What she complains about having to do
- What she does regularly that you could do
- What would give her a break

### 2. Do It Without Being Asked

The whole point is to take something off her plate. If she has to ask, it's not the same.

### 3. Do It Well

Don't half-ass it. If you're going to do it, do it right:
- Clean the kitchen, not just load the dishwasher
- Handle the morning routine, not just make coffee
- Take care of something completely, not just start it

### 4. Don't Make It About You

Don't announce it. Don't expect thanks. Just do it. Acts of service are about making her life easier, not getting credit.

## Examples of Acts of Service

- Handle the morning routine (breakfast, kids, etc.)
- Clean something without being asked
- Take over a task she usually does
- Handle something stressful for her
- Do something that gives her a break
- Take care of something she's been putting off

## What Makes It Meaningful

- **It's something she actually needs:** Not what you think she needs
- **You do it without being asked:** Anticipate, don't wait
- **You do it well:** Complete it, don't half-do it
- **You don't make it about you:** Just do it, don't announce it

## Common Mistakes

- **Doing what you want to do:** It's about what she needs, not what you think she needs
- **Half-doing it:** If you're going to do it, do it right
- **Expecting thanks:** Acts of service aren't transactional
- **Making her manage you:** Don't ask what to do—figure it out

## The Win

You did something that made her life easier. She felt cared for. You showed love through action. That's a win.`,
  },
  'practice-words-of-affirmation': {
    id: 25,
    title: 'Practice Words of Affirmation',
    category: 'Intimacy',
    difficulty: 'Easy',
    time: '30 seconds',
    excerpt: 'Learn how to use words to make her feel deeply loved. Speak her love language through genuine, specific affirmations.',
    content: `## Why This Matters

For some people, words have power. When words of affirmation are her love language, what you say (or don't say) matters deeply. Your words can build her up or tear her down.

## The Secret: Be Specific and Genuine

Generic words don't land. Specific, genuine words of affirmation show you're paying attention and you actually see her.

## How to Practice Words of Affirmation

### 1. Notice What You Appreciate

Pay attention to:
- Her character traits
- How she handles things
- What she does for you
- Who she is as a person

### 2. Be Specific

**Generic:** "You're great."
**Specific:** "I love how patient you are with the kids. That's really impressive."

### 3. Focus on Character

Affirm who she is, not just what she does:
- "You're so resilient."
- "I admire how you handle challenges."
- "You have such a good heart."

### 4. Say It Regularly

Don't wait for special occasions. Say it when you notice it. Make it a habit.

## Examples of Words of Affirmation

- "I'm proud of you."
- "You handled that really well."
- "I appreciate how you..."
- "You're so good at..."
- "I love how you..."
- "You make me feel..."

## What Makes It Meaningful

- **It's specific:** Not generic, but specific to her
- **It's genuine:** You actually mean it
- **It's about character:** Who she is, not just what she does
- **It's regular:** You say it often, not just on special occasions

## Common Mistakes

- **Being generic:** "You're great" doesn't land like specific affirmations
- **Only saying it when you want something:** Affirmations aren't transactional
- **Not saying it enough:** If you notice it, say it
- **Focusing only on appearance:** Character affirmations hit deeper

## The Win

You affirmed her. She felt seen and valued. You spoke her love language. That's a win.`,
  },
  'practice-love-languages': {
    id: 29,
    title: 'Speak Her Love Language (Actually)',
    category: 'Intimacy',
    difficulty: 'Medium',
    time: 'Ongoing',
    excerpt: 'Learn how to identify and practice her love language in ways that feel genuine, not forced. Make her feel deeply loved in the way she needs.',
    content: `## Why This Matters

People express and receive love in different ways. Understanding how your partner feels most loved—her "love language"—helps you show love in ways that actually land. When you speak her language, she feels deeply understood and cared for.


## The Secret: It's About How She Feels Loved

This isn't about what you think shows love. It's about what actually makes her feel loved. Pay attention to what she responds to, what she asks for, and what makes her light up.

## The Five Ways People Feel Loved

While everyone is unique, relationship research has identified five common ways people express and receive love. Most people have one or two primary ways they feel most loved:

### 1. Words of Affirmation

**What it is:** Feeling loved through spoken or written words of appreciation, encouragement, and affection.

**Signs it's her language:**
- She lights up when you compliment her
- She asks "do you love me?" or "what do you like about me?"
- She values verbal appreciation
- She remembers things you've said

**How to practice it:**
- Give specific, genuine compliments regularly
- Tell her what you appreciate about her character
- Write notes or texts expressing your feelings
- Verbally acknowledge her efforts and qualities
- Say "I love you" and mean it

**Examples:**
- "I'm so proud of how you handled that situation."
- "You're such a thoughtful person. I love that about you."
- "Thank you for being so patient with me."

### 2. Acts of Service

**What it is:** Feeling loved when someone does things for you that make your life easier or better.

**Signs it's her language:**
- She appreciates when you help without being asked
- She notices and values when you take care of things
- She gets frustrated when you don't help
- She does things for you as her way of showing love

**How to practice it:**
- Notice what needs doing and do it
- Take over tasks she usually handles
- Do things that give her a break
- Help without being asked
- Complete tasks fully and well

**Examples:**
- Handle the morning routine so she can sleep in
- Clean something without being asked
- Take care of something stressful for her
- Do a chore she usually does

### 3. Receiving Gifts

**What it is:** Feeling loved through thoughtful gifts that show you were thinking of her.

**Signs it's her language:**
- She treasures small gifts and mementos
- She remembers gifts you've given her
- She gives thoughtful gifts herself
- She appreciates the thought behind gifts more than the cost

**How to practice it:**
- Give small, thoughtful gifts regularly (not just holidays)
- Pick up something you know she'd like
- Give gifts that show you know her interests
- Leave little surprises for her to find
- Remember that it's the thought, not the price

**Examples:**
- Her favorite snack when you're at the store
- A book by an author she likes
- A small item related to her hobby
- Flowers "just because"

### 4. Quality Time

**What it is:** Feeling loved through focused, undivided attention and time spent together.

**Signs it's her language:**
- She wants to spend time together without distractions
- She gets frustrated when you're on your phone during time together
- She values deep conversations
- She asks for your attention and time

**How to practice it:**
- Put your phone away when you're together
- Have regular date nights or time together
- Listen actively when she's talking
- Do activities together that you both enjoy
- Create rituals and routines together

**Examples:**
- Weekly date night with phones put away
- Morning coffee together
- Evening walks
- Tech-free quality time

### 5. Physical Touch

**What it is:** Feeling loved through physical affection—hugs, hand-holding, cuddling, and physical closeness.

**Signs it's her language:**
- She initiates physical contact
- She appreciates hugs, hand-holding, cuddling
- She feels disconnected when there's no physical touch
- She uses touch to show affection

**How to practice it:**
- Give hugs and kisses regularly
- Hold hands when you're together
- Cuddle on the couch
- Give non-sexual physical affection
- Sit close to her

**Examples:**
- Hug her when you get home
- Hold her hand when walking together
- Cuddle while watching TV
- Give her a back rub
- Sit close on the couch

## How to Identify Her Love Language

### 1. Pay Attention

Notice:
- What makes her light up?
- What does she ask for?
- What does she complain about not getting?
- How does she show love to you?

### 2. Ask Her

Have a conversation:
- "What makes you feel most loved?"
- "When do you feel most connected to me?"
- "What do you wish I did more of?"

### 3. Try Different Things

Experiment with all five. See what she responds to most.

### 4. Notice Patterns

Most people have one or two primary languages. Notice which ones she responds to most.

## The Key: It's About Her, Not You

Your love language might be different from hers. That's okay. The goal is to speak her language, not yours. Show love in the way she receives it, not the way you would want to receive it.

## Common Mistakes

- **Assuming her language is the same as yours:** It probably isn't. Pay attention.
- **Only speaking your language:** Show love in the way she receives it.
- **Not being consistent:** Speak her language regularly, not just sometimes.
- **Forcing it:** Make it genuine. Don't just go through the motions.

## Putting It Into Practice

1. **Identify her primary love language** (or languages)
2. **Make a plan** to practice it regularly
3. **Start small** and build the habit
4. **Notice her response** and adjust
5. **Keep at it**—consistency matters

## The Win

You identified her love language. You're speaking it regularly. She feels deeply loved in the way she needs. That's a win.`,
  },
  // Additional Partnership guides
  'take-over-chore-completely': {
    id: 26,
    title: 'Take Over a Chore Completely (Without Being Asked)',
    category: 'Partnership',
    difficulty: 'Easy',
    time: 'Varies',
    excerpt: 'Pick one of her regular chores and own it. Do it consistently, do it well, and do it without her having to think about it.',
    content: `## Why This Matters

When you take over a chore completely, you're taking something off her mental load. She doesn't have to think about it, manage it, or remind you. You just do it. That's what partnership looks like.

## The Secret: Own It Completely

Don't just do it sometimes. Don't do it when asked. Own it. Make it yours. Do it consistently and well.

## How to Take Over a Chore

### 1. Pick Something She Usually Does

Look at what she does regularly:
- Morning routine
- Meal planning
- Laundry
- Cleaning something specific
- Managing something

### 2. Learn How She Does It

Ask her how she does it (once). Learn her system. Then do it that way.

### 3. Do It Consistently

Don't do it once and forget. Make it yours. Do it regularly, without being asked.

### 4. Do It Well

Don't half-do it. Do it completely. Do it the way she would do it.

## Examples of Chores to Take Over

- Morning routine (breakfast, kids, etc.)
- Meal planning and grocery shopping
- Laundry (wash, dry, fold, put away)
- Cleaning a specific room regularly
- Managing bills or paperwork
- Taking care of pets
- Handling school/kid stuff

## What "Completely" Means

- **You do it regularly:** Not just when you feel like it
- **You do it well:** Not half-done
- **You do it without being asked:** She doesn't have to think about it
- **You own it:** It's yours now, not hers

## Common Mistakes

- **Doing it once and stopping:** Consistency matters
- **Doing it your way:** Learn her way and do it that way
- **Half-doing it:** If you're going to do it, do it completely
- **Making her manage you:** Don't ask what to do—just do it

## The Win

You took over a chore completely. She doesn't have to think about it anymore. You're a true partner. That's a win.`,
  },
  'be-proactive-around-house': {
    id: 27,
    title: 'Be Proactive Around the House',
    category: 'Partnership',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Notice what needs to be done and do it. Don\'t wait to be told. Don\'t wait for her to do it. Just notice and do it.',
    content: `## Why This Matters

When you're proactive, you're taking initiative. You're showing you're paying attention and you're a partner, not just a passenger. This prevents small tasks from becoming sources of resentment.

## The Secret: Notice, Don't Wait

Don't wait for her to tell you what needs doing. Look around. Notice. Do it.

## How to Be Proactive

### 1. Look Around

Regularly scan your environment:
- What's out of place?
- What needs cleaning?
- What needs fixing?
- What needs doing?

### 2. Notice Patterns

Pay attention to:
- What she does regularly
- What stresses her out
- What she complains about
- What she handles that you could handle

### 3. Do It Without Being Asked

If you see something that needs doing, do it. Don't announce it. Don't wait for permission. Just do it.

### 4. Make It a Habit

This isn't a one-time thing. Make noticing and doing a regular habit.

## Examples of Being Proactive

- Empty the dishwasher when it's clean
- Take out trash when it's full
- Clean up messes you see
- Handle something before it becomes a problem
- Do something that prevents her from having to do it
- Notice what needs restocking and restock it

## What Makes It "Proactive"

- **You notice it:** You're paying attention
- **You do it without being asked:** You take initiative
- **You do it before it's a problem:** You prevent issues
- **You do it consistently:** It's a habit, not a one-time thing

## Common Mistakes

- **Waiting to be told:** That's reactive, not proactive
- **Only doing obvious things:** Notice the less obvious things too
- **Doing it once:** Make it a habit
- **Making her manage you:** Don't ask what to do—figure it out

## The Win

You were proactive. You noticed what needed doing and did it. She didn't have to think about it or ask. That's a win.`,
  },
  // Additional Romance guides
  'plan-surprise-date': {
    id: 28,
    title: 'Plan a Surprise Date (That She\'ll Actually Love)',
    category: 'Romance',
    difficulty: 'Medium',
    time: '1-2 hours planning',
    excerpt: 'Learn how to plan a surprise that feels thoughtful and exciting, not overwhelming or inconvenient.',
    content: `## Why This Matters

Surprises show you're thinking about her. They show you put effort into making her feel special. But surprises can backfire if you don't think them through.

## The Secret: Think About Her, Not You

This isn't about what you want to do. It's about what she'd actually enjoy. What does she like? What would make her feel special? Start there.

## How to Plan a Surprise Date

### 1. Consider Her Preferences

Think about:
- What does she like to do?
- What relaxes her?
- What makes her feel special?
- What has she mentioned wanting to do?

### 2. Consider Her Energy Level

Is she exhausted? Plan something low-key. Is she energized? Maybe something more active. Read the room.

### 3. Handle the Logistics

You plan it. You handle:
- Reservations
- Timing
- Details
- Everything

Don't make her think about any of it.

### 4. Give Her a Heads Up (If Needed)

Some people don't like complete surprises. If that's her, give her a general heads up: "I'm planning something for us Friday. Keep it free."

### 5. Keep It Simple

One good thing is better than three mediocre things. Don't overcomplicate it.

## What Makes a Surprise Good

- **It's something she'd actually enjoy:** Not what you want to do
- **It's well-planned:** You handled the logistics
- **It matches her energy:** You read the room
- **It's thoughtful:** You put effort into it

## Common Mistakes

- **Planning what you want:** This is about her, not you
- **Not considering her energy:** A fancy dinner when she's exhausted isn't thoughtful
- **Overcomplicating it:** Simple and thoughtful beats elaborate
- **Making her manage it:** You plan it, you handle it

## The Win

You planned a surprise. She loved it. She felt special and cared for. That's a win.`,
  },
  'give-physical-affection': {
    id: 29,
    title: 'Give Physical Affection (Without Expecting Sex)',
    category: 'Romance',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Learn how to show physical affection that isn\'t about sex. Hugs, hand-holding, and cuddling rebuild physical connection.',
    content: `## Why This Matters

Physical touch releases oxytocin (the bonding hormone). But if every touch leads to sex, she'll start avoiding touch. Non-sexual physical affection rebuilds the physical connection that makes you feel like partners.

## The Secret: Touch Without Agenda

Touch her because you want to connect, not because you want something. Make it about connection, not expectation.

## How to Give Physical Affection

### 1. Start Small

- A hug when you see her
- A kiss on the forehead
- Holding her hand
- A hand on her back

### 2. Make It Regular

Don't only touch her when you want sex. Touch her regularly, just because.

### 3. Make It About Connection

Touch her to connect, not to get something. Make it about showing love, not about getting something in return.

### 4. Notice What She Likes

Pay attention to:
- What kind of touch does she respond to?
- When does she seem to enjoy it?
- What makes her pull away?

## Examples of Non-Sexual Physical Affection

- Hugs (long, not quick)
- Hand-holding
- Cuddling on the couch
- Back rubs or massages
- Kisses (forehead, cheek, not just lips)
- Sitting close
- Touching her arm or back

## What Makes It Meaningful

- **It's not about sex:** Touch for connection, not expectation
- **It's regular:** You do it often, not just when you want something
- **It's about her:** What she likes, not what you want
- **It's genuine:** You actually want to connect

## Common Mistakes

- **Every touch leading to sex:** That makes her avoid touch
- **Only touching when you want something:** Touch regularly, just because
- **Not noticing her response:** Pay attention to what she likes
- **Making it about you:** It's about connection, not your needs

## The Win

You gave physical affection. She felt connected. You rebuilt physical intimacy. That's a win.`,
  },
  // Additional Gratitude guides
  'send-gratitude-text': {
    id: 30,
    title: 'Send a Gratitude Text',
    category: 'Gratitude',
    difficulty: 'Easy',
    time: '30 seconds',
    excerpt: 'Learn how to send a quick text expressing gratitude. A simple way to brighten her day and show you\'re thinking of her.',
    content: `## Why This Matters

A quick text expressing gratitude shows you're thinking of her even when you're apart. It's a simple way to brighten her day and make her feel appreciated.

## The Secret: Be Specific

Generic "thanks" doesn't land. Specific gratitude shows you're paying attention.

## How to Send a Gratitude Text

### 1. Be Specific

**Generic:** "Thanks!"
**Specific:** "Thanks for handling that stressful situation this morning. I know that wasn't easy, and I appreciate you."

### 2. Notice What She Does

Pay attention to:
- What did she handle today?
- What did she do for you?
- What effort did she make?

### 3. Send It When You Notice It

Don't wait. If you notice something, text about it.

### 4. Keep It Simple

You don't need a novel. A few sentences is enough.

## Examples of Gratitude Texts

- "Thanks for making coffee this morning. I really needed that."
- "I appreciate you handling that. I know it was stressful."
- "Thank you for [specific thing]. It meant a lot."
- "I'm grateful for how you [specific thing]. You're amazing."

## What Makes It Meaningful

- **It's specific:** Not generic, but specific to what she did
- **It's timely:** You send it when you notice it
- **It's genuine:** You actually mean it
- **It's simple:** A few sentences, not a novel

## Common Mistakes

- **Being generic:** "Thanks" is better than nothing, but specific is better
- **Only texting when you want something:** Gratitude isn't transactional
- **Not sending it:** If you notice it, say it
- **Overthinking it:** Keep it simple

## The Win

You sent a gratitude text. She felt appreciated. You brightened her day. That's a win.`,
  },
  'morning-gratitude': {
    id: 31,
    title: 'Start the Day with Gratitude',
    category: 'Gratitude',
    difficulty: 'Easy',
    time: '30 seconds',
    excerpt: 'Learn how to start the day by telling your partner one thing you appreciate about them. Sets a positive tone and creates connection.',
    content: `## Why This Matters

Starting the day with gratitude sets a positive tone. It creates connection before life gets busy. It shows you're thinking about her and you appreciate her.

## The Secret: Make It a Habit

Don't do it once. Make it a daily habit. Same time, every day.

## How to Start the Day with Gratitude

### 1. Pick a Time

Choose when you'll do it:
- When you first see her in the morning
- Over morning coffee
- Before you leave for work
- During breakfast

### 2. Be Specific

**Generic:** "I appreciate you."
**Specific:** "I appreciate how patient you are with the kids in the mornings. That's really impressive."

### 3. Make It About Her

Focus on:
- Her character
- What she does
- Who she is
- What you're grateful for about her

### 4. Keep It Simple

You don't need a speech. One specific thing is enough.

## Examples of Morning Gratitude

- "I'm grateful for how you always make mornings easier for us."
- "I appreciate you getting up early to handle [thing]. Thank you."
- "I'm grateful for your patience. I see how you handle [situation]."
- "Thank you for [specific thing]. It means a lot."

## What Makes It Meaningful

- **It's specific:** Not generic, but specific to her
- **It's regular:** You do it daily, not just sometimes
- **It's genuine:** You actually mean it
- **It's timely:** You do it in the morning, when it sets the tone

## Common Mistakes

- **Being generic:** Specific gratitude lands better
- **Skipping it:** Make it a habit, don't skip it
- **Making it about you:** Focus on her, not you
- **Overthinking it:** Keep it simple

## The Win

You started the day with gratitude. You set a positive tone. She felt appreciated. That's a win.`,
  },
  // Additional Conflict guides
  'use-i-statements': {
    id: 32,
    title: 'Use "I" Statements in Conflicts',
    category: 'Conflict Resolution',
    difficulty: 'Medium',
    time: 'Ongoing',
    excerpt: 'Learn how to express yourself in conflicts using "I" statements instead of "you" statements. Prevents defensiveness and opens dialogue.',
    content: `## Why This Matters

"You" statements sound like accusations. They make her defensive. "I" statements express how you feel without blaming. They open dialogue instead of closing it.

## The Secret: Express Your Feelings, Don't Blame

"I" statements are about how you feel, not about what she did wrong. They express your experience without making her the problem.

## How to Use "I" Statements

### 1. Start with "I"

"I feel [emotion] when [situation]."

Not: "You make me feel..." or "You always..."

### 2. Express Your Feelings

Name the emotion:
- "I feel hurt..."
- "I feel frustrated..."
- "I feel disconnected..."
- "I feel overwhelmed..."

### 3. Describe the Situation

What happened that led to this feeling:
- "...when we don't spend time together."
- "...when I feel like I'm not being heard."
- "...when we're both stressed and snapping at each other."

### 4. Avoid Blame

Don't make it about what she did wrong. Make it about how you feel.

## Examples of "I" Statements

**Instead of:** "You never listen to me."
**Say:** "I feel unheard when I'm trying to tell you something and you're on your phone."

**Instead of:** "You always make plans without asking me."
**Say:** "I feel left out when plans are made without me being included."

**Instead of:** "You're always stressed."
**Say:** "I feel disconnected when we're both stressed and we don't have time to connect."

## What Makes "I" Statements Work

- **They express feelings:** Not accusations, but feelings
- **They avoid blame:** They're about your experience, not her fault
- **They open dialogue:** They invite conversation, not defensiveness
- **They're specific:** They describe the situation, not vague complaints

## Common Mistakes

- **Starting with "you":** That's an accusation, not an "I" statement
- **Blaming:** "I feel hurt because you..." is still blaming
- **Being vague:** Be specific about the situation
- **Using it to manipulate:** "I" statements are about expressing feelings, not getting your way

## The Win

You used "I" statements. You expressed your feelings without blame. She didn't get defensive. You opened dialogue. That's a win.`,
  },
  'make-amends': {
    id: 33,
    title: 'Make Amends After a Mistake',
    category: 'Conflict Resolution',
    difficulty: 'Medium',
    time: 'Varies',
    excerpt: 'Learn how to not just apologize, but actually make amends. Take concrete steps to repair trust and show you\'re committed to doing better.',
    content: `## Why This Matters

An apology is words. Amends are actions. Making amends shows you're not just sorry—you're committed to doing better. It repairs trust and heals hurts.

## The Secret: Actions Speak Louder

Don't just say you're sorry. Show you're sorry. Take concrete steps to make things right.

## How to Make Amends

### 1. Apologize Sincerely

Start with a real apology:
- Take responsibility
- Acknowledge the impact
- Don't make excuses

### 2. Ask What You Can Do

Ask her: "What can I do to make this right?" or "How can I repair this?"

### 3. Take Concrete Steps

Do something specific:
- Change your behavior
- Fix what you broke
- Make up for what you did
- Show you're committed to doing better

### 4. Follow Through

Don't just say you'll do it. Actually do it. And keep doing it.

## Examples of Making Amends

**If you forgot something important:**
- Apologize
- Set up systems so it doesn't happen again
- Make it up to her in a specific way

**If you hurt her feelings:**
- Apologize
- Understand why it hurt
- Change your behavior
- Show you're committed to doing better

**If you broke trust:**
- Apologize
- Take responsibility
- Be transparent
- Show through actions that you're trustworthy

## What Makes Amends Meaningful

- **They're specific:** Not vague promises, but specific actions
- **They address the impact:** They repair what was broken
- **They show commitment:** You're not just sorry, you're committed to change
- **They're ongoing:** You follow through, not just do it once

## Common Mistakes

- **Just apologizing:** Words aren't enough—you need actions
- **Making vague promises:** Be specific about what you'll do
- **Not following through:** If you say you'll do it, do it
- **Making it about you:** It's about repairing what you broke, not about you

## The Win

You made amends. You took concrete steps to repair trust. She saw you're committed to doing better. That's a win.`,
  },
  // Additional Reconnection guides
  'sit-close-and-talk': {
    id: 34,
    title: 'Sit Close and Talk',
    category: 'Reconnection',
    difficulty: 'Easy',
    time: '15-30 min',
    excerpt: 'Learn how physical proximity increases emotional connection. Sit side-by-side instead of across from each other and have a conversation.',
    content: `## Why This Matters

Physical proximity increases emotional intimacy. When you sit side-by-side instead of across from each other, conversations feel more connected. It's a simple way to rebuild the connection that got lost.

## The Secret: Proximity Creates Connection

Being physically close while talking creates a different kind of connection than sitting across from each other. It feels more intimate, more connected.

## How to Sit Close and Talk

### 1. Choose Side-by-Side

Instead of sitting across from each other:
- Sit on the same couch
- Sit next to each other on a bench
- Sit side-by-side at a table

### 2. Be Close

Don't sit at opposite ends. Sit close. Your bodies should be near each other.

### 3. Actually Talk

This isn't about watching TV together. It's about talking:
- Ask questions
- Share your day
- Talk about your relationship
- Have a real conversation

### 4. Make It Regular

Don't do it once. Make it a regular thing. Same time, same place.

## What Makes It Work

- **Physical proximity:** You're close, not far apart
- **Actual conversation:** You're talking, not just being near each other
- **Regularity:** You do it often, not just sometimes
- **Presence:** You're actually there, not distracted

## Common Mistakes

- **Sitting across from each other:** That's not the same
- **Not actually talking:** Being near each other isn't enough—you need to talk
- **Being distracted:** Put your phone away, be present
- **Only doing it once:** Make it a regular thing

## The Win

You sat close and talked. You felt more connected. Physical proximity increased emotional intimacy. That's a win.`,
  },
  'practice-turning-toward': {
    id: 35,
    title: 'Practice Turning Toward Her Bids for Connection',
    category: 'Reconnection',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Learn to recognize when she\'s reaching out for connection and how to respond positively. Small moments build big emotional bonds.',
    content: `## Why This Matters

When she reaches out—a comment, a question, a look—how you respond determines everything. Turn toward her, and you connect. Turn away, and you drift apart. It's that simple, and it's that important.

## The Secret: Notice and Respond

She's constantly making small bids for connection. A comment, a question, a gesture. Notice them. Respond positively. Turn toward her, not away.

## How to Turn Toward Bids

### 1. Notice the Bid

Pay attention to:
- Comments she makes
- Questions she asks
- Gestures she makes
- Times she's trying to connect

### 2. Respond Positively

When she makes a bid:
- Acknowledge it
- Engage with it
- Show interest
- Be present

### 3. Don't Turn Away

Avoid:
- Ignoring her
- Giving one-word answers
- Being distracted
- Making it about you

### 4. Make It a Habit

This isn't a one-time thing. Make turning toward her a regular habit.

## Examples of Bids for Connection

- A comment about her day
- A question about something
- A gesture (touching your arm, etc.)
- Sharing something she's thinking about
- Asking for your attention

## Examples of Turning Toward

**She says:** "Look at this sunset."
**You turn toward:** "Wow, that's beautiful. Let's watch it together."
**You turn away:** "Yeah." (keeps looking at phone)

**She asks:** "How was your day?"
**You turn toward:** "It was good. How was yours? Tell me about it."
**You turn away:** "Fine." (one word, no follow-up)

## What Makes It Work

- **You notice the bid:** You're paying attention
- **You respond positively:** You engage, don't dismiss
- **You're present:** You're actually there, not distracted
- **You do it consistently:** It's a habit, not occasional

## Common Mistakes

- **Not noticing bids:** You miss them because you're distracted
- **Turning away:** Ignoring, dismissing, or being distracted
- **Making it about you:** Turning her bid into a chance to talk about yourself
- **Only doing it sometimes:** Make it a habit, not occasional

## The Win

You turned toward her bid. You responded positively. You connected. Small moments built big bonds. That's a win.`,
  },
  // Additional Quality Time guides
  'create-morning-ritual': {
    id: 36,
    title: 'Create a Morning Ritual Together',
    category: 'Quality Time',
    difficulty: 'Easy',
    time: '10-30 min daily',
    excerpt: 'Learn how to create a small daily ritual—morning coffee, walk, or check-in. Consistency builds connection and creates predictable connection points.',
    content: `## Why This Matters

Small daily rituals create predictable connection points. They give you time together before life gets busy. Consistency builds connection and prevents you from drifting apart.

## The Secret: Make It Consistent

The power is in consistency. Same time, every day. It becomes something you both look forward to.

## How to Create a Morning Ritual

### 1. Pick Something Simple

Choose something that's:
- Easy to do
- Doesn't take long
- You can do consistently
- You both enjoy

### 2. Pick a Time

Choose when you'll do it:
- First thing in the morning
- After you wake up
- Over morning coffee
- Before you start your day

### 3. Make It Consistent

Do it at the same time, every day. Consistency is what makes it powerful.

### 4. Keep It Simple

Don't overcomplicate it. A simple ritual is better than a complicated one you can't maintain.

## Examples of Morning Rituals

- Morning coffee together (10-15 min)
- A short walk together (15-20 min)
- Breakfast together (20-30 min)
- A morning check-in (5-10 min)
- Sitting together before the day starts (10-15 min)

## What Makes It Work

- **It's consistent:** Same time, every day
- **It's simple:** Easy to do, not complicated
- **It's together:** You're both there, both engaged
- **It's regular:** You do it daily, not just sometimes

## Common Mistakes

- **Making it complicated:** Keep it simple
- **Not being consistent:** Do it every day, not just when you feel like it
- **Being distracted:** Be present, not on your phone
- **Giving up:** Stick with it, even when it's hard

## The Win

You created a morning ritual. You're connecting daily. You're building consistency. That's a win.`,
  },
  'create-evening-ritual': {
    id: 37,
    title: 'Create an Evening Ritual Together',
    category: 'Quality Time',
    difficulty: 'Easy',
    time: '10-30 min daily',
    excerpt: 'Learn how to create a small daily ritual at the end of the day—evening walk, bedtime check-in, or quiet time together. Consistency rebuilds connection.',
    content: `## Why This Matters

Evening rituals give you time together at the end of the day. They help you process the day together, reconnect, and end the day on a positive note.

## The Secret: Make It a Wind-Down

Evening rituals should help you both wind down and connect. They're about ending the day together, not adding stress.

## How to Create an Evening Ritual

### 1. Pick Something Relaxing

Choose something that:
- Helps you both wind down
- Doesn't require energy
- You can do consistently
- Feels good

### 2. Pick a Time

Choose when you'll do it:
- After dinner
- Before bed
- End of the day
- When you're both home

### 3. Make It Consistent

Do it at the same time, every day. Consistency is what makes it powerful.

### 4. Keep It Simple

Don't overcomplicate it. A simple ritual is better than a complicated one.

## Examples of Evening Rituals

- Evening walk together (15-20 min)
- Bedtime check-in (5-10 min)
- Quiet time together (10-15 min)
- Tea or hot drink together (10-15 min)
- Sitting together and talking (15-20 min)

## What Makes It Work

- **It's consistent:** Same time, every day
- **It's relaxing:** Helps you wind down, not add stress
- **It's together:** You're both there, both engaged
- **It's regular:** You do it daily, not just sometimes

## Common Mistakes

- **Making it complicated:** Keep it simple
- **Not being consistent:** Do it every day
- **Being distracted:** Be present, not on your phone
- **Making it about logistics:** It's about connection, not planning

## The Win

You created an evening ritual. You're ending the day together. You're building consistency. That's a win.`,
  },
  // Additional Outdoor guides
  'bike-ride-together': {
    id: 38,
    title: 'Go for a Bike Ride Together',
    category: 'Outdoor Activities',
    difficulty: 'Easy',
    time: '1-2 hours',
    excerpt: 'Learn how to plan and execute a bike ride together. Explore local trails, get exercise, and create quality time in nature.',
    content: `## Why This Matters

Bike rides combine exercise, nature, and quality time. You're moving together, exploring together, and creating shared experiences. It's a simple way to connect and get outside.

## The Secret: Match Her Pace

Don't make it about speed or distance. Make it about being together. Match her pace. Enjoy the ride.

## How to Go for a Bike Ride Together

### 1. Pick a Route

Choose something that:
- Matches both your skill levels
- Is safe and enjoyable
- Has nice scenery
- Isn't too long or challenging

### 2. Check Your Bikes

Make sure:
- Tires are inflated
- Brakes work
- Everything is in good shape
- You have water and snacks

### 3. Match Her Pace

Don't race ahead. Ride together. Match her pace. Enjoy being together.

### 4. Make It About Connection

This isn't about speed or distance. It's about:
- Spending time together
- Getting outside
- Moving together
- Having fun

## What Makes It Work

- **You ride together:** Not racing, but together
- **You match her pace:** It's about connection, not competition
- **You enjoy it:** It's fun, not stressful
- **You're present:** You're there together, not just on bikes

## Common Mistakes

- **Racing ahead:** That's not together, that's you leaving her behind
- **Making it about speed:** It's about connection, not competition
- **Not checking bikes:** Broken bike ruins the ride
- **Making it too long:** Start shorter, build up

## The Win

You went for a bike ride together. You got outside, moved together, and connected. That's a win.`,
  },
  'evening-stroll-together': {
    id: 39,
    title: 'Take an Evening Stroll Together',
    category: 'Outdoor Activities',
    difficulty: 'Easy',
    time: '20-30 min',
    excerpt: 'Learn how to make evening walks a regular thing. Use this time to connect, process the day, and unwind together.',
    content: `## Why This Matters

Evening walks are perfect for processing the day. You're moving, you're outside, and you have time to talk. It's a simple way to connect and unwind together.

## The Secret: Make It a Habit

Don't do it once. Make it a regular thing. Same time, every day. It becomes something you both look forward to.

## How to Take an Evening Stroll

### 1. Pick a Time

Choose when you'll go:
- After dinner
- Before bed
- End of the day
- When you're both home

### 2. Pick a Route

Choose something:
- Safe and enjoyable
- Nice to walk
- Not too long
- You can do regularly

### 3. Leave Your Phones

Put your phones away. This is about being together, not being distracted.

### 4. Talk

Use this time to:
- Process the day
- Check in with each other
- Talk about what's on your mind
- Just be together

## What Makes It Work

- **It's consistent:** You do it regularly, not just sometimes
- **You're present:** Phones away, actually together
- **You talk:** You use the time to connect
- **You enjoy it:** It's relaxing, not stressful

## Common Mistakes

- **Being on your phone:** That defeats the purpose
- **Not talking:** Use the time to connect
- **Making it too long:** Start shorter, build up
- **Skipping it:** Make it a habit, don't skip it

## The Win

You took an evening stroll. You processed the day together. You connected and unwound. That's a win.`,
  },
  // Additional Active guides
  'swim-together': {
    id: 40,
    title: 'Go Swimming Together',
    category: 'Active Together',
    difficulty: 'Easy',
    time: '1-2 hours',
    excerpt: 'Learn how to make swimming a fun activity you do together. Pool, lake, or beach—water activities are naturally playful and bonding.',
    content: `## Why This Matters

Swimming together is naturally playful and fun. Water activities create a relaxed, playful environment. You're moving together, having fun, and creating shared experiences.

## The Secret: Make It Playful

This isn't about laps or competition. It's about having fun together in the water.

## How to Go Swimming Together

### 1. Pick a Place

Choose somewhere:
- You both enjoy
- Is safe
- You can actually swim
- Is fun

### 2. Make It About Fun

This isn't about:
- Speed
- Distance
- Competition

It's about:
- Having fun
- Being together
- Playing in the water
- Enjoying each other

### 3. Be Present

Put your phone away. Be in the water together. Actually be there.

### 4. Enjoy It

Relax. Have fun. Play. Enjoy being together in the water.

## What Makes It Work

- **It's fun:** You're enjoying it, not stressing about it
- **You're together:** You're in the water together, not separately
- **You're present:** You're actually there, not distracted
- **You enjoy it:** It's playful, not competitive

## Common Mistakes

- **Making it competitive:** That's not fun, that's stressful
- **Being on your phone:** Be in the water, not on your phone
- **Not being together:** You're swimming together, not separately
- **Making it about exercise:** It's about fun and connection

## The Win

You went swimming together. You had fun in the water. You played and connected. That's a win.`,
  },
  'disc-golf-together': {
    id: 41,
    title: 'Play Disc Golf Together',
    category: 'Active Together',
    difficulty: 'Easy',
    time: '1-2 hours',
    excerpt: 'Learn how to make disc golf a fun activity you do together. Casual, fun, and gets you moving outside while having a good time.',
    content: `## Why This Matters

Disc golf is casual, fun, and gets you moving. It's not competitive or stressful—it's just a good time together outside. Perfect for couples who want to be active without the pressure.

## The Secret: Keep It Casual

This isn't about scores or competition. It's about having fun together outside.

## How to Play Disc Golf Together

### 1. Find a Course

Look for:
- A local course
- Something beginner-friendly
- Nice setting
- Not too crowded

### 2. Get Some Discs

You don't need fancy equipment:
- A few discs (driver, mid-range, putter)
- Can rent or buy cheap starter sets
- Don't need a lot to start

### 3. Keep It Fun

This isn't about:
- Scores
- Competition
- Being good

It's about:
- Having fun
- Being outside
- Moving together
- Enjoying each other

### 4. Be Patient

If one of you is better, be patient. Help each other. Make it fun, not competitive.

## What Makes It Work

- **It's casual:** No pressure, just fun
- **You're together:** You're playing together, not competing
- **You're outside:** Getting fresh air and movement
- **You enjoy it:** It's fun, not stressful

## Common Mistakes

- **Making it competitive:** That takes the fun out
- **Getting frustrated:** Keep it light and fun
- **Not being patient:** Help each other, don't get competitive
- **Making it about scores:** It's about fun, not scores

## The Win

You played disc golf together. You had fun outside. You moved together and connected. That's a win.`,
  },
  // Cooking Together Guides
  'cook-together': {
    id: 42,
    title: 'Cook a Meal Together',
    category: 'Quality Time',
    difficulty: 'Easy',
    time: '1-2 hours',
    excerpt: 'Learn how to turn cooking into quality time. Work as a team in the kitchen and create something together.',
    content: `## Why This Matters

Cooking together transforms a necessary task into quality time. You're working as a team, creating something together, and spending focused time without distractions. It builds teamwork and creates shared accomplishment.

## The Secret: Make It a Team Effort

This isn't about one person cooking while the other watches. It's about working together, dividing tasks, and creating something as a team.

## How to Cook Together

### 1. Plan Together

Before you start:
- Pick a recipe you both want to try
- Make sure you have all ingredients
- Divide tasks fairly
- Set aside enough time

### 2. Divide Tasks

Work together:
- One chops, one preps
- One cooks, one assists
- One cleans as you go, one focuses on cooking
- Switch roles so it's fair

### 3. Be Patient

Cooking together requires:
- Patience with each other
- Not taking over
- Letting each person do their part
- Working as a team, not competing

### 4. Enjoy the Process

This isn't just about the food:
- Talk while you cook
- Laugh at mistakes
- Enjoy working together
- Make it fun, not stressful

## What Makes It Work

- **You're both involved:** It's a team effort, not a solo task
- **You're patient:** You work together, not against each other
- **You enjoy it:** It's fun, not stressful
- **You create something:** You're making something together

## Common Mistakes

- **One person taking over:** That defeats the purpose
- **Making it competitive:** It's teamwork, not competition
- **Rushing through it:** Take your time, enjoy the process
- **Not planning:** Have everything ready before you start

## The Win

You cooked together. You worked as a team. You created something together and spent quality time. That's a win.`,
  },
  'cook-her-favorite-meal': {
    id: 43,
    title: 'Cook Her Favorite Meal',
    category: 'Romance',
    difficulty: 'Medium',
    time: '2-3 hours',
    excerpt: 'Learn how to make her favorite dish from scratch. Put thought and effort into making it special and showing you care.',
    content: `## Why This Matters

Making her favorite meal shows you pay attention to what she likes. The effort demonstrates care and thoughtfulness. It's a tangible way to show love through action.

## The Secret: Put in Real Effort

This isn't about ordering her favorite takeout. It's about making it yourself, putting in the time and effort to create something special for her.

## How to Cook Her Favorite Meal

### 1. Find Out What It Is

If you don't know:
- Pay attention to what she orders
- Ask her what her favorite meal is
- Notice what she gets excited about
- Remember what she's mentioned

### 2. Get the Recipe Right

Don't guess:
- Find a good recipe
- Read reviews
- Make sure you understand the steps
- Have all ingredients ready

### 3. Put in the Effort

This is about showing you care:
- Don't take shortcuts
- Follow the recipe
- Make it from scratch
- Put thought into presentation

### 4. Make It Special

Go the extra mile:
- Set the table nicely
- Light candles
- Put on music she likes
- Make it feel like a special occasion

## What Makes It Special

- **You paid attention:** You know what she likes
- **You put in effort:** You made it yourself
- **You made it special:** You went beyond just cooking
- **You showed you care:** The effort demonstrates love

## Common Mistakes

- **Taking shortcuts:** That shows you didn't care enough
- **Not asking what she likes:** Make sure it's actually her favorite
- **Making it about you:** This is about her, not your cooking skills
- **Rushing it:** Take your time, do it right

## The Win

You made her favorite meal. You put in real effort. She felt seen and cared for. That's a win.`,
  },
  // Financial Communication Guides
  'talk-about-finances': {
    id: 44,
    title: 'Have a Complete Financial Conversation',
    category: 'Partnership',
    difficulty: 'Medium',
    time: '1-2 hours',
    excerpt: 'Learn how to have open, honest conversations about money. Financial transparency builds trust and prevents conflicts.',
    content: `## Why This Matters

Money is one of the biggest sources of conflict in relationships. Financial transparency builds trust and prevents money-related fights. When you're on the same page financially, you're true partners.

## The Secret: Complete Transparency

This isn't about sharing some things. It's about sharing everything: income, expenses, debts, savings, goals, and concerns. No secrets, no surprises.

## How to Have a Financial Conversation

### 1. Set Aside Time

Don't rush this:
- Pick a time when you're both calm
- No distractions (phones away)
- Enough time to cover everything
- Private space where you can talk

### 2. Come Prepared

Before you talk:
- Gather all financial documents
- Know your numbers (income, expenses, debts)
- Be ready to be completely honest
- Come with an open mind

### 3. Share Everything

Be completely transparent:
- All income sources
- All expenses
- All debts
- All savings and investments
- Financial goals and concerns

### 4. Listen Without Judgment

When she shares:
- Don't judge her spending
- Don't get defensive
- Listen to understand
- Ask questions to clarify

### 5. Make a Plan Together

After sharing:
- Discuss what's working
- Identify what needs to change
- Set financial goals together
- Create a plan you both agree on

## What to Cover

- **Income:** All sources of income
- **Expenses:** Where money is going
- **Debts:** All debts and payment plans
- **Savings:** Current savings and goals
- **Financial goals:** Short-term and long-term
- **Concerns:** What worries each of you

## Common Mistakes

- **Hiding things:** Secrets destroy trust
- **Being judgmental:** Different money mindsets are normal
- **Making it one-sided:** Both people need to share
- **Not following up:** Make it a regular conversation
- **Getting defensive:** Listen and understand, don't defend

## The Win

You had a complete financial conversation. You're both on the same page. You're true financial partners. That's a win.`,
  },
  // Cleaning Guides
  'clean-together': {
    id: 45,
    title: 'Do a Deep Clean Together',
    category: 'Partnership',
    difficulty: 'Easy',
    time: '2-4 hours',
    excerpt: 'Learn how to transform cleaning from a chore into quality time. Work as a team and make it fun.',
    content: `## Why This Matters

Cleaning together transforms a chore into quality time. When you work as a team, the work goes faster, it's more enjoyable, and you both benefit from the result. It's practical partnership in action.

## The Secret: Make It a Team Effort

This isn't about one person cleaning while the other watches. It's about working together, dividing tasks, and getting it done as a team.

## How to Clean Together

### 1. Pick a Space

Choose something:
- That needs deep cleaning
- You can finish in one session
- You both care about
- That will make a real difference

### 2. Divide Tasks Fairly

Work together:
- One person takes one area, the other takes another
- Or work on the same area together
- Switch tasks so it's fair
- Help each other when needed

### 3. Make It Fun

It doesn't have to be miserable:
- Put on music you both like
- Take breaks together
- Laugh at the mess
- Make it a game

### 4. Finish It Completely

Don't half-do it:
- Complete the whole space
- Put everything away
- Clean up your supplies
- Admire the result together

## What Makes It Work

- **You're both involved:** It's teamwork, not a solo task
- **You divide fairly:** No one person does everything
- **You make it fun:** It's enjoyable, not miserable
- **You finish it:** You complete it together

## Common Mistakes

- **One person doing everything:** That's not cleaning together
- **Making it competitive:** It's teamwork, not a race
- **Not finishing:** Complete the whole space
- **Complaining the whole time:** Make it fun, not miserable

## The Win

You cleaned together. You worked as a team. You have a clean space and you spent quality time together. That's a win.`,
  },
  // Pet Responsibility Guides
  'pet-responsibility': {
    id: 46,
    title: 'Take Full Pet Responsibility',
    category: 'Partnership',
    difficulty: 'Easy',
    time: 'Ongoing',
    excerpt: 'Learn how to take complete responsibility for pet care. Give her a real break and show you understand the mental load.',
    content: `## Why This Matters

Pet care is often one person's responsibility, even when you both agreed to get the pet. Taking full responsibility for a period shows you understand the mental load and gives her a real break. It's true partnership.

## The Secret: Complete Responsibility

This isn't about helping with pet care. It's about taking it over completely: feeding, walking, cleaning, vet appointments, everything. She doesn't have to think about it at all.

## How to Take Full Pet Responsibility

### 1. Take Over Everything

Handle 100% of:
- Feeding (all meals, on time)
- Walking/exercise
- Cleaning (litter box, waste, grooming)
- Vet appointments
- Medication if needed
- Training/exercise

### 2. Do It Without Being Asked

The whole point is:
- She doesn't have to remind you
- She doesn't have to think about it
- You just do it
- You handle it completely

### 3. Do It Well

Don't half-do it:
- Feed on time, every time
- Clean thoroughly, not just quickly
- Exercise properly
- Handle everything, not just the easy parts

### 4. Do It Consistently

This isn't a one-time thing:
- Do it every day
- Don't skip days
- Don't ask her to help
- Just handle it

## What "Full Responsibility" Means

- **You handle everything:** All pet care tasks
- **You do it without being asked:** No reminders needed
- **You do it well:** Not half-done
- **You do it consistently:** Every day, not just sometimes

## Common Mistakes

- **Asking her to help:** That's not full responsibility
- **Doing it poorly:** Do it right, not just quickly
- **Skipping days:** Consistency matters
- **Making her manage you:** Don't ask what to do—just do it

## The Win

You took full pet responsibility. She got a real break. You showed you understand partnership. That's a win.`,
  },
  // Family Actions for Mom Guides
  'breakfast-in-bed-for-mom': {
    id: 47,
    title: 'Make Mom Breakfast in Bed',
    category: 'Partnership',
    difficulty: 'Easy',
    time: '30-60 min',
    excerpt: 'You and the kids prepare breakfast together and serve it to Mom in bed. Let her relax and be served for once.',
    content: `## Why This Matters

Moms rarely get to be served. They're usually the ones serving everyone else. Breakfast in bed makes Mom feel special and appreciated. It's a simple way to show love and give her a break from morning responsibilities.

## The Secret: Let Her Be Served

This isn't about making breakfast and then asking her to help. It's about you and the kids doing everything so she can just relax and be served.

## How to Make Breakfast in Bed for Mom

### 1. Plan It

Before you start:
- Pick a day (weekend works best)
- Decide what to make
- Get all ingredients ready
- Make sure kids are involved

### 2. Do It Together (You and Kids)

Work as a team:
- Kids can help with simple tasks
- You handle the cooking
- Kids can help set up the tray
- Make it a family effort

### 3. Make It Special

Go the extra mile:
- Use a nice tray
- Add a flower or note
- Make her favorite things
- Present it nicely

### 4. Let Her Enjoy It

When you serve it:
- Don't rush her
- Don't ask her to help clean up
- Let her eat in peace
- Handle everything else

## What Makes It Special

- **She doesn't have to do anything:** You handle everything
- **It's from the whole family:** Kids are involved
- **It's thoughtful:** You made her favorite things
- **She gets to relax:** No morning responsibilities

## Common Mistakes

- **Asking her to help:** That defeats the purpose
- **Making it about you:** This is about her
- **Rushing her:** Let her enjoy it
- **Not involving kids:** They should be part of it

## The Win

You made Mom breakfast in bed. She felt special and appreciated. The whole family showed love. That's a win.`,
  },
  'poem-for-mom': {
    id: 48,
    title: 'Write and Read a Poem About Her',
    category: 'Romance',
    difficulty: 'Medium',
    time: '30-60 min',
    excerpt: 'Write a poem (or have the kids help) about Mom and read it to her. Make it personal and heartfelt.',
    content: `## Why This Matters

A personal poem shows thoughtfulness and effort. It's a unique way to express appreciation and make her feel deeply loved. When kids are involved, it becomes even more meaningful.

## The Secret: Make It Personal

This isn't about writing a generic poem. It's about writing something specific to her, about her, that shows you see and appreciate who she is.

## How to Write a Poem for Mom

### 1. Think About Her

Before you write:
- What do you appreciate about her?
- What makes her special?
- What does she do that you're grateful for?
- What do you love about who she is?

### 2. Keep It Simple

You don't have to be Shakespeare:
- Simple, heartfelt words work best
- Focus on being genuine, not fancy
- Write from the heart
- It doesn't have to rhyme perfectly

### 3. Involve the Kids

If you have kids:
- Ask them what they love about Mom
- Have them help write parts
- Let them add their own lines
- Make it a family poem

### 4. Read It to Her

When you share it:
- Read it with feeling
- Look at her while you read
- Don't rush through it
- Let her feel the words

## What Makes It Meaningful

- **It's personal:** It's about her, specifically
- **It's from the heart:** Genuine, not generic
- **It shows effort:** You took time to write it
- **It's unique:** Not something you can buy

## Common Mistakes

- **Making it generic:** Make it specific to her
- **Not putting in effort:** Actually write it, don't copy something
- **Rushing through reading it:** Read it with feeling
- **Making it about you:** Focus on her

## The Win

You wrote a poem for Mom. It was personal and heartfelt. She felt deeply loved and appreciated. That's a win.`,
  },
  'give-mom-a-break': {
    id: 49,
    title: 'Take the Kids Out So Mom Gets a Break',
    category: 'Partnership',
    difficulty: 'Easy',
    time: '2-4 hours',
    excerpt: 'Take the kids out for several hours so Mom can have uninterrupted time alone. Handle everything—no calls or texts unless emergency.',
    content: `## Why This Matters

Moms rarely get uninterrupted alone time. Giving Mom real alone time is a gift. When you take the kids out completely, she can actually relax, recharge, and have time to herself without worrying about anything.

## The Secret: Complete Break

This isn't about taking the kids to the park for 30 minutes. It's about taking them out for several hours, handling everything, and not bothering her unless it's a real emergency.

## How to Give Mom a Break

### 1. Plan It Ahead

Before you go:
- Tell her when you're leaving
- Tell her when you'll be back
- Make sure she knows she has time
- Plan something the kids will enjoy

### 2. Take Everything You Need

Don't make her pack:
- Pack snacks and drinks
- Pack diapers/wipes if needed
- Pack extra clothes
- Pack activities/toys
- Handle everything yourself

### 3. Don't Call or Text

Unless it's a real emergency:
- Don't call to ask questions
- Don't text for permission
- Don't check in constantly
- Let her have real alone time

### 4. Handle Everything

While you're out:
- Handle all kid needs
- Deal with any issues
- Don't come back early
- Give her the full time

## What Makes It a Real Break

- **She has time alone:** Uninterrupted, no kids
- **You handle everything:** She doesn't have to think about anything
- **You don't bother her:** No calls or texts
- **It's long enough:** Several hours, not 30 minutes

## Common Mistakes

- **Calling or texting constantly:** That's not a break
- **Coming back early:** Give her the full time
- **Asking her to pack things:** Handle it yourself
- **Making it too short:** She needs real time

## The Win

You took the kids out. Mom got real alone time. She relaxed and recharged. That's a win.`,
  },
  // Relationship Games Guides
  'relationship-games': {
    id: 50,
    title: 'Play Relationship Games Together',
    category: 'Intimacy',
    difficulty: 'Easy',
    time: '30-60 min',
    excerpt: 'Learn how relationship games can deepen connection and add playfulness. Try games that help you have real conversations.',
    content: `## Why This Matters

Relationship games create structured opportunities for deep connection. They help you have conversations you might not have otherwise and add playfulness to your relationship. They're fun and meaningful.

## The Secret: Be Open and Vulnerable

These games only work if you're willing to be honest and vulnerable. They create safe spaces for conversations, but you have to actually engage.

## Popular Relationship Games

### 1. "We're Not Really Strangers"

- Card game with deep questions
- Three levels of intimacy
- Encourages vulnerability
- Great for meaningful conversations

### 2. "The Gottman Card Decks" App

- Good conversation starters
- Multiple card decks (love, intimacy, etc.)
- Free app available

### 3. "TableTopics for Couples"

- Conversation starter cards
- Designed specifically for couples
- Fun and thought-provoking
- Easy to play anywhere

### 4. "The Adventure Challenge: Couples Edition"

- Scratch-off adventures
- Fun activities to do together
- Adds spontaneity
- Creates shared experiences

## How to Play Relationship Games

### 1. Pick a Game

Choose something:
- You're both interested in
- That matches your comfort level
- You can commit to playing
- That sounds fun to both of you

### 2. Set the Mood

Create the right environment:
- No distractions (phones away)
- Comfortable setting
- Enough time to play
- Relaxed atmosphere

### 3. Be Honest

When playing:
- Answer questions honestly
- Don't hold back
- Listen to her answers
- Be vulnerable

### 4. Have Fun

Remember:
- It's supposed to be fun
- Don't take it too seriously
- Laugh together
- Enjoy the connection

## What Makes It Work

- **You're both engaged:** Both people participate fully
- **You're honest:** You answer questions truthfully
- **You listen:** You pay attention to her answers
- **You have fun:** It's enjoyable, not stressful

## Common Mistakes

- **Not being honest:** These games only work if you're real
- **Taking it too seriously:** Have fun with it
- **Not listening:** Pay attention to her answers
- **Rushing through it:** Take your time, enjoy it

## The Win

You played a relationship game. You had meaningful conversations. You connected and had fun. That's a win.`,
  },
  // Intimacy Guides
  'initiate-intimacy': {
    id: 51,
    title: 'Initiate Physical Intimacy Without Pressure',
    category: 'Intimacy',
    difficulty: 'Medium',
    time: 'Varies',
    excerpt: 'Learn how to initiate physical intimacy in a way that feels loving and pressure-free. Focus on connection, not just the end goal.',
    content: `## Why This Matters

Pressure-free initiation makes intimacy feel safe and enjoyable. When she feels no pressure, she's more likely to want to connect. Focus on connection and pleasure, not just sex.

## The Secret: Remove All Pressure

This isn't about getting her to say yes. It's about creating an environment where she feels safe, desired, and free to say yes or no without consequences.

## How to Initiate Without Pressure

### 1. Start with Non-Sexual Touch

Build connection first:
- Cuddle and hold her
- Give her a back rub
- Touch her affectionately
- Build physical connection gradually

### 2. Pay Attention to Her Response

Watch for:
- Does she seem relaxed?
- Is she responding positively?
- Does she seem into it?
- Or does she seem tense or checked out?

### 3. Make It About Her Pleasure

Focus on:
- What feels good to her
- Her pleasure, not yours
- Making her feel desired
- Connection, not just sex

### 4. Accept "No" Gracefully

If she says no:
- Don't get upset
- Don't pressure her
- Don't make her feel guilty
- Just accept it and continue being affectionate

## What Makes It Pressure-Free

- **No expectations:** You're not assuming it will lead to sex
- **Her pleasure matters:** You focus on what feels good to her
- **She can say no:** Without consequences or guilt
- **It's about connection:** Not just the end goal

## Common Mistakes

- **Having expectations:** Don't assume it will lead to sex
- **Ignoring her response:** Pay attention to how she's reacting
- **Making it about you:** Focus on her pleasure
- **Getting upset if she says no:** That creates pressure

## The Win

You initiated intimacy without pressure. She felt safe and desired. You connected physically and emotionally. That's a win.`,
  },
  'focus-on-her-pleasure': {
    id: 52,
    title: 'Focus on Her Pleasure',
    category: 'Intimacy',
    difficulty: 'Medium',
    time: 'Varies',
    excerpt: 'Make an intimate encounter entirely about her pleasure. Ask what she wants and follow through without expecting anything in return.',
    content: `## Why This Matters

Focusing on her pleasure shows you care about her satisfaction. Selfless giving in intimacy strengthens emotional and physical connection. When she feels truly pleasured, your intimacy improves for both of you.

## The Secret: It's All About Her

This isn't about you getting something. It's about making her feel amazing, asking what she wants, and following through without expecting anything in return.

## How to Focus on Her Pleasure

### 1. Ask What She Wants

Don't assume:
- "What feels good?"
- "What do you want?"
- "How do you like to be touched?"
- "What would make you feel amazing?"

### 2. Listen and Follow Through

When she tells you:
- Actually do what she says
- Pay attention to her response
- Adjust based on her feedback
- Keep checking in

### 3. Don't Rush

Take your time:
- Don't rush to the "main event"
- Enjoy the whole process
- Focus on her pleasure throughout
- There's no timeline

### 4. No Expectations

This is about her:
- Don't expect anything in return
- Don't make it transactional
- Just focus on making her feel amazing
- Her pleasure is the goal

## What Makes It About Her

- **You ask what she wants:** You don't assume
- **You listen:** You actually follow through
- **You take your time:** You don't rush
- **You have no expectations:** It's about her, not you

## Common Mistakes

- **Assuming you know what she wants:** Ask, don't assume
- **Rushing through it:** Take your time
- **Having expectations:** This is about her, not you
- **Not listening:** Actually do what she says

## The Win

You focused entirely on her pleasure. She felt amazing. You connected deeply. That's a win.`,
  },
};

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const guide = guides[params.slug];

  if (!guide) {
    redirect('/dashboard/how-to-guides');
  }

  // Track visit to this guide
  const auth0Id = session.user.sub;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (user) {
    // Record visit (fire and forget - don't block page render)
    // Use void to explicitly ignore the promise
    void (async () => {
      try {
        await supabase
          .from('guide_visits')
          .insert({
            guide_slug: params.slug,
            user_id: user.id,
          });
      } catch (error: any) {
        // Silently fail - don't block page render if tracking fails
        // Table might not exist yet if migration hasn't been run
        if (error?.code !== '42P01') { // Only log if it's not a "table doesn't exist" error
          console.error('Failed to track guide visit:', error);
        }
      }
    })();
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/how-to-guides"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to guides
          </Link>

          <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full">
                {guide.category}
              </span>
              <span className="text-xs text-slate-500">
                {guide.difficulty} • {guide.time}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">{guide.title}</h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">{guide.excerpt}</p>

            <div className="prose prose-invert prose-lg max-w-none">
              {guide.content.split('\n\n').map((section: string, idx: number) => {
                if (section.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-2xl font-bold text-slate-50 mt-8 mb-4">
                      {section.replace('## ', '')}
                    </h2>
                  );
                }
                if (section.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-xl font-bold text-slate-50 mt-6 mb-3">
                      {section.replace('### ', '')}
                    </h3>
                  );
                }
                if (section.startsWith('- ')) {
                  const items = section.split('\n').filter((l) => l.startsWith('- '));
                  return (
                    <ul key={idx} className="list-disc list-inside mb-4 space-y-2 ml-4">
                      {items.map((item, i) => (
                        <li key={i} className="text-slate-200">
                          {item.replace('- ', '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                // Regular paragraph
                const lines = section.split('\n');
                return (
                  <div key={idx} className="mb-6">
                    {lines.map((line, i) => {
                      if (line.trim() === '') return null;
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-bold text-slate-100 mt-4 mb-2">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      return (
                        <p key={i} className="text-slate-200 mb-3 leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

