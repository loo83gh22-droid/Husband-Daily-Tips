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

