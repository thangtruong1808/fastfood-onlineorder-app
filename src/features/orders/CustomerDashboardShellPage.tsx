import { Award, Heart, MapPin, RotateCcw } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Badge, Card } from '@/components/ui';

export default function CustomerDashboardShellPage() {
  const { currentUser, favoriteItemIds } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge tone="amber">{currentUser.loyaltyTier} Member</Badge>
          <h1 className="mt-1 font-display text-3xl font-extrabold">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-text-secondary">
            Customer Dashboard &amp; Southern Cross Loyalty Hub (Full interactive 1-click
            reorder &amp; tier progress unlock in Phase 4).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase">
            <Award className="h-4 w-4" />
            <span>Flame Rewards Balance</span>
          </div>
          <p className="font-display text-2xl font-extrabold">
            {currentUser.loyaltyPoints.toLocaleString()} pts
          </p>
          <p className="text-xs text-text-secondary">Tier: {currentUser.loyaltyTier}</p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 text-brand-secondary text-xs font-bold uppercase">
            <Heart className="h-4 w-4" />
            <span>Saved Melbourne Favorites</span>
          </div>
          <p className="font-display text-2xl font-extrabold">{favoriteItemIds.length}</p>
          <p className="text-xs text-text-secondary">Persisted in localStorage</p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center gap-2 text-status-success text-xs font-bold uppercase">
            <MapPin className="h-4 w-4" />
            <span>Saved Delivery Addresses</span>
          </div>
          <p className="font-display text-2xl font-extrabold">
            {currentUser.savedAddresses.length}
          </p>
          <p className="text-xs text-text-secondary">
            <RotateCcw className="inline h-3 w-3 mr-1" />
            1-Click Reorder ready in Phase 4
          </p>
        </Card>
      </div>
    </div>
  );
}
