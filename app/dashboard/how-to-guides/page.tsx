import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import { supabase } from '@/lib/supabase';

async function getGuideVisitCounts() {
  try {
    // Get visit counts for all guides
    const { data: visits, error } = await supabase
      .from('guide_visits')
      .select('guide_slug');

    // If table doesn't exist or query fails, return empty map
    if (error || !visits) {
      console.warn('Guide visits table not available yet:', error?.message);
      return new Map<string, number>();
    }

    // Count visits per guide slug
    const visitCounts = new Map<string, number>();
    visits.forEach((visit) => {
      const count = visitCounts.get(visit.guide_slug) || 0;
      visitCounts.set(visit.guide_slug, count + 1);
    });

    return visitCounts;
  } catch (error) {
    // Handle any unexpected errors gracefully
    console.warn('Error fetching guide visit counts:', error);
    return new Map<string, number>();
  }
}

export default async function HowToGuidesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Get visit counts for all guides
  const visitCounts = await getGuideVisitCounts();

  // Guide data organized by category (ordered by marriage importance - matching action categories)
  // Order: Communication, Intimacy, Partnership, Romance, Gratitude, Conflict, Reconnection, Quality Time, Outdoor, Active
  const guidesByCategory = {
    'communication': {
      name: 'Communication',
      description: 'Listen, communicate, and actually be there.',
      icon: '💬',
      guides: [
        {
          slug: 'be-present-quality-time',
          title: 'Be Present During Quality Time (Actually)',
          excerpt:
            'Put the phone down. Actually listen. Be there mentally, not just physically. Learn how to give her your full attention without it feeling forced.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
        {
          slug: 'listen-without-fixing',
          title: 'Listen Without Trying to Fix Everything',
          excerpt:
            'Sometimes she just needs to vent. She doesn\'t need solutions. She needs you to listen. Learn the difference and when to just be there.',
          difficulty: 'Medium',
          time: 'Varies',
        },
        {
          slug: 'have-hard-conversation',
          title: 'Have a Hard Conversation (Without It Becoming a Fight)',
          excerpt:
            'Difficult conversations don\'t have to turn into arguments. Learn how to communicate about tough topics without defensiveness or escalation.',
          difficulty: 'Hard',
          time: '30-60 min',
        },
        {
          slug: 'ask-better-questions',
          title: 'Ask Questions That Actually Matter',
          excerpt:
            'Move beyond "how was your day?" Learn how to ask questions that show you\'re actually interested and help you understand what\'s going on with her.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'apologize-right-way',
          title: 'Apologize the Right Way (Without Excuses)',
          excerpt:
            'A real apology doesn\'t include "but" or excuses. Learn how to take responsibility, acknowledge impact, and actually make things right.',
          difficulty: 'Medium',
          time: '5-10 min',
        },
        {
          slug: 'share-your-feelings',
          title: 'Share Your Feelings (Without Making It About You)',
          excerpt:
            'Learn how to open up and be vulnerable in a way that builds connection, not walls. Express what you\'re feeling without turning it into a problem she needs to solve.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
        {
          slug: 'daily-check-in',
          title: 'Do a Real Daily Check-In',
          excerpt:
            'Move beyond "how was your day?" Learn how to have meaningful daily conversations that show you care and help you stay connected.',
          difficulty: 'Easy',
          time: '10-15 min',
        },
        {
          slug: 'express-gratitude-to-partner',
          title: 'Express Gratitude to Your Partner',
          excerpt:
            'Learn how to thank your partner for specific things in ways that feel genuine and meaningful, not like you\'re checking a box.',
          difficulty: 'Easy',
          time: '1 min',
        },
        {
          slug: 'practice-5-1-ratio',
          title: 'Practice the 5:1 Ratio',
          excerpt:
            'Relationship researcher John Gottman found that healthy relationships need 5 positive interactions for every negative one. Learn how to build this ratio and rebuild connection.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
      ],
    },
    'intimacy': {
      name: 'Intimacy',
      description: 'Build emotional and physical connection that goes deeper.',
      icon: '💝',
      guides: [
        {
          slug: 'practice-love-languages',
          title: 'Speak Her Love Language (Actually)',
          excerpt:
            'Learn how to identify and practice her love language in ways that feel genuine, not forced. Make her feel deeply loved in the way she needs.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
        {
          slug: 'create-love-map',
          title: 'Build Your Love Map (Know Her Inner World)',
          excerpt:
            'Learn how to ask questions and pay attention in ways that help you understand her hopes, fears, dreams, and stresses. Build true emotional intimacy.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
        {
          slug: 'practice-turning-toward',
          title: 'Turn Toward Her Bids for Connection',
          excerpt:
            'Learn to recognize when she\'s reaching out for connection and how to respond positively. Small moments build big emotional bonds.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'non-sexual-physical-touch',
          title: 'Give Non-Sexual Physical Affection',
          excerpt:
            'Learn how to show physical affection that isn\'t about sex. Hugs, hand-holding, and cuddling rebuild the physical connection that makes you feel like partners.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'share-gratitude-for-character',
          title: 'Express Gratitude for Who She Is',
          excerpt:
            'Move beyond thanking her for what she does. Learn how to appreciate her character, values, and who she is as a person.',
          difficulty: 'Easy',
          time: '5 min',
        },
        {
          slug: 'practice-acts-of-service',
          title: 'Practice Acts of Service as a Love Language',
          excerpt:
            'Learn how to show love through actions. Do things for her that make her life easier and show you care.',
          difficulty: 'Easy',
          time: 'Varies',
        },
        {
          slug: 'practice-words-of-affirmation',
          title: 'Practice Words of Affirmation',
          excerpt:
            'Learn how to use words to make her feel deeply loved. Speak her love language through genuine, specific affirmations.',
          difficulty: 'Easy',
          time: '30 seconds',
        },
        {
          slug: 'initiate-intimacy',
          title: 'Initiate Physical Intimacy Without Pressure',
          excerpt:
            'Learn how to initiate physical intimacy in a way that feels loving and pressure-free. Focus on connection, not just the end goal.',
          difficulty: 'Medium',
          time: 'Varies',
        },
        {
          slug: 'focus-on-her-pleasure',
          title: 'Focus on Her Pleasure',
          excerpt:
            'Make an intimate encounter entirely about her pleasure. Ask what she wants and follow through without expecting anything in return.',
          difficulty: 'Medium',
          time: 'Varies',
        },
      ],
    },
    'partnership': {
      name: 'Partnership',
      description: 'Actually help. Be a partner, not just a passenger.',
      icon: '🤝',
      guides: [
        {
          slug: 'help-hosting-party',
          title: 'Help When You\'re Hosting the Party',
          excerpt:
            'Don\'t be the husband who disappears when guests arrive. Actually help. Know what to do, when to do it, and how to make hosting easier for her.',
          difficulty: 'Easy',
          time: 'Party duration',
        },
        {
          slug: 'handle-morning-routine',
          title: 'Take Over the Morning Routine (Without Being Asked)',
          excerpt:
            'Give her a break. Handle breakfast, kids, whatever needs doing. Show up without her having to ask or manage you.',
          difficulty: 'Easy',
          time: 'Morning routine',
        },
        {
          slug: 'notice-what-needs-doing',
          title: 'Notice What Needs Doing (And Do It)',
          excerpt:
            'Stop waiting to be told. Look around. See what needs doing. Do it. This is what being a partner actually looks like.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'help-when-shes-stressed',
          title: 'Help When She\'s Stressed (The Right Way)',
          excerpt:
            'Don\'t try to fix it. Don\'t make it about you. Actually help. Learn what she needs when she\'s overwhelmed and how to provide it.',
          difficulty: 'Medium',
          time: 'Varies',
        },
        {
          slug: 'handle-household-tasks',
          title: 'Own Household Tasks (Without Resentment)',
          excerpt:
            'Pick something and own it. Don\'t do it for credit. Don\'t do it to be thanked. Do it because it needs doing and you\'re a partner.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'support-her-goals',
          title: 'Support Her Goals (Actually)',
          excerpt:
            'Actually support her goals—personal and work stuff. Ask about progress, celebrate wins, help her when she needs it.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'plan-together',
          title: 'Plan Things Together (As a Team)',
          excerpt:
            'Learn how to plan vacations, projects, or decisions together in a way that feels collaborative, not like you\'re managing or being managed.',
          difficulty: 'Medium',
          time: 'Varies',
        },
        {
          slug: 'take-over-chore-completely',
          title: 'Take Over a Chore Completely (Without Being Asked)',
          excerpt:
            'Pick one of her regular chores and own it. Do it consistently, do it well, and do it without her having to think about it.',
          difficulty: 'Easy',
          time: 'Varies',
        },
        {
          slug: 'be-proactive-around-house',
          title: 'Be Proactive Around the House',
          excerpt:
            'Notice what needs to be done and do it. Don\'t wait to be told. Don\'t wait for her to do it. Just notice and do it.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'talk-about-finances',
          title: 'Have a Complete Financial Conversation',
          excerpt:
            'Learn how to have open, honest conversations about money. Financial transparency builds trust and prevents conflicts.',
          difficulty: 'Medium',
          time: '1-2 hours',
        },
        {
          slug: 'clean-together',
          title: 'Do a Deep Clean Together',
          excerpt:
            'Learn how to transform cleaning from a chore into quality time. Work as a team and make it fun.',
          difficulty: 'Easy',
          time: '2-4 hours',
        },
        {
          slug: 'pet-responsibility',
          title: 'Take Full Pet Responsibility',
          excerpt:
            'Learn how to take complete responsibility for pet care. Give her a real break and show you understand the mental load.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'breakfast-in-bed-for-mom',
          title: 'Make Mom Breakfast in Bed',
          excerpt:
            'You and the kids prepare breakfast together and serve it to Mom in bed. Let her relax and be served for once.',
          difficulty: 'Easy',
          time: '30-60 min',
        },
        {
          slug: 'poem-for-mom',
          title: 'Write and Read a Poem About Her',
          excerpt:
            'Write a poem (or have the kids help) about Mom and read it to her. Make it personal and heartfelt.',
          difficulty: 'Medium',
          time: '30-60 min',
        },
        {
          slug: 'give-mom-a-break',
          title: 'Take the Kids Out So Mom Gets a Break',
          excerpt:
            'Take the kids out for several hours so Mom can have uninterrupted time alone. Handle everything—no calls or texts unless emergency.',
          difficulty: 'Easy',
          time: '2-4 hours',
        },
      ],
    },
    'romance': {
      name: 'Romance',
      description: 'Dates, surprises, and making her feel special—without the cheesy stuff.',
      icon: '💕',
      guides: [
        {
          slug: 'plan-perfect-date-night',
          title: 'Plan the Perfect, No-Pressure Date Night',
          excerpt:
            'Skip the "what do you want to do?" conversation. Plan a date that actually works, doesn\'t stress her out, and shows you put thought into it.',
          difficulty: 'Easy',
          time: '30 min planning',
        },
        {
          slug: 'handle-surprise-right',
          title: 'Plan a Surprise That Doesn\'t Stress Her Out',
          excerpt:
            'Surprises can backfire if you don\'t think them through. Learn how to plan something that feels thoughtful, not overwhelming or inconvenient.',
          difficulty: 'Medium',
          time: '1-2 hours planning',
        },
        {
          slug: 'give-genuine-compliment',
          title: 'Give a Genuine Compliment That Actually Lands',
          excerpt:
            'Move beyond "you look nice." Learn how to give compliments that feel real, specific, and actually make her feel seen and appreciated.',
          difficulty: 'Easy',
          time: '30 seconds',
        },
        {
          slug: 'write-love-note',
          title: 'Write a Love Note That Doesn\'t Sound Cheesy',
          excerpt:
            'Skip the Hallmark card. Write something real that actually means something. Learn how to express yourself without it feeling forced or fake.',
          difficulty: 'Easy',
          time: '10 min',
        },
        {
          slug: 'plan-weekend-getaway',
          title: 'Plan a Weekend Getaway She\'ll Actually Enjoy',
          excerpt:
            'Not just any trip—one that she\'ll actually want to go on. Think through the details, match her energy, and make it about connection, not just a destination.',
          difficulty: 'Medium',
          time: '2-3 hours planning',
        },
        {
          slug: 'plan-surprise-date',
          title: 'Plan a Surprise Date (That She\'ll Actually Love)',
          excerpt:
            'Learn how to plan a surprise that feels thoughtful and exciting, not overwhelming or inconvenient.',
          difficulty: 'Medium',
          time: '1-2 hours planning',
        },
        {
          slug: 'give-physical-affection',
          title: 'Give Physical Affection (Without Expecting Sex)',
          excerpt:
            'Learn how to show physical affection that isn\'t about sex. Hugs, hand-holding, and cuddling rebuild physical connection.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
      ],
    },
    'gratitude': {
      name: 'Gratitude',
      description: 'Show appreciation in ways that actually matter.',
      icon: '🙏',
      guides: [
        {
          slug: 'express-gratitude-daily',
          title: 'Express Gratitude Daily (The Right Way)',
          excerpt:
            'Learn how to thank her for specific things in ways that feel genuine and meaningful, not like you\'re checking a box.',
          difficulty: 'Easy',
          time: '1 min',
        },
        {
          slug: 'gratitude-list',
          title: 'Create a Gratitude List About Her',
          excerpt:
            'Learn how to identify and express multiple things you\'re grateful for about her. Shift your focus to what\'s working in your relationship.',
          difficulty: 'Easy',
          time: '5 min',
        },
        {
          slug: 'thank-her-for-chores',
          title: 'Thank Her for Things She Does (Without Being Asked)',
          excerpt:
            'Acknowledge her efforts around the house and in your relationship. Learn how to recognize contributions in ways that make her feel seen.',
          difficulty: 'Easy',
          time: '30 seconds',
        },
        {
          slug: 'appreciate-her-effort',
          title: 'Acknowledge Her Effort (Not Just Results)',
          excerpt:
            'Learn how to appreciate the work she puts in, even when things don\'t turn out perfectly. Recognize effort, not just outcomes.',
          difficulty: 'Easy',
          time: '1 min',
        },
        {
          slug: 'send-gratitude-text',
          title: 'Send a Gratitude Text',
          excerpt:
            'Learn how to send a quick text expressing gratitude. A simple way to brighten her day and show you\'re thinking of her.',
          difficulty: 'Easy',
          time: '30 seconds',
        },
        {
          slug: 'morning-gratitude',
          title: 'Start the Day with Gratitude',
          excerpt:
            'Learn how to start the day by telling your partner one thing you appreciate about them. Sets a positive tone and creates connection.',
          difficulty: 'Easy',
          time: '30 seconds',
        },
      ],
    },
    'conflict': {
      name: 'Conflict Resolution',
      description: 'Handle disagreements in ways that strengthen, not weaken, your relationship.',
      icon: '⚖️',
      guides: [
        {
          slug: 'resolve-disagreement',
          title: 'Resolve a Disagreement (Without Winning)',
          excerpt:
            'Learn how to work through disagreements using "I" statements and active listening. Focus on understanding, not being right.',
          difficulty: 'Hard',
          time: '30-60 min',
        },
        {
          slug: 'take-responsibility',
          title: 'Take Responsibility (Without Blame)',
          excerpt:
            'Learn how to own your part in conflicts without defensiveness or making excuses. Show maturity and accountability.',
          difficulty: 'Medium',
          time: '10-15 min',
        },
        {
          slug: 'find-common-ground',
          title: 'Find Common Ground in Disagreements',
          excerpt:
            'Learn how to identify shared goals and work together toward solutions. Turn conflict into collaboration.',
          difficulty: 'Medium',
          time: '20-30 min',
        },
        {
          slug: 'stay-calm-during-conflict',
          title: 'Stay Calm During a Disagreement',
          excerpt:
            'Learn techniques to manage your emotions and stay respectful even when things get heated. Prevent escalation.',
          difficulty: 'Hard',
          time: 'Ongoing',
        },
        {
          slug: 'use-i-statements',
          title: 'Use "I" Statements in Conflicts',
          excerpt:
            'Learn how to express yourself in conflicts using "I" statements instead of "you" statements. Prevents defensiveness and opens dialogue.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
        {
          slug: 'make-amends',
          title: 'Make Amends After a Mistake',
          excerpt:
            'Learn how to not just apologize, but actually make amends. Take concrete steps to repair trust and show you\'re committed to doing better.',
          difficulty: 'Medium',
          time: 'Varies',
        },
      ],
    },
    'reconnection': {
      name: 'Reconnection',
      description: 'Move from roommates back to partners. Rebuild emotional connection.',
      icon: '🔗',
      guides: [
        {
          slug: 'have-20-minute-conversation',
          title: 'Have a 20-Minute Undistracted Conversation',
          excerpt:
            'Learn how to create space for meaningful connection. Set aside time with no phones or distractions to actually talk and listen.',
          difficulty: 'Easy',
          time: '20 min',
        },
        {
          slug: 'ask-about-inner-world',
          title: 'Ask About Her Inner World',
          excerpt:
            'Learn how to ask questions about her thoughts, feelings, dreams, and concerns. Show you care about who she is, not just what she does.',
          difficulty: 'Easy',
          time: '15-30 min',
        },
        {
          slug: 'state-of-union-conversation',
          title: 'Have a "State of the Union" Conversation',
          excerpt:
            'Learn how to have regular relationship check-ins. Discuss what\'s working, what isn\'t, and how you can both improve together.',
          difficulty: 'Medium',
          time: '30-60 min',
        },
        {
          slug: 'do-something-you-used-to-enjoy',
          title: 'Do Something You Used to Enjoy Together',
          excerpt:
            'Remember what you both loved doing together. Learn how to reconnect to the fun, playful couple you used to be.',
          difficulty: 'Easy',
          time: 'Varies',
        },
        {
          slug: 'plan-surprise-that-shows-you-know-her',
          title: 'Plan a Surprise That Shows You Know Her',
          excerpt:
            'Learn how to plan something specific that shows you pay attention to her interests, preferences, and needs. Demonstrate you see her as an individual.',
          difficulty: 'Medium',
          time: '1-2 hours',
        },
        {
          slug: 'sit-close-and-talk',
          title: 'Sit Close and Talk',
          excerpt:
            'Learn how physical proximity increases emotional connection. Sit side-by-side instead of across from each other and have a conversation.',
          difficulty: 'Easy',
          time: '15-30 min',
        },
        {
          slug: 'relationship-games',
          title: 'Play Relationship Games Together',
          excerpt:
            'Learn how relationship games can deepen connection and add playfulness. Try games designed to facilitate meaningful conversations.',
          difficulty: 'Easy',
          time: '30-60 min',
        },
        {
          slug: 'practice-turning-toward',
          title: 'Practice Turning Toward Her Bids for Connection',
          excerpt:
            'Learn to recognize when she\'s reaching out for connection and how to respond positively. Small moments build big emotional bonds.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
      ],
    },
    'quality-time': {
      name: 'Quality Time',
      description: 'Spend meaningful time together that actually connects you.',
      icon: '⏰',
      guides: [
        {
          slug: 'tech-free-quality-time',
          title: 'Have Tech-Free Quality Time',
          excerpt:
            'Learn how to spend 30 minutes together with phones put away. Remove distractions and rebuild the connection that got lost in busyness.',
          difficulty: 'Easy',
          time: '30 min',
        },
        {
          slug: 'weekly-date-night-conversation',
          title: 'Have a Weekly Date Night (Just Conversation)',
          excerpt:
            'Learn how to have a weekly "date night" that\'s just conversation—not an activity. Talk about your relationship, dreams, or catch up deeply.',
          difficulty: 'Easy',
          time: '1-2 hours',
        },
        {
          slug: 'create-daily-ritual',
          title: 'Create a Morning or Evening Ritual Together',
          excerpt:
            'Learn how to create small daily rituals—morning coffee, evening walk, or bedtime check-in. Consistency builds connection.',
          difficulty: 'Easy',
          time: '10-30 min daily',
        },
        {
          slug: 'create-morning-ritual',
          title: 'Create a Morning Ritual Together',
          excerpt:
            'Learn how to create a small daily ritual at the start of the day—morning coffee, walk, or check-in. Consistency builds connection.',
          difficulty: 'Easy',
          time: '10-30 min daily',
        },
        {
          slug: 'create-evening-ritual',
          title: 'Create an Evening Ritual Together',
          excerpt:
            'Learn how to create a small daily ritual at the end of the day—evening walk, bedtime check-in, or quiet time together.',
          difficulty: 'Easy',
          time: '10-30 min daily',
        },
        {
          slug: 'cook-together',
          title: 'Cook a Meal Together',
          excerpt:
            'Learn how to turn cooking into quality time. Work as a team in the kitchen and create something together.',
          difficulty: 'Easy',
          time: '1-2 hours',
        },
        {
          slug: 'cook-her-favorite-meal',
          title: 'Cook Her Favorite Meal',
          excerpt:
            'Learn how to make her favorite dish from scratch. Put thought and effort into making it special and showing you care.',
          difficulty: 'Medium',
          time: '2-3 hours',
        },
      ],
    },
    'outdoor': {
      name: 'Outdoor Activities',
      description: 'Get outside together. Nature, adventure, and shared experiences.',
      icon: '🌲',
      guides: [
        {
          slug: 'go-for-hike-together',
          title: 'Go for a Hike Together',
          excerpt:
            'Learn how to plan and execute a hike that disconnects you from daily stress and creates space for deep conversations and connection.',
          difficulty: 'Easy',
          time: '2-4 hours',
        },
        {
          slug: 'morning-walk-together',
          title: 'Start the Day with a Walk Together',
          excerpt:
            'Learn how to make morning walks a regular thing. Even 15 minutes around the neighborhood can set a positive tone and create connection.',
          difficulty: 'Easy',
          time: '15-30 min',
        },
        {
          slug: 'picnic-in-nature',
          title: 'Plan a Picnic in Nature',
          excerpt:
            'Learn how to pack a lunch and find a beautiful outdoor spot. Create an intimate, relaxed setting for quality conversation.',
          difficulty: 'Easy',
          time: '2-3 hours',
        },
        {
          slug: 'stargazing-date',
          title: 'Plan a Stargazing Date',
          excerpt:
            'Learn how to find a spot away from city lights and spend time stargazing together. Create quiet, meaningful moments of connection.',
          difficulty: 'Easy',
          time: '1-2 hours',
        },
        {
          slug: 'bike-ride-together',
          title: 'Go for a Bike Ride Together',
          excerpt:
            'Learn how to plan and execute a bike ride together. Explore local trails, get exercise, and create quality time in nature.',
          difficulty: 'Easy',
          time: '1-2 hours',
        },
        {
          slug: 'evening-stroll-together',
          title: 'Take an Evening Stroll Together',
          excerpt:
            'Learn how to make evening walks a regular thing. Use this time to connect, process the day, and unwind together.',
          difficulty: 'Easy',
          time: '20-30 min',
        },
      ],
    },
    'active': {
      name: 'Active Together',
      description: 'Get moving together. Exercise, fitness, and shared physical activity.',
      icon: '💪',
      guides: [
        {
          slug: 'run-together',
          title: 'Go for a Run Together',
          excerpt:
            'Learn how to run together even if you run at different paces. Create accountability, shared goals, and quality time.',
          difficulty: 'Medium',
          time: '30-60 min',
        },
        {
          slug: 'yoga-in-nature',
          title: 'Do Yoga Together Outdoors',
          excerpt:
            'Learn how to practice yoga together in your backyard, a park, or beach. Create calm, presence, and physical closeness.',
          difficulty: 'Easy',
          time: '30-60 min',
        },
        {
          slug: 'outdoor-workout',
          title: 'Do an Outdoor Workout Together',
          excerpt:
            'Learn how to do an outdoor workout together—running, calisthenics, or yoga in the park. Combine health, nature, and connection.',
          difficulty: 'Medium',
          time: '30-60 min',
        },
        {
          slug: 'swim-together',
          title: 'Go Swimming Together',
          excerpt:
            'Learn how to make swimming a fun activity you do together. Pool, lake, or beach—water activities are naturally playful and bonding.',
          difficulty: 'Easy',
          time: '1-2 hours',
        },
        {
          slug: 'disc-golf-together',
          title: 'Play Disc Golf Together',
          excerpt:
            'Learn how to make disc golf a fun activity you do together. Casual, fun, and gets you moving outside while having a good time.',
          difficulty: 'Easy',
          time: '1-2 hours',
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
              📚 How To Guides
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Practical guides organized by relationship priorities. Learn how to communicate better, build intimacy, show up as a partner, and strengthen your connection.
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(guidesByCategory).map(([categoryKey, category]) => (
              <section key={categoryKey} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-50">{category.name}</h2>
                    <p className="text-sm text-slate-400">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {(() => {
                    // Sort guides by visit count (most visited first) and take top 2
                    const sortedGuides = [...category.guides].sort((a, b) => {
                      const aVisits = visitCounts.get(a.slug) || 0;
                      const bVisits = visitCounts.get(b.slug) || 0;
                      return bVisits - aVisits; // Descending order
                    });
                    const topGuides = sortedGuides.slice(0, 2);

                    return topGuides.map((guide) => (
                      <Link
                        key={guide.slug}
                        href={`/dashboard/how-to-guides/${guide.slug}`}
                        className="block"
                      >
                        <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-primary-500/50 hover:bg-slate-900 transition-all cursor-pointer h-full">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-slate-500">
                                  {guide.difficulty} • {guide.time}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-50 mb-2">
                                {guide.title}
                              </h3>
                            </div>
                            <svg
                              className="w-4 h-4 text-slate-500 flex-shrink-0 ml-3 mt-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">{guide.excerpt}</p>
                        </article>
                      </Link>
                    ));
                  })()}
                </div>
                {category.guides.length > 2 && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/dashboard/how-to-guides?category=${categoryKey}`}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 rounded-lg hover:bg-primary-500/20 transition-colors text-sm font-medium"
                    >
                      See All {category.name} Guides
                      <span className="text-xs text-slate-400">
                        ({category.guides.length - 2} more)
                      </span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm">
              More guides coming soon. Share your own wins in Team Wins.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

