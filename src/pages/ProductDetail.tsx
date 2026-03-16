import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductBySlug } from "@/data/merchData";
import { Button } from "@/components/ui/button";
import { Star, Minus, Plus, ChevronLeft, ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = getProductBySlug(slug || "");

  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.sizes?.[2] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Product Not Found
            </h1>
            <Link to="/merch" className="text-accent hover:underline">
              ← Back to Merch
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePurchase = () => {
    setPurchasing(true);
    // PayPal integration placeholder — redirect to thank-you for now
    setTimeout(() => {
      navigate("/merch/thank-you");
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              <Link
                to="/merch"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-8 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Merch
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted/20 rounded-2xl overflow-hidden border border-border">
                    <img
                      src={product.images[0].src}
                      alt={product.images[0].alt}
                      className="w-full h-full object-contain p-8"
                    />
                  </div>
                  {/* Thumbnail strip — ready for multiple images */}
                  {product.images.length > 1 && (
                    <div className="flex gap-3">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          className="w-20 h-20 rounded-lg border-2 border-accent overflow-hidden"
                        >
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-contain p-2"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {product.badge && (
                    <span
                      className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        product.badge === "Popular"
                          ? "bg-coral text-coral-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}

                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(product.rating!)
                                ? "fill-amber-400 text-amber-400"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-2xl font-bold text-foreground">
                    ${product.price}
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* Size Selector */}
                  {product.sizes && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all min-w-[48px] ${
                              selectedSize === size
                                ? "bg-accent text-accent-foreground border-accent"
                                : "bg-card text-foreground border-border hover:border-accent/50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      Quantity
                    </label>
                    <div className="inline-flex items-center border border-border rounded-md h-9">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 h-full hover:bg-muted/60 transition-colors rounded-l-md"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 h-full flex items-center text-sm font-medium min-w-[40px] justify-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2.5 h-full hover:bg-muted/60 transition-colors rounded-r-md"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="space-y-3 pt-2">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                      onClick={handlePurchase}
                      disabled={purchasing || (!!product.sizes && !selectedSize)}
                    >
                      {purchasing ? (
                        <span className="flex items-center gap-2">
                          <span className="h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Purchase — ${(product.price * quantity).toFixed(2)}
                        </span>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout powered by PayPal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
