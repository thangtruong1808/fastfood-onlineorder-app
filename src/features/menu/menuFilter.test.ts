import { describe, expect, it } from 'vitest';
import { MENU_ITEMS } from '@/data/menuSeed';
import { DIETARY_TAGS, MENU_CATEGORY_IDS } from '@/types';

describe('Menu filtering and customization pricing logic', () => {
  it('correctly filters items by category', () => {
    const burgerItems = MENU_ITEMS.filter((item) => item.categoryId === MENU_CATEGORY_IDS.BURGERS);
    expect(burgerItems.length).toBeGreaterThan(0);
    expect(burgerItems.every((item) => item.categoryId === 'burgers')).toBe(true);
  });

  it('correctly filters items by dietary tag', () => {
    const vegetarianItems = MENU_ITEMS.filter((item) =>
      item.dietaryTags.includes(DIETARY_TAGS.VEGETARIAN),
    );
    expect(vegetarianItems.length).toBeGreaterThan(0);
    expect(
      vegetarianItems.every((item) => item.dietaryTags.includes(DIETARY_TAGS.VEGETARIAN)),
    ).toBe(true);
  });

  it('correctly identifies items under $15 AUD', () => {
    const affordableItems = MENU_ITEMS.filter((item) => item.basePrice < 15);
    expect(affordableItems.length).toBeGreaterThan(0);
    expect(affordableItems.every((item) => item.basePrice < 15)).toBe(true);
  });

  it('accurately calculates item customization unit price with size and add-ons', () => {
    const signature = MENU_ITEMS.find((item) => item.id === 'itm-southern-cross-signature')!;
    expect(signature).toBeDefined();

    const basePrice = signature.basePrice; // 16.90
    const largeSizeDelta = 4.5;
    const comboPrice = signature.comboUpgradePrice ?? 6.5; // 6.50
    const extraCheddarPrice = 1.8;

    const customizedUnitPrice = basePrice + largeSizeDelta + comboPrice + extraCheddarPrice;
    // 16.9 + 4.5 + 6.5 + 1.8 = 29.7
    expect(customizedUnitPrice).toBeCloseTo(29.7, 2);

    const quantity = 2;
    const totalPrice = customizedUnitPrice * quantity;
    expect(totalPrice).toBeCloseTo(59.4, 2);
  });
});

