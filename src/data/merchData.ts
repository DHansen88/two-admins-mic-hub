import mugImg from "@/assets/merch/mug.png";
import tshirtImg from "@/assets/merch/tshirt.png";
import hoodieImg from "@/assets/merch/hoodie.png";
import stickersImg from "@/assets/merch/stickers.png";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  approved: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  badge?: "Popular" | "New" | "Featured" | "";
  sizes?: string[];
  category: "apparel" | "accessories" | "stickers";
  stock: number;
  enabled: boolean;
  featured: boolean;
  paypalLink: string;
  reviewsEnabled: boolean;
  createdAt: string;
}

/* ── Default seed data ── */
const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    slug: "admin-energy-coffee-mug",
    name: "Admin Energy Coffee Mug",
    description: "Start your day with leadership energy. This premium ceramic mug keeps your coffee hot and your admin spirit high.",
    price: 18,
    images: [{ src: mugImg, alt: "Admin Energy Coffee Mug" }],
    badge: "Popular",
    category: "accessories",
    stock: 50,
    enabled: true,
    featured: false,
    paypalLink: "",
    reviewsEnabled: true,
    createdAt: "2025-09-01",
  },
  {
    id: "prod-002",
    slug: "behind-every-leader-tshirt",
    name: "Behind Every Leader T-Shirt",
    description: "A tribute to the administrative professionals who make things happen. Soft, comfortable, and built to last.",
    price: 28,
    images: [{ src: tshirtImg, alt: "Behind Every Leader T-Shirt" }],
    badge: "New",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    category: "apparel",
    stock: 30,
    enabled: true,
    featured: true,
    paypalLink: "",
    reviewsEnabled: true,
    createdAt: "2025-10-15",
  },
  {
    id: "prod-003",
    slug: "two-admins-hoodie",
    name: "Two Admins & a Mic Hoodie",
    description: "Stay cozy while running the show. Premium heavyweight hoodie with the podcast logo embroidered on the chest.",
    price: 45,
    images: [{ src: hoodieImg, alt: "Two Admins & a Mic Hoodie" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    category: "apparel",
    stock: 20,
    enabled: true,
    featured: false,
    paypalLink: "",
    reviewsEnabled: true,
    createdAt: "2025-10-20",
  },
  {
    id: "prod-004",
    slug: "podcast-logo-sticker-pack",
    name: "Podcast Logo Sticker Pack",
    description: "Decorate your laptop, notebook, or water bottle with these fun podcast-themed vinyl stickers.",
    price: 12,
    images: [{ src: stickersImg, alt: "Podcast Logo Sticker Pack" }],
    badge: "New",
    category: "stickers",
    stock: 100,
    enabled: true,
    featured: false,
    paypalLink: "",
    reviewsEnabled: true,
    createdAt: "2025-11-01",
  },
];

const SEED_REVIEWS: Review[] = [
  { id: "r1", productId: "prod-001", name: "Maria S.", rating: 5, text: "Love this mug! Perfect size and the design is so fun.", date: "2025-11-10", approved: true },
  { id: "r2", productId: "prod-001", name: "James T.", rating: 4, text: "Great quality ceramic. Keeps my coffee warm.", date: "2025-10-22", approved: true },
  { id: "r3", productId: "prod-001", name: "Priya K.", rating: 5, text: "Bought one for every admin on my team — they loved it!", date: "2025-09-15", approved: true },
  { id: "r4", productId: "prod-002", name: "Maria S.", rating: 5, text: "Super comfortable shirt and great message!", date: "2025-11-05", approved: true },
  { id: "r5", productId: "prod-002", name: "David L.", rating: 4, text: "Nice quality and fits perfectly.", date: "2025-10-18", approved: true },
  { id: "r6", productId: "prod-002", name: "Rachel W.", rating: 5, text: "The fabric is so soft. I've already ordered a second one!", date: "2025-09-28", approved: true },
  { id: "r7", productId: "prod-003", name: "Carlos M.", rating: 5, text: "Incredibly cozy and the logo looks awesome.", date: "2025-11-12", approved: true },
  { id: "r8", productId: "prod-003", name: "Linda B.", rating: 5, text: "Best hoodie I own. Heavyweight and warm.", date: "2025-10-30", approved: true },
  { id: "r9", productId: "prod-004", name: "Aisha N.", rating: 5, text: "So cute! They look great on my laptop.", date: "2025-11-01", approved: true },
  { id: "r10", productId: "prod-004", name: "Tom R.", rating: 4, text: "Good variety of stickers. Wish there were a few more.", date: "2025-10-14", approved: true },
  { id: "r11", productId: "prod-004", name: "Sophie G.", rating: 5, text: "Perfect little gift for podcast fans.", date: "2025-09-20", approved: true },
  { id: "r12", productId: "prod-004", name: "Mike H.", rating: 5, text: "Vibrant colors and great adhesive quality.", date: "2025-08-30", approved: true },
];

/* ── localStorage-backed reactive store ── */
const LS_PRODUCTS_KEY = "tam_merch_products";
const LS_REVIEWS_KEY = "tam_merch_reviews";

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED_PRODUCTS;
}

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LS_REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED_REVIEWS;
}

function saveProducts(products: Product[]) {
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
}

function saveReviews(reviews: Review[]) {
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(reviews));
}

/* ── Subscribers for React re-renders ── */
type Listener = () => void;
const productListeners: Set<Listener> = new Set();
const reviewListeners: Set<Listener> = new Set();

function notifyProducts() { productListeners.forEach((fn) => fn()); }
function notifyReviews() { reviewListeners.forEach((fn) => fn()); }

export function subscribeProducts(fn: Listener) {
  productListeners.add(fn);
  return () => { productListeners.delete(fn); };
}

export function subscribeReviews(fn: Listener) {
  reviewListeners.add(fn);
  return () => { reviewListeners.delete(fn); };
}

/* ── Product CRUD ── */
let _products = loadProducts();
let _enabledProductsCache: Product[] | null = null;

export function getProducts(): Product[] { return _products; }

export function getEnabledProducts(): Product[] {
  if (!_enabledProductsCache) {
    _enabledProductsCache = _products
      .filter((p) => p.enabled)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return _enabledProductsCache;
}

function invalidateEnabledCache() { _enabledProductsCache = null; }

export function getProductBySlug(slug: string): Product | undefined {
  return _products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return _products.find((p) => p.id === id);
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function addProduct(product: Omit<Product, "id" | "slug" | "createdAt">) {
  const newP: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    slug: slugify(product.name),
    createdAt: new Date().toISOString().split("T")[0],
  };
  _products = [..._products, newP];
  invalidateEnabledCache();
  saveProducts(_products);
  notifyProducts();
  return newP;
}

export function updateProduct(id: string, updates: Partial<Product>) {
  _products = _products.map((p) => (p.id === id ? { ...p, ...updates, slug: updates.name ? slugify(updates.name) : p.slug } : p));
  saveProducts(_products);
  notifyProducts();
}

export function deleteProduct(id: string) {
  _products = _products.filter((p) => p.id !== id);
  saveProducts(_products);
  notifyProducts();
  // Also remove associated reviews
  _reviews = _reviews.filter((r) => r.productId !== id);
  saveReviews(_reviews);
  notifyReviews();
}

/* ── Review CRUD ── */
let _reviews = loadReviews();

export function getReviews(): Review[] { return _reviews; }

export function getApprovedReviewsForProduct(productId: string): Review[] {
  return _reviews.filter((r) => r.productId === productId && r.approved);
}

export function getAllReviewsForProduct(productId: string): Review[] {
  return _reviews.filter((r) => r.productId === productId);
}

export function addReview(review: Omit<Review, "id" | "approved">) {
  const newR: Review = { ...review, id: `rev-${Date.now()}`, approved: true };
  _reviews = [newR, ..._reviews];
  saveReviews(_reviews);
  notifyReviews();
  return newR;
}

export function approveReview(id: string) {
  _reviews = _reviews.map((r) => (r.id === id ? { ...r, approved: true } : r));
  saveReviews(_reviews);
  notifyReviews();
}

export function deleteReview(id: string) {
  _reviews = _reviews.filter((r) => r.id !== id);
  saveReviews(_reviews);
  notifyReviews();
}

/* Compute average rating for a product */
export function getAvgRating(productId: string): { avg: number; count: number } {
  const approved = getApprovedReviewsForProduct(productId);
  if (approved.length === 0) return { avg: 0, count: 0 };
  const sum = approved.reduce((s, r) => s + r.rating, 0);
  return { avg: sum / approved.length, count: approved.length };
}
