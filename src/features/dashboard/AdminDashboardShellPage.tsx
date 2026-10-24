import { Activity, BarChart3, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { formatAUD } from '@/lib/currency';

export default function AdminDashboardShellPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge tone="brand">Melbourne Regional Operations • Admin</Badge>
          <h1 className="mt-1 font-display text-3xl font-extrabold">
            Southern Cross Analytics &amp; Live Kitchen Feed
          </h1>
          <p className="text-sm text-text-secondary">
            Full Recharts visualizations (Sales AreaChart, Hourly Rush Bar/Heatmap,
            Category Donut, Pickup vs Delivery split &amp; Live Orders Table) unlock in
            Phase 4.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '7-Day Gross Revenue (AUD)', value: formatAUD(142890.5), delta: '+14.2%', icon: DollarSign },
          { label: 'Completed Melbourne Orders', value: '4,812', delta: '+9.8%', icon: ShoppingBag },
          { label: 'Average Order Value (AOV)', value: formatAUD(29.69), delta: '+4.1%', icon: TrendingUp },
          { label: 'Active Kitchens Online', value: '8 / 8', delta: '100% Uptime', icon: Activity },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
              <span>{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-brand-primary" />
            </div>
            <div className="font-display text-2xl font-extrabold text-text-primary">
              {kpi.value}
            </div>
            <Badge tone="success">{kpi.delta}</Badge>
          </Card>
        ))}
      </div>

      <Card className="p-6 flex items-center gap-3 text-sm text-text-secondary">
        <BarChart3 className="h-5 w-5 text-brand-primary shrink-0" />
        <span>
          Phase 4 will populate this dashboard with interactive Recharts visualizations,
          date-range filters, and a live-updating Melbourne Kitchen Orders table.
        </span>
      </Card>
    </div>
  );
}
