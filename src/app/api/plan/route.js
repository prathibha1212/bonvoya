import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const {
      destination,
      days,
      budget,
      travelers,
      purpose,
      interests,
    } = await request.json();

    if (!destination || !days) {
      return NextResponse.json(
        { error: "Please enter a destination and trip duration." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is missing. Check your Vercel environment variables." },
        { status: 500 }
      );
    }

    const prompt = `
Create a practical travel itinerary in JSON format.

Destination: ${destination}
Duration: ${days} days
Budget: ${budget || "Not specified"}
Travelers: ${travelers || "Not specified"}
Trip purpose: ${purpose || "Leisure"}
Interests: ${interests || "General sightseeing"}

Return only valid JSON in this exact structure:
{
  "title": "A catchy trip title",
  "introduction": "A short introduction to the trip",
  "days": [
    {
      "day": 1,
      "title": "Theme for the day",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "details": "Useful details about the activity"
        }
      ]
    }
  ],
  "tips": ["Travel tip 1", "Travel tip 2"]
}

Include realistic activities, logical travel order, local food,
and useful practical tips. Return exactly ${days} days.
Do not invent precise opening hours or prices.
`;

    const model = process.env.OPENROUTER_MODEL || "openrouter/free";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://bonvoya.vercel.app",
          "X-Title": "Bonvoya",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are Bonvoya's travel itinerary planner. Return only valid JSON, without markdown fences or explanatory text. Follow the exact JSON structure requested by the user.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status, data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "The AI could not generate your itinerary. Please try again.",
        },
        { status: 502 }
      );
    }

    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText || typeof generatedText !== "string") {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    // Handle responses that contain JSON inside markdown fences.
    const cleanedText = generatedText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    let itinerary;

    try {
      itinerary = JSON.parse(cleanedText);
    } catch {
      console.error("Invalid itinerary JSON:", generatedText);

      return NextResponse.json(
        { error: "The AI returned an invalid itinerary. Please try again." },
        { status: 502 }
      );
    }

    if (
      !itinerary.title ||
      !itinerary.introduction ||
      !Array.isArray(itinerary.days) ||
      !Array.isArray(itinerary.tips) ||
      itinerary.days.length !== Number(days)
    ) {
      return NextResponse.json(
        { error: "The AI returned an incomplete itinerary. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Itinerary generation error:", error);

    return NextResponse.json(
      {
        error:
          error?.name === "TimeoutError"
            ? "Itinerary generation took too long. Please try again."
            : "Something went wrong while creating your itinerary.",
      },
      { status: 500 }
    );
  }
}