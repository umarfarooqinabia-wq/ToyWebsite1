"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Address,
  CartLine,
  Money,
  Order,
  OrderStatus,
  PaymentMethod,
} from "@/types/commerce";
import { isPrepaidTransferMethod } from "@/lib/bank-details";

interface PlaceOrderInput {
  orderId: string;
  lines: CartLine[];
  subtotal: Money;
  shipping: Money;
  total: Money;
  paymentMethod: PaymentMethod;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

interface OrdersState {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  getOrder: (id: string) => Order | undefined;
  allOrders: () => Order[];
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    extra?: Partial<Pick<Order, "trackingNumber">>,
  ) => Order | undefined;
  patchOrder: (id: string, patch: Partial<Order>) => Order | undefined;
}

function toAddress(customer: PlaceOrderInput["customer"]): Address {
  return {
    id: `addr-${Date.now()}`,
    fullName: customer.fullName,
    phone: customer.phone,
    address1: customer.address,
    city: customer.city,
    province: customer.province,
    postalCode: customer.postalCode,
    country: "Pakistan",
  };
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      placeOrder: (input) => {
        const now = new Date().toISOString();
        const order: Order = {
          id: input.orderId,
          number: input.orderId,
          status: "placed",
          createdAt: now,
          updatedAt: now,
          items: input.lines.map((l) => ({
            title: l.title,
            quantity: l.quantity,
            price: l.price,
            image: l.image,
            productId: l.productId,
          })),
          subtotal: input.subtotal,
          shipping: input.shipping,
          total: input.total,
          paymentMethod: input.paymentMethod,
          paymentStatus: isPrepaidTransferMethod(input.paymentMethod)
            ? "unpaid"
            : undefined,
          shippingAddress: toAddress(input.customer),
          trackingNumber: `PTPK-TRK-${String(input.orderId).padStart(6, "0").slice(-6)}`,
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },
      getOrder: (id) => {
        return get().orders.find((o) => o.id === id || o.number === id);
      },
      allOrders: () => {
        return [...get().orders].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },
      updateOrderStatus: (id, status, extra) => {
        const existing = get().orders.find((o) => o.id === id || o.number === id);
        if (!existing) return undefined;
        const updated: Order = {
          ...existing,
          ...extra,
          status,
          updatedAt: new Date().toISOString(),
        };
        set({
          orders: get().orders.map((o) => (o.id === existing.id ? updated : o)),
        });
        return updated;
      },
      patchOrder: (id, patch) => {
        const existing = get().orders.find((o) => o.id === id || o.number === id);
        if (!existing) return undefined;
        const updated: Order = {
          ...existing,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        set({
          orders: get().orders.map((o) => (o.id === existing.id ? updated : o)),
        });
        return updated;
      },
    }),
    { name: "toycompany-orders" },
  ),
);
