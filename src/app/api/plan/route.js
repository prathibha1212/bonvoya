import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      origin,
      destination,
      days,
      budget,
      travelers,
      travelParty,
      travelDate,
      currency,
      purpose,
      interests,
      preferences,
    } = await request.json();

    // Validate required fields
    if (!destination || !days || !budget) {
      return NextResponse.json(
        {
          error: "Please provide a destination, trip duration, and budget.",
        },
        { status: 400 }
      );
    }

    const numberOfDays = Number(days);
    const numberOfTravelers = Number(travelers) || 1;
    const totalBudget = Number(budget);

    if (
      !Number.isInteger(numberOfDays) ||
      numberOfDays < 1 ||
      numberOfDays > 14
    ) {
      return NextResponse.json(
        { error: "Trip duration must be between 1 and 14 days." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      return NextResponse.json(
        { error: "Please provide a valid travel budget." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured.");

      return NextResponse.json(
        { error: "The itinerary service is temporarily unavailable." },
        { status: 500 }
      );
    }

    const selectedCurrency = currency || "INR";
    const selectedInterests = Array.isArray(interests) ? interests : [];

    const tripDetails = {
      startingLocation: origin || "Not specified",
      destination,
      duration: `${numberOfDays} days`,
      travelDate: travelDate || "Not specified",
      travelers: numberOfTravelers,
      travelParty: travelParty || "Not specified",
      totalBudget: `${selectedCurrency} ${totalBudget}`,
      purpose: purpose || "General sightseeing",
      interests: selectedInterests,
      preferences: preferences || "No additional preferences",
    };

    const systemPrompt = `
You are Bonvoya, an expert travel planner who creates practical,
personalised, enjoyable travel itineraries.

Your goal is to create a realistic trip plan based on the traveller's
destination, dates, group type, budget, interests, and preferences.

IMPORTANT RULES:

1. Personalisation
- Tailor recommendations to the traveller's selected purpose and interests.
- Consider whether the traveller is solo, travelling as a couple,
  with friends, or with family.
- For families with children, prioritise suitable activities and a
  manageable pace.
- For couples, consider romantic experiences where appropriate.
- For solo travellers, consider convenient transport and practical
  safety advice.
- For groups of friends, consider activities the group can enjoy together.
- Respect any additional preferences supplied by the traveller.

2. Dates and seasonality
- Use the requested travel date when it is provided.
- Consider typical seasonal weather and relevant seasonal conditions.
- Do not invent live weather forecasts, current opening hours, ticket
  availability, or confirmed reservations.
- If the date is missing, make a general itinerary without claiming
  date-specific information.

3. Budget
- The supplied budget is the TOTAL budget for the entire trip,
  not a per-person or daily budget.
- The currency code specifies the currency to use.
- Do not convert the budget into another currency.
- Allocate the budget across accommodation, food, transport,
  activities, and miscellaneous expenses.
- Keep recommendations realistic for the supplied budget.
- Clearly label all monetary amounts with the selected currency.
- Treat price estimates as approximate, not guaranteed current prices.
- Do not claim that prices or reservations have been verified live.

4. Practical itinerary
- Create exactly the requested number of days.
- Give each day a clear title and a sensible sequence of activities.
- Group nearby attractions together to reduce unnecessary travel.
- Include suggested times, activities, food suggestions, and transport
  guidance where useful.
- Avoid overloading each day with too many activities.
- Do not invent specific businesses or claim that a venue exists if
  you are unsure.
- Mention when travellers should verify opening hours, prices, or
  booking requirements.

5. Missing information
- If the origin, date, or preferences are missing, proceed using
  reasonable assumptions where possible.
- Do not block itinerary generation solely because optional information
  is missing.
- State important assumptions briefly in the response.

6. Output
Return ONLY valid JSON. Do not include Markdown fences or explanatory
text outside the JSON object.

Use this structure:

{
  "tripTitle": "A suitable title for the trip",
  "destination": "Destination",
  "summary": "A short personalised trip overview",
  "bestTimeToVisit": "Seasonal guidance relevant to the travel date",
  "travelTips": [
    "Practical tip"
  ],
  "budgetBreakdown": {
    "accommodation": "Estimated total",
    "food": "Estimated total",
    "transport": "Estimated total",
    "activities": "Estimated total",
    "miscellaneous": "Estimated total",
    "total": "Estimated total in the selected currency"
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity description",
          "location": "Location or area",
          "estimatedCost": "Approximate cost in the selected currency",
          "tip": "Useful practical tip"
        }
      ]
    }
  ]
}

The itinerary array must contain exactly the requested number of days.
The budget breakdown must use the selected currency and remain consistent
with the total budget.
`;

    const userPrompt = `
Create a personalised travel itinerary using these trip details:

${JSON.stringify(tripDetails, null, 2)}

Generate the complete itinerary and budget breakdown.

Ensure the recommendations match the traveller's purpose, interests,
group type, date, preferences, and total budget.

Return valid JSON only.
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
          model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 7000,
          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();

      console.error(
        "Groq API error:",
        response.status,
        errorDetails
      );

      return NextResponse.json(
        {
          error:
            "We couldn't generate your itinerary right now. Please try again.",
        },
        { status: 502 }
      );
    }

    const result = await response.json();

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Groq returned an empty itinerary response.");

      return NextResponse.json(
        { error: "The itinerary response was empty. Please try again." },
        { status: 502 }
      );
    }

    let itinerary;

try {
  const cleanedContent = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  itinerary = JSON.parse(cleanedContent);
} catch (parseError) {
  console.error("Failed to parse itinerary JSON:", parseError);
  console.error("Groq response content:", content);

  return NextResponse.json(
    {
      error:
        "We couldn't process the generated itinerary. Please try again.",
    },
    { status: 502 }
  );
}
    if (
  !itinerary ||
  typeof itinerary !== "object" ||
  !Array.isArray(itinerary.itinerary) ||
  itinerary.itinerary.length !== numberOfDays
) {
  console.error(
    "Invalid itinerary structure:",
    JSON.stringify(itinerary, null, 2)
  );

  return NextResponse.json(
    {
      error:
        "The generated itinerary was incomplete or had an unexpected format. Please try again.",
    },
    { status: 502 }
  );
}

return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Itinerary generation error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while generating your itinerary.",
      },
      { status: 500 }
    );
  }
}