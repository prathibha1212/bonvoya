# Bonvoya integrated UI starter

This package contains a full visual refresh for the Bonvoya travel planner plus:
- AI destination discovery / travel buddy
- A live INR budget breakdown
- Responsive mobile and desktop layout
- Loading and error states

## Before you copy anything
**Back up your current project. Do not replace your existing `src/app/api/plan/route.js`** if it already works. This ZIP includes a placeholder for that route only to document the location. The existing Gemini itinerary endpoint must be preserved.

## Install
1. Stop the development server with `Ctrl + C`.
2. Back up these current files: `src/app/page.js`, `src/app/globals.css`, and your existing API route.
3. Copy `src/app/page.js`, `src/app/globals.css`, `src/components/TravelBuddy.jsx`, and `src/app/api/buddy/route.js` into the matching folders in your project.
4. If your current `src/app/page.js` uses a different request body format for `/api/plan`, change only the JSON body inside `generatePlan()` to match your working route. The existing route's response is displayed as readable JSON unless it returns an `itinerary` field.
5. Keep your existing `src/app/api/plan/route.js` and `.env.local`. Do not share `.env.local`.
6. In `.env.local`, use the same server-side Gemini key name as your working API route (`GEMINI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, or `GOOGLE_API_KEY`). Optionally set `GEMINI_MODEL=gemini-2.5-flash` if that model is available for your key.
7. Run `npm run dev -- --webpack` and open `http://localhost:3000`.

## Important API compatibility note
This starter sends the itinerary route a JSON object with:
`destination`, `days`, `travelers`, `budget`, `purpose`, `interests`, `preferences`, `origin`.

If your existing route expects different property names, keep its format. The Travel Buddy route is independent and uses `/api/buddy`.

## Cost calculation
Transport and stay are group totals. Food and local transport are per person per day. Activities are per person for the whole trip. Buffer is a one-time group amount. The calculator estimates arithmetic only and does not fetch live prices.

## Check before demo
- Destination suggestions work through the Travel Buddy
- Existing itinerary generation still works
- Budget totals update when values change
- Errors show readable messages
- Test mobile width
- Do not claim that prices, weather, or availability are live unless you add a real data source
