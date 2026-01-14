---
applyTo: "**/*.tsx"
---

# Next.js Framework-Specific Best Practices

## 1. App Router & File Structure

### Route Organization

- Use `/app` directory structure (App Router, not Pages Router).
- Place API routes in `/app/api/` with `route.ts` files.
- Group related routes using folder naming conventions: `(group-name)/`.
- Use `layout.tsx` for shared UI and `page.tsx` for route content.

### Route Handlers (API Routes)

```typescript
// ✅ Correct: /app/api/rates/route.ts
export async function GET(request: Request) {
  try {
    // Fetch with error handling and validation
    const data = await fetchExchangeRates();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}

// ❌ Avoid: Multiple exports without proper method handling
export async function POST(request: Request) {
  // Validate request body
  const body = await request.json();
  // Process safely
}
```

## 2. Client vs Server Components

### Use 'use client' Directive Strategically

- Add `'use client'` only at the leaf component level, not at the root.
- Keep server components as default (no directive needed).
- Use server components for data fetching; pass data to client components.

```typescript
// ✅ Server component (app/page.tsx)
export default async function Page() {
  const exchangeRates = await fetchExchangeRates();
  return <ClientComponent rates={exchangeRates} />;
}

// ✅ Client component (requires 'use client')
("use client");

import { useState } from "react";

export default function ClientComponent({ rates }) {
  const [amount, setAmount] = useState("1");
  // Handle client-side state
}

// ❌ Avoid: 'use client' at the top-level layout
("use client"); // Don't do this unless absolutely necessary
export default function Layout({ children }) {
  // ...
}
```

## 3. Navigation & URL State Management

### useRouter & useSearchParams

- Import from `'next/navigation'` (not `'next/router'`).
- Always use `{ scroll: false }` when updating URL to prevent unwanted scrolling.
- Use `useSearchParams()` for reading query parameters on the client.
- Validate query parameters before using them.

```typescript
// ✅ Correct usage
import { useRouter, useSearchParams } from "next/navigation";

export default function Converter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleConvert = useCallback(
    (amount, from, to) => {
      const params = new URLSearchParams();
      params.set("amount", amount);
      params.set("from", from);
      params.set("to", to);

      // Prevent scroll jump
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Read parameters safely
  const amount = searchParams.get("amount") || "1";
  const from = searchParams.get("from") || "USD";

  // Validate before use
  if (!CURRENCIES.find((c) => c.code === from)) {
    return null; // or render error
  }
}

// ❌ Avoid: Direct manipulation without scroll prevention
router.push(`?amount=${amount}&from=${from}`); // No scroll: false!
```

## 4. Data Fetching Patterns

### Server-Side Fetching

- Fetch data in server components or API routes, not in client components.
- Use `next/fetch` or standard `fetch()` with caching headers.
- Implement retry logic and fallbacks for external APIs.

```typescript
// ✅ Correct: Fetch in API route with caching
// app/api/rates/route.ts
const CACHE_DURATION = 3600; // 1 hour

export async function GET() {
  try {
    const response = await fetch("https://api.exchangerate.host/latest", {
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) throw new Error("Primary API failed");

    return Response.json(await response.json());
  } catch (error) {
    // Fallback to secondary API
    try {
      const fallbackResponse = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD",
        {
          next: { revalidate: CACHE_DURATION },
        }
      );
      return Response.json(await fallbackResponse.json());
    } catch (fallbackError) {
      console.error("All APIs failed:", fallbackError);
      return Response.json({ error: "Unavailable" }, { status: 503 });
    }
  }
}

// ✅ Correct: Fetch in server component
import { ExchangeRates } from "@/types";

async function getExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch("/api/rates");
  if (!response.ok) throw new Error("Failed to fetch rates");
  return response.json();
}

export default async function Page() {
  const rates = await getExchangeRates();
  return <ConverterApp initialRates={rates} />;
}

// ❌ Avoid: Fetching in client component without proper error handling
("use client");
export default function BadComponent() {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    // This works but mixes concerns
    fetch("/api/rates")
      .then((r) => r.json())
      .then(setRates);
  }, []);
}
```

### Client-Side Fetching with Hooks

- Use custom hooks to encapsulate fetch logic.
- Always handle loading, error, and success states.
- Use `useCallback` to memoize fetch functions.

```typescript
// ✅ Correct: Custom hook for data fetching
"use client";

import { useEffect, useState, useCallback } from "react";

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rates");
      if (!response.ok) throw new Error("Failed to fetch");
      setRates(await response.json());
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return { rates, loading, error };
}
```

## 5. Image Optimization

### Use next/image

- Always use `<Image>` from `'next/image'` instead of `<img>`.
- Specify `width` and `height` to prevent layout shift.
- Use `priority` for above-the-fold images.
- Leverage automatic lazy loading and format optimization.

```typescript
// ✅ Correct
import Image from "next/image";

export function CurrencyFlag({ code }: { code: string }) {
  return (
    <Image
      src={`/flags/${code}.svg`}
      alt={`${code} flag`}
      width={24}
      height={24}
      priority={false}
    />
  );
}

// ❌ Avoid: Using plain img tag
export function BadFlag({ code }: { code: string }) {
  return <img src={`/flags/${code}.svg`} alt={code} />;
}
```

## 6. Environment Variables

### Configuration Management

- Store API endpoints, keys, and secrets in `.env.local` (never commit).
- Use `.env` for defaults and `.env.local` for local overrides.
- Prefix client-side variables with `NEXT_PUBLIC_`.
- Server-side variables have no prefix.

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
SECRET_API_KEY=your-secret-key
DATABASE_URL=postgresql://...
```

```typescript
// ✅ Correct: Using environment variables
const publicUrl = process.env.NEXT_PUBLIC_API_URL;
const secretKey = process.env.SECRET_API_KEY; // Only in server components/routes

// ❌ Avoid: Hardcoding URLs or exposing secrets
const apiUrl = "https://api.example.com"; // Hardcoded
const key = "secret-key-123"; // Exposed!
```

## 7. Middleware & Request Handling

### Next.js Middleware

- Use `middleware.ts` at the root of `/app` for global request processing.
- Validate and transform requests before they reach route handlers.
- Use for authentication, logging, or redirects.

```typescript
// app/middleware.ts
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Add request logging
  console.log(
    `[${new Date().toISOString()}] ${request.method} ${
      request.nextUrl.pathname
    }`
  );

  // Validate API requests
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Add headers, validate, etc.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
```

## 8. Performance Optimization

### Code Splitting & Dynamic Imports

- Use `dynamic()` for large components to split code.
- Load components on-demand, not upfront.

```typescript
// ✅ Correct: Dynamic import with loading state
import dynamic from "next/dynamic";

const ConversionHistory = dynamic(
  () => import("@/components/ConversionHistory"),
  { loading: () => <LoadingSpinner /> }
);

export default function Page() {
  return <ConversionHistory />;
}
```

### Memoization & React.memo

- Memoize expensive components and callbacks.
- Use `useCallback` for event handlers passed to child components.
- Use `useMemo` for expensive computations (use sparingly).

```typescript
// ✅ Correct: Memoized component and callback
"use client";

import { memo, useCallback } from "react";

const ConverterForm = memo(function ConverterForm({
  onConvert,
}: {
  onConvert: (amount: string) => void;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onConvert(e.target.value);
    },
    [onConvert]
  );

  return <input onChange={handleChange} />;
});

export default ConverterForm;
```

## 9. Error Handling

### Error Boundaries & Error Pages

- Create `error.tsx` in `/app` directories for component-level error handling.
- Use `global-error.tsx` for root-level errors.
- Always log errors with context for debugging.

```typescript
// app/error.tsx
"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div>
      <ErrorMessage message="Something went wrong" />
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## 10. Testing API Routes

### Testing Next.js Route Handlers

- Use Jest with `node` environment for API route tests.
- Mock external API calls.
- Test both success and error paths.

```typescript
// app/api/rates/route.test.ts
import { GET } from "./route";

jest.mock("@/utils/currency", () => ({
  fetchExchangeRates: jest.fn(),
}));

describe("GET /api/rates", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return exchange rates on success", async () => {
    const mockRates = { base: "USD", rates: { EUR: 0.85 } };
    (fetchExchangeRates as jest.Mock).mockResolvedValue(mockRates);

    const response = await GET(new Request("http://localhost:3000/api/rates"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockRates);
  });

  it("should return 503 when all APIs fail", async () => {
    (fetchExchangeRates as jest.Mock).mockRejectedValue(
      new Error("API failed")
    );

    const response = await GET(new Request("http://localhost:3000/api/rates"));

    expect(response.status).toBe(503);
  });
});
```

## 11. SSR Safety & Browser APIs

### Guarding Browser APIs

- Always check `typeof window !== 'undefined'` before accessing browser APIs.
- Use `useEffect` on the client side, not during render.
- Avoid localStorage access during server-side rendering.

```typescript
// ✅ Correct: Safe browser API access
"use client";

import { useEffect, useState } from "react";

export function useLocalStorage(key: string) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    // Only runs on client after hydration
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(key);
        setValue(stored);
      } catch (error) {
        console.error("Storage access failed:", error);
      }
    }
  }, [key]);

  return value;
}

// ❌ Avoid: Accessing window during render
export function BadComponent() {
  // This will fail on the server!
  const theme = window.localStorage.getItem("theme");
  return <div>{theme}</div>;
}
```

## 12. Metadata & SEO

### Head Metadata

- Use `metadata` object in server components for SEO.
- Generate dynamic metadata with `generateMetadata()`.

```typescript
// app/layout.tsx
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Converter",
  description: "Real-time currency conversion between 10 popular currencies",
  keywords: ["currency", "converter", "exchange rates"],
};

// app/page.tsx
import { type Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Currency Converter | Live Exchange Rates",
    description: "Convert currencies with real-time rates",
  };
}
```

## Summary Checklist

- ✅ Use App Router with `/app` structure
- ✅ Fetch data in server components or API routes
- ✅ Add `'use client'` only where needed (leaf components)
- ✅ Always use `{ scroll: false }` on `router.push()`
- ✅ Check `typeof window !== 'undefined'` before browser API access
- ✅ Use `next/image` for all images
- ✅ Environment variables prefixed correctly
- ✅ Implement proper error boundaries
- ✅ Test API routes thoroughly
- ✅ Memoize expensive components and callbacks
