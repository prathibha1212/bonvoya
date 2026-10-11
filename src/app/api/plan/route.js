
import { NextResponse } from "next/server";

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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Check your .env.local file." },
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

    const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);

      return NextResponse.json(
        { error: "The AI could not generate your itinerary. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    const itinerary = JSON.parse(generatedText);

    if (
      !itinerary.title ||
      !itinerary.introduction ||
      !Array.isArray(itinerary.days)
    ) {
      return NextResponse.json(
        { error: "The AI returned an invalid itinerary. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Itinerary generation error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating your itinerary." },
      { status: 500 }
    );
  }
}
