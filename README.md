# TraceStack

TraceStack is a developer-focused request tracing interface designed to make backend request flow easier to understand. It visualizes how a request moves through different backend stages and highlights successful, slow, or failed steps.

## Features

* Interactive trace ID search
* Multiple predefined demo traces
* Random demo trace generation
* Horizontal request pipeline visualization
* Step-by-step trace execution
* Success, failure, pending, and blocked states
* Bottleneck and failure summaries
* Responsive UI for desktop and mobile

## Tech Stack

* **React** — UI development
* **Vite** — Development and build tooling
* **JavaScript** — Application logic and demo data
* **CSS** — Responsive and visual styling
* **Framer Motion** — Trace animations
* **Lucide React** — Icons
* **Vercel** — Deployment

## Project Structure

```text
TraceStack/
├── public/
├── src/
│   ├── data/
│   │   └── demoTraces.js
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## How It Works

TraceStack uses predefined JavaScript demo traces to simulate backend request execution.

Each trace contains:

```text
Trace ID
   ↓
HTTP method + endpoint
   ↓
Backend processing stages
   ↓
Duration + status for each stage
```

When a trace starts, each stage progresses sequentially. A successful stage allows execution to continue, while a failed stage stops the trace and reports the failure point.

The demo data is intentionally local so the deployed interface remains reliable without requiring an external backend or database.

## Running Locally

Clone the repository:

```bash
git clone https://github.com/Anchalshukla145/TraceStack.git
cd TraceStack
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Scope

TraceStack currently focuses on the frontend demonstration of request tracing. It does not collect or persist real production traces.

A production implementation could extend the concept with application instrumentation, a trace collector, persistent storage, and a backend API for real-time trace data.

## Author

**Anchal Shukla**
