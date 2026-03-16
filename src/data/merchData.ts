import mugImg from "@/assets/merch/mug.png";
import tshirtImg from "@/assets/merch/tshirt.png";
import hoodieImg from "@/assets/merch/hoodie.png";
import stickersImg from "@/assets/merch/stickers.png";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  images: ProductImage[];
  badge?: "Popular" | "New";
  sizes?: string[];
  category: "apparel" | "accessories" | "stickers";
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
}

export const allProducts: Product[] = [
  {
    id: "prod-001",
    slug: "admin-energy-coffee-mug",
    name: "Admin Energy Coffee Mug",
    description: "Start your day with leadership energy. This premium ceramic mug keeps your coffee hot and your admin spirit high.",
    price: 18,
    images: [{ src: mugImg, alt: "Admin Energy Coffee Mug" }],
    badge: "Popular",
    category: "accessories",
    rating: 4.8,
    reviewCount: 42,
    inStock: true,
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
    rating: 4.9,
    reviewCount: 27,
    inStock: true,
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
    rating: 5.0,
    reviewCount: 15,
    inStock: true,
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
    rating: 4.7,
    reviewCount: 63,
    inStock: true,
  },
];

export const getProductBySlug = (slug: string): Product | undefined =>
  allProducts.find((p) => p.slug === slug);
