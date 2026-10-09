export const deviceVisits = [
  { month: "Jan", desktop: 186, mobile: 80, tablet: 42 },
  { month: "Feb", desktop: 205, mobile: 104, tablet: 48 },
  { month: "Mar", desktop: 237, mobile: 120, tablet: 51 },
  { month: "Apr", desktop: 173, mobile: 190, tablet: 44 },
  { month: "May", desktop: 209, mobile: 130, tablet: 58 },
  { month: "Jun", desktop: 214, mobile: 140, tablet: 63 },
  { month: "Jul", desktop: 248, mobile: 162, tablet: 60 },
  { month: "Aug", desktop: 231, mobile: 178, tablet: 72 },
  { month: "Sep", desktop: 262, mobile: 191, tablet: 70 },
  { month: "Oct", desktop: 240, mobile: 205, tablet: 81 },
  { month: "Nov", desktop: 276, mobile: 214, tablet: 77 },
  { month: "Dec", desktop: 301, mobile: 236, tablet: 90 },
];

export const deviceVisitsNextPeriod = [
  { month: "Jan", desktop: 214, mobile: 121, tablet: 50 },
  { month: "Feb", desktop: 196, mobile: 140, tablet: 55 },
  { month: "Mar", desktop: 260, mobile: 152, tablet: 49 },
  { month: "Apr", desktop: 228, mobile: 171, tablet: 62 },
  { month: "May", desktop: 251, mobile: 166, tablet: 70 },
  { month: "Jun", desktop: 238, mobile: 194, tablet: 66 },
  { month: "Jul", desktop: 282, mobile: 205, tablet: 74 },
  { month: "Aug", desktop: 270, mobile: 230, tablet: 79 },
  { month: "Sep", desktop: 296, mobile: 222, tablet: 85 },
  { month: "Oct", desktop: 310, mobile: 248, tablet: 88 },
  { month: "Nov", desktop: 298, mobile: 262, tablet: 96 },
  { month: "Dec", desktop: 334, mobile: 281, tablet: 101 },
];

export const productLines = [
  { product: "Starter", revenue: 42, margin: 12 },
  { product: "Team", revenue: 68, margin: 21 },
  { product: "Business", revenue: 91, margin: 34 },
  { product: "Enterprise", revenue: 120, margin: 48 },
  { product: "Add-ons", revenue: 36, margin: -8 },
  { product: "Services", revenue: 54, margin: -14 },
  { product: "Training", revenue: 22, margin: 6 },
  { product: "Support", revenue: 47, margin: 15 },
];

export const channelRevenue = [
  { channel: "Organic search", direct: 186, partner: 64, paid: 92 },
  { channel: "Newsletter", direct: 132, partner: 41, paid: 18 },
  { channel: "Social", direct: 88, partner: 72, paid: 130 },
  { channel: "Referral", direct: 104, partner: 118, paid: 26 },
  { channel: "Events", direct: 56, partner: 94, paid: 48 },
];

export const browserShare = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  { browser: "Firefox", visitors: 187 },
  { browser: "Edge", visitors: 173 },
  { browser: "Other", visitors: 90 },
];

export const quarterlyGoals = [
  { goal: "Revenue", value: 82 },
  { goal: "Signups", value: 64 },
  { goal: "Retention", value: 91 },
];

const REGIONS = ["Europe", "Americas", "Asia"] as const;

export const serviceLatency = Array.from({ length: 40 }, (_, index) => {
  const region = REGIONS[index % REGIONS.length] ?? "Europe";
  const wave = Math.sin(index * 1.7) * 0.5 + 0.5;
  const latency = 40 + ((index * 37) % 160) + (region === "Asia" ? 30 : 0);
  return {
    latency,
    throughput: Math.round(1200 - latency * 4 + wave * 260),
    size: 4 + ((index * 13) % 24),
    region,
  };
});

function dailySeries(seed: number, trend: number) {
  return Array.from({ length: 14 }, (_, index) => ({
    day: `Day ${index + 1}`,
    value: Math.round(100 + trend * index + Math.sin(index * 0.9 + seed) * 14),
  }));
}

export const kpiSeries = {
  revenue: dailySeries(1, 4),
  sessions: dailySeries(2.4, 2),
  churn: dailySeries(4.1, -1.5),
};

export const forecastRevenue = [
  { month: "Jan", actual: 120, forecast: null },
  { month: "Feb", actual: 132, forecast: null },
  { month: "Mar", actual: 128, forecast: null },
  { month: "Apr", actual: 146, forecast: null },
  { month: "May", actual: 158, forecast: null },
  { month: "Jun", actual: 151, forecast: null },
  { month: "Jul", actual: 170, forecast: null },
  { month: "Aug", actual: 182, forecast: 182 },
  { month: "Sep", actual: null, forecast: 190 },
  { month: "Oct", actual: null, forecast: 204 },
  { month: "Nov", actual: null, forecast: 212 },
  { month: "Dec", actual: null, forecast: 230 },
];

export const plannedHeadcount = [
  { team: "Design", hired: 6, planned: 3 },
  { team: "Engineering", hired: 18, planned: 7 },
  { team: "Sales", hired: 9, planned: 5 },
  { team: "Support", hired: 7, planned: 2 },
];
