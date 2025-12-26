import { NextRequest, NextResponse } from "next/server";

// Force this route to be dynamic so it doesn't cache incorrectly
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // 1. Get configuration
  const API_URL = process.env.API_BASE_URL || "http://localhost:8000/api/v1";
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Server Error: API_KEY is missing in .env.local" },
      { status: 500 }
    );
  }

  // 2. Reconstruct the backend URL
  // Example: /api/proxy/metrics/overview -> http://localhost:8000/api/v1/metrics/overview
  const pathStr = params.path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const destinationUrl = `${API_URL}/${pathStr}${searchParams ? `?${searchParams}` : ""}`;

  try {
    // 3. Forward request to Python Backend with the Key
    const res = await fetch(destinationUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY, // The key is injected here, server-side
      },
    });

    // 4. Return the backend response
    if (!res.ok) {
      // If backend errors (e.g. 404, 500), forward that status
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Proxy connection failed:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend service" },
      { status: 502 }
    );
  }
}
