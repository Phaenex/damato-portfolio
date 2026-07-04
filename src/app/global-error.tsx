"use client";

import "./globals.css";

// Catches errors thrown in the root layout itself. Must render its own
// <html>/<body> because it replaces the entire document.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="global-error-body">
        <h1 className="global-error-title">Something went wrong.</h1>
        <p className="global-error-message">The page failed to load. Try reloading.</p>
        <button type="button" onClick={reset} className="global-error-button">
          Try again
        </button>
      </body>
    </html>
  );
}
