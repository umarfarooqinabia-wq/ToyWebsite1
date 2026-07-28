import type { Order, UserProfile } from "@/types/commerce";

export const DEMO_USER: UserProfile = {
  id: "user-1",
  fullName: "Alex Gamer",
  email: "alex@toycompany.store",
  phone: "+92 300 1234567",
  addresses: [
    {
      id: "addr-1",
      fullName: "Alex Gamer",
      phone: "+92 300 1234567",
      address1: "12 Gaming Street, Block A",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
      country: "Pakistan",
      isDefault: true,
    },
    {
      id: "addr-2",
      fullName: "Alex Gamer",
      phone: "+92 300 1234567",
      address1: "45 Tech Avenue",
      city: "Karachi",
      province: "Sindh",
      postalCode: "75500",
      country: "Pakistan",
    },
  ],
  orders: [
    {
      id: "PTPK-DEMO001",
      number: "PTPK-DEMO001",
      status: "shipped",
      createdAt: "2026-07-18T10:00:00Z",
      updatedAt: "2026-07-20T14:00:00Z",
      items: [
        {
          title: "DualSense Wireless Controller Midnight Black",
          quantity: 1,
          price: { amount: 21999, currencyCode: "PKR" },
          image:
            "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=200&q=80",
        },
      ],
      subtotal: { amount: 21999, currencyCode: "PKR" },
      shipping: { amount: 299, currencyCode: "PKR" },
      total: { amount: 22298, currencyCode: "PKR" },
      paymentMethod: "jazzcash",
      shippingAddress: {
        id: "addr-1",
        fullName: "Alex Gamer",
        phone: "+92 300 1234567",
        address1: "12 Gaming Street, Block A",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
        country: "Pakistan",
      },
      trackingNumber: "TCS-99887766",
    },
    {
      id: "PTPK-DEMO002",
      number: "PTPK-DEMO002",
      status: "delivered",
      createdAt: "2026-06-10T10:00:00Z",
      updatedAt: "2026-06-14T18:00:00Z",
      items: [
        {
          title: "ASTRO BOT — PS5 Physical Edition",
          quantity: 1,
          price: { amount: 12999, currencyCode: "PKR" },
          image:
            "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=200&q=80",
        },
      ],
      subtotal: { amount: 12999, currencyCode: "PKR" },
      shipping: { amount: 0, currencyCode: "PKR" },
      total: { amount: 12999, currencyCode: "PKR" },
      paymentMethod: "cod",
      shippingAddress: {
        id: "addr-1",
        fullName: "Alex Gamer",
        phone: "+92 300 1234567",
        address1: "12 Gaming Street, Block A",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
        country: "Pakistan",
      },
    },
  ],
};

export function getDemoOrder(id: string): Order | undefined {
  return DEMO_USER.orders.find((o) => o.id === id || o.number === id);
}
