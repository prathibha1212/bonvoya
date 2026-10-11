
"use client";

import { useState } from "react";
import TravelBuddy from "@/components/TravelBuddy";
import "./globals.css";

const interestsList = [
  "Nature", "Beaches", "Food", "Culture",
  "Adventure", "Shopping", "History", "Relaxation",
];

const destinations = [
  {
    name: "Bali, Indonesia",
    description: "Tropical escapes & hidden gems",
    price: "From ₹35,000",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85",
    tag: "TROPICAL FAVOURITE",
  },
  {
    name: "Goa, India",
    description: "Sunsets, beaches & slow days",
    price: "From ₹8,000",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=85",
    tag: "BEACH ESCAPE",
  },
  {
    name: "Manali, India",
    description: "Mountain air & scenic trails",
    price: "From ₹10,000",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=85",
    tag: "MOUNTAIN MAGIC",
  },
  {
    name: "Kerala, India",
    description: "Backwaters & lush greenery",
    price: "From ₹9,000",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=85",
    tag: "NATURE'S RETREAT",
  },
];

const features = [
  {
    icon: "✳",
    title: "AI-powered itineraries",
    text: "Day-by-day plans shaped around you.",
  },
  {
    icon: "₹",
    title: "Smart budget planning",
    text: "Know where your travel money goes.",
  },
  {
    icon: "⌖",
    title: "Discover destinations",
    text: "Find places that fit your kind of trip.",
  },
  {
    icon: "♡",
    title: "Made for your style",
    text: "Your pace, interests, and preferences.",
  },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function Home() {
  const [origin, setOrigin] = useState("Bengaluru");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [people, setPeople] = useState("2");
  const [budget, setBudget] = useState(20000);
  const [purpose, setPurpose] = useState("Explore");
  const [interests, setInterests] = useState(["Nature", "Food"]);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  function toggleInterest(item) {
    setInterests((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  }

  async function generatePlan(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination:
            destination.trim() ||
            "Suggest a destination that fits my preferences",
          days: Number(days),
          travelers: Number(people),
          budget: Number(budget),
          purpose,
          interests,
          preferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create your itinerary.");
      }

      setPlan(data);

      setTimeout(() => {
        document
          .getElementById("itinerary")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bonvoya" id="home">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Bonvoya home">
          <span className="brand-mark">b.</span>
          <span>bonvoya<span className="brand-dot">.</span></span>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#destinations">Destinations</a>
          <a href="#planner">Plan a trip</a>
          <a href="#buddy">Travel Buddy</a>
        </nav>

        <a className="nav-cta" href="#planner">Start planning ↗</a>
      </header>

      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <h1>
            Plan smarter.
            <br />
            Travel <em>happier.</em>
          </h1>

          <p className="hero-description">
            Your next adventure starts here. Let AI plan the perfect trip
            around your style, interests, and budget.
          </p>

          <div className="hero-actions">
            <a className="button button-dark" href="#planner">
              Plan my getaway <span>↗</span>
            </a>
            <a className="text-link" href="#destinations">
              Explore destinations ↓
            </a>
          </div>

          <div className="hero-proof">
            <span className="proof-icon">✳</span>
            Personalised trips
            <span>·</span>
            Budget-friendly ideas
          </div>
        </div>

        <div className="hero-visual" aria-label="Travel inspiration">
          <div className="hero-photo hero-photo-main">
            <span className="photo-caption">FIND YOUR KIND OF SOMEWHERE</span>
          </div>
          <div className="hero-photo hero-photo-small" />
          <div className="floating-note">
            <span className="note-icon">✦</span>
            <span>
              <strong>Your trip, your pace</strong>
              <small>Thoughtfully planned with AI</small>
            </span>
          </div>
          <span className="hero-sticker">GO SOMEWHERE<br />WONDERFUL ✳</span>
        </div>
      </section>

      <section className="dashboard section-wrap" id="planner">
        <div className="dashboard-heading">
          <div>
            <div className="eyebrow">LET'S MAKE IT HAPPEN</div>
            <h2>Your next trip, <em>your way.</em></h2>
          </div>
          <p>Tell us a little about your plans. We'll help with the rest.</p>
        </div>

        <div className="dashboard-grid">
          <form className="planner-card" onSubmit={generatePlan}>
            <div className="planner-card-heading">
              <div className="planner-icon">✈</div>
              <div>
                <h3>Plan your trip</h3>
                <p>A few details make all the difference.</p>
              </div>
            </div>

            <div className="planner-fields">
              <label className="field">
                <span>Starting from</span>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  required
                />
              </label>

              <label className="field">
                <span>Destination</span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Anywhere, or name a place"
                />
              </label>

              <div className="field-pair">
                <label className="field">
                  <span>Duration</span>
                  <select value={days} onChange={(e) => setDays(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "day" : "days"}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Travellers</span>
                  <select value={people} onChange={(e) => setPeople(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="budget-heading">
              <label htmlFor="trip-budget">Your total budget</label>
              <strong>{formatINR(budget)}</strong>
            </div>

            <input
              id="trip-budget"
              className="budget-range"
              type="range"
              min="3000"
              max="200000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>₹3,000</span>
              <span>₹2,00,000+</span>
            </div>

            <div className="field-label">What kind of trip?</div>
            <div className="purpose-row">
              {["Explore", "Relaxation", "Adventure", "Romantic"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`purpose-chip ${purpose === item ? "selected" : ""}`}
                  aria-pressed={purpose === item}
                  onClick={() => setPurpose(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="field-label">Things you love</div>
            <div className="interest-grid">
              {interestsList.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`interest-chip ${interests.includes(item) ? "selected" : ""}`}
                  aria-pressed={interests.includes(item)}
                  onClick={() => toggleInterest(item)}
                >
                  {interests.includes(item) ? "✓ " : "+ "}{item}
                </button>
              ))}
            </div>

            <label className="field">
              <span>Anything else we should know?</span>
              <textarea
                rows={2}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Vegetarian food, hidden gems, fewer long drives..."
              />
            </label>

            {error && <div className="error-message" role="alert">{error}</div>}

            <button className="button button-dark submit-button" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating your trip...</> : <>Build my itinerary ✨</>}
            </button>

            <p className="privacy-note">
              AI-generated suggestions and budget estimates; confirm details before booking.
            </p>
          </form>

          <div id="buddy" className="dashboard-buddy">
            <TravelBuddy />
          </div>
        </div>
      </section>

      <section className="destinations section-wrap" id="destinations">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A LITTLE TRAVEL INSPIRATION</div>
            <h2>Places you'll <em>fall for.</em></h2>
          </div>
          <a className="text-link" href="#planner">Plan your own escape ↗</a>
        </div>

        <div className="destination-grid">
          {destinations.map((place) => (
            <button
              type="button"
              className="destination-card"
              key={place.name}
              onClick={() => {
                setDestination(place.name.split(",")[0]);
                document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div
                className="destination-image"
                style={{ backgroundImage: `url("${place.image}")` }}
              >
                <span className="destination-tag">{place.tag}</span>
                <span className="destination-arrow">↗</span>
              </div>
              <div className="destination-info">
                <h3>{place.name}</h3>
                <p>{place.description}</p>
                <span className="destination-price">{place.price}</span>
              </div>
            </button>
          ))}
        </div>
        <p className="price-disclaimer">Starting prices are illustrative estimates, not live travel quotes.</p>
      </section>

      {plan && (
        <section className="results-section section-wrap" id="itinerary">
          <div className="results-card">
            <div className="results-heading">
              <div>
                <div className="eyebrow">MADE FOR YOUR NEXT ADVENTURE</div>
                <h2>Your itinerary is <em>ready.</em></h2>
              </div>
              <button
                className="button button-outline"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      JSON.stringify(plan, null, 2)
                    );
                  } catch {
                    setError("Could not copy the itinerary.");
                  }
                }}
              >
                Copy plan ↗
              </button>
            </div>
            <PlanContent plan={plan} />
          </div>
        </section>
      )}

      <section className="features-section">
        <div className="section-wrap feature-grid">
          {features.map((feature) => (
            <div className="feature-item" key={feature.title}>
              <span className="feature-icon">{feature.icon}</span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer section-wrap">
        <a className="brand" href="#home">
          <span className="brand-mark">b.</span>
          <span>bonvoya<span className="brand-dot">.</span></span>
        </a>
        <p>Go where you feel most alive.</p>
        <span className="footer-right">MADE FOR THE WAY YOU WANDER ✳</span>
      </footer>
    </main>
  );
}

function PlanContent({ plan }) {
  let data = plan?.itinerary ?? plan;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return <pre className="plan-text">{data}</pre>;
    }
  }

  if (data?.itinerary && !data?.days) {
    data = data.itinerary;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        return <pre className="plan-text">{data}</pre>;
      }
    }
  }

  const days = Array.isArray(data?.days)
    ? data.days
    : Array.isArray(data)
      ? data
      : [];

  return (
    <div className="itinerary-content">
      <div className="itinerary-overview">
        <span className="itinerary-label">YOUR TRAVEL PLAN</span>
        <h2>{data?.title || "Your next adventure"}</h2>
        {data?.introduction && <p>{data.introduction}</p>}
      </div>

      {days.length ? days.map((day, index) => (
        <article className="itinerary-day" key={day.day ?? index}>
          <div className="day-heading">
            <span className="day-number">DAY {day.day ?? index + 1}</span>
            <h3>{day.title || `Day ${index + 1}`}</h3>
          </div>
          {Array.isArray(day.activities) ? day.activities.map((activity, i) => (
            <div className="activity-item" key={i}>
              <span className="activity-time">{activity.time || "Flexible"}</span>
              <div className="activity-details">
                <h4>{activity.activity || activity.title || "Explore"}</h4>
                {activity.details && <p>{activity.details}</p>}
              </div>
            </div>
          )) : (
            <p className="plan-introduction">
              {day.description || day.summary || "Explore the destination at your own pace."}
            </p>
          )}
        </article>
      )) : (
        <p className="plan-introduction">
          The API returned a response, but its day-by-day structure wasn't recognised.
          We may need to map the actual response fields.
        </p>
      )}
    </div>
  );
}
