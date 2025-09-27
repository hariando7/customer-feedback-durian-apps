import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const scriptUrl = "https://script.google.com/macros/s/AKfycbwFSmwI5I8HK2vyg-qqiWrCJSH-Bd_z7Gj8jO9F21cmSK2-sEmn9Puf7TvBS3a-W3a9/exec";

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

