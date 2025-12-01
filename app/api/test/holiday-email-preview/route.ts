import { NextResponse } from 'next/server';
import { generateEmailHTML } from '@/lib/email';

/**
 * Preview holiday email for Canada Day 2026
 * Usage: /api/test/holiday-email-preview
 */
export async function GET(request: Request) {
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://www.besthusbandever.com';

  // Sample Canada Day holiday actions (action-packed, showing initiative) - 3 unique options
  const canadaDayActions = [
    {
      id: 'action-1',
      name: 'Plan a Canada Day BBQ and Fireworks Viewing',
      description: 'Take the lead in planning a Canada Day celebration. Organize a BBQ, invite friends or family, find the best fireworks viewing spot, and create a memorable day. Show initiative by handling all the details.',
      benefit: 'Taking charge of holiday planning shows leadership and thoughtfulness. Your initiative makes the celebration special and memorable.',
      category: 'Quality Time'
    },
    {
      id: 'action-2',
      name: 'Organize a Canada Day Day Trip',
      description: 'Research and plan a day trip for Canada Day. Find a destination, plan the route, pack a picnic, and create an adventure. Take full responsibility for making it happen.',
      benefit: 'Planning a day trip shows you\'re proactive and willing to create experiences. Your initiative makes holidays special.',
      category: 'Quality Time'
    },
    {
      id: 'action-3',
      name: 'Host a Canada Day Gathering',
      description: 'Take initiative to host a Canada Day gathering. Plan the menu, invite guests, decorate, and create a festive atmosphere. Show leadership by organizing everything.',
      benefit: 'Hosting shows you\'re willing to take on responsibility and create joy for others. Your initiative strengthens relationships.',
      category: 'Partnership'
    }
  ];

  // 2 regular planning actions (non-holiday) to fill out the 5 total
  const regularPlanningActions = [
    {
      id: 'action-4',
      name: 'Plan a Weekend Getaway',
      description: 'Research destinations, book accommodations, and plan activities for a weekend trip. Create an itinerary that makes the getaway special.',
      benefit: 'A weekend getaway creates lasting memories and shows you\'re willing to invest time and effort in your relationship.',
      category: 'Romance'
    },
    {
      id: 'action-5',
      name: 'Organize a Surprise Date Night',
      description: 'Plan a complete surprise date night. Choose the venue, make reservations, plan the activities, and handle all the details without her knowing.',
      benefit: 'Surprises show thoughtfulness and effort. Planning everything demonstrates you care enough to create something special.',
      category: 'Romance'
    }
  ];

  // Sample daily action (weekly_routine)
  const dailyAction = {
    id: 'daily-action-1',
    name: 'Express Gratitude',
    description: 'Take a moment each day to thank your partner for something specific they did. Gratitude strengthens bonds and creates a positive atmosphere.',
    benefit: 'Gratitude strengthens bonds and creates a positive atmosphere.',
    category: 'Gratitude'
  };

  // Sample quote
  const quote = {
    quote_text: 'The best thing to hold onto in life is each other.',
    author: 'Audrey Hepburn'
  };

  // Generate email HTML (Monday = dayOfWeek 1)
  const emailTip = {
    title: dailyAction.name,
    content: `${dailyAction.description}\n\nWhy this matters: ${dailyAction.benefit}`,
    category: dailyAction.category,
    quote: quote,
    actionId: dailyAction.id,
    userId: 'preview-user',
    dayOfWeek: 1, // Monday
    weeklyPlanningActions: [...canadaDayActions, ...regularPlanningActions].map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      benefit: a.benefit,
      category: a.category,
    })),
    allActionsLastWeek: [],
  };

  const emailHTML = generateEmailHTML(emailTip, baseUrl);

  // Return HTML for preview
  return new NextResponse(emailHTML, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

