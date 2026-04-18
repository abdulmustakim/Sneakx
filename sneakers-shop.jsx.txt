import { useState, useEffect, useRef } from "react";

// ============================================================
// DATA — Products, Orders, Colors
// ============================================================
const INITIAL_PRODUCTS = [
  {
    id: 1, name: "Air Velocity Pro", brand: "Nike",
    price: 4999, originalPrice: 6499,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
             "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80"],
    colors: ["White/Red", "Black/Gold", "Blue/White"],
    sizes: [6,7,8,9,10,11,12],
    stock: 45, category: "Running",
    description: "Engineered for champions. The Air Velocity Pro delivers cushioned comfort with responsive energy return. Breathable mesh upper keeps your foot cool during intense workouts.",
    tags: ["running", "sport", "cushion"], featured: true,
  },
  {
    id: 2, name: "Retro Slam 90", brand: "Adidas",
    price: 5999, originalPrice: 7999,
    images: ["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80",
             "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=600&q=80"],
    colors: ["Classic White", "Triple Black", "Cream/Gum"],
    sizes: [6,7,8,9,10,11],
    stock: 28, category: "Lifestyle",
    description: "Street culture meets premium craftsmanship. The Retro Slam 90 features a classic silhouette updated with modern materials and a comfortable EVA midsole.",
    tags: ["lifestyle", "street", "retro"], featured: true,
  },
  {
    id: 3, name: "CloudRun Elite", brand: "Puma",
    price: 3499, originalPrice: 4499,
    images: ["https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80",
             "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80"],
    colors: ["Volt Yellow", "Neon Orange", "Arctic White"],
    sizes: [5,6,7,8,9,10,11,12],
    stock: 60, category: "Running",
    description: "Ultra-lightweight running shoe designed for speed. CloudRun Elite's proprietary foam technology absorbs impact while propelling you forward with every stride.",
    tags: ["running", "lightweight", "fast"], featured: false,
  },
  {
    id: 4, name: "Urban Force Hi", brand: "Converse",
    price: 2999, originalPrice: 3999,
    images: ["https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80",
             "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80"],
    colors: ["Classic Black", "Pure White", "Navy Blue"],
    sizes: [6,7,8,9,10,11],
    stock: 35, category: "Lifestyle",
    description: "The timeless high-top silhouette reinvented for modern street culture. Premium canvas upper with vulcanized rubber sole for all-day comfort.",
    tags: ["lifestyle", "high-top", "classic"], featured: false,
  },
  {
    id: 5, name: "Apex Boost X", brand: "New Balance",
    price: 6499, originalPrice: 8999,
    images: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
             "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"],
    colors: ["Grey/Navy", "White/Gold", "Black/Red"],
    sizes: [7,8,9,10,11,12],
    stock: 22, category: "Training",
    description: "Performance-first design for serious athletes. Apex Boost X features a full-length BOOST midsole for maximum energy return and a supportive upper for stability.",
    tags: ["training", "boost", "performance"], featured: true,
  },
  {
    id: 6, name: "Shadow Street Low", brand: "Vans",
    price: 2499, originalPrice: 3299,
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
             "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80"],
    colors: ["Checkerboard", "Solid Black", "Olive Green"],
    sizes: [5,6,7,8,9,10,11],
    stock: 50, category: "Skate",
    description: "Born on the streets of California. Shadow Street Low's waffle outsole provides superior grip while the padded collar ensures all-day comfort for skaters and style icons alike.",
    tags: ["skate", "street", "casual"], featured: false,
  },
];

const TRACKING_STATUSES = ["Order Placed","Payment Confirmed","Processing","Packed","Shipped","Out for Delivery","Delivered"];

// ============================================================
// HELPERS
// ============================================================
const formatPrice = p => `₹${p.toLocaleString("en-IN")}`;
const generateOrderId = () => "SNK" + Date.now().toString().slice(-8);
const getDiscount = (orig, cur) => Math.round(((orig - cur) / orig) * 100);

// ============================================================
// MAIN APP
// ============================================================
export default function SneakersShop() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product, color, size, qty = 1) => {
    const existing = cart.find(i => i.id === product.id && i.color === color && i.size === size);
    if (existing) {
      setCart(cart.map(i => i.id === product.id && i.color === color && i.size === size
        ? { ...i, qty: i.qty + qty } : i));
    } else {
      setCart([...cart, { ...product, color, size, qty }]);
    }
    showToast("Added to cart! 🛒");
  };

  const removeFromCart = (id, color, size) =>
    setCart(cart.filter(i => !(i.id === id && i.color === color && i.size === size)));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(w => w !== id));
      showToast("Removed from wishlist");
    } else {
      setWishlist([...wishlist, id]);
      showToast("Added to wishlist ❤️");
    }
  };

  const placeOrder = (formData, paymentId) => {
    const order = {
      id: generateOrderId(),
      ...formData,
      items: [...cart],
      total: cartTotal,
      paymentId: paymentId || "PAY_DEMO_" + Date.now(),
      paymentMethod: formData.paymentMethod,
      status: "Order Placed",
      statusIndex: 0,
      date: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN"),
    };
    setOrders(prev => [order, ...prev]);
    setCart([]);
    setCheckoutData(order);
    setPage("order-success");
    showToast("Order placed successfully! 🎉");
  };

  // AI Chat with Anthropic API
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiChat(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);
    try {
      const productContext = products.map(p =>
        `${p.name} by ${p.brand}: ₹${p.price}, Sizes: ${p.sizes.join(",")}, Colors: ${p.colors.join(", ")}, Stock: ${p.stock}`
      ).join("\n");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful sneaker shopping assistant for SneakX store. Help customers find the perfect sneakers, answer sizing questions, and assist with orders. Be enthusiastic, knowledgeable and concise. Current products:\n${productContext}\nAlways recommend products from our store when relevant.`,
          messages: [...aiChat, { role: "user", content: userMsg }],
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that.";
      setAiChat(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setAiChat(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again!" }]);
    }
    setAiLoading(false);
  };

  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    })
    .filter(p => filterCategory === "All" || p.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  const categories = ["All", ...new Set(products.map(p => p.category))];

  return (
    <div style={{ fontFamily: "'Syne', 'Barlow', sans-serif", background: "#0a0a0a", color: "#f0f0f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #ff3c00; border-radius: 3px; }
        .btn-primary { background: #ff3c00; color: #fff; border: none; padding: 12px 28px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-radius: 4px; }
        .btn-primary:hover { background: #ff6030; transform: translateY(-1px); }
        .btn-outline { background: transparent; color: #f0f0f0; border: 1.5px solid #333; padding: 11px 28px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-radius: 4px; }
        .btn-outline:hover { border-color: #ff3c00; color: #ff3c00; }
        .card { background: #141414; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(255,60,0,0.1); }
        input, select, textarea { background: #1a1a1a; border: 1.5px solid #2a2a2a; color: #f0f0f0; padding: 12px 16px; border-radius: 8px; font-family: 'Barlow', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border-color 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #ff3c00; }
        select option { background: #1a1a1a; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .badge-orange { background: rgba(255,60,0,0.2); color: #ff3c00; border: 1px solid rgba(255,60,0,0.3); }
        .badge-green { background: rgba(0,200,100,0.2); color: #00c864; border: 1px solid rgba(0,200,100,0.3); }
        .badge-blue { background: rgba(0,150,255,0.2); color: #0096ff; border: 1px solid rgba(0,150,255,0.3); }
        .badge-red { background: rgba(255,50,50,0.2); color: #ff3232; border: 1px solid rgba(255,50,50,0.3); }
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .progress-step.active { background: #ff3c00 !important; color: #fff !important; }
        .progress-step.done { background: #00c864 !important; color: #fff !important; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 500px) { .grid-2 { grid-template-columns: 1fr; } }
        .shine { position: relative; overflow: hidden; }
        .shine::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%); transform: translateX(-100%); transition: transform 0.6s; }
        .shine:hover::after { transform: translateX(100%); }
        .nav-link { color: #aaa; text-decoration: none; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; cursor: pointer; }
        .nav-link:hover, .nav-link.active { color: #ff3c00; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: toast.type === "error" ? "#ff3232" : "#ff3c00", color: "#fff", padding: "12px 20px", borderRadius: 8, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease" }}>
          <style>{`@keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          {toast.msg}
        </div>
      )}

      {/* AI CHAT BUBBLE */}
      <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9998 }}>
        {showAiChat && (
          <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 16, width: 320, marginBottom: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ background: "#ff3c00", padding: "12px 16px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>🤖 SneakX AI Assistant</span>
              <span onClick={() => setShowAiChat(false)} style={{ cursor: "pointer", fontSize: 18 }}>×</span>
            </div>
            <div style={{ height: 260, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {aiChat.length === 0 && <p style={{ color: "#666", fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>Hi! Ask me about sizes, styles, or help finding the perfect sneaker! 👟</p>}
              {aiChat.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#ff3c00" : "#1e1e1e", color: "#fff", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0", fontSize: 13, fontFamily: "'Barlow', sans-serif", maxWidth: "85%", lineHeight: 1.5 }}>
                  {m.content}
                </div>
              ))}
              {aiLoading && <div style={{ alignSelf: "flex-start", background: "#1e1e1e", padding: "8px 16px", borderRadius: "12px 12px 12px 0", fontSize: 13, color: "#666" }}>Thinking...</div>}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #1e1e1e", display: "flex", gap: 8 }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAiMessage()} placeholder="Ask anything..." style={{ flex: 1, padding: "8px 12px", fontSize: 13 }} />
              <button onClick={sendAiMessage} className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>→</button>
            </div>
          </div>
        )}
        <button onClick={() => setShowAiChat(!showAiChat)} style={{ background: "#ff3c00", border: "none", borderRadius: "50%", width: 52, height: 52, fontSize: 22, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,60,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {showAiChat ? "×" : "🤖"}
        </button>
      </div>

      {/* NAVBAR */}
      <nav style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, zIndex: 1000, padding: "0 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: "#ff3c00", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👟</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>SNEAK<span style={{ color: "#ff3c00" }}>X</span></span>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="desktop-nav">
            {["home","shop","track","contact"].map(p => (
              <span key={p} onClick={() => setPage(p)} className={`nav-link ${page === p ? "active" : ""}`}>{p}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span onClick={() => setPage("wishlist")} style={{ cursor: "pointer", position: "relative" }}>
              ❤️ {wishlist.length > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#ff3c00", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{wishlist.length}</span>}
            </span>
            <span onClick={() => setPage("cart")} style={{ cursor: "pointer", position: "relative" }}>
              🛒 {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#ff3c00", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cartCount}</span>}
            </span>
            <button onClick={() => setPage(adminLoggedIn ? "admin" : "admin-login")} className="btn-outline" style={{ padding: "7px 16px", fontSize: 12 }}>
              {adminLoggedIn ? "🛡 Admin" : "Admin"}
            </button>
          </div>
        </div>
      </nav>

      {/* PAGES */}
      {page === "home" && <HomePage products={products} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />}
      {page === "shop" && <ShopPage products={filteredProducts} categories={categories} filterCategory={filterCategory} setFilterCategory={setFilterCategory} sortBy={sortBy} setSortBy={setSortBy} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />}
      {page === "product" && <ProductPage product={selectedProduct} setPage={setPage} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} products={products} setSelectedProduct={setSelectedProduct} />}
      {page === "cart" && <CartPage cart={cart} removeFromCart={removeFromCart} setCart={setCart} cartTotal={cartTotal} setPage={setPage} />}
      {page === "checkout" && <CheckoutPage cart={cart} cartTotal={cartTotal} placeOrder={placeOrder} setPage={setPage} />}
      {page === "order-success" && <OrderSuccessPage order={checkoutData} setPage={setPage} />}
      {page === "track" && <TrackPage orders={orders} trackOrderId={trackOrderId} setTrackOrderId={setTrackOrderId} trackResult={trackResult} setTrackResult={setTrackResult} />}
      {page === "wishlist" && <WishlistPage products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />}
      {page === "contact" && <ContactPage />}
      {page === "admin-login" && <AdminLoginPage setAdminLoggedIn={setAdminLoggedIn} setPage={setPage} showToast={showToast} />}
      {page === "admin" && adminLoggedIn && <AdminDashboard products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} setPage={setPage} setAdminLoggedIn={setAdminLoggedIn} adminTab={adminTab} setAdminTab={setAdminTab} editProduct={editProduct} setEditProduct={setEditProduct} showAddProduct={showAddProduct} setShowAddProduct={setShowAddProduct} showToast={showToast} />}

      {/* FOOTER */}
      <footer style={{ background: "#080808", borderTop: "1px solid #1a1a1a", padding: "48px 24px 24px", marginTop: 80 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 16 }}>SNEAK<span style={{ color: "#ff3c00" }}>X</span></div>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 1.8, fontFamily: "'Barlow', sans-serif" }}>Premium sneakers for every lifestyle. From streets to stadiums, we've got your sole covered.</p>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#ff3c00" }}>Shop</div>
              {["New Arrivals","Running","Lifestyle","Training","Skate"].map(l => (
                <div key={l} onClick={() => { setFilterCategory(l === "New Arrivals" ? "All" : l); setPage("shop"); }} style={{ color: "#666", fontSize: 13, marginBottom: 8, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }} onMouseEnter={e => e.target.style.color = "#ff3c00"} onMouseLeave={e => e.target.style.color = "#666"}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#ff3c00" }}>Support</div>
              {["Order Tracking","Size Guide","Returns","FAQ","Contact Us"].map(l => (
                <div key={l} style={{ color: "#666", fontSize: 13, marginBottom: 8, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }} onMouseEnter={e => e.target.style.color = "#ff3c00"} onMouseLeave={e => e.target.style.color = "#666"}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#ff3c00" }}>Contact</div>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 2, fontFamily: "'Barlow', sans-serif" }}>📧 Yearoneofthe@gmail.com<br/>📍 India<br/>⏰ Mon–Sat 9AM–6PM</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "#444", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>© 2025 SneakX. All rights reserved.</p>
            <div style={{ display: "flex", gap: 16 }}>
              {["UPI", "Razorpay", "Stripe", "COD"].map(p => (
                <span key={p} style={{ background: "#1a1a1a", color: "#666", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ products, setPage, setSelectedProduct, addToCart, toggleWishlist, wishlist }) {
  const featured = products.filter(p => p.featured);
  const [heroIdx, setHeroIdx] = useState(0);

  return (
    <div>
      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,60,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,60,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div className="badge badge-orange" style={{ marginBottom: 20 }}>New Season 2025</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(42px, 6vw, 80px)", lineHeight: 1.05, letterSpacing: -3, marginBottom: 20 }}>
              STEP INTO<br />YOUR <span style={{ color: "#ff3c00" }}>POWER</span>
            </h1>
            <p style={{ color: "#888", fontSize: 17, lineHeight: 1.8, marginBottom: 36, fontFamily: "'Barlow', sans-serif", fontWeight: 300 }}>
              Discover premium sneakers from the world's top brands. Every pair engineered for performance, designed for culture.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => setPage("shop")} style={{ fontSize: 15, padding: "14px 36px" }}>Shop Now →</button>
              <button className="btn-outline" onClick={() => setPage("track")} style={{ fontSize: 15, padding: "14px 36px" }}>Track Order</button>
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 48 }}>
              {[["500+", "Products"], ["50K+", "Customers"], ["100%", "Authentic"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#ff3c00" }}>{n}</div>
                  <div style={{ color: "#666", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Barlow', sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #1a1a1a, #111)", borderRadius: 24, overflow: "hidden", aspectRatio: "1", position: "relative", border: "1px solid #2a2a2a" }}>
              <img src={featured[heroIdx]?.images[0]} alt={featured[heroIdx]?.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, background: "rgba(10,10,10,0.9)", backdropFilter: "blur(10px)", borderRadius: 12, padding: "16px 20px", border: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>{featured[heroIdx]?.name}</div>
                    <div style={{ color: "#666", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>{featured[heroIdx]?.brand}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#ff3c00", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>{formatPrice(featured[heroIdx]?.price)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
              {featured.map((_, i) => (
                <div key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === heroIdx ? "#ff3c00" : "#333", cursor: "pointer", transition: "all 0.3s" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 32, letterSpacing: -1 }}>Shop by <span style={{ color: "#ff3c00" }}>Category</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {["Running", "Lifestyle", "Training", "Skate"].map((cat, i) => {
            const icons = ["🏃", "🌆", "💪", "🛹"];
            const colors = ["#ff3c00", "#7c3aed", "#059669", "#f59e0b"];
            return (
              <div key={cat} onClick={() => { setPage("shop"); }} className="card shine" style={{ padding: 28, textAlign: "center", cursor: "pointer", background: `linear-gradient(135deg, #141414, #1a1a1a)` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{icons[i]}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{cat}</div>
                <div style={{ color: colors[i], fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>{products.filter(p => p.category === cat).length} styles</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>Featured <span style={{ color: "#ff3c00" }}>Picks</span></h2>
          <button className="btn-outline" onClick={() => setPage("shop")} style={{ padding: "8px 20px", fontSize: 12 }}>View All →</button>
        </div>
        <div className="grid-2">
          {products.slice(0, 6).map(p => (
            <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />
          ))}
        </div>
      </section>

      {/* BANNER */}
      <section style={{ background: "#ff3c00", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 52px)", marginBottom: 16, letterSpacing: -2 }}>FREE SHIPPING ON ORDERS OVER ₹3,999</h2>
        <p style={{ fontSize: 16, opacity: 0.85, fontFamily: "'Barlow', sans-serif", marginBottom: 28 }}>Pan-India delivery. 7-day returns. 100% authentic guarantee.</p>
        <button onClick={() => setPage("shop")} style={{ background: "#fff", color: "#ff3c00", border: "none", padding: "14px 36px", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", borderRadius: 4, letterSpacing: 1 }}>SHOP NOW</button>
      </section>
    </div>
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================
function ProductCard({ product, setPage, setSelectedProduct, addToCart, toggleWishlist, wishlist }) {
  const [imgHover, setImgHover] = useState(false);
  const discount = getDiscount(product.originalPrice, product.price);

  return (
    <div className="card" style={{ cursor: "pointer" }}>
      <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden" }} onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)}
        onClick={() => { setSelectedProduct(product); setPage("product"); }}>
        <img src={product.images[imgHover && product.images[1] ? 1 : 0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {product.featured && <span className="badge badge-orange">Featured</span>}
          <span className="badge badge-green">-{discount}%</span>
        </div>
        <div onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }} style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, background: "rgba(10,10,10,0.8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", transition: "transform 0.2s" }}>
          {wishlist.includes(product.id) ? "❤️" : "🤍"}
        </div>
      </div>
      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ color: "#666", fontSize: 11, fontFamily: "'Barlow', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{product.brand} · {product.category}</div>
        <div onClick={() => { setSelectedProduct(product); setPage("product"); }} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{product.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#ff3c00" }}>{formatPrice(product.price)}</span>
          <span style={{ color: "#444", fontSize: 13, textDecoration: "line-through", fontFamily: "'Barlow', sans-serif" }}>{formatPrice(product.originalPrice)}</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {product.colors.slice(0, 3).map(c => (
            <div key={c} title={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c.includes("Black") ? "#111" : c.includes("White") ? "#eee" : c.includes("Blue") ? "#1a5fff" : c.includes("Red") ? "#ff3c00" : c.includes("Yellow") ? "#ffd700" : c.includes("Green") ? "#22c55e" : c.includes("Navy") ? "#1e3a5f" : "#888", border: "2px solid #2a2a2a" }} />
          ))}
          {product.colors.length > 3 && <span style={{ fontSize: 11, color: "#666", fontFamily: "'Barlow', sans-serif" }}>+{product.colors.length - 3}</span>}
        </div>
        <button className="btn-primary shine" onClick={() => { setSelectedProduct(product); setPage("product"); }} style={{ width: "100%", padding: "10px" }}>
          View Details
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SHOP PAGE
// ============================================================
function ShopPage({ products, categories, filterCategory, setFilterCategory, sortBy, setSortBy, searchQuery, setSearchQuery, setPage, setSelectedProduct, addToCart, toggleWishlist, wishlist }) {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 40, letterSpacing: -2, marginBottom: 8 }}>All <span style={{ color: "#ff3c00" }}>Sneakers</span></h1>
        <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif" }}>{products.length} products found</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Search sneakers, brands..." style={{ flex: 1, minWidth: 200 }} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#444" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👟</div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20 }}>No sneakers found</p>
          <p style={{ color: "#555", fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid-2">
          {products.map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRODUCT DETAIL PAGE
// ============================================================
function ProductPage({ product, setPage, addToCart, toggleWishlist, wishlist, products, setSelectedProduct }) {
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("description");

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) { alert("Please select a size!"); return; }
    addToCart(product, selectedColor, selectedSize, qty);
  };

  const similar = products.filter(p => p.id !== product.id && (p.brand === product.brand || p.category === product.category)).slice(0, 3);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      <button onClick={() => setPage("shop")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 14, marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>← Back to Shop</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginBottom: 80 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "1", marginBottom: 12, border: "1px solid #2a2a2a", background: "#141414" }}>
            <img src={product.images[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {product.images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${activeImg === i ? "#ff3c00" : "#2a2a2a"}`, flex: "0 0 80px" }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
        {/* Details */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span className="badge badge-orange">{product.category}</span>
            <span className={`badge ${product.stock > 10 ? "badge-green" : product.stock > 0 ? "badge-orange" : "badge-red"}`}>
              {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
            </span>
          </div>
          <div style={{ color: "#888", fontSize: 13, fontFamily: "'Barlow', sans-serif", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{product.brand}</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1, marginBottom: 20, lineHeight: 1.1 }}>{product.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <span style={{ color: "#ff3c00", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36 }}>{formatPrice(product.price)}</span>
            <div>
              <div style={{ color: "#555", fontSize: 14, textDecoration: "line-through", fontFamily: "'Barlow', sans-serif" }}>{formatPrice(product.originalPrice)}</div>
              <div style={{ color: "#00c864", fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Save {formatPrice(product.originalPrice - product.price)}</div>
            </div>
          </div>

          {/* Color */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, color: "#888" }}>Color: <span style={{ color: "#f0f0f0" }}>{selectedColor}</span></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)} style={{ padding: "6px 16px", borderRadius: 6, border: `2px solid ${selectedColor === c ? "#ff3c00" : "#2a2a2a"}`, background: selectedColor === c ? "rgba(255,60,0,0.1)" : "#1a1a1a", color: "#f0f0f0", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: 12, transition: "all 0.2s" }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, color: "#888" }}>Size (UK/India): {selectedSize && <span style={{ color: "#f0f0f0" }}>{selectedSize}</span>}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)} style={{ width: 48, height: 48, borderRadius: 8, border: `2px solid ${selectedSize === s ? "#ff3c00" : "#2a2a2a"}`, background: selectedSize === s ? "rgba(255,60,0,0.15)" : "#1a1a1a", color: selectedSize === s ? "#ff3c00" : "#f0f0f0", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.2s" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#888" }}>Qty:</div>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #2a2a2a", borderRadius: 8, overflow: "hidden" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, background: "#1a1a1a", border: "none", color: "#f0f0f0", cursor: "pointer", fontSize: 18 }}>−</button>
              <span style={{ width: 40, textAlign: "center", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, background: "#1a1a1a", border: "none", color: "#f0f0f0", cursor: "pointer", fontSize: 18 }}>+</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1, padding: "14px" }}>Add to Cart 🛒</button>
            <button onClick={() => toggleWishlist(product.id)} style={{ width: 50, height: 50, background: "#1a1a1a", border: "1.5px solid #2a2a2a", borderRadius: 8, fontSize: 20, cursor: "pointer" }}>
              {wishlist.includes(product.id) ? "❤️" : "🤍"}
            </button>
          </div>
          <button className="btn-outline" onClick={() => { handleAddToCart(); if(selectedSize) setPage("checkout"); }} style={{ width: "100%", padding: "13px", background: "rgba(255,60,0,0.08)" }}>Buy Now →</button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 28 }}>
            {[["🚚", "Free Delivery", "Over ₹3999"], ["↩️", "7-Day Return", "Easy returns"], ["✅", "Authentic", "100% genuine"]].map(([icon, title, sub]) => (
              <div key={title} style={{ textAlign: "center", padding: "12px 8px", background: "#141414", borderRadius: 8, border: "1px solid #1e1e1e" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11 }}>{title}</div>
                <div style={{ color: "#666", fontSize: 10, fontFamily: "'Barlow', sans-serif" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1e1e1e", marginBottom: 32, display: "flex", gap: 32 }}>
        {["description", "specs"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === t ? "#ff3c00" : "transparent"}`, color: tab === t ? "#ff3c00" : "#666", padding: "12px 0", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s" }}>{t}</button>
        ))}
      </div>
      {tab === "description" && <p style={{ color: "#aaa", lineHeight: 1.9, fontFamily: "'Barlow', sans-serif", fontSize: 15, maxWidth: 700 }}>{product.description}</p>}
      {tab === "specs" && (
        <div style={{ maxWidth: 500 }}>
          {[["Brand", product.brand], ["Category", product.category], ["Available Sizes", product.sizes.join(", ")], ["Colors", product.colors.join(", ")], ["Stock", `${product.stock} units`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
              <span style={{ color: "#666", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>{k}</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1, marginBottom: 28 }}>You May Also <span style={{ color: "#ff3c00" }}>Like</span></h2>
          <div className="grid-2">
            {similar.map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CART PAGE
// ============================================================
function CartPage({ cart, removeFromCart, setCart, cartTotal, setPage }) {
  if (cart.length === 0) return (
    <div style={{ textAlign: "center", padding: "120px 24px" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: "#666", marginBottom: 28, fontFamily: "'Barlow', sans-serif" }}>Looks like you haven't added any sneakers yet.</p>
      <button className="btn-primary" onClick={() => setPage("shop")}>Shop Now →</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1, marginBottom: 40 }}>Shopping <span style={{ color: "#ff3c00" }}>Cart</span></h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {cart.map((item, i) => (
            <div key={i} className="card" style={{ padding: 20, display: "flex", gap: 20, alignItems: "center" }}>
              <img src={item.images[0]} alt={item.name} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, flex: "0 0 90px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{item.name}</div>
                <div style={{ color: "#666", fontSize: 12, fontFamily: "'Barlow', sans-serif", marginBottom: 8 }}>{item.brand} · {item.color} · Size {item.size}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #2a2a2a", borderRadius: 6, overflow: "hidden" }}>
                    <button onClick={() => { if(item.qty > 1) setCart(cart.map((c, idx) => idx === i ? {...c, qty: c.qty-1} : c)); else removeFromCart(item.id, item.color, item.size); }} style={{ width: 30, height: 30, background: "#1a1a1a", border: "none", color: "#f0f0f0", cursor: "pointer" }}>−</button>
                    <span style={{ width: 32, textAlign: "center", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                    <button onClick={() => setCart(cart.map((c, idx) => idx === i ? {...c, qty: c.qty+1} : c))} style={{ width: 30, height: 30, background: "#1a1a1a", border: "none", color: "#f0f0f0", cursor: "pointer" }}>+</button>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#ff3c00", fontSize: 18 }}>{formatPrice(item.price * item.qty)}</div>
                <button onClick={() => removeFromCart(item.id, item.color, item.size)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{ padding: 28, position: "sticky", top: 80 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Order Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>
                <span>Subtotal ({cart.reduce((s,i)=>s+i.qty,0)} items)</span><span>{formatPrice(cartTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>
                <span>Delivery</span><span style={{ color: "#00c864" }}>{cartTotal >= 3999 ? "FREE" : formatPrice(99)}</span>
              </div>
              <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 12, display: "flex", justifyContent: "space-between", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>
                <span>Total</span><span style={{ color: "#ff3c00" }}>{formatPrice(cartTotal + (cartTotal >= 3999 ? 0 : 99))}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setPage("checkout")} style={{ width: "100%", padding: "14px" }}>Proceed to Checkout →</button>
            <button className="btn-outline" onClick={() => setPage("shop")} style={{ width: "100%", padding: "12px", marginTop: 10 }}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHECKOUT PAGE
// ============================================================
function CheckoutPage({ cart, cartTotal, placeOrder, setPage }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", paymentMethod: "UPI", upiId: "" });
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const total = cartTotal + (cartTotal >= 3999 ? 0 : 99);

  const handleSubmit = async () => {
    const required = ["name","email","phone","address","city","state","pincode"];
    for (let f of required) { if (!form[f]) { alert(`Please fill: ${f}`); return; } }
    if (!/^\d{10}$/.test(form.phone)) { alert("Enter valid 10-digit mobile number"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert("Enter valid email"); return; }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    const paymentId = "PAY_" + Math.random().toString(36).substring(2,12).toUpperCase();
    placeOrder(form, paymentId);
    setProcessing(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1, marginBottom: 8 }}>Checkout</h1>
      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
        {["Delivery", "Payment", "Confirm"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className={`progress-step ${step > i+1 ? "done" : step === i+1 ? "active" : ""}`} style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a", border: "2px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#555" }}>
              {step > i+1 ? "✓" : i+1}
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, color: step === i+1 ? "#ff3c00" : "#555" }}>{s}</span>
            {i < 2 && <div style={{ width: 32, height: 2, background: step > i+1 ? "#ff3c00" : "#2a2a2a" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>
        <div>
          {step === 1 && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Delivery Details</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[["name","Full Name","text"],["email","Email Address","email"],["phone","Mobile Number","tel"],["pincode","Pincode","text"]].map(([f, p, t]) => (
                  <div key={f}>
                    <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{p}</label>
                    <input type={t} placeholder={p} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} />
                  </div>
                ))}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Address</label>
                  <textarea placeholder="House no., Street, Area..." rows={3} value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ resize: "none" }} />
                </div>
                {[["city","City"],["state","State"]].map(([f, p]) => (
                  <div key={f}>
                    <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{p}</label>
                    <input placeholder={p} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setStep(2)} style={{ marginTop: 24, padding: "13px 32px" }}>Continue to Payment →</button>
            </div>
          )}
          {step === 2 && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Payment Method</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {[["UPI","💳 UPI Payment"],["Razorpay","⚡ Razorpay"],["Stripe","💳 Card (Stripe)"],["COD","📦 Cash on Delivery"]].map(([val, label]) => (
                  <label key={val} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: form.paymentMethod === val ? "rgba(255,60,0,0.08)" : "#1a1a1a", border: `2px solid ${form.paymentMethod === val ? "#ff3c00" : "#2a2a2a"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                    <input type="radio" name="payment" value={val} checked={form.paymentMethod === val} onChange={e => setForm({...form, paymentMethod: e.target.value})} style={{ width: "auto" }} />
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 15 }}>{label}</span>
                  </label>
                ))}
              </div>
              {form.paymentMethod === "UPI" && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>UPI ID</label>
                  <input placeholder="yourname@upi" value={form.upiId} onChange={e => setForm({...form, upiId: e.target.value})} />
                  <p style={{ color: "#555", fontSize: 12, fontFamily: "'Barlow', sans-serif", marginTop: 6 }}>Demo mode: Any UPI ID accepted</p>
                </div>
              )}
              <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 16, marginBottom: 24 }}>
                <p style={{ color: "#888", fontSize: 12, fontFamily: "'Barlow', sans-serif", lineHeight: 1.7 }}>
                  🔒 <strong style={{ color: "#f0f0f0" }}>Secure Payment</strong> — This is a demo environment. In production, real Razorpay/Stripe keys would process actual transactions.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-outline" onClick={() => setStep(1)} style={{ padding: "12px 24px" }}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 1, padding: "13px" }}>Review Order →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Confirm Order</h2>
              <div style={{ background: "#111", borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 12, color: "#ff3c00", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Delivery To</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", color: "#ccc", lineHeight: 1.8, fontSize: 14 }}>{form.name}<br/>{form.email} · {form.phone}<br/>{form.address}, {form.city}, {form.state} - {form.pincode}</p>
              </div>
              <div style={{ background: "#111", borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 12, color: "#ff3c00", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Payment</div>
                <p style={{ fontFamily: "'Barlow', sans-serif", color: "#ccc", fontSize: 14 }}>{form.paymentMethod}{form.upiId ? ` · ${form.upiId}` : ""}</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-outline" onClick={() => setStep(2)} style={{ padding: "12px 24px" }}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={processing} style={{ flex: 1, padding: "13px", opacity: processing ? 0.7 : 1 }}>
                  {processing ? "Processing Payment... ⏳" : `Pay ${formatPrice(total)} →`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Order ({cart.length} items)</h3>
            {cart.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1a1a1a" }}>
                <img src={item.images[0]} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ color: "#666", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>{item.color} · Size {item.size} · Qty {item.qty}</div>
                  <div style={{ color: "#ff3c00", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, marginTop: 4 }}>{formatPrice(item.price * item.qty)}</div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "'Barlow', sans-serif", color: "#888", fontSize: 13 }}>
                <span>Subtotal</span><span>{formatPrice(cartTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "'Barlow', sans-serif", color: "#888", fontSize: 13 }}>
                <span>Delivery</span><span style={{ color: "#00c864" }}>{cartTotal >= 3999 ? "FREE" : formatPrice(99)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#ff3c00" }}>
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ORDER SUCCESS PAGE
// ============================================================
function OrderSuccessPage({ order, setPage }) {
  if (!order) return null;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 40, letterSpacing: -2, marginBottom: 12 }}>Order <span style={{ color: "#00c864" }}>Confirmed!</span></h1>
      <p style={{ color: "#888", fontFamily: "'Barlow', sans-serif", fontSize: 16, marginBottom: 32 }}>Thank you, {order.name}! Your order has been placed successfully.</p>
      <div className="card" style={{ padding: 32, textAlign: "left", marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {[["Order ID", order.id], ["Payment ID", order.paymentId], ["Total", formatPrice(order.total)], ["Est. Delivery", order.estimatedDelivery]].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: "#666", fontSize: 11, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: k === "Total" ? "#ff3c00" : "#f0f0f0" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#111", borderRadius: 10, padding: 16 }}>
          <div style={{ color: "#666", fontSize: 11, fontFamily: "'Syne', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Items Ordered</div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Barlow', sans-serif", fontSize: 14, padding: "4px 0", color: "#ccc" }}>
              <span>{item.name} (Size {item.size}, {item.color}) × {item.qty}</span>
              <span style={{ color: "#ff3c00" }}>{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.2)", borderRadius: 10, padding: 16, marginBottom: 32 }}>
        <p style={{ color: "#00c864", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>📧 Order confirmation sent to <strong>{order.email}</strong></p>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn-primary" onClick={() => setPage("track")}>Track Order →</button>
        <button className="btn-outline" onClick={() => setPage("shop")}>Continue Shopping</button>
      </div>
    </div>
  );
}

// ============================================================
// TRACK PAGE
// ============================================================
function TrackPage({ orders, trackOrderId, setTrackOrderId, trackResult, setTrackResult }) {
  const handleTrack = () => {
    const found = orders.find(o => o.id.toLowerCase() === trackOrderId.toLowerCase());
    setTrackResult(found || "not-found");
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 40, letterSpacing: -2, marginBottom: 8 }}>Track <span style={{ color: "#ff3c00" }}>Order</span></h1>
      <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif", marginBottom: 36 }}>Enter your order ID to get real-time updates</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
        <input value={trackOrderId} onChange={e => setTrackOrderId(e.target.value)} placeholder="Enter Order ID (e.g. SNK12345678)" onKeyDown={e => e.key === "Enter" && handleTrack()} style={{ flex: 1 }} />
        <button className="btn-primary" onClick={handleTrack} style={{ padding: "12px 28px" }}>Track</button>
      </div>

      {trackResult === "not-found" && (
        <div style={{ background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: 12, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Order not found</p>
          <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif", fontSize: 13, marginTop: 8 }}>Check the order ID and try again</p>
        </div>
      )}

      {trackResult && trackResult !== "not-found" && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22 }}>{trackResult.id}</div>
              <div style={{ color: "#666", fontFamily: "'Barlow', sans-serif", fontSize: 13 }}>Placed on {new Date(trackResult.date).toLocaleDateString("en-IN")}</div>
            </div>
            <span className="badge badge-green">{trackResult.status}</span>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#666", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>Progress</span>
              <span style={{ color: "#ff3c00", fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                {Math.round(((trackResult.statusIndex + 1) / TRACKING_STATUSES.length) * 100)}%
              </span>
            </div>
            <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((trackResult.statusIndex + 1) / TRACKING_STATUSES.length) * 100}%`, background: "linear-gradient(90deg, #ff3c00, #ff6030)", borderRadius: 3, transition: "width 0.5s" }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TRACKING_STATUSES.map((status, i) => {
              const done = i <= trackResult.statusIndex;
              const active = i === trackResult.statusIndex;
              return (
                <div key={status} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? (active ? "#ff3c00" : "#00c864") : "#1a1a1a", border: `2px solid ${done ? (active ? "#ff3c00" : "#00c864") : "#2a2a2a"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                      {done && !active ? "✓" : i + 1}
                    </div>
                    {i < TRACKING_STATUSES.length - 1 && <div style={{ width: 2, height: 24, background: i < trackResult.statusIndex ? "#00c864" : "#1a1a1a" }} />}
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: active ? 700 : 500, fontSize: 14, color: active ? "#ff3c00" : done ? "#f0f0f0" : "#444" }}>{status}</div>
                    {active && <div style={{ color: "#666", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>Current status</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 20, marginTop: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["Customer", trackResult.name], ["Delivery To", `${trackResult.city}, ${trackResult.state}`], ["Total Paid", formatPrice(trackResult.total)], ["Est. Delivery", trackResult.estimatedDelivery]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: "#555", fontSize: 11, fontFamily: "'Syne', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#ccc" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {orders.length > 0 && !trackResult && (
        <div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16, color: "#666" }}>Recent Orders</h3>
          {orders.slice(0, 3).map(o => (
            <div key={o.id} onClick={() => { setTrackOrderId(o.id); setTrackResult(o); }} className="card" style={{ padding: 16, marginBottom: 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>{o.id}</div>
                <div style={{ color: "#666", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>{new Date(o.date).toLocaleDateString("en-IN")} · {o.items.length} items</div>
              </div>
              <span className="badge badge-orange">{o.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// WISHLIST PAGE
// ============================================================
function WishlistPage({ products, wishlist, toggleWishlist, setPage, setSelectedProduct, addToCart }) {
  const wishProducts = products.filter(p => wishlist.includes(p.id));
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: -1, marginBottom: 32 }}>My <span style={{ color: "#ff3c00" }}>Wishlist</span></h1>
      {wishProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤍</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Your wishlist is empty</h2>
          <button className="btn-primary" onClick={() => setPage("shop")} style={{ marginTop: 16 }}>Explore Sneakers →</button>
        </div>
      ) : (
        <div className="grid-2">
          {wishProducts.map(p => <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CONTACT PAGE
// ============================================================
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 40, letterSpacing: -2, marginBottom: 8 }}>Contact <span style={{ color: "#ff3c00" }}>Us</span></h1>
      <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif", marginBottom: 40 }}>Questions about sizing, orders, or returns? We're here to help.</p>
      {sent ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, color: "#00c864" }}>Message Sent!</h2>
          <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif", marginTop: 8 }}>We'll reply within 24 hours.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {[["name","Your Name"],["email","Email Address"]].map(([f,p]) => (
              <div key={f}>
                <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{p}</label>
                <input placeholder={p} value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} />
              </div>
            ))}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Subject</label>
              <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Message</label>
              <textarea placeholder="Tell us how we can help..." rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ resize: "none" }} />
            </div>
          </div>
          <button className="btn-primary" onClick={() => setSent(true)} style={{ padding: "13px 36px" }}>Send Message →</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN LOGIN
// ============================================================
function AdminLoginPage({ setAdminLoggedIn, setPage, showToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (form.email === "admin@sneakx.com" && form.password === "admin123") {
      setAdminLoggedIn(true);
      setPage("admin");
      showToast("Welcome back, Admin! 🛡");
    } else {
      setError("Invalid credentials. Use: admin@sneakx.com / admin123");
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 48 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: "#ff3c00", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🛡</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>Admin Login</h1>
          <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif", fontSize: 13, marginTop: 6 }}>SneakX Admin Dashboard</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
          <input type="email" placeholder="admin@sneakx.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        {error && <div style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: 8, padding: "10px 14px", color: "#ff5555", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 16 }}>{error}</div>}
        <button className="btn-primary" onClick={handleLogin} style={{ width: "100%", padding: "14px" }}>Login to Dashboard</button>
        <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 20, fontFamily: "'Barlow', sans-serif" }}>Demo: admin@sneakx.com / admin123</p>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ products, setProducts, orders, setOrders, setPage, setAdminLoggedIn, adminTab, setAdminTab, editProduct, setEditProduct, showAddProduct, setShowAddProduct, showToast }) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const tabs = [["dashboard","📊 Overview"], ["products","👟 Products"], ["orders","📦 Orders"], ["add-product","➕ Add Product"]];

  const updateOrderStatus = (orderId, newStatus) => {
    const idx = TRACKING_STATUSES.indexOf(newStatus);
    setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus, statusIndex: idx} : o));
    showToast("Order status updated!");
  };

  const deleteProduct = (id) => {
    if (confirm("Delete this product?")) { setProducts(products.filter(p => p.id !== id)); showToast("Product deleted"); }
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>Admin <span style={{ color: "#ff3c00" }}>Dashboard</span></h1>
          <p style={{ color: "#666", fontFamily: "'Barlow', sans-serif", fontSize: 13 }}>SneakX Control Panel</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-outline" onClick={() => setPage("home")} style={{ padding: "8px 16px", fontSize: 12 }}>← View Site</button>
          <button onClick={() => { setAdminLoggedIn(false); setPage("home"); }} style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", color: "#ff5555", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600 }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1a1a1a", marginBottom: 32, flexWrap: "wrap" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setAdminTab(id)} style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: `2px solid ${adminTab === id ? "#ff3c00" : "transparent"}`, color: adminTab === id ? "#ff3c00" : "#666", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>{label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {adminTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
            {[
              ["Total Revenue", formatPrice(totalRevenue), "📈", "#ff3c00"],
              ["Total Orders", orders.length, "📦", "#7c3aed"],
              ["Products", products.length, "👟", "#059669"],
              ["Customers", new Set(orders.map(o => o.email)).size, "👥", "#f59e0b"],
            ].map(([label, val, icon, color]) => (
              <div key={label} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#666", fontSize: 12, fontFamily: "'Syne', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color }}>{val}</div>
                  </div>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Recent Orders</h3>
              {orders.length === 0 ? <p style={{ color: "#444", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>No orders yet</p> : orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>{o.id}</div>
                    <div style={{ color: "#666", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>{o.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#ff3c00", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13 }}>{formatPrice(o.total)}</div>
                    <span className="badge badge-green" style={{ fontSize: 9 }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Stock Alerts</h3>
              {products.filter(p => p.stock < 30).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13 }}>{p.name}</div>
                  <span className={`badge ${p.stock < 10 ? "badge-red" : "badge-orange"}`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {adminTab === "products" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24 }}>Products ({products.length})</h2>
            <button className="btn-primary" onClick={() => setAdminTab("add-product")}>+ Add Product</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {products.map(p => (
              <div key={p.id} className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
                <img src={p.images[0]} alt={p.name} style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 10, flex: "0 0 70px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                  <div style={{ color: "#666", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>{p.brand} · {p.category} · Stock: {p.stock}</div>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#ff3c00", fontSize: 18 }}>{formatPrice(p.price)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setEditProduct(p); setAdminTab("add-product"); }} style={{ background: "rgba(0,150,255,0.1)", border: "1px solid rgba(0,150,255,0.2)", color: "#0096ff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600 }}>Edit</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.2)", color: "#ff5555", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {adminTab === "orders" && (
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 24 }}>Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>No orders yet</p>
            </div>
          ) : orders.map(o => (
            <div key={o.id} className="card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>{o.id}</div>
                  <div style={{ color: "#666", fontFamily: "'Barlow', sans-serif", fontSize: 13 }}>{o.name} · {o.email} · {o.phone}</div>
                  <div style={{ color: "#555", fontFamily: "'Barlow', sans-serif", fontSize: 12 }}>📍 {o.address}, {o.city}, {o.state} - {o.pincode}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#ff3c00", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22 }}>{formatPrice(o.total)}</div>
                  <div style={{ color: "#666", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}>Pay ID: {o.paymentId}</div>
                </div>
              </div>
              <div style={{ background: "#111", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                {o.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "#ccc", fontFamily: "'Barlow', sans-serif", fontSize: 13, padding: "3px 0" }}>
                    <span>{item.name} · {item.color} · Size {item.size} × {item.qty}</span>
                    <span style={{ color: "#ff3c00" }}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>Status:</span>
                <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}>
                  {TRACKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="badge badge-green">{o.paymentMethod}</span>
                <span style={{ color: "#555", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}>{new Date(o.date).toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT PRODUCT */}
      {adminTab === "add-product" && (
        <AddEditProductForm products={products} setProducts={setProducts} editProduct={editProduct} setEditProduct={setEditProduct} setAdminTab={setAdminTab} showToast={showToast} />
      )}
    </div>
  );
}

// ============================================================
// ADD/EDIT PRODUCT FORM
// ============================================================
function AddEditProductForm({ products, setProducts, editProduct, setEditProduct, setAdminTab, showToast }) {
  const [form, setForm] = useState(editProduct || {
    name: "", brand: "", price: "", originalPrice: "", category: "Running",
    description: "", stock: "", featured: false,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", ""],
    colors: ["White", "Black"],
    sizes: [6,7,8,9,10,11],
    tags: [],
  });
  const [colorsStr, setColorsStr] = useState((editProduct?.colors || ["White","Black"]).join(", "));

  const handleSave = () => {
    if (!form.name || !form.brand || !form.price) { alert("Name, Brand, and Price are required"); return; }
    const product = {
      ...form,
      id: editProduct ? editProduct.id : Date.now(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      stock: Number(form.stock) || 0,
      colors: colorsStr.split(",").map(c => c.trim()).filter(Boolean),
      images: form.images.filter(Boolean),
    };
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? product : p));
      showToast("Product updated! ✅");
    } else {
      setProducts([...products, product]);
      showToast("Product added! 🎉");
    }
    setEditProduct(null);
    setAdminTab("products");
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 28 }}>{editProduct ? "Edit" : "Add New"} Product</h2>
      <div className="card" style={{ padding: 36 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[["name","Product Name","text"],["brand","Brand","text"],["price","Price (₹)","number"],["originalPrice","Original Price (₹)","number"],["stock","Stock Quantity","number"]].map(([f,p,t]) => (
            <div key={f}>
              <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{p}</label>
              <input type={t} placeholder={p} value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} />
            </div>
          ))}
          <div>
            <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {["Running","Lifestyle","Training","Skate"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Image URL 1</label>
            <input placeholder="https://..." value={form.images[0]} onChange={e => setForm({...form, images: [e.target.value, form.images[1]]})} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Image URL 2 (optional)</label>
            <input placeholder="https://..." value={form.images[1]} onChange={e => setForm({...form, images: [form.images[0], e.target.value]})} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Colors (comma separated)</label>
            <input placeholder="White, Black, Blue/White" value={colorsStr} onChange={e => setColorsStr(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Sizes (select)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[5,6,7,8,9,10,11,12].map(s => (
                <button key={s} type="button" onClick={() => setForm({...form, sizes: form.sizes.includes(s) ? form.sizes.filter(sz => sz !== s) : [...form.sizes, s].sort()})}
                  style={{ width: 44, height: 44, borderRadius: 8, border: `2px solid ${form.sizes.includes(s) ? "#ff3c00" : "#2a2a2a"}`, background: form.sizes.includes(s) ? "rgba(255,60,0,0.15)" : "#1a1a1a", color: form.sizes.includes(s) ? "#ff3c00" : "#f0f0f0", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Description</label>
            <textarea placeholder="Product description..." rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: "none" }} />
          </div>
          <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 12 }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} style={{ width: "auto" }} />
            <label htmlFor="featured" style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, cursor: "pointer" }}>Mark as Featured Product</label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding: "13px 36px" }}>{editProduct ? "Update Product" : "Add Product"} ✓</button>
          <button className="btn-outline" onClick={() => { setEditProduct(null); setAdminTab("products"); }} style={{ padding: "12px 24px" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
