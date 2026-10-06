import prisma from "../../utils/db.js";

export const getDailyRevenue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "Completed",
        payment_date: { gte: startOfDay },
      },
    });

    res.json({ total: revenue._sum.amount || 0 });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getWeeklyRevenue = async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "Completed",
        payment_date: { gte: startOfWeek },
      },
    });

    res.json({ total: revenue._sum.amount || 0 });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "Completed",
        payment_date: { gte: startOfMonth },
      },
    });

    res.json({ total: revenue._sum.amount || 0 });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTopSelling = async (req, res) => {
  try {
    const topSell = await prisma.orderItem.groupBy({
      by: ["menu_item_id"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const withNames = await Promise.all(
      topSell.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { menu_item_id: item.menu_item_id },
          select: { item_name: true },
        });
        return {
          item_name: menuItem.item_name,
          total_quantity: item._sum.quantity,
        };
      }),
    );

    res.json(withNames);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const peakHour = async (req, res) => {
  try {
    const peakHours = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM order_date) as hour, 
        CAST(COUNT(*) AS INT) as total_orders
      FROM orders
      GROUP BY EXTRACT(HOUR FROM order_date)
      ORDER BY hour ASC
    `;
    res.json(peakHours);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
