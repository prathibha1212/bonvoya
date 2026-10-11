# ✈️ Bonvoya — AI-Powered Travel Planner

**Plan smarter. Travel happier.**

Bonvoya is an AI-powered travel planning application that helps users create personalized travel itineraries based on their destination, travel duration, budget, interests, travel group, and preferences.

Built with Next.js and powered by the Groq API, Bonvoya generates day-by-day travel plans and provides an AI travel assistant to help users explore destinations and ask travel-related questions.

🌐 **Live Demo:** https://bonvoya-ahnm.vercel.app/

---

## 📌 Project Overview

Planning a trip often involves researching destinations, organizing activities, estimating expenses, and considering individual preferences.

Bonvoya simplifies this process by allowing users to provide their travel requirements and receive an AI-generated itinerary tailored to their needs.

The application combines an intuitive interface with AI-powered recommendations to make travel planning more convenient and personalized.

---

## ✨ Features

### 🗺️ Personalized Travel Planning

Generate customized travel itineraries based on:

- Departure city
- Destination
- Travel dates
- Number of travel days
- Number of travelers
- Travel group
- Purpose of the trip
- Interests and preferred activities
- Approximate travel budget
- Additional preferences and requirements

### 🤖 AI-Powered Itinerary Generation

- Generates day-by-day travel plans.
- Uses the provided trip details to personalize recommendations.
- Organizes suggested activities into a structured itinerary.
- Uses an LLM through the Groq API to generate travel suggestions.

### 💬 AI Travel Buddy

Bonvoya includes an AI travel assistant that helps users explore travel-related questions and receive recommendations.

The assistant supports conversational interactions and follow-up questions to help users refine their travel plans.

### 💰 Budget Planning

- Allows users to specify a trip budget.
- Displays budget amounts in Indian Rupees (INR).
- Helps users consider budget constraints when planning a trip.

### 🎨 User Interface

- Modern travel-planning interface.
- Consistent visual styling and reusable UI components.
- Responsive layout designed for desktop and mobile devices.
- Loading and error feedback for supported interactions.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and application routing |
| React | Component-based user interface |
| JavaScript | Application logic |
| Groq API | AI-powered itinerary generation and travel assistance |
| CSS | Application styling and responsive layouts |
| Vercel | Application deployment and hosting |
| Git and GitHub | Version control and source code management |

---

## 🏗️ Application Architecture

Bonvoya uses Next.js API routes to communicate with the AI service from the server side.

The main application components are:

```text
bonvoya/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── buddy/
│   │   │   │   └── route.js
│   │   │   └── plan/
│   │   │       └── route.js
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   └── components/
├── public/
├── package.json
├── package-lock.json
└── README.md
```

**Key application routes:**

- `/` — Main Bonvoya travel-planning interface.
- `/api/plan` — Server-side endpoint for generating travel itineraries.
- `/api/buddy` — Server-side endpoint for AI travel assistant interactions.

The exact files and folders may vary slightly depending on the current project structure.

---

## ⚙️ Getting Started

Follow these instructions to run Bonvoya locally.

### Prerequisites

Install the following:

- Node.js
- npm
- Git
- A Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/prathibha1212/bonvoya.git
```

### 2. Navigate to the project directory

```bash
cd bonvoya
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a file named `.env.local` in the project root.

Add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key
```

Replace `your_groq_api_key` with your own API key.

If your application uses an optional model override, you can also configure:

```env
GROQ_MODEL=openai/gpt-oss-20b
```

The model override is optional when the application already specifies a default model in its API route.

**Security note:** Never commit `.env.local` or expose API keys in client-side code. Keep credentials in server-side environment variables.

### 5. Start the development server

```bash
npm run dev
```

### 6. Open the application

Visit:

http://localhost:3000

If Next.js reports a different port because port 3000 is already occupied, open the URL shown in the terminal.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Authenticates server-side requests to the Groq API |
| `GROQ_MODEL` | Optional | Overrides the default Groq model when supported by the application code |

Configure the required environment variables in the deployment platform as well as in your local development environment.

For Vercel, add them under:

**Project Settings → Environment Variables**

After adding or changing an environment variable, redeploy the application so the deployment uses the updated configuration.

---

## 🚀 Deployment

Bonvoya is deployed using Vercel.

### Deployment workflow

1. Push the latest project changes to the connected GitHub repository.
2. Allow Vercel to build and deploy the application.
3. Verify that the deployment completes successfully.
4. Test itinerary generation and AI Buddy interactions on the deployed website.

### Live Application

🌐 https://bonvoya-ahnm.vercel.app/

---

## 🧪 Testing Checklist

The following checks can be used to verify the application before submission.

- [ ] The homepage loads successfully.
- [ ] Users can enter trip details.
- [ ] Users can specify a destination and trip duration.
- [ ] Users can configure their travel group, interests, and preferences.
- [ ] Budget values display in INR.
- [ ] AI itinerary generation works.
- [ ] Generated itineraries reflect the user's requirements.
- [ ] AI Buddy responds to travel-related questions.
- [ ] Follow-up questions work as expected.
- [ ] Loading and error states are understandable.
- [ ] The application works at desktop and mobile screen sizes.
- [ ] The deployed application can access the required environment variables.

---

## 🔮 Potential Future Improvements

Possible extensions include:

- Weather information using a weather API.
- Interactive maps and location-based recommendations.
- Hotel and accommodation suggestions.
- More detailed travel expense breakdowns.
- Trip saving and sharing.
- Support for multiple destinations.
- Packing recommendations and destination-specific travel tips.
- Additional itinerary customization options.

These are potential enhancements rather than claims about existing functionality.

---

## 🔒 Security Considerations

- API keys are configured through environment variables.
- AI API requests are handled through server-side routes.
- Secrets should never be committed to GitHub.
- The `.env.local` file should remain excluded through `.gitignore`.

---

## 🎯 Assessment Context

**Project:** AI Travel Planner  
**Role:** Associate Software Developer  
**Organization:** COM8 Studio

The project explores how an AI-powered application can simplify travel planning through personalized recommendations, structured itineraries, and conversational assistance.

---

## 👩‍💻 Author

**Prathibha**

GitHub: https://github.com/prathibha1212

Live Project: https://bonvoya-ahnm.vercel.app/

---

*Bonvoya — Plan smarter. Travel happier.* ✈️
