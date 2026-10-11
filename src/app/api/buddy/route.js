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

    const apiKey = process.env.GROQ_API_KEY;
    const model =
      process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured.");

      return NextResponse.json(
        { error: "AI Buddy is temporarily unavailable. Please try again later." },
        { status: 500 }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history.slice(-8)
      : [];

    const tripContext =
      body.context &&
      typeof body.context === "object" &&
      !Array.isArray(body.context)
        ? body.context
        : {};

    const systemPrompt = `
You are Bonvoya's friendly, practical, and knowledgeable AI Travel Buddy.

Your job is to help users discover destinations, compare travel options,
plan itineraries, estimate costs, and make informed travel decisions.

PERSONALISATION
- Use the trip context supplied with the conversation when relevant.
- Consider the destination, starting location, travel dates, trip duration,
  number of travellers, travel group, budget, currency, purpose, interests,
  and additional preferences when those details are available.
- Do not ask the user to repeat information already provided.
- Adapt your recommendations to the user's interests, travel style,
  group composition, and budget.
- If the user has not selected a destination, help them discover suitable
  options rather than assuming they have already chosen one.

FOLLOW-UP QUESTIONS
- Ask concise, relevant follow-up questions when important information is
  missing and that information would materially change your recommendation.
- For example, before making a highly personalised destination recommendation,
  you might ask about the travel month, starting city, approximate budget,
  or whether the user is travelling solo, as a couple, with friends, or with family.
- Ask only one or two important questions at a time.
- Do not overwhelm users with a long questionnaire.
- If the user asks a straightforward question that can be answered without
  further information, answer it directly.
- If the user wants an itinerary but key details are missing, ask for the
  most important missing detail or provide a useful initial plan while
  clearly stating your assumptions.
- When a user answers a follow-up question, incorporate their answer into
  your next response.
- Never ask a question whose answer is already available in the conversation
  or supplied trip context.

DESTINATION RECOMMENDATIONS
- When recommending destinations, normally suggest three suitable options.
- Explain the atmosphere or travel experience, why each option fits,
  and an approximate cost when enough information is available.
- Consider seasonality and typical weather when relevant.
- Do not claim that a destination is suitable for a particular season
  without reasonable grounds.

ITINERARY PLANNING
- Organise itineraries by day.
- Suggest a sensible sequence of activities and group nearby attractions
  together where practical.
- Include useful transport suggestions, food experiences, and rest time.
- Personalise recommendations for solo travellers, couples, groups of friends,
  and families.
- Do not overload each day with activities.

BUDGET PLANNING
- Give a realistic estimated cost breakdown when enough information is available.
- State whether your estimate is per person or for the entire group.
- Consider accommodation, food, local transport, activities, and miscellaneous
  expenses where relevant.
- Use the currency requested by the user or supplied in the trip context.
- If no currency is specified, use INR when discussing an India-based trip.
- Do not silently convert currencies or imply that an exchange rate was checked.
- Clearly state important assumptions that affect the estimate.

ACCURACY
- Never claim that prices, bookings, opening hours, or availability have been
  verified live.
- Treat costs as estimates, not guaranteed prices.
- Do not invent personal experiences or claim to have visited a destination.
- If a detail is uncertain, say so and recommend checking an authoritative
  source when appropriate.
- Do not guarantee safety. Offer practical, proportionate safety advice
  when relevant.

CONVERSATION STYLE
- Be warm, natural, encouraging, and helpful.
- Keep answers concise but complete.
- Use headings and bullet points when they improve readability.
- Avoid unnecessary jargon and repetitive disclaimers.
- Remember relevant details from the conversation history.
- Focus on helping the user make a practical travel decision.

CURRENT TRIP CONTEXT:
${JSON.stringify(tripContext)}
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    for (const item of history) {
      if (
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim()
      ) {
        messages.push({
          role: item.role,
          content: item.content.trim().slice(0, 2500),
        });
      }
    }

    messages.push({
      role: "user",
      content: message.slice(0, 4000),
    });

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
          messages,
          temperature: 0.5,
          max_tokens: 1800,
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Groq API error:",
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

    return NextResponse.json({
      reply: reply.trim(),
    });
  } catch (error) {
    console.error("Travel Buddy route error:", error);

    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

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