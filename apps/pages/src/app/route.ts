import { NextResponse } from "next/server";

function handler() {
  return NextResponse.redirect('https://app.wallette.id');
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
