import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, MousePointerClick, Users, Eye, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AnalyticsPreviewUnavailable,
  fetchAnalyticsReport,
  toCsv,
  type AnalyticsReport,
  type AnalyticsRow,
} from "@/lib/analytics-report";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const RANGES = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

const num = (value: unknown) => Number(value ?? 0).toLocaleString();

const StatCard = ({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <span className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold">{value.toLocaleString()}</p>
      </div>
    </div>
  </Card>
);

const DataTable = ({
  title,
  rows,
  valueKey,
  valueHeader,
  showHref,
}: {
  title: string;
  rows: AnalyticsRow[];
  valueKey: keyof AnalyticsRow;
  valueHeader: string;
  showHref?: boolean;
}) => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display font-semibold">{title}</h2>
      {rows.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const csv = toCsv(rows, [
              { key: "label", header: "Label" },
              ...(showHref ? [{ key: "href" as const, header: "URL" }] : []),
              { key: valueKey, header: valueHeader },
              { key: "visitors", header: "Visitors" },
            ]);
            const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          CSV
        </Button>
      )}
    </div>

    {rows.length === 0 ? (
      <p className="text-sm text-muted-foreground">No data for this period yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">Item</th>
              <th className="py-2 px-3 font-medium text-right whitespace-nowrap">{valueHeader}</th>
              <th className="py-2 pl-3 font-medium text-right whitespace-nowrap">Visitors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.label}-${index}`} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-3">
                  <span className="font-medium break-all">{row.label}</span>
                  {showHref && row.href ? (
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-xs text-muted-foreground hover:text-primary break-all"
                    >
                      <ExternalLink className="h-3 w-3 mr-1 shrink-0" />
                      {row.href}
                    </a>
                  ) : null}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">{num(row[valueKey])}</td>
                <td className="py-2 pl-3 text-right tabular-nums">{num(row.visitors)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

const SiteAnalytics = () => {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOnly, setPreviewOnly] = useState(false);

  const load = async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalyticsReport(range);
      setReport(data);
      setPreviewOnly(false);
    } catch (e) {
      setReport(null);
      if (e instanceof AnalyticsPreviewUnavailable) {
        setPreviewOnly(true);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);
  }, [days]);

  const chartData = useMemo(
    () =>
      (report?.timeseries ?? []).map((point) => ({
        ...point,
        day: point.day?.slice(5) ?? point.day,
      })),
    [report],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Site Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymous first-party traffic and click data from your own database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {RANGES.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant={days === range.value ? "default" : "outline"}
              onClick={() => setDays(range.value)}
            >
              {range.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => load(days)} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {previewOnly && (
        <Card className="p-5 border-dashed">
          <p className="font-medium">Live site only</p>
          <p className="text-sm text-muted-foreground mt-1">
            Analytics runs on the PHP backend, which doesn't execute in this preview. Visit
            /admin/analytics on twoadminsandamic.com to see real numbers.
          </p>
        </Card>
      )}

      {error && (
        <Card className="p-5 border-destructive/40">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {loading && !report && !previewOnly && (
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Eye} label="Page views" value={report.totals.pageviews} />
            <StatCard icon={Users} label="Unique visitors" value={report.totals.visitors} />
            <StatCard icon={MousePointerClick} label="Clicks tracked" value={report.totals.clicks} />
            <StatCard icon={ExternalLink} label="Outbound clicks" value={report.totals.outbound} />
          </div>

          <Card className="p-5">
            <h2 className="font-display font-semibold mb-4">Activity over time</h2>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pageviews" name="Page views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clicks" name="Clicks" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="visitors" name="Visitors" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <DataTable title="Top Clicked Links" rows={report.top_links} valueKey="clicks" valueHeader="Clicks" showHref />
            <DataTable title="Top Pages" rows={report.top_pages} valueKey="views" valueHeader="Views" />
            <DataTable title="Top Episodes" rows={report.top_episodes} valueKey="views" valueHeader="Views" />
            <DataTable title="Top Referrers" rows={report.top_referrers} valueKey="visits" valueHeader="Visits" />
          </div>
        </>
      )}
    </div>
  );
};

export default SiteAnalytics;
