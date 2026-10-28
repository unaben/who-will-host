import { NextResponse } from 'next/server';
import { handle, readJson } from '@/lib/http';
import { createGroup, listGroups } from '@/lib/eventsService';
import type { CreateGroupInput } from '@/features/events/events.types';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(async () => NextResponse.json(await listGroups()));
}

export function POST(request: Request) {
  return handle(async () => {
    const body = await readJson<CreateGroupInput>(request);
    return NextResponse.json(await createGroup(body), { status: 201 });
  });
}
