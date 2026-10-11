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

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model =
      process.env.OPENROUTER_MODEL || "openrouter/free";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is missing." },
        { status: 500 }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history.slice(-8)
      : [];

    const messages = [
  {
    role: "system",
    content:
      "You are Bonvoya's friendly, practical AI travel buddy. " +
      "Help users discover destinations, plan itineraries, compare options, " +
      "and manage travel budgets, especially for trips in India using INR. " +
      "Answer the user's entire question. For destination recommendations, " +
      "provide 3 options with the vibe, estimated cost, and why each fits. " +
      "For itinerary requests, organise the plan by day with useful activities. " +
      "For budget requests, provide a realistic cost breakdown and state your " +
      "assumptions. Keep answers concise but complete. Never claim prices are " +
      "live or verified. Include every requested section.\n\n" +
      "Trip context: " + JSON.stringify(body.context || {}),
  },
];

    for (const item of history) {
      if (
        !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string" ||
        !item.content.trim()
      ) {
        continue;
      }

      messages.push({
        role: item.role,
        content: item.content.trim().slice(0, 2500),
      });
    }

    messages.push({
      role: "user",
      content: message.slice(0, 4000),
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://bonvoya.vercel.app",
          "X-Title": "Bonvoya Travel Buddy",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(45000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenRouter API error:",
        response.status,
        data?.error?.message || "Unknown error"
      );

      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "AI Buddy is temporarily rate-limited. Please try again shortly."
              : "AI Buddy couldn't generate a response. Please try again.",
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json(
        { error: "AI Buddy returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (error) {
    console.error("Travel Buddy route error:", error);

    const timedOut =
      error instanceof Error && error.name === "TimeoutError";

    return NextResponse.json(
      {
        error: timedOut
          ? "AI Buddy took too long to respond. Please try again."
          : "The request could not be processed. Please try again.",
      },
      { status: timedOut ? 504 : 500 }
    );
  }
}