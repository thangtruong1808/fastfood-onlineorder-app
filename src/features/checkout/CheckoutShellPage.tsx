import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import { Badge, Button, Card } from '@/components/ui';
import { calculateIncludedGST, formatAUD } from '@/lib/currency';

export default function CheckoutShellPage() {
  const navigate = useNavigate();
  const cartItems = useAppSelector((state) => state.cart.items);
  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const gst = calculateIncludedGST(subtotal);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge tone="amber">Phase 3 Route Shell</Badge>
          <h1 className="mt-1 font-display text-3xl font-extrabold">
            Melbourne Checkout &amp; Payment
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/menu')}
        >
          Back to Menu
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">
              Order Summary ({cartItems.length} line items)
            </h2>
            <p className="text-xs text-text-secondary">
              Subtotal: <strong>{formatAUD(subtotal)}</strong> (includes{' '}
              <strong>{formatAUD(gst)}</strong> 10% Australian GST)
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated/60 p-4 text-xs text-text-secondary flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-status-success shrink-0" />
          <span>
            Full fulfillment time-slot picker, address validation, dual-adapter{' '}
            <strong>Stripe Test Mode / Offline Card Simulator</strong>, and live order
            creation will be unlocked in <strong>Phase 3</strong>.
          </span>
        </div>
      </Card>
    </div>
  );
}
