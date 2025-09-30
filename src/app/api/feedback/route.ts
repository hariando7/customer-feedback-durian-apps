import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzsXcj_e-aNPN8JiuPLZ7HVGNMU0hPc8X-Zi0AIbEAc78omZN1T3F4XAMsBgZln8ugd/exec";

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("Raw Apps Script Response:", text);

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: 200 });
    } catch {
      // Jika bukan JSON
      return NextResponse.json({ success: false, message: "Invalid JSON from Apps Script", raw: text }, { status: 502 });
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

