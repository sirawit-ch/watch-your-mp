import { NextRequest, NextResponse } from "next/server";

const POLITIGRAPH_API = "https://politigraph.wevis.info/graphql";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(POLITIGRAPH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    if (!text) {
      return NextResponse.json({ data: null });
    }

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
