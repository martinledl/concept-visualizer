type Series = {
  values: number[];
  label: string;
  tone?: "primary" | "coral" | "muted" | "success";
  stems?: boolean;
  dashed?: boolean;
};

export function SignalPlot({
  series,
  label,
  height = 220,
  highlightIndex,
  yMin,
  yMax,
}: {
  series: Series[];
  label: string;
  height?: number;
  highlightIndex?: number;
  yMin?: number;
  yMax?: number;
}) {
  const width = 720;
  const padding = { left: 42, right: 18, top: 18, bottom: 30 };
  const values = series.flatMap((item) => item.values);
  const low = yMin ?? Math.min(-0.1, ...values);
  const high = yMax ?? Math.max(0.1, ...values);
  const x = (index: number, count: number) => Number((padding.left + index * (width - padding.left - padding.right) / Math.max(1, count - 1)).toFixed(3));
  const y = (value: number) => Number((padding.top + (high - value) * (height - padding.top - padding.bottom) / (high - low || 1)).toFixed(3));
  const zeroY = y(Math.min(high, Math.max(low, 0)));

  return (
    <svg className="signal-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <line className="signal-axis" x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} />
      <line className="signal-axis" x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} />
      {[0, 0.25, 0.5, 0.75, 1].map((position) => (
        <line key={position} className="signal-grid-line" x1={padding.left + position * (width - padding.left - padding.right)} y1={padding.top} x2={padding.left + position * (width - padding.left - padding.right)} y2={height - padding.bottom} />
      ))}
      {series.map((item) => {
        const tone = item.tone ?? "primary";
        if (item.stems) {
          return <g key={item.label} className={`signal-series tone-${tone}`} aria-label={item.label}>
            {item.values.map((value, index) => <g key={index} className={index === highlightIndex ? "is-highlighted" : ""}><line className="signal-stem" x1={x(index, item.values.length)} y1={zeroY} x2={x(index, item.values.length)} y2={y(value)} /><circle className="signal-point" cx={x(index, item.values.length)} cy={y(value)} r={index === highlightIndex ? 5 : 3.5} /></g>)}
          </g>;
        }
        const points = item.values.map((value, index) => `${x(index, item.values.length)},${y(value)}`).join(" ");
        return <polyline key={item.label} className={`signal-line tone-${tone} ${item.dashed ? "is-dashed" : ""}`} points={points} aria-label={item.label} />;
      })}
      <text className="signal-axis-label" x={padding.left} y={height - 9}>0</text>
      <text className="signal-axis-label" x={width - padding.right} y={height - 9} textAnchor="end">n / time</text>
    </svg>
  );
}

export function SpectrumBars({
  values,
  label,
  highlightIndex,
  height = 220,
}: {
  values: number[];
  label: string;
  highlightIndex?: number;
  height?: number;
}) {
  const width = 720;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 30;
  const maximum = Math.max(0.001, ...values);
  const plotWidth = width - left - right;
  const barWidth = plotWidth / Math.max(values.length, 1);
  return <svg className="signal-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    <line className="signal-axis" x1={left} y1={height - bottom} x2={width - right} y2={height - bottom} />
    <line className="signal-axis" x1={left} y1={top} x2={left} y2={height - bottom} />
    {values.map((value, index) => {
      const barHeight = Number((value / maximum * (height - top - bottom)).toFixed(3));
      return <rect key={index} className={index === highlightIndex ? "spectrum-bar is-highlighted" : "spectrum-bar"} x={Number((left + index * barWidth + 1).toFixed(3))} y={Number((height - bottom - barHeight).toFixed(3))} width={Number(Math.max(1, barWidth - 2).toFixed(3))} height={barHeight} />;
    })}
    <text className="signal-axis-label" x={left} y={height - 9}>0</text>
    <text className="signal-axis-label" x={width - right} y={height - 9} textAnchor="end">frequency bin</text>
  </svg>;
}
