import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export async function getAuth0User(req?: NextRequest) {
  const session = await getSession(req);
  return session?.user;
}

export async function getAuth0UserId(req?: NextRequest): Promise<string | null> {
  const user = await getAuth0User(req);
  return user?.sub || null;
}


