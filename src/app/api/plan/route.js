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

    const numberOfDays = Number(days);

    if (
      !destination ||
      !Number.isInteger(numberOfDays) ||
      numberOfDays < 1 ||
      numberOfDays > 14
    ) {
      return NextResponse.json(
        { error: "Please enter a destination and a trip duration between 1 and 14 days." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model =
      process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is missing. Check your environment variables." },
        { status: 500 }
      );
    }

    const prompt = `
Create a practical travel itinerary in JSON format.

Destination: ${destination}
Duration: ${numberOfDays} days
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

Requirements:
- Return exactly ${numberOfDays} days, numbered from 1 to ${numberOfDays}.
- Include several useful activities per day.
- Organize activities in a logical travel order.
- Include local food and practical travel tips.
- Respect the stated budget, traveler count, purpose, and interests.
- Do not invent precise opening hours or prices.
- Return JSON only, without Markdown fences.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are Bonvoya's travel itinerary planner. Return only valid JSON matching the exact requested schema. Do not include Markdown fences or explanatory text outside the JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(45000),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "Groq itinerary API error:",
        response.status,
        data?.error?.message || "Unknown error"
      );

      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "The AI service is temporarily rate-limited. Please try again shortly."
              : "The AI could not generate your itinerary. Please try again.",
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const generatedText = data?.choices?.[0]?.message?.content;

    if (typeof generatedText !== "string" || !generatedText.trim()) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

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
      itinerary.days.length !== numberOfDays
    ) {
      return NextResponse.json(
        { error: "The AI returned an incomplete itinerary. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Itinerary generation error:", error);

    const timedOut =
      error instanceof Error && error.name === "TimeoutError";

    return NextResponse.json(
      {
        error: timedOut
          ? "Itinerary generation took too long. Please try again."
          : "Something went wrong while creating your itinerary.",
      },
      { status: timedOut ? 504 : 500 }
    );
  }
}