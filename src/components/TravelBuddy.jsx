
"use client";

import { useMemo, useState } from "react";

const prompts = [
  "Suggest a destination for my budget",
  "Plan a relaxed 3-day getaway",
  "How can I make this trip cheaper?",
];

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export default function TravelBuddy() {
  const [tab, setTab] = useState("chat");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [people, setPeople] = useState("2");
  const [budget, setBudget] = useState("20000");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, traveller! ✨ Tell me what kind of escape you're craving, or ask me for destination ideas.",
    },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [transport, setTransport] = useState(3000);
  const [stay, setStay] = useState(4500);
  const [food, setFood] = useState(900);
  const [local, setLocal] = useState(500);
  const [activities, setActivities] = useState(2000);
  const [buffer, setBuffer] = useState(1500);

  const peopleCount = Math.max(1, Number(people) || 1);
  const dayCount = Math.max(1, Number(days) || 1);
  const target = Math.max(0, Number(budget) || 0);

  const total = useMemo(
    () =>
      Number(transport) +
      Number(stay) +
      (Number(food) + Number(local)) * dayCount * peopleCount +
      Number(activities) * peopleCount +
      Number(buffer),
    [transport, stay, food, local, activities, buffer, dayCount, peopleCount]
  );

  async function send(text = message) {
    const clean = text.trim();
    if (!clean || sending) return;

    const history = messages.slice(-8);
    setMessages((current) => [
      ...current,
      { role: "user", content: clean },
    ]);
    setMessage("");
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          history,
          context: {
            destination: destination || "Not decided",
            days,
            people,
            budget,
            estimatedBudget: total,
            currency: "INR",
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Your travel buddy couldn't reply.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || "Please try asking another question.",
        },
      ]);
    } catch (err) {
      setError(err.message || "Could not connect to the travel buddy.");
    } finally {
      setSending(false);
    }
  }

  function optimise() {
    setTab("chat");
    send(
      `Help me reduce my trip costs. Destination: ${destination || "undecided"}. ` +
      `${days} days for ${people} traveller(s). Target budget: ${money(target)}. ` +
      `Estimated group cost: ${money(total)}. Suggest practical savings.`
    );
  }

  return (
    <div className="buddy-tools">
      <div className="chat-card">
        <div className="chat-header">
          <div className="buddy-avatar">✳</div>
          <div className="chat-header-copy">
            <strong>AI Travel Buddy</strong>
            <span><i className="online-dot" /> Ready to explore with you</span>
          </div>
          <span className="buddy-header-star">✦</span>
        </div>

        <div className="buddy-tabs" role="tablist" aria-label="Travel tools">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "chat"}
            className={tab === "chat" ? "active" : ""}
            onClick={() => setTab("chat")}
          >
            ✈ Travel Buddy
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "budget"}
            className={tab === "budget" ? "active" : ""}
            onClick={() => setTab("budget")}
          >
            ▦ Budget Calculator
          </button>
        </div>

        {tab === "chat" ? (
          <div className="buddy-chat-panel">
            <div className="buddy-context-fields">
              <label>
                Destination
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Not sure yet"
                />
              </label>
              <div className="buddy-context-pair">
                <label>
                  Days
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </label>
                <label>
                  Travellers
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Total budget (₹)
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </label>
            </div>

            <div className="chat-messages" aria-live="polite">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`chat-message ${
                    item.role === "user" ? "from-user" : "from-ai"
                  }`}
                >
                  {item.role === "assistant" && (
                    <span className="message-avatar">✳</span>
                  )}
                  <div className="message-bubble">{item.content}</div>
                </div>
              ))}
              {sending && (
                <div className="typing" role="status">
                  Your buddy is thinking…
                </div>
              )}
            </div>

            {error && (
              <div className="chat-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => setError("")}>Dismiss</button>
              </div>
            )}

            <div className="prompt-chips">
              {prompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  disabled={sending}
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="chat-compose"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me what you're dreaming of..."
                aria-label="Message your travel buddy"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                aria-label="Send message"
              >
                ↑
              </button>
            </form>

            <p className="chat-disclaimer">
              AI suggestions are estimates. Confirm details before booking.
            </p>
          </div>
        ) : (
          <div className="buddy-budget-panel">
            <div className="budget-card-heading">
              <div>
                <div className="eyebrow">A LITTLE MONEY CLARITY</div>
                <h3>Your trip budget</h3>
              </div>
              <span className="budget-symbol">₹</span>
            </div>
            <p className="budget-explain">
              Adjust estimates to see your group and per-person costs.
            </p>

            <div className="budget-lines">
              <BudgetInput label="Transport (group total)" value={transport} onChange={setTransport} />
              <BudgetInput label="Stay (group total)" value={stay} onChange={setStay} />
              <BudgetInput label="Food (per person / day)" value={food} onChange={setFood} />
              <BudgetInput label="Local transport (per person / day)" value={local} onChange={setLocal} />
              <BudgetInput label="Activities (per person)" value={activities} onChange={setActivities} />
              <BudgetInput label="Extra buffer (group total)" value={buffer} onChange={setBuffer} />
            </div>

            <div className="budget-total">
              <span>Estimated group total</span>
              <strong>{money(total)}</strong>
              <div className="budget-per-person">
                <span>Per person</span>
                <strong>{money(total / peopleCount)}</strong>
              </div>
            </div>

            <div className={`budget-status ${total > target ? "over" : "under"}`}>
              {total > target
                ? `${money(total - target)} over your target budget`
                : `${money(target - total)} left in your target budget`}
            </div>

            <button
              className="button button-dark budget-optimise"
              type="button"
              disabled={sending}
              onClick={optimise}
            >
              Ask buddy to optimise ↗
            </button>
            <p className="budget-note">
              Estimates only, not live booking prices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetInput({ label, value, onChange }) {
  return (
    <label className="budget-input-row">
      <span>{label}</span>
      <div>
        <span>₹</span>
        <input
          type="number"
          min="0"
          step="100"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
    </label>
  );
}
