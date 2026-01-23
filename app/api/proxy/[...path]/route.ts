import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

// Helper to handle all methods (GET, POST, DELETE, PUT, PATCH)
async function handleProxy(req: NextRequest, { params }: { params: { path: string[] } }, method: string) {
  const supabase = createClient();

  // 1. Get the Current User's Session (JWT)
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 });
  }

  // 2. Construct Backend URL
  const API_URL = process.env.API_BASE_URL || "http://localhost:8000/api/v1";
  const pathStr = params.path.join("/");
  const searchParams = req.nextUrl.searchParams.toString();
  const destinationUrl = `${API_URL}/${pathStr}${searchParams ? `?${searchParams}` : ""}`;

  try {
    // 3. Forward request with Bearer Token (Supabase JWT)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`, // Inject Supabase JWT
    };

    const body = method !== "GET" && method !== "DELETE" ? await req.text() : undefined;

    const res = await fetch(destinationUrl, {
      method,
      headers,
      body,
    });

    // 4. Handle Response
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend error:', {
        status: res.status,
        path: destinationUrl,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: errorText || 'Backend request failed',
          status: res.status,
          path: pathStr 
        }, 
        { status: res.status }
      );
    }

    // Handle 204 No Content responses (e.g., DELETE operations)
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

// Export route handlers for all HTTP methods
export async function GET(req: NextRequest, ctx: any) { 
  return handleProxy(req, ctx, "GET"); 
}

export async function POST(req: NextRequest, ctx: any) { 
  return handleProxy(req, ctx, "POST"); 
}

export async function DELETE(req: NextRequest, ctx: any) { 
  return handleProxy(req, ctx, "DELETE"); 
}

export async function PUT(req: NextRequest, ctx: any) { 
  return handleProxy(req, ctx, "PUT"); 
}

export async function PATCH(req: NextRequest, ctx: any) { 
  return handleProxy(req, ctx, "PATCH"); 
}
