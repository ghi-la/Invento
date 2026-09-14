import { listEvents } from "@/lib/data/events";
import EventsClient from "./EventsClient";

export default async function EventsPage({ params }) {
  const initialEvents = await listEvents(params.warehouseId, {});
  return <EventsClient initialEvents={initialEvents} />;
}
