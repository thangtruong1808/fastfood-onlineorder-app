import { CheckCircle2, Clock, Flame, MapPin } from 'lucide-react';
import { useParams } from 'react-router';
import { Badge, Card } from '@/components/ui';

export default function TrackingShellPage() {
  const { orderId } = useParams();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge tone="success">Live Order Tracker Shell</Badge>
        <h1 className="mt-1 font-display text-3xl font-extrabold">
          Order #{orderId ?? 'SCB-8841'} • Preparing in Kitchen
        </h1>
        <p className="text-sm text-text-secondary">
          Animated 4-stage progress timeline (Received → Preparing → Ready/Out for
          Delivery → Completed) unlocks in Phase 3.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { label: 'Order Received', icon: CheckCircle2, active: true },
            { label: 'Flame Grilling', icon: Flame, active: true },
            { label: 'Ready / En Route', icon: Clock, active: false },
            { label: 'Completed', icon: MapPin, active: false },
          ].map((step) => (
            <div
              key={step.label}
              className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-elevated/50 p-3.5"
            >
              <step.icon
                className={
                  step.active ? 'h-5 w-5 text-brand-primary' : 'h-5 w-5 text-text-muted'
                }
              />
              <span className="text-xs font-bold">{step.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
