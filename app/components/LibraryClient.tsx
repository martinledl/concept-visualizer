"use client";

import {
  AudioWaveform,
  ArrowRight,
  BookOpen,
  Clock3,
  Compass,
  Grid3X3,
  Layers3,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { VisualizationMeta } from "../content/visualizations";
import { sitePath } from "../lib/site-path";

const topicIcons = {
  "Pipeline & Coordinates": Compass,
  "Rasterization & Visibility": Grid3X3,
  "Images & Display": Layers3,
  "Geometry & Models": BookOpen,
  "Signals & Sampling": Radio,
  "Systems & Filters": SlidersHorizontal,
  "Frequency Analysis": AudioWaveform,
};

const fieldDescriptions = {
  "Computer Graphics": "How models, geometry, pixels, memory, and displays work together to form images.",
  "Signal Processing": "How continuous phenomena become samples, filtered outputs, and frequency representations.",
};

export function LibraryClient({ items }: { items: VisualizationMeta[] }) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("All fields");
  const [topic, setTopic] = useState("All topics");
  const fields = useMemo(
    () => ["All fields", ...Array.from(new Set(items.map((item) => item.field)))],
    [items],
  );
  const topics = useMemo(
    () => ["All topics", ...Array.from(new Set(items.filter((item) => field === "All fields" || item.field === field).map((item) => item.topic)))],
    [field, items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [item.title, item.summary, item.field, item.topic, ...item.tags]
        .join(" ")
        .toLowerCase();
      return (
        (field === "All fields" || item.field === field) &&
        (topic === "All topics" || item.topic === topic) &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [field, items, query, topic]);

  const groupedItems = useMemo(() => Array.from(new Set(filteredItems.map((item) => item.field))).map((groupField) => ({
    field: groupField,
    items: filteredItems.filter((item) => item.field === groupField),
  })), [filteredItems]);

  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Interactive explanations for difficult ideas</p>
          <h1 id="home-title">Build intuition by changing the system.</h1>
          <p className="hero-description">
            Manipulate the variables, follow the consequences, and turn abstract
            concepts into something you can see and test.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#catalogue">
              Explore the catalogue
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="text-link" href={sitePath("/learn/rasterization/")}>
              Try a lesson
            </a>
          </div>
          <div className="hero-meta" aria-label="Project qualities">
            <span><Sparkles size={16} aria-hidden="true" /> Learn by manipulating</span>
            <span><Layers3 size={16} aria-hidden="true" /> Open-source and growing</span>
          </div>
        </div>

        <div className="concept-atlas" aria-label="Interactive concept map preview">
          <div className="atlas-topline">
            <span>Concept atlas</span>
            <span className="live-dot">{items.length} interactive lessons</span>
          </div>
          <div className="atlas-canvas" aria-hidden="true">
            <span className="atlas-line atlas-line-a" />
            <span className="atlas-line atlas-line-b" />
            <span className="atlas-line atlas-line-c" />
            <div className="atlas-node atlas-node-model"><small>Input</small><strong>Model</strong></div>
            <div className="atlas-node atlas-node-transform"><small>Space</small><strong>Transform</strong></div>
            <div className="atlas-node atlas-node-raster"><small>Sample</small><strong>Rasterize</strong></div>
            <div className="atlas-node atlas-node-image"><small>Output</small><strong>Image</strong></div>
            <div className="atlas-pixel-field">
              {Array.from({ length: 48 }, (_, index) => (
                <span key={index} className={index % 7 === 0 || index % 11 === 0 ? "is-lit" : ""} />
              ))}
              <i />
            </div>
          </div>
          <div className="atlas-caption">
            <span>Follow one example from input to image</span>
            <span>Change a value and inspect the result</span>
          </div>
        </div>
      </section>

      <section className="catalogue-section" id="catalogue" aria-labelledby="catalogue-title">
        <div className="catalogue-intro">
          <div>
            <p className="eyebrow">The catalogue</p>
            <h2 id="catalogue-title">Choose a concept. Start experimenting.</h2>
            <p>Browse by field, narrow by topic, or search for the idea you are trying to understand.</p>
          </div>
          <div className="catalogue-stat" aria-label={`${items.length} interactive lessons`}>
            <strong>{String(items.length).padStart(2, "0")}</strong>
            <span>interactive<br />lessons</span>
          </div>
        </div>

        <div className="catalogue-tools">
          <div className="field-tabs" aria-label="Filter by field">
            {fields.map((item) => (
              <button
                type="button"
                key={item}
                className={field === item ? "field-tab is-active" : "field-tab"}
                onClick={() => { setField(item); setTopic("All topics"); }}
                aria-pressed={field === item}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="topic-tabs" aria-label="Filter by topic">
            {topics.map((item) => (
              <button
                type="button"
                key={item}
                className={topic === item ? "topic-tab is-active" : "topic-tab"}
                onClick={() => setTopic(item)}
                aria-pressed={topic === item}
              >
                {item}
              </button>
            ))}
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

        {groupedItems.map((group, groupIndex) => <section className="catalogue-field" key={group.field} aria-labelledby={`field-${groupIndex}`}>
          <div className="field-heading">
            <span className="field-index">{String(groupIndex + 1).padStart(2, "0")}</span>
            <div><span>Field</span><h3 id={`field-${groupIndex}`}>{group.field}</h3></div>
            <p>{fieldDescriptions[group.field as keyof typeof fieldDescriptions]}</p>
          </div>
          <div className="concept-list">
            {group.items.map((item) => {
              const TopicIcon = topicIcons[item.topic as keyof typeof topicIcons] ?? Compass;
              return (
                <a className="catalogue-card" href={sitePath(`/learn/${item.slug}/`)} key={item.slug}>
                  <div className="catalogue-card-index">{item.number}</div>
                  <div className="catalogue-card-icon"><TopicIcon size={20} aria-hidden="true" /></div>
                  <div className="catalogue-card-copy">
                    <span>{item.topic}</span>
                    <h4>{item.shortTitle}</h4>
                    <p>{item.summary}</p>
                  </div>
                  <div className="catalogue-card-meta">
                    <span><Clock3 size={14} aria-hidden="true" /> {item.studyMinutes} min</span>
                    <span>{item.difficulty}</span>
                    <span>{item.interaction}</span>
                  </div>
                  <ArrowRight className="catalogue-card-arrow" size={20} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </section>)}

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <Search size={24} aria-hidden="true" />
            <h3>No matching concepts</h3>
            <p>Try another term or reset the topic filter.</p>
            <button className="secondary-button" type="button" onClick={() => { setField("All fields"); setTopic("All topics"); setQuery(""); }}>
              Reset filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
