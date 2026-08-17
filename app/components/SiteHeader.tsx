import { BookOpen } from "lucide-react";
import { sitePath } from "../lib/site-path";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`site-header ${compact ? "site-header-compact" : ""}`}>
      <a className="brand" href={sitePath("/")} aria-label="Concept Visualizer home">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>Concept Visualizer</span>
      </a>
      <nav className="header-actions" aria-label="Main navigation">
        <a className="header-link" href={sitePath("/#catalogue")}>
          <BookOpen size={18} aria-hidden="true" />
          <span>Library</span>
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
