import { getEventDetail, listEventReturns } from "@/lib/data/events";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({ params }) {
  const [initialEvent, initialReturns] = await Promise.all([
    getEventDetail(params.warehouseId, params.eventId),
    listEventReturns(params.warehouseId, params.eventId, { limit: 10 }),
  ]);

  return <EventDetailClient initialEvent={initialEvent} initialReturns={initialReturns} />;
}
