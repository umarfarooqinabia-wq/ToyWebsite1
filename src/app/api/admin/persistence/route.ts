import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import {
  PERSISTED_DATA_FILES,
  usesDurableBlobStore,
  verifyDurablePersistence,
} from "@/lib/admin/json-store";

/** Admin-only: confirm lifetime Blob persistence is configured and writable. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const check = await verifyDurablePersistence();
  return NextResponse.json({
    ...check,
    files: PERSISTED_DATA_FILES,
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    onVercel: process.env.VERCEL === "1",
    durableMode: usesDurableBlobStore() ? "blob" : "local",
  });
}
