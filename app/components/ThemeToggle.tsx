"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribeToTheme(callback: () => void) {
  window.addEventListener("concept-theme-change", callback);
  return () => window.removeEventListener("concept-theme-change", callback);
}

function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerTheme() {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  function toggleTheme() {
    const root = document.documentElement;
    const current = root.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("concept-visualizer-theme", next);
    window.dispatchEvent(new Event("concept-theme-change"));
  }

  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="theme-icon theme-icon-light" aria-hidden="true" />
      <Moon className="theme-icon theme-icon-dark" aria-hidden="true" />
    </button>
  );
}
