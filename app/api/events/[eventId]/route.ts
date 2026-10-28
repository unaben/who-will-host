import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/http";
import { deleteEvent, updateEvent } from "@/lib/eventsService";
import type { CreateEventInput } from "@/features/events/events.types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ eventId: string }> };

// PUT replaces the event's details, hosts and attendees with the body.
export function PUT(request: Request, { params }: Context) {
  return handle(async () => {
    const { eventId } = await params;
    const body = await readJson<CreateEventInput>(request);
    return NextResponse.json(await updateEvent(eventId, body));
  });
}

export function DELETE(_request: Request, { params }: Context) {
  return handle(async () => {
    const { eventId } = await params;
    return NextResponse.json(await deleteEvent(eventId));
  });
}
