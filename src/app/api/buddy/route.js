
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Check your .env.local file." },
        { status: 500 }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history.slice(-8)
      : [];

    const contents = [];

    for (const item of history) {
      if (
        !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string" ||
        !item.content.trim()
      ) {
        continue;
      }

      const role = item.role === "assistant" ? "model" : "user";
      const text = item.content.trim().slice(0, 2500);
      const previous = contents[contents.length - 1];

      if (previous && previous.role === role) {
        previous.parts[0].text += "\n\n" + text;
      } else {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    }

    while (contents.length && contents[0].role !== "user") {
      contents.shift();
    }

    const previous = contents[contents.length - 1];

    if (previous && previous.role === "user") {
      previous.parts[0].text += "\n\n" + message.slice(0, 4000);
    } else {
      contents.push({
        role: "user",
        parts: [{ text: message.slice(0, 4000) }],
      });
    }

    const context = body.context || {};
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
  "You are Bonvoya's friendly, practical AI travel buddy. " +
  "Help users discover destinations, plan itineraries, compare options, " +
  "and manage travel budgets, especially for trips in India using INR. " +
  "Answer the user's entire question. For destination recommendations, " +
  "provide 3 options with the vibe, estimated cost, and why each fits. " +
  "For itinerary requests, organise the plan by day with useful activities. " +
  "For budget requests, provide a realistic cost breakdown and state your " +
  "assumptions. Keep answers concise but complete. Do not stop mid-sentence " +
  "or omit requested sections. Never claim prices are live or verified. " +
  "If a request needs a longer answer, prioritise covering every requested " +
  "part rather than adding unnecessary detail.\n\n" +
  "Trip context: " + JSON.stringify(context),
              },
            ],
          },
          contents,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const details =
        data?.error?.message || "Unknown Gemini API error";

      console.error("Gemini API status:", response.status);
      console.error("Gemini API details:", details);

      return NextResponse.json(
        {
          error: details,
          geminiStatus: response.status,
        },
        { status: 502 }
      );
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Gemini returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Travel Buddy route error:", error);

    return NextResponse.json(
      { error: "The request could not be processed. Please try again." },
      { status: 500 }
    );
  }
}
