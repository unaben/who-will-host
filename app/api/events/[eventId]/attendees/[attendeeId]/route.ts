import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/http";
import { updateRsvp } from "@/lib/eventsService";

type Context = { params: Promise<{ eventId: string; attendeeId: string }> };

// PATCH /api/events/:eventId/attendees/:attendeeId   body: { "rsvp": "accepted" }
export async function PATCH(request: Request, { params }: Context) {
  return handle(async () => {
    const { eventId, attendeeId } = await params;
    const { rsvp } = await readJson<{ rsvp?: unknown }>(request);
    return NextResponse.json(await updateRsvp(eventId, attendeeId, rsvp));
  });
}
