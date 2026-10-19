"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-sm animate-bounce">
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <span>{message}</span>
    </div>
  );
}
