import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/http";
import { deleteGroup, updateGroup } from "@/lib/eventsService";
import type { CreateGroupInput } from "@/features/events/events.types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ groupId: string }> };

export function PUT(request: Request, { params }: Context) {
  return handle(async () => {
    const { groupId } = await params;
    const body = await readJson<CreateGroupInput>(request);
    return NextResponse.json(await updateGroup(groupId, body));
  });
}

// Also deletes every event in the group.
export function DELETE(_request: Request, { params }: Context) {
  return handle(async () => {
    const { groupId } = await params;
    return NextResponse.json(await deleteGroup(groupId));
  });
}
