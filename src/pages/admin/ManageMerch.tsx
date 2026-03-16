import { useState, useEffect, useSyncExternalStore } from "react";
import BlogBlockEditor from "@/components/BlogBlockEditor";
import { type ContentBlock } from "@/lib/block-types";
import {
  getProducts,
  getReviews,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteReview,
  approveReview,
  getAllReviewsForProduct,
  subscribeProducts,
  subscribeReviews,
  type Product,
  type Review,
} from "@/data/merchData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Package,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";

/* ── Hook to subscribe to store changes ── */
function useProducts() {
  return useSyncExternalStore(subscribeProducts, getProducts, getProducts);
}
function useReviews() {
  return useSyncExternalStore(subscribeReviews, getReviews, getReviews);
}

/* ── Blank product template ── */
const blankProduct = (): Omit<Product, "id" | "slug" | "createdAt"> => ({
  name: "",
  description: "",
  price: 0,
  images: [],
  badge: "",
  sizes: [],
  category: "accessories",
  stock: 0,
  enabled: true,
  featured: false,
  paypalLink: "",
  reviewsEnabled: true,
});

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const BADGE_OPTIONS: Product["badge"][] = ["", "New", "Popular", "Featured"];
const CATEGORY_OPTIONS: Product["category"][] = ["apparel", "accessories", "stickers"];

const ManageMerch = () => {
  const products = useProducts();
  const allReviews = useReviews();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blankProduct());
  const [imageUrl, setImageUrl] = useState("");
  const [reviewPanel, setReviewPanel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const startNew = () => {
    setForm(blankProduct());
    setEditing("new");
    setReviewPanel(null);
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      images: [...p.images],
      badge: p.badge || "",
      sizes: p.sizes ? [...p.sizes] : [],
      category: p.category,
      stock: p.stock,
      enabled: p.enabled,
      featured: p.featured,
      paypalLink: p.paypalLink,
      reviewsEnabled: p.reviewsEnabled,
    });
    setEditing(p.id);
    setReviewPanel(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing === "new") {
      addProduct(form);
    } else if (editing) {
      updateProduct(editing, form);
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product and all its reviews?")) {
      deleteProduct(id);
      if (editing === id) setEditing(null);
    }
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm((f) => ({
      ...f,
      images: [...f.images, { src: imageUrl.trim(), alt: f.name || "Product image" }],
    }));
    setImageUrl("");
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;
    setUploading(true);
    const remaining = 6 - form.images.length;
    const filesToProcess = fileArr.slice(0, remaining);
    let processed = 0;

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({
          ...f,
          images: [...f.images, { src: reader.result as string, alt: f.name || file.name }],
        }));
        processed++;
        if (processed === filesToProcess.length) setUploading(false);
      };
      reader.onerror = () => {
        processed++;
        if (processed === filesToProcess.length) setUploading(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (form.images.length >= 6) return;
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes?.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...(f.sizes || []), size],
    }));
  };

  const productReviews = reviewPanel
    ? getAllReviewsForProduct(reviewPanel)
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Merchandise
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} product{products.length !== 1 && "s"}
          </p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* ── Product Form ── */}
      {editing && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5 animate-fade-in">
          <h2 className="font-display font-bold text-lg">
            {editing === "new" ? "New Product" : "Edit Product"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Product Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price ($) *</label>
              <Input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Badge</label>
              <select
                value={form.badge || ""}
                onChange={(e) => setForm({ ...form, badge: e.target.value as Product["badge"] })}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b ?? "none"} value={b ?? ""}>{b || "None"}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Stock Quantity</label>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">PayPal Checkout Link</label>
              <Input value={form.paypalLink} onChange={(e) => setForm({ ...form, paypalLink: e.target.value })} placeholder="https://paypal.me/..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sizes (for apparel)</label>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.sizes?.includes(s)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              <ImageIcon className="inline h-4 w-4 mr-1" />
              Product Images
            </label>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative rounded-xl border-2 border-dashed p-4 transition-all ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/10"
              } ${form.images.length >= 6 ? "opacity-50 pointer-events-none" : ""}`}
            >
              {/* Thumbnails */}
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg border border-border overflow-hidden group">
                      <img src={img.src} alt={img.alt} className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-accent/80 text-[9px] text-accent-foreground text-center">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Drop prompt */}
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploading ? "Processing…" : "Drag & drop images here"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("product-image-upload")?.click()}
                    disabled={uploading || form.images.length >= 6}
                    className="gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Browse Files
                  </Button>
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex gap-1.5">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste URL"
                      className="h-8 w-44 text-xs"
                    />
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={addImage}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="product-image-upload"
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">First image is the primary. Up to 6 images. Drag & drop, browse, or paste a URL.</p>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.reviewsEnabled} onCheckedChange={(v) => setForm({ ...form, reviewsEnabled: v })} />
              Reviews enabled
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave}>Save Product</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Product List ── */}
      <div className="space-y-3">
        {products.map((p) => {
          const reviews = getAllReviewsForProduct(p.id);
          const showReviews = reviewPanel === p.id;
          return (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Thumb */}
                <div className="w-14 h-14 rounded-lg bg-muted/30 overflow-hidden shrink-0">
                  {p.images[0] ? (
                    <img src={p.images[0].src} alt={p.images[0].alt} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Package className="w-full h-full p-3 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                    {p.badge && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                        {p.badge}
                      </span>
                    )}
                    {!p.enabled && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-destructive/15 text-destructive">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${p.price} · Stock: {p.stock} · {reviews.length} review{reviews.length !== 1 && "s"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReviewPanel(showReviews ? null : p.id)}>
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Reviews panel */}
              {showReviews && (
                <div className="border-t border-border p-4 bg-muted/10 space-y-3 animate-fade-in">
                  <h4 className="text-sm font-semibold">Reviews ({reviews.length})</h4>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="flex items-start gap-3 text-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.name}</span>
                            <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                            {!r.approved && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span>
                            )}
                          </div>
                          <p className="text-muted-foreground">"{r.text}"</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!r.approved && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => approveReview(r.id)}>
                              Approve
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deleteReview(r.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageMerch;
