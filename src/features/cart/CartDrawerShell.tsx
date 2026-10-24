import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { setCartDrawerOpen } from '@/features/cart/cartSlice';
import { calculateIncludedGST, formatAUD } from '@/lib/currency';

export function CartDrawerShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isCartDrawerOpen } = useAppSelector((state) => state.cart);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const includedGst = calculateIncludedGST(subtotal);

  return (
    <Drawer
      open={isCartDrawerOpen}
      onOpenChange={(open) => dispatch(setCartDrawerOpen(open))}
      title="Your Southern Cross Bag"
      subtitle="AUD ($) pricing • Includes 10% Australian GST"
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-text-primary">
                  {formatAUD(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Includes 10% GST</span>
                <span>{formatAUD(includedGst)}</span>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => {
                dispatch(setCartDrawerOpen(false));
                navigate('/checkout');
              }}
            >
              Proceed to Checkout • {formatAUD(subtotal)}
            </Button>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="Your order bag is empty"
          description="Explore our flame-grilled Gippsland beef burgers, crispy free-range chicken, and rosemary sea-salt chips."
          actionLabel="Browse Melbourne Menu"
          onAction={() => {
            dispatch(setCartDrawerOpen(false));
            navigate('/menu');
          }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-bg-elevated/50 p-3"
            >
              <div>
                <p className="font-semibold text-sm text-text-primary">{item.name}</p>
                <p className="text-xs text-text-secondary">
                  Qty: {item.quantity} • {item.customization.sizeLabel}
                </p>
              </div>
              <span className="text-sm font-bold text-text-primary">
                {formatAUD(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
