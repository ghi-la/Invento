import { dbConnect } from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import EventItem from "@/lib/models/EventItem";
import EventReturn from "@/lib/models/EventReturn";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const EMPTY_AGGREGATE = { itemCount: 0, outstandingCount: 0, outstandingValue: 0, totalCost: 0 };

// Shared by listEvents and listUpcomingEvents: attaches per-event item counts
// and cost aggregates to a set of already-fetched Event docs in one query.
async function withItemAggregates(events) {
  if (events.length === 0) return [];

  const ids = events.map((e) => e._id);
  const counts = await EventItem.aggregate([
    { $match: { event: { $in: ids } } },
    {
      $group: {
        _id: "$event",
        itemCount: { $sum: 1 },
        outstandingCount: {
          $sum: { $cond: [{ $gt: [{ $subtract: ["$quantityTaken", "$quantityReturned"] }, 0] }, 1, 0] },
        },
        outstandingValue: {
          $sum: {
            $multiply: ["$unitCost", { $max: [{ $subtract: ["$quantityTaken", "$quantityReturned"] }, 0] }],
          },
        },
        totalCost: { $sum: { $multiply: ["$unitCost", "$quantityTaken"] } },
      },
    },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));

  return events.map((e) => {
    const c = countMap[e._id.toString()] || EMPTY_AGGREGATE;
    return {
      id: e._id.toString(),
      name: e.name,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      itemCount: c.itemCount,
      outstandingCount: c.outstandingCount,
      outstandingValue: c.outstandingValue,
      totalCost: c.totalCost,
    };
  });
}

export async function listEvents(warehouseId, { q, status } = {}) {
  await dbConnect();
  const filter = { warehouse: warehouseId };
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { location: rx }];
  }
  if (status) filter.status = status;

  const events = await Event.find(filter).sort({ startDate: -1 }).lean();
  return withItemAggregates(events);
}

// Events not yet completed (planning or active), soonest first — backs the
// "upcoming events" dashboard widget and, with no limit, its cost-summary sibling.
export async function listUpcomingEvents(warehouseId, { limit } = {}) {
  await dbConnect();
  let query = Event.find({ warehouse: warehouseId, status: { $in: ["planning", "active"] } }).sort({
    startDate: 1,
  });
  if (limit) query = query.limit(limit);

  const events = await query.lean();
  return withItemAggregates(events);
}

// Shared by the event detail page and the report page: both render the same
// items + cost totals, just laid out differently, so one DTO backs both.
export async function getEventDetail(warehouseId, eventId, myRole = null) {
  await dbConnect();
  const event = await Event.findOne({ _id: eventId, warehouse: warehouseId }).lean();
  if (!event) return null;

  const items = await EventItem.find({ event: eventId })
    .populate("product", "name unit quantity")
    .populate("supplier", "name")
    .sort({ createdAt: 1 })
    .lean();

  const shapedItems = items.map((item) => {
    const outstanding = Math.max(0, item.quantityTaken - item.quantityReturned);
    const lineCost = item.unitCost * item.quantityTaken;
    return {
      id: item._id.toString(),
      source: item.source,
      name: item.nameSnapshot,
      product: item.product
        ? {
            id: item.product._id.toString(),
            name: item.product.name,
            unit: item.product.unit,
            quantityOnHand: item.product.quantity,
          }
        : null,
      supplier: item.supplier ? { id: item.supplier._id.toString(), name: item.supplier.name } : null,
      quantityTaken: item.quantityTaken,
      quantityReturned: item.quantityReturned,
      outstanding,
      unitCost: item.unitCost,
      lineCost,
      shortageQuantity: item.shortageQuantity,
      reconciledAt: item.reconciledAt,
      notes: item.notes,
    };
  });

  const totals = shapedItems.reduce(
    (acc, item) => {
      if (item.source === "warehouse") acc.warehouseItemsCost += item.lineCost;
      else acc.supplierItemsCost += item.lineCost;
      acc.totalCost += item.lineCost;
      acc.outstandingValue += item.unitCost * item.outstanding;
      acc.shortageValue += item.unitCost * item.shortageQuantity;
      return acc;
    },
    { warehouseItemsCost: 0, supplierItemsCost: 0, totalCost: 0, outstandingValue: 0, shortageValue: 0 }
  );

  return {
    id: event._id.toString(),
    name: event.name,
    description: event.description,
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate,
    status: event.status,
    closedAt: event.closedAt,
    items: shapedItems,
    totals,
    myRole,
  };
}

export async function listEventReturns(warehouseId, eventId, { limit = 15 } = {}) {
  await dbConnect();
  const returns = await EventReturn.find({ warehouse: warehouseId, event: eventId })
    .sort({ createdAt: -1 })
    .limit(Math.min(50, limit))
    .populate("user", "name image")
    .populate("eventItem", "nameSnapshot")
    .lean();

  return returns.map((r) => ({
    id: r._id.toString(),
    eventItemId: r.eventItem?._id?.toString() || null,
    itemName: r.eventItem?.nameSnapshot || "",
    quantity: r.quantity,
    note: r.note,
    userName: r.user?.name || "Someone",
    userImage: r.user?.image || null,
    createdAt: r.createdAt,
  }));
}
