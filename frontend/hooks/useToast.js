"use client";

import { useState } from "react";

export function useToast(duration = 3000) {
  const [message, setMessage] = useState(null);

  const show = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, duration);
  };

  return { message, show };
}

export default useToast;
