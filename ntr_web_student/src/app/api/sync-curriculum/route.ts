import { NextResponse } from "next/server";

let subjectsCache: any[] = [];

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3010",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      subjects: subjectsCache,
    },
    {
      headers: corsHeaders,
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    subjectsCache = Array.isArray(body.subjects)
      ? body.subjects
      : [];

    return NextResponse.json(
      {
        success: true,
        subjects: subjectsCache,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Curriculum sync error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync curriculum",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
