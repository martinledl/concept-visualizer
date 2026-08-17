import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`site-header ${compact ? "site-header-compact" : ""}`}>
      <Link className="brand" href="/" aria-label="Concept Visualizer home">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>Concept Visualizer</span>
      </Link>
      <nav className="header-actions" aria-label="Main navigation">
        <Link className="header-link" href="/#library">
          <BookOpen size={18} aria-hidden="true" />
          <span>Library</span>
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
