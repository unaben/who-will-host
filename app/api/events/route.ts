import { NextResponse } from 'next/server';
import { ApiError, handle, readJson } from '@/lib/http';
import { createEvent, listEvents } from '@/lib/eventsService';
import type { CreateEventInput } from '@/features/events/events.types';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handle(async () => {
    const groupId = new URL(request.url).searchParams.get('groupId');
    if (!groupId) throw new ApiError(400, 'groupId is required.');
    return NextResponse.json(await listEvents(groupId));
  });
}

export function POST(request: Request) {
  return handle(async () => {
    const body = await readJson<CreateEventInput>(request);
    return NextResponse.json(await createEvent(body), { status: 201 });
  });
}
