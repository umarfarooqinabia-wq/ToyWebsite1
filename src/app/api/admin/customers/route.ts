import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { listAdminOrders } from "@/lib/admin/orders-db";
import { listSellRequests } from "@/lib/admin/sell-requests-db";
import { listUsers } from "@/lib/auth/users-db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, orders, sellRequests] = await Promise.all([
    listUsers(),
    listAdminOrders(),
    listSellRequests(),
  ]);

  const customers = users.map((user) => {
    const email = user.email.toLowerCase();
    const userOrders = orders.filter(
      (o) => (o.customerEmail ?? "").toLowerCase() === email,
    );
    const userSell = sellRequests.filter(
      (r) => r.sellerEmail.toLowerCase() === email,
    );
    const spent = userOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total.amount, 0);

    return {
      ...user,
      orderCount: userOrders.length,
      sellRequestCount: userSell.length,
      totalSpent: spent,
      recentOrders: userOrders.slice(0, 5).map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt,
        paymentMethod: o.paymentMethod,
      })),
      recentSellRequests: userSell.slice(0, 5).map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        askingPrice: r.askingPrice,
        createdAt: r.createdAt,
      })),
    };
  });

  return NextResponse.json({
    customers,
    totals: {
      users: users.length,
      orders: orders.length,
      sellRequests: sellRequests.length,
    },
  });
}
