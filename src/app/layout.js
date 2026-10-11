export const metadata = {
  title: "Bonvoya | AI-Powered Travel Planner",
  description:
    "Plan smarter and travel happier with Bonvoya. Create personalised travel itineraries, discover destinations, and plan trips around your interests and budget.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
