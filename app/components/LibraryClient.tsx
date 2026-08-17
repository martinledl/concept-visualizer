"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Layers3,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { VisualizationMeta } from "../content/visualizations";

const filters = ["All", "Pipeline", "Rendering", "Visibility", "Images"];

export function LibraryClient({
  items,
}: {
  items: VisualizationMeta[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter =
        filter === "All" ||
        item.stage === filter ||
        (filter === "Pipeline" &&
          ["Pipeline", "Transform", "Clipping", "Culling"].includes(
            item.stage,
          ));
      const haystack = [
        item.title,
        item.summary,
        item.stage,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [filter, items, query]);

  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Visual Computing Fundamentals · Chapter 1</p>
          <h1 id="home-title">See the algorithm, not just the slide.</h1>
          <p className="hero-description">
            Build intuition by moving the geometry, changing the assumptions,
            and watching every stage respond.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/learn/rasterization">
              Open Rasterization Explorer
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a className="text-link" href="#library">
              Browse Chapter 1
            </a>
          </div>
          <div className="hero-meta" aria-label="Project qualities">
            <span>
              <Sparkles size={16} aria-hidden="true" /> Interactive by default
            </span>
            <span>
              <Layers3 size={16} aria-hidden="true" /> Lecture-grounded
            </span>
          </div>
        </div>
        <div className="pipeline-preview" aria-label="Graphics pipeline preview">
          <div className="preview-topline">
            <span>Pipeline preview</span>
            <span className="live-dot">Interactive lesson</span>
          </div>
          <div className="preview-stage-list">
            {[
              ["01", "Model", "Object vertices"],
              ["02", "Clip", "View volume"],
              ["03", "Raster", "Fragments"],
              ["04", "Depth", "Visibility"],
            ].map(([number, title, label], index) => (
              <div
                className={`preview-stage ${index === 2 ? "is-active" : ""}`}
                key={number}
              >
                <span className="preview-number">{number}</span>
                <span>
                  <strong>{title}</strong>
                  <small>{label}</small>
                </span>
                <span className="stage-node" aria-hidden="true" />
              </div>
            ))}
          </div>
          <div className="preview-grid" aria-hidden="true">
            <div className="preview-triangle" />
            {Array.from({ length: 42 }, (_, index) => (
              <span key={index} className={index % 5 === 0 ? "sample-hit" : ""} />
            ))}
          </div>
        </div>
      </section>

      <section className="library-section" id="library" aria-labelledby="library-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Growing concept library</p>
            <h2 id="library-title">Chapter 1</h2>
            <p>Graphics pipeline, raster images, buffers, and display timing.</p>
          </div>
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search concepts</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search concepts"
            />
          </label>
        </div>

        <div className="filter-row" aria-label="Filter concepts">
          {filters.map((item) => (
            <button
              className={filter === item ? "filter-chip is-active" : "filter-chip"}
              type="button"
              key={item}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="visualization-grid">
          {filteredItems.map((item) => {
            const content = (
              <>
                <div className="card-topline">
                  <span className="card-number">{item.number}</span>
                  <span
                    className={`status-pill status-${item.status}`}
                    aria-label={`Status: ${item.status}`}
                  >
                    {item.status === "available" ? "Ready" : "Planned"}
                  </span>
                </div>
                <div className="concept-card-copy">
                  <span className="concept-stage">{item.stage}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <div className="tag-row" aria-label="Topics">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="card-footer">
                  <span>
                    <Clock3 size={15} aria-hidden="true" /> {item.studyMinutes} min
                  </span>
                  <span>Slides {item.sourceSlides}</span>
                  {item.status === "available" && (
                    <ArrowRight size={18} aria-hidden="true" />
                  )}
                </div>
              </>
            );

            return item.status === "available" ? (
              <Link
                className="concept-card concept-card-available"
                href={`/learn/${item.slug}`}
                key={item.slug}
              >
                {content}
              </Link>
            ) : (
              <article className="concept-card" key={item.slug}>
                {content}
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <Search size={24} aria-hidden="true" />
            <h3>No matching concepts</h3>
            <p>Try another term or reset the topic filter.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setFilter("All");
                setQuery("");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
