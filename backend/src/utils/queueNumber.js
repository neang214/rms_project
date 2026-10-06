import prisma from "./db.js";

export async function getQueueNumber(order) {
  const dateStr = new Date(order.order_date).toISOString().split("T")[0];
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);

  const countBefore = await prisma.order.count({
    where: {
      order_date: { gte: dayStart, lt: order.order_date },
    },
  });

  return countBefore + 1;
}

export async function attachQueueNumbers(orders) {
  const map = new Map();
  for (const order of orders) {
    if (map.has(order.order_id)) continue;
    map.set(order.order_id, await getQueueNumber(order));
  }
  return map;
}
