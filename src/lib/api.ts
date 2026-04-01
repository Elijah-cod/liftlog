import { NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/types";

export function ok<T>(data: T) {
  return NextResponse.json<ApiResponse<T>>({
    data,
    error: null,
  });
}

export function fail(message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>(
    {
      data: null,
      error: message,
    },
    { status },
  );
}

