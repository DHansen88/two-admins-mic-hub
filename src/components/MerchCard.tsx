import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "@/data/merchData";

interface MerchCardProps {
  product: Product;
}

const MerchCard = ({ product }: MerchCardProps) => {
  return (
    <Link
      to={`/merch/${product.slug}`}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent/40 block"
    >
      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute top-4 left-4 z-10 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            product.badge === "Popular"
              ? "bg-coral text-coral-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {product.badge}
        </span>
      )}

      {/* Image */}
      <div className="aspect-square bg-muted/30 overflow-hidden">
        <img
          src={product.images[0].src}
          alt={product.images[0].alt}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="p-5 space-y-2">
        <h3 className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-foreground">
            ${product.price}
          </span>
          <span className="text-sm font-medium text-accent group-hover:underline">
            View Item →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MerchCard;
