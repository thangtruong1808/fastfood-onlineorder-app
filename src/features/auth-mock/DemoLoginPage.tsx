import { CheckCircle2, ShieldCheck, Sparkles, User, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge, Button, Card } from '@/components/ui';
import { DEMO_PROFILES } from '@/data/promosSeed';
import { switchDemoRole } from '@/features/auth-mock/authSlice';
import type { UserRole } from '@/types';

export default function DemoLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const handleSelectPersona = (role: UserRole) => {
    dispatch(switchDemoRole(role));
    const profile = DEMO_PROFILES[role];
    toast.success(`Signed in as ${profile.name} (${role.toUpperCase()})`);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <div className="text-center space-y-2">
        <Badge tone="brand">1-Click Demo Role Switcher</Badge>
        <h1 className="font-display text-3xl font-extrabold">
          Choose Your Showcase Persona
        </h1>
        <p className="mx-auto max-w-xl text-sm text-text-secondary">
          Instantly switch between our loyal Melbourne Customer account and Regional Store
          Operations Admin to experience both sides of Southern Cross Burgers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(
          [
            {
              role: 'customer' as const,
              icon: Sparkles,
              badge: 'Southern Gold Member',
              desc: '1,420 Flame Points, saved Fitzroy & CBD addresses, order history & 1-click reorder.',
            },
            {
              role: 'admin' as const,
              icon: ShieldCheck,
              badge: 'Regional Ops Manager',
              desc: 'Full access to Recharts revenue analytics, hourly rush heatmaps & live kitchen orders.',
            },
            {
              role: 'guest' as const,
              icon: User,
              badge: 'First-Time Visitor',
              desc: 'Clean guest experience for demonstrating first-time Melbourne checkout flows.',
            },
          ] as const
        ).map(({ role, icon: Icon, badge, desc }) => {
          const profile = DEMO_PROFILES[role];
          const isCurrent = currentUser.role === role;
          return (
            <Card
              key={role}
              interactive
              onClick={() => handleSelectPersona(role)}
              className="flex flex-col justify-between p-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  {isCurrent && (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </Badge>
                  )}
                </div>
                <div>
                  <Badge tone="amber" className="mb-1.5">
                    {badge}
                  </Badge>
                  <h2 className="font-display text-lg font-bold">{profile.name}</h2>
                  <p className="text-xs text-text-muted">
                    {profile.email || 'No account required'}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">{desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-border-subtle">
                <Button
                  variant={isCurrent ? 'outline' : 'primary'}
                  size="sm"
                  className="w-full"
                  leftIcon={<UserCheck className="h-4 w-4" />}
                >
                  {isCurrent ? 'Currently Active' : `Switch to ${profile.name.split(' ')[0]}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
