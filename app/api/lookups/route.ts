import { NextResponse } from 'next/server';
import { handle } from '@/lib/http';
import { getLookups } from '@/lib/eventsService';

export const dynamic = 'force-dynamic';

// Saved contacts and existing hosts: what the event form picks from.
export function GET() {
  return handle(async () => NextResponse.json(await getLookups()));
}
