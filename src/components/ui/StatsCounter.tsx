import { useState, useEffect, useCallback } from "react";

interface PopularLanguage {
  language: string;
  count: number;
}

interface Stats {
  today: {
    date: string;
    totalEvents: number;
    extractions: number;
    avgProcessingTimeMs: number;
    avgTextLength: number;
    popularLanguages: PopularLanguage[];
  };
  allTime: {
    totalExtractions: number;
  };
}

interface StatsCounterProps {
  refreshIntervalMs?: number;
  className?: string;
  format?: "full" | "compact";
}

const STATS_ENDPOINT = "/api/stats";
const DEFAULT_REFRESH_MS = 30000;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function StatsCounter({
  refreshIntervalMs = DEFAULT_REFRESH_MS,
  className = "",
  format = "full",
}: StatsCounterProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(STATS_ENDPOINT, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Stats = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const id = setInterval(fetchStats, refreshIntervalMs);
    return () => clearInterval(id);
  }, [fetchStats, refreshIntervalMs]);

  if (loading && !stats) {
    return (
      <div className={`stats-counter stats-counter--loading ${className}`}>
        <span className="stats-counter__pulse" aria-hidden="true" />
        Loading stats...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={`stats-counter stats-counter--error ${className}`} role="alert">
        Stats unavailable
      </div>
    );
  }

  if (!stats) return null;

  const { today, allTime } = stats;

  if (format === "compact") {
    return (
      <div className={`stats-counter stats-counter--compact ${className}`}>
        <span className="stats-counter__number">{formatNumber(today.extractions)}</span>
        <span className="stats-counter__label"> texts extracted today</span>
      </div>
    );
  }

  return (
    <div className={`stats-counter ${className}`} aria-live="polite">
      <div className="stats-counter__today">
        <div className="stats-counter__metric">
          <span className="stats-counter__number">{formatNumber(today.extractions)}</span>
          <span className="stats-counter__label"> texts extracted today</span>
        </div>

        {today.popularLanguages.length > 0 && (
          <div className="stats-counter__languages">
            <span className="stats-counter__sublabel">Popular languages: </span>
            {today.popularLanguages.map((lang) => (
              <span key={lang.language} className="stats-counter__lang-badge">
                {lang.language} ({formatNumber(lang.count)})
              </span>
            ))}
          </div>
        )}

        {today.avgProcessingTimeMs > 0 && (
          <div className="stats-counter__perf">
            <span className="stats-counter__sublabel">Avg speed: </span>
            <span>{today.avgProcessingTimeMs}ms</span>
          </div>
        )}
      </div>

      <div className="stats-counter__alltime">
        <span className="stats-counter__number">{formatNumber(allTime.totalExtractions)}</span>
        <span className="stats-counter__label"> total extractions</span>
      </div>
    </div>
  );
}
