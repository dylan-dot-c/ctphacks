"use client";

import { useEffect, useState } from "react";

export function ApiStatus() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to reach backend"));
  }, []);

  return <p className="text-sm text-foreground/70">Backend says: {message}</p>;
}
