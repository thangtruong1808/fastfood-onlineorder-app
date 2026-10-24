/**
 * Realistic Melbourne Fast-Food Analytics Seed Data — Mobile App
 * Copied from web seed data
 */

export interface DailySalesRecord {
  date: string;
  dayOfWeek: string;
  revenue: number; // AUD
  orders: number;
  aov: number; // AUD
}

export interface HourlyRushRecord {
  hour: string; // e.g. "12 PM"
  pickupOrders: number;
  deliveryOrders: number;
  totalOrders: number;
}

export interface CategoryShareRecord {
  name: string;
  percentage: number;
  revenue: number;
  color: string;
}

export interface TopSellingItemRecord {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growth: string;
}

export interface StoreKpiRecord {
  storeId: string;
  name: string;
  suburb: string;
  revenue: number;
  orders: number;
  avgPrepTimeMins: number;
  rating: number;
  status: 'optimal' | 'busy' | 'rush';
}

export const SALES_7D: DailySalesRecord[] = [
  { date: '18 Oct', dayOfWeek: 'Sat', revenue: 24890, orders: 812, aov: 30.65 },
  { date: '19 Oct', dayOfWeek: 'Sun', revenue: 26450, orders: 864, aov: 30.61 },
  { date: '20 Oct', dayOfWeek: 'Mon', revenue: 17200, orders: 602, aov: 28.57 },
  { date: '21 Oct', dayOfWeek: 'Tue', revenue: 18450, orders: 641, aov: 28.78 },
  { date: '22 Oct', dayOfWeek: 'Wed', revenue: 19800, orders: 678, aov: 29.20 },
  { date: '23 Oct', dayOfWeek: 'Thu', revenue: 22100, orders: 742, aov: 29.78 },
  { date: '24 Oct', dayOfWeek: 'Fri', revenue: 28540, orders: 928, aov: 30.75 },
];

export const SALES_30D: DailySalesRecord[] = [
  { date: 'Wk 1', dayOfWeek: 'Week 1', revenue: 142100, orders: 4810, aov: 29.54 },
  { date: 'Wk 2', dayOfWeek: 'Week 2', revenue: 148900, orders: 5012, aov: 29.71 },
  { date: 'Wk 3', dayOfWeek: 'Week 3', revenue: 154200, orders: 5120, aov: 30.12 },
  { date: 'Wk 4', dayOfWeek: 'Week 4', revenue: 162400, orders: 5325, aov: 30.49 },
];

export const SALES_90D: DailySalesRecord[] = [
  { date: 'Month 1', dayOfWeek: 'August', revenue: 580000, orders: 19400, aov: 29.89 },
  { date: 'Month 2', dayOfWeek: 'September', revenue: 615000, orders: 20450, aov: 30.07 },
  { date: 'Month 3', dayOfWeek: 'October', revenue: 655000, orders: 21600, aov: 30.32 },
];

export const HOURLY_RUSH_DATA: HourlyRushRecord[] = [
  { hour: '7 AM', pickupOrders: 28, deliveryOrders: 12, totalOrders: 40 },
  { hour: '8 AM', pickupOrders: 65, deliveryOrders: 24, totalOrders: 89 },
  { hour: '9 AM', pickupOrders: 82, deliveryOrders: 35, totalOrders: 117 },
  { hour: '10 AM', pickupOrders: 48, deliveryOrders: 30, totalOrders: 78 },
  { hour: '11 AM', pickupOrders: 74, deliveryOrders: 68, totalOrders: 142 },
  { hour: '12 PM', pickupOrders: 195, deliveryOrders: 165, totalOrders: 360 },
  { hour: '1 PM', pickupOrders: 180, deliveryOrders: 155, totalOrders: 335 },
  { hour: '2 PM', pickupOrders: 92, deliveryOrders: 75, totalOrders: 167 },
  { hour: '3 PM', pickupOrders: 45, deliveryOrders: 42, totalOrders: 87 },
  { hour: '4 PM', pickupOrders: 58, deliveryOrders: 64, totalOrders: 122 },
  { hour: '5 PM', pickupOrders: 112, deliveryOrders: 130, totalOrders: 242 },
  { hour: '6 PM', pickupOrders: 210, deliveryOrders: 245, totalOrders: 455 },
  { hour: '7 PM', pickupOrders: 235, deliveryOrders: 278, totalOrders: 513 },
  { hour: '8 PM', pickupOrders: 185, deliveryOrders: 215, totalOrders: 400 },
  { hour: '9 PM', pickupOrders: 140, deliveryOrders: 160, totalOrders: 300 },
  { hour: '10 PM', pickupOrders: 95, deliveryOrders: 115, totalOrders: 210 },
  { hour: '11 PM', pickupOrders: 62, deliveryOrders: 78, totalOrders: 140 },
  { hour: '12 AM', pickupOrders: 38, deliveryOrders: 45, totalOrders: 83 },
];

export const CATEGORY_SHARE_DATA: CategoryShareRecord[] = [
  { name: 'Burgers', percentage: 38, revenue: 59800, color: '#D9381E' },
  { name: 'Chicken', percentage: 22, revenue: 34600, color: '#D97706' },
  { name: 'Combos', percentage: 16, revenue: 25100, color: '#B91C1C' },
  { name: 'Sides', percentage: 11, revenue: 17300, color: '#EAB308' },
  { name: 'Drinks', percentage: 5, revenue: 7850, color: '#0284C7' },
  { name: 'Wraps', percentage: 4, revenue: 6290, color: '#15803D' },
  { name: 'Desserts', percentage: 2, revenue: 3140, color: '#9333EA' },
  { name: 'Breakfast', percentage: 2, revenue: 3140, color: '#EA580C' },
];

export const FULFILLMENT_SPLIT_DATA = [
  { name: 'Click & Collect (Pickup)', percentage: 46, value: 2420, color: '#D9381E' },
  { name: 'Melbourne Courier (Delivery)', percentage: 44, value: 2315, color: '#0284C7' },
  { name: 'Kitchen Kiosk / Dine-in', percentage: 10, value: 526, color: '#10B981' },
];

export const TOP_SELLING_ITEMS: TopSellingItemRecord[] = [
  {
    id: 'itm-southern-cross-signature',
    name: 'The Southern Cross Signature',
    category: 'Burgers',
    unitsSold: 2140,
    revenue: 36166,
    growth: '+18.4%',
  },
  {
    id: 'itm-chapel-hot-honey-chicken',
    name: 'Chapel St Hot Honey Crispy Chicken',
    category: 'Chicken',
    unitsSold: 1820,
    revenue: 28938,
    growth: '+24.1%',
  },
  {
    id: 'itm-rosemary-sea-salt-chips',
    name: 'Signature Rosemary & Murray Salt Chips',
    category: 'Sides',
    unitsSold: 3250,
    revenue: 21125,
    growth: '+11.2%',
  },
  {
    id: 'itm-yarra-valley-truffle',
    name: 'Yarra Valley Truffle & Swiss Melt',
    category: 'Burgers',
    unitsSold: 1190,
    revenue: 20825,
    growth: '+9.5%',
  },
  {
    id: 'itm-flinders-fiery-smash',
    name: 'Flinders Street Fiery Smash',
    category: 'Burgers',
    unitsSold: 1040,
    revenue: 17160,
    growth: '+14.8%',
  },
];

export const STORE_KPIS: StoreKpiRecord[] = [
  {
    storeId: 'melb-cbd-flinders',
    name: 'Flinders Quarter Flagship',
    suburb: 'Melbourne CBD',
    revenue: 41250,
    orders: 1340,
    avgPrepTimeMins: 6.8,
    rating: 4.9,
    status: 'optimal',
  },
  {
    storeId: 'melb-fitzroy-brunswick',
    name: 'Brunswick Street Kitchen',
    suburb: 'Fitzroy',
    revenue: 32400,
    orders: 1085,
    avgPrepTimeMins: 7.1,
    rating: 4.8,
    status: 'optimal',
  },
  {
    storeId: 'melb-south-yarra-chapel',
    name: 'Chapel Precinct Drive-Thru',
    suburb: 'South Yarra',
    revenue: 28900,
    orders: 940,
    avgPrepTimeMins: 8.4,
    rating: 4.7,
    status: 'busy',
  },
  {
    storeId: 'melb-st-kilda-esplanade',
    name: 'Bayside Esplanade',
    suburb: 'St Kilda',
    revenue: 24100,
    orders: 790,
    avgPrepTimeMins: 7.5,
    rating: 4.8,
    status: 'optimal',
  },
  {
    storeId: 'melb-carlton-lygon',
    name: 'Lygon Italian Quarter',
    suburb: 'Carlton',
    revenue: 21400,
    orders: 710,
    avgPrepTimeMins: 6.9,
    rating: 4.9,
    status: 'optimal',
  },
  {
    storeId: 'melb-richmond-swan',
    name: 'Swan Street Sports Kitchen',
    suburb: 'Richmond',
    revenue: 23600,
    orders: 765,
    avgPrepTimeMins: 7.9,
    rating: 4.8,
    status: 'busy',
  },
];

