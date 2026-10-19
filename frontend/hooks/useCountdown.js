"use client";

import { useState, useEffect } from "react";

export function useCountdown(initialHours = 2, initialMinutes = 45, initialSeconds = 18) {
  const [timeLeft, setTimeLeft] = useState([initialHours, initialMinutes, initialSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(([h, m, s]) => {
        if (s > 0) return [h, m, s - 1];
        if (m > 0) return [h, 59, 59];
        if (h > 0) return [h - 1, 59, 59];
        return [2, 45, 0];
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

export default useCountdown;
