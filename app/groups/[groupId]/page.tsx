import { EventsScreen } from "@/features/events/events";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <EventsScreen groupId={groupId} />;
}
