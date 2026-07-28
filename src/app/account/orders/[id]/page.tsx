import type { Metadata } from "next";
import { OrderDetailClient } from "./order-detail-client";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}`, robots: { index: false } };
}

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
