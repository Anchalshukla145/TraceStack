export const demoTraces = [
  {
    id: "TS-4821",
    method: "POST",
    endpoint: "/api/orders",
    status: "success",
    steps: [
      {
        name: "Authentication",
        duration: 24,
        status: "success",
        log: "Token verified for user 'dev_alice'. Session scope: read, write."
      },
      {
        name: "Rate Limiter",
        duration: 12,
        status: "success",
        log: "IP limit ok. Rate bucket: 149/150 remaining."
      },
      {
        name: "Order Controller",
        duration: 38,
        status: "success",
        log: "POST payload validated successfully. Order size: 3 items."
      },
      {
        name: "Order Service",
        duration: 112,
        status: "success",
        log: "Business logic processed. Stock reserved. Created draft Order ID: ORD-889."
      },
      {
        name: "PostgreSQL DB",
        duration: 640,
        status: "success",
        log: "Query execution: INSERT INTO orders VALUES (...). 1 row affected."
      },
      {
        name: "HTTP Response",
        duration: 20,
        status: "success",
        log: "Response status 201 Created sent. Payload size: 456 bytes."
      }
    ]
  },
  {
    id: "TS-7319",
    method: "POST",
    endpoint: "/api/payment",
    status: "failure",
    steps: [
      {
        name: "Authentication",
        duration: 21,
        status: "success",
        log: "Token verified for user 'client_bob'. Session scope: read, write, payment."
      },
      {
        name: "Rate Limiter",
        duration: 14,
        status: "success",
        log: "IP limit ok. Rate bucket: 89/100 remaining."
      },
      {
        name: "Payment Controller",
        duration: 31,
        status: "success",
        log: "POST payment request validated. Amount: $120.00."
      },
      {
        name: "Payment Service",
        duration: 89,
        status: "success",
        log: "Initiating Stripe session. Intent generated: pi_3N41x."
      },
      {
        name: "Payment Gateway",
        duration: 420,
        status: "failure",
        log: "Connection closed by upstream. Stripe API returned 502 Bad Gateway."
      },
      {
        name: "HTTP Response",
        duration: 0,
        status: "blocked",
        log: "Trace stopped. Service was aborted before response."
      }
    ]
  },
  {
    id: "TS-1946",
    method: "GET",
    endpoint: "/api/profile",
    status: "pending",
    steps: [
      {
        name: "Authentication",
        duration: 18,
        status: "success",
        log: "Cookie session authenticated for user 'user_charlie'."
      },
      {
        name: "Rate Limiter",
        duration: 11,
        status: "success",
        log: "IP limit ok. Rate bucket: 242/300 remaining."
      },
      {
        name: "Profile Controller",
        duration: 27,
        status: "success",
        log: "GET request received. Dispatching to user-profile resolver."
      },
      {
        name: "Profile Service",
        duration: 76,
        status: "success",
        log: "Fetching user metadata & relational data from DB layer."
      },
      {
        name: "MongoDB Database",
        duration: 0,
        status: "pending",
        log: "Awaiting database cursor... Connection pool has 0 available connections."
      },
      {
        name: "HTTP Response",
        duration: 0,
        status: "blocked",
        log: "Trace blocked. Database connection pending."
      }
    ]
  },
  {
    id: "TS-3052",
    method: "POST",
    endpoint: "/api/admin/config",
    status: "failure",
    steps: [
      {
        name: "Authentication",
        duration: 45,
        status: "failure",
        log: "Forbidden: Signature validation failed. Expired JSON Web Token."
      },
      {
        name: "Rate Limiter",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "Admin Controller",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "Config Service",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "Redis Cache DB",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "HTTP Response",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      }
    ]
  },
  {
    id: "TS-8843",
    method: "GET",
    endpoint: "/api/analytics/users",
    status: "failure",
    steps: [
      {
        name: "Authentication",
        duration: 15,
        status: "success",
        log: "API key validated for analytics-harvester agent."
      },
      {
        name: "Rate Limiter",
        duration: 8,
        status: "failure",
        log: "Rate limit exceeded. Bucket capacity: 0/10 tokens. Retry-After: 60s."
      },
      {
        name: "Controller",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "Service",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "Database",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      },
      {
        name: "HTTP Response",
        duration: 0,
        status: "blocked",
        log: "Blocked due to previous step failure."
      }
    ]
  },
  {
    id: "TS-9120",
    method: "GET",
    endpoint: "/api/reports/annual",
    status: "warning",
    steps: [
      {
        name: "Authentication",
        duration: 22,
        status: "success",
        log: "Bearer token verified. Scope: reports."
      },
      {
        name: "Rate Limiter",
        duration: 16,
        status: "success",
        log: "IP rate limit ok."
      },
      {
        name: "Reports Controller",
        duration: 45,
        status: "success",
        log: "GET request validation complete. Report year: 2026."
      },
      {
        name: "Reports Service",
        duration: 180,
        status: "success",
        log: "Consolidating monthly datasets. Initializing aggregation pipeline."
      },
      {
        name: "ClickHouse DB",
        duration: 2450,
        status: "success",
        log: "Warning: Slow query detected. Scanned 12.4M rows. Table scan fallback."
      },
      {
        name: "HTTP Response",
        duration: 35,
        status: "success",
        log: "Report file generated. 200 OK sent. Payload size: 4.8MB."
      }
    ]
  }
];
