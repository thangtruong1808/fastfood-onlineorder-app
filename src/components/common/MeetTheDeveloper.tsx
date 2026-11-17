import { Mail, Phone } from 'lucide-react';

export function MeetTheDeveloper() {
  return (
    <section aria-labelledby="developer-heading" className="scroll-mt-24">
      <div className="flex flex-col gap-5 rounded-3xl border border-border-subtle bg-bg-surface p-5 shadow-card sm:flex-row sm:items-start sm:gap-6 sm:p-6">
        <img
          src="/thang-truong.jpg"
          alt="Thang Truong, the developer of Southern Cross Burgers"
          width={555}
          height={537}
          className="h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-32"
        />

        <div className="min-w-0 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
            Meet the developer
          </p>
          <h2
            id="developer-heading"
            className="font-display text-2xl font-bold tracking-tight text-text-primary"
          >
            Thang Truong
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
            <p>
              Thang built Southern Cross Burgers to show a complete Melbourne fast-food
              order in the browser. Guests pick a kitchen, customise a burger, and see the
              Australian GST breakdown before they pay. The same interface covers live order
              tracking, a rewards dashboard, an iPad point of sale, and a kitchen admin view.
            </p>
            <p>
              React 19, Vite, and Tailwind draw the interface. Redux Toolkit keeps the cart,
              orders, and selected store in sync. Checkout uses a mock payment adapter, so a
              reviewer can walk through an approved card, a 3-D Secure challenge, and a
              declined card without a live Stripe account.
            </p>
          </div>
          <ul className="flex flex-col gap-2 pt-1 text-sm font-semibold sm:flex-row sm:flex-wrap sm:gap-x-5">
            <li>
              <a
                href="mailto:thangtruong180@gmail.com"
                className="inline-flex items-center gap-2 text-brand-primary hover:underline"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                thangtruong1808@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+61466828649"
                className="inline-flex items-center gap-2 text-brand-primary hover:underline"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                0466 828 649
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
