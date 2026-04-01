import { ok } from "@/lib/api";
import { getRuntimeStatus } from "@/lib/server/runtime-status";

export async function GET() {
  const status = await getRuntimeStatus();

  return ok({
    status: "ok",
    ...status,
  });
}

