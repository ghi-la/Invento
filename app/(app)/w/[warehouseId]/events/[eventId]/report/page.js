import { getEventDetail } from "@/lib/data/events";
import EventReportClient from "./EventReportClient";

export default async function EventReportPage({ params }) {
  const initialEvent = await getEventDetail(params.warehouseId, params.eventId);
  return <EventReportClient initialEvent={initialEvent} />;
}
