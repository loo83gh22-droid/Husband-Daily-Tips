import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

// Guide data - in the future this could come from a database
const guides: Record<string, any> = {
  'fix-leaky-faucet': {
    id: 1,
    title: 'Fix a Leaky Faucet Like a Pro',
    category: 'Home Repair',
    difficulty: 'Easy',
    time: '20 min',
    excerpt: 'Stop that annoying drip-drip-drip. This step-by-step guide will have you fixing faucets in under 20 minutes. Your wife will notice, and you\'ll feel like a boss.',
    content: `## Why This Matters

That constant drip-drip-drip isn't just annoying—it's wasting water and money. More importantly, fixing it yourself shows competence. Your wife notices when you handle things without calling a plumber.

## What You'll Need

- Adjustable wrench
- Screwdriver (flathead or Phillips, depending on your faucet)
- Replacement O-ring or cartridge (check your faucet model)
- Plumber's tape (optional but recommended)
- Rag or towel

## Step-by-Step

### 1. Turn Off the Water Supply

Find the shut-off valves under the sink. Turn them clockwise until they're fully closed. If you can't find them or they're stuck, turn off the main water supply to the house.

**Pro tip:** Test by turning on the faucet. If water still comes out, you didn't shut it off completely.

### 2. Remove the Handle

Look for a small cap or cover on top of the handle. Pop it off with a flathead screwdriver. Underneath, you'll find a screw. Remove it and pull the handle straight up.

**Common issue:** If the handle is stuck, gently wiggle it while pulling. Don't force it—you'll break something.

### 3. Remove the Stem or Cartridge

Use your adjustable wrench to unscrew the packing nut. Once it's off, pull out the stem or cartridge. This is where the leak is usually happening.

**What to look for:** Check the O-ring (the rubber ring around the stem). If it's cracked, worn, or missing, that's your problem.

### 4. Replace the O-Ring or Cartridge

If it's just the O-ring, replace it with an exact match from the hardware store. If it's the whole cartridge, you'll need to match the model number.

**Pro tip:** Take the old part with you to the store. Makes matching way easier.

### 5. Reassemble Everything

Put everything back in reverse order:
- Insert the new stem/cartridge
- Screw on the packing nut (not too tight—snug is enough)
- Put the handle back on
- Screw it in place

### 6. Turn the Water Back On

Slowly turn the shut-off valves counterclockwise. Check for leaks. If you see water, turn it off and tighten a bit more.

## Common Mistakes

- **Overtightening:** You'll strip threads or crack something. Snug is enough.
- **Wrong parts:** Make sure you match the exact model. Not all faucets are the same.
- **Skipping the shut-off:** You'll flood your kitchen. Don't be that guy.

## When to Call a Pro

If you've tried this and it's still leaking, or if you have a fancy faucet with no visible parts, call a plumber. No shame in it. But try this first—you'll surprise yourself.

## The Win

You fixed something. You didn't call someone. You saved money. Your wife noticed. That's a win.`,
  },
  'organize-garage': {
    id: 2,
    title: 'Organize the Garage (Without Losing Your Mind)',
    category: 'Organization',
    difficulty: 'Medium',
    time: '2-3 hours',
    excerpt: 'Transform that disaster zone into a functional space. Learn the system that actually works and keeps things organized long-term.',
    content: `## Why This Matters

Your garage is probably a disaster. Tools everywhere, boxes you haven't opened in years, and that one thing you know you need but can never find. Organizing it isn't just about neatness—it's about being able to actually use the space and find what you need when you need it.

## What You'll Need

- Heavy-duty trash bags
- Cardboard boxes (for donations)
- Labels and a marker
- Shelving units (if you don't have any)
- Clear storage bins
- A full day (seriously, don't rush this)

## The System That Actually Works

### Step 1: Empty Everything Out

Pull everything out of the garage. Yes, everything. Put it in the driveway or yard. This is the only way to see what you actually have.

**Pro tip:** Do this on a day with good weather. You don't want your stuff getting rained on.

### Step 2: Sort Into Piles

Create these categories:
- **Keep and use regularly** (tools, sports equipment you actually use)
- **Keep but store** (seasonal stuff, sentimental items)
- **Donate** (stuff that's still good but you don't need)
- **Trash** (broken, useless, or expired items)
- **Sell** (if it's worth your time)

**The rule:** If you haven't used it in a year and it's not sentimental, it goes.

### Step 3: Zone Your Garage

Divide your garage into zones:
- **Workbench area** (tools, hardware)
- **Storage zone** (seasonal items, boxes)
- **Active use zone** (things you grab regularly)
- **Vehicle space** (you know, for your car)

### Step 4: Install Shelving

If you don't have shelves, get some. Heavy-duty metal shelving units are worth every penny. Put them along the walls, not in the middle.

**Pro tip:** Leave space between shelves and the wall for air circulation. Prevents moisture issues.

### Step 5: Use Clear Bins

Store things in clear, labeled bins. You can see what's inside without opening them. Label the front and top.

**What goes in bins:**
- Seasonal decorations
- Sports equipment
- Tools by category
- Hardware and small parts

### Step 6: Create a Tool Wall

Hang frequently used tools on a pegboard or wall-mounted system. You'll use them more if you can see them and grab them easily.

### Step 7: Keep the Floor Clear

Your car should fit in the garage. If it doesn't, you have too much stuff. Keep walkways clear. Nothing should be on the floor except your vehicle.

## The Maintenance System

- **Once a month:** Quick sweep, put things back where they belong
- **Every 6 months:** Full review—what haven't you used? Get rid of it.
- **When you bring something new in:** Something old goes out. One in, one out.

## Common Mistakes

- **Keeping everything "just in case":** That's how you end up with a hoarder garage.
- **No system:** Just throwing things on shelves doesn't work long-term.
- **Rushing it:** This takes time. Do it right the first time.

## The Win

You can find your tools. Your car fits. Your wife can park in there. You look like you have your shit together. That's a win.`,
  },
  'build-garden-bed': {
    id: 3,
    title: 'Build a Simple Raised Garden Bed',
    category: 'Outdoor',
    difficulty: 'Medium',
    time: '3-4 hours',
    excerpt: 'Show off your skills and give your wife fresh herbs or veggies. This project looks impressive but is surprisingly straightforward.',
    content: `## Why This Matters

Fresh herbs and vegetables from your own garden? That's next-level. Your wife will be impressed, you'll save money, and you'll have something to show for a weekend project. Plus, gardening is actually pretty satisfying.

## What You'll Need

- 4 pieces of 2x8 or 2x10 lumber (8 feet long each)
- 4 corner brackets (L-brackets)
- Wood screws (2.5 inches)
- Drill with drill bit
- Level
- Landscape fabric (optional but recommended)
- Soil and compost
- Plants or seeds

**Cost:** About $50-80 depending on wood quality and size.

## Step-by-Step

### 1. Choose Your Location

Pick a spot that gets at least 6 hours of sunlight per day. Make sure it's level and has good drainage. Not too close to trees (roots will compete for nutrients).

**Size recommendation:** 4x4 feet is perfect for beginners. Big enough to grow plenty, small enough to manage.

### 2. Cut Your Lumber

Cut two 4-foot pieces and two 4-foot pieces (or whatever size you want). Most hardware stores will cut it for you if you ask.

**Pro tip:** Use cedar or redwood if you can afford it. They last longer and resist rot.

### 3. Assemble the Frame

Lay out your boards in a rectangle. Use corner brackets to join them at the corners. Pre-drill holes to avoid splitting the wood, then screw in the brackets.

**Make it square:** Measure diagonally from corner to corner. If both measurements are the same, it's square.

### 4. Level the Ground

Where you're placing the bed, level the ground. Remove grass, weeds, and rocks. You don't need to dig deep—just make it flat.

### 5. Place the Frame

Set your frame in place. Use a level to make sure it's even. If the ground isn't perfectly level, you can adjust by digging a bit more on the high side.

### 6. Add Landscape Fabric (Optional)

Line the bottom with landscape fabric. This prevents weeds from growing up into your bed while still allowing drainage.

### 7. Fill with Soil

Mix good quality topsoil with compost (about 70/30 ratio). Fill the bed almost to the top, leaving about an inch of space.

**Don't skimp on soil:** Good soil = good plants. Bad soil = wasted effort.

### 8. Plant Your Seeds or Seedlings

Follow the instructions on your seed packets or plant tags. Different plants need different spacing.

**Beginner-friendly plants:**
- Herbs (basil, rosemary, thyme)
- Lettuce
- Tomatoes (if you have room)
- Peppers

### 9. Water and Maintain

Water regularly, especially in the first few weeks. Check the soil—if it's dry an inch down, it's time to water.

## Common Mistakes

- **Wrong location:** Not enough sun = sad plants
- **Bad soil:** Don't use dirt from your yard. Buy good soil.
- **Overwatering:** More plants die from too much water than too little
- **Too big too fast:** Start small. You can always build another one.

## When to Build

Early spring is ideal, but you can build anytime. Just plant according to the season.

## The Win

You built something. You're growing food. Your wife is impressed. You have fresh herbs for cooking. That's a win.`,
  },
  'deep-clean-oven': {
    id: 4,
    title: 'Deep Clean the Oven (The Right Way)',
    category: 'Cleaning',
    difficulty: 'Easy',
    time: '45 min',
    excerpt: 'No harsh chemicals, no hours of scrubbing. The method that actually works and doesn\'t make you want to throw the oven out the window.',
    content: `## Why This Matters

Your oven is probably disgusting. Years of baked-on grease, food spills, and who knows what else. Cleaning it the wrong way is a nightmare. Do it the right way, and it's actually not that bad. Your wife will notice. Trust me.

## What You'll Need

- Baking soda
- White vinegar
- Spray bottle
- Sponge or scrub brush
- Razor blade scraper (for glass door)
- Old towels or rags
- Patience (45 minutes, not 3 hours)

## The Method That Actually Works

### Step 1: Remove the Racks

Take out the oven racks. Set them aside. You'll clean these separately in the sink with soap and water.

**Pro tip:** Soak the racks in hot, soapy water while you clean the oven. Makes them way easier to clean.

### Step 2: Make the Paste

Mix baking soda with just enough water to make a thick paste. You want it spreadable but not runny. Think toothpaste consistency.

### Step 3: Spread the Paste

Cover the entire inside of the oven with the baking soda paste. Don't be shy—get it everywhere. Avoid the heating elements if you can.

**How thick:** About 1/4 inch. You want good coverage.

### Step 4: Let It Sit

Leave it overnight. Yes, overnight. The baking soda needs time to break down the grease and grime. This is the secret—let chemistry do the work.

**Alternative:** If you're in a hurry, leave it for at least 2-3 hours. Overnight is better.

### Step 5: Wipe It Out

After it's sat, use a damp rag or sponge to wipe out the paste. Most of the grime will come with it. You might need to scrub a bit, but it should come off easily.

**If it's stubborn:** Add a bit more baking soda paste to that spot and let it sit another 30 minutes.

### Step 6: Spray with Vinegar

Fill a spray bottle with white vinegar. Spray the entire inside of the oven. It'll fizz (that's the baking soda reacting). This helps break down any remaining residue.

### Step 7: Final Wipe

Wipe everything out with a clean, damp rag. Get all the paste and vinegar residue out.

### Step 8: Clean the Glass Door

For the glass door, use a razor blade scraper. Hold it at a 45-degree angle and scrape off the baked-on gunk. Be careful not to scratch the glass.

**Pro tip:** Spray the glass with vinegar first to loosen things up.

### Step 9: Clean the Racks

By now, your racks have been soaking. Scrub them with a scrub brush or steel wool. Rinse and dry.

### Step 10: Put It Back Together

Put the racks back in. You're done.

## Why This Works

Baking soda is a mild abrasive that breaks down grease. The overnight soak gives it time to work. Vinegar helps dissolve remaining residue. Together, they're way more effective than harsh chemicals, and they won't make your kitchen smell like a chemical plant.

## Common Mistakes

- **Rushing it:** If you don't let the baking soda sit long enough, you'll be scrubbing for hours.
- **Using too much water:** The paste should be thick, not runny.
- **Skipping the vinegar step:** It really does help.
- **Trying to clean it in one go:** Let it sit overnight. Seriously.

## When to Do This

Do it when you don't need the oven for 12-24 hours. Weekend mornings are perfect.

## The Win

Your oven is clean. It didn't take 3 hours of scrubbing. Your wife noticed. You didn't use harsh chemicals. That's a win.`,
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
  'install-smart-thermostat': {
    id: 4,
    title: 'Install a Smart Thermostat',
    category: 'Smart Home',
    difficulty: 'Medium',
    time: '1 hour',
    excerpt: 'Save money, impress your wife, and control the temperature from your phone. This upgrade pays for itself and makes you look tech-savvy.',
    content: `## Why This Matters

Smart thermostats save money on energy bills, make your home more comfortable, and you can control them from your phone. Your wife will love being able to adjust the temperature without getting up. Plus, you look like you know what you're doing with technology.

## What You'll Need

- Smart thermostat (Nest, Ecobee, or similar)
- Screwdriver
- Drill (if you need to mount it)
- Level
- Wire labels (optional but helpful)
- Smartphone with the app installed

**Cost:** $100-250 depending on the model. It pays for itself in energy savings within a year or two.

## Step-by-Step

### Step 1: Turn Off the Power

Go to your circuit breaker and turn off the power to your HVAC system. This is important—you're working with electrical wires.

**Safety first:** Test the wires with a voltage tester to make sure they're off. Don't skip this.

### Step 2: Remove the Old Thermostat

Unscrew the old thermostat from the wall. Gently pull it away. You'll see wires connected to terminals.

**Take a photo:** Before you disconnect anything, take a picture of the wiring. This is your backup if you forget what goes where.

### Step 3: Label the Wires

Label each wire with the terminal it was connected to. Use tape or wire labels. Common labels:
- R (power)
- W (heat)
- Y (cooling)
- G (fan)
- C (common)

**Pro tip:** If you don't have a C wire, you might need an adapter. Check your thermostat's requirements.

### Step 4: Disconnect the Wires

Carefully disconnect each wire. Don't let them fall back into the wall. If they do, you'll have to fish them out, which is annoying.

**Trick:** Wrap the wires around a pencil to keep them from falling.

### Step 5: Mount the New Base

Hold the new thermostat's base plate against the wall. Use a level to make sure it's straight. Mark the screw holes, then drill and mount it.

**If the holes don't line up:** You might need to patch the old holes and drill new ones.

### Step 6: Connect the Wires

Connect each wire to the corresponding terminal on the new thermostat. Match the labels you made earlier.

**Double-check:** Make sure each wire is securely connected. Loose connections cause problems.

### Step 7: Attach the Thermostat

Snap the thermostat onto the base plate. It should click into place.

### Step 8: Turn the Power Back On

Go back to the circuit breaker and turn the power back on.

### Step 9: Set It Up

Follow the on-screen instructions to set up your new thermostat. You'll need to:
- Connect to Wi-Fi
- Set your preferences
- Download the app on your phone
- Link it to your account

### Step 10: Test It

Test both heating and cooling to make sure everything works. Adjust the temperature and make sure the system responds.

## Common Issues

- **No C wire:** Some older systems don't have a C (common) wire. You might need an adapter. Check your thermostat's instructions.
- **Wrong wire labels:** If your system doesn't work, double-check your wire connections against the photo you took.
- **Wi-Fi connection:** Make sure your thermostat is close enough to your router, or use a Wi-Fi extender.

## When to Call a Pro

If you're not comfortable working with electrical wires, or if your system is complex (like a heat pump with multiple stages), call an HVAC professional. No shame in it.

## The Win

You installed smart home technology. You can control your thermostat from your phone. Your energy bills will go down. Your wife is impressed. That's a win.`,
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

