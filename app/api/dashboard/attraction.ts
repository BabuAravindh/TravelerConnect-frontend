import { NextResponse } from "next/server";
export async function GET(req: { url: string | URL; }) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "India";

  try {
    const response = await fetch(
      `https://tripadvisor16.p.rapidapi.com/api/v1/attractions/searchLocation?query=${query}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
          "X-RapidAPI-Host": "tripadvisor16.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch attractions");

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch attractions" }, { status: 500 });
  }
}

