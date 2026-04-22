import { useState, useEffect, useRef } from "react";

// ============================================================
// ⚙️  CONFIGURATION — Replace these with your real keys
// ============================================================
const CONFIG = {
  // Razorpay — get from https://dashboard.razorpay.com
  RAZORPAY_KEY_ID: "rzp_test_SfQ7WGnS3fbSBP",   // ← paste your Test Key ID here

  // EmailJS — get from https://www.emailjs.com
  EMAILJS_SERVICE_ID:  "service_ziqh4rr",          // ← your EmailJS Service ID
  EMAILJS_TEMPLATE_ID: "template_dztm35o",         // ← your EmailJS Template ID
  EMAILJS_PUBLIC_KEY:  "GxxhEzMkPsFy6Ha17",      // ← your EmailJS Public Key

  // Admin notification email (already in your EmailJS template)
  ADMIN_EMAIL: "Yearoneofthe@gmail.com",
};

// ============================================================
// DATA
// ============================================================
const INITIAL_PRODUCTS = [
  {
    id: 1, name: "Air Velocity Pro", brand: "Nike",
    price: 4999, originalPrice: 6499,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    ],
    colors: ["White/Red","Black/Gold","Blue/White"],
    sizes: [6,7,8,9,10,11,12], stock: 45,
    category: "Running", featured: true,
    description: "Engineered for champions. Air Velocity Pro delivers cushioned comfort with responsive energy return. Breathable mesh upper keeps your foot cool during intense workouts.",
    tags: ["running","sport","cushion"],
    fit: "true-to-size", arch: "neutral", width: "standard",
  },
  {
    id: 2, name: "Retro Slam 90", brand: "Adidas",
    price: 5999, originalPrice: 7999,
    images: [
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80",
      "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=600&q=80",
    ],
    colors: ["Classic White","Triple Black","Cream/Gum"],
    sizes: [6,7,8,9,10,11], stock: 28,
    category: "Lifestyle", featured: true,
    description: "Street culture meets premium craftsmanship. Retro Slam 90 features a classic silhouette updated with modern materials and a comfortable EVA midsole.",
    tags: ["lifestyle","street","retro"],
    fit: "runs-large", arch: "neutral", width: "wide",
  },
  {
    id: 3, name: "CloudRun Elite", brand: "Puma",
    price: 3499, originalPrice: 4499,
    images: [
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    ],
    colors: ["Volt Yellow","Neon Orange","Arctic White"],
    sizes: [5,6,7,8,9,10,11,12], stock: 60,
    category: "Running", featured: false,
    description: "Ultra-lightweight running shoe designed for speed. CloudRun Elite's proprietary foam absorbs impact while propelling you forward with every stride.",
    tags: ["running","lightweight","fast"],
    fit: "runs-small", arch: "high", width: "narrow",
  },
  {
    id: 4, name: "Urban Force Hi", brand: "Converse",
    price: 2999, originalPrice: 3999,
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
    ],
    colors: ["Classic Black","Pure White","Navy Blue"],
    sizes: [6,7,8,9,10,11], stock: 35,
    category: "Lifestyle", featured: false,
    description: "The timeless high-top silhouette reinvented for modern street culture. Premium canvas upper with vulcanized rubber sole.",
    tags: ["lifestyle","high-top","classic"],
    fit: "true-to-size", arch: "flat", width: "standard",
  },
  {
    id: 5, name: "Apex Boost X", brand: "New Balance",
    price: 6499, originalPrice: 8999,
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    ],
    colors: ["Grey/Navy","White/Gold","Black/Red"],
    sizes: [7,8,9,10,11,12], stock: 22,
    category: "Training", featured: true,
    description: "Performance-first design for serious athletes. Full-length BOOST midsole for maximum energy return and a supportive upper for stability.",
    tags: ["training","boost","performance"],
    fit: "runs-large", arch: "neutral", width: "wide",
  },
  {
    id: 6, name: "Shadow Street Low", brand: "Vans",
    price: 2499, originalPrice: 3299,
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
    ],
    colors: ["Checkerboard","Solid Black","Olive Green"],
    sizes: [5,6,7,8,9,10,11], stock: 50,
    category: "Skate", featured: false,
    description: "Born on the streets of California. Waffle outsole provides superior grip while the padded collar ensures all-day comfort.",
    tags: ["skate","street","casual"],
    fit: "true-to-size", arch: "flat", width: "standard",
  },
];

const TRACKING_STATUSES = [
  "Order Placed","Payment Confirmed","Processing","Packed",
  "Shipped","Out for Delivery","Delivered"
];

// ============================================================
// HELPERS
// ============================================================
const formatPrice = p => `₹${Number(p).toLocaleString("en-IN")}`;
const generateOrderId = () => "SNK" + Date.now().toString().slice(-8);
const getDiscount = (orig, cur) => Math.round(((orig - cur) / orig) * 100);

// ── Razorpay checkout opener ─────────────────────────────────
function openRazorpay({ amount, orderId, customerName, customerEmail, customerPhone, onSuccess, onFailure }) {
  if (!window.Razorpay) {
    alert("Razorpay SDK not loaded. Check your internet connection.");
    onFailure("SDK_NOT_LOADED");
    return;
  }
  const options = {
    key: CONFIG.RAZORPAY_KEY_ID,
    amount: amount * 100,          // paise
    currency: "INR",
    name: "SneakX",
    description: `Order ${orderId}`,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&q=80",
    order_id: undefined,           // set this if you have a backend order_id
    prefill: { name: customerName, email: customerEmail, contact: customerPhone },
    theme: { color: "#ff3c00" },
    handler: (response) => onSuccess(response.razorpay_payment_id),
    modal: { ondismiss: () => onFailure("DISMISSED") },
  };
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", (resp) => onFailure(resp.error.description));
  rzp.open();
}

// ── EmailJS order notification sender ───────────────────────
async function sendOrderEmail(order) {
  try {
    // Load EmailJS SDK dynamically if not present
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      window.emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
    }

    const itemsText = order.items
      .map(i => `${i.name} (${i.brand}) | Color: ${i.color} | Size: ${i.size} | Qty: ${i.qty} | ₹${i.price * i.qty}`)
      .join("\n");

    const templateParams = {
      to_email:      CONFIG.ADMIN_EMAIL,
      order_id:      order.id,
      customer_name: order.name,
      customer_email:order.email,
      customer_phone:order.phone,
      delivery_address: `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
      items_detail:  itemsText,
      total_amount:  `₹${order.total.toLocaleString("en-IN")}`,
      payment_id:    order.paymentId,
      payment_method:order.paymentMethod,
      order_date:    new Date(order.date).toLocaleString("en-IN"),
    };

    await window.emailjs.send(
      CONFIG.EMAILJS_SERVICE_ID,
      CONFIG.EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log("✅ Order email sent to", CONFIG.ADMIN_EMAIL);
  } catch (err) {
    console.warn("⚠️ EmailJS send failed (demo mode):", err);
  }
}

// ── AI Size Recommendation via Anthropic API ─────────────────
async function getAISizeRecommendation(product, footLength, footWidth, usualSize, activity) {
  const prompt = `You are a sneaker sizing expert. A customer wants to buy the "${product.name}" by ${product.brand}.

Product sizing profile:
- Fit: ${product.fit} (true-to-size / runs-small / runs-large)
- Arch support: ${product.arch} (neutral / high / flat)
- Width: ${product.width} (standard / wide / narrow)
- Available sizes: ${product.sizes.join(", ")} (UK/India)

Customer info:
- Foot length: ${footLength} cm
- Foot width: ${footWidth} (narrow / standard / wide)
- Usual shoe size: UK ${usualSize}
- Primary activity: ${activity}

Give a specific size recommendation from the available sizes. Format your reply as:
🎯 RECOMMENDED SIZE: [size]
📏 REASON: [1-2 sentence explanation]
💡 TIP: [1 short care/wear tip]`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Unable to generate recommendation. Please try again.";
}

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
  const [checkoutData, setCheckoutData] = useState(null);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Load Razorpay SDK once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addToCart = (product, color, size, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id && i.color === color && i.size === size);
      if (ex) return prev.map(i => i.id === product.id && i.color === color && i.size === size ? {...i, qty: i.qty + qty} : i);
      return [...prev, {...product, color, size, qty}];
    });
    showToast("Added to cart! 🛒");
  };

  const removeFromCart = (id, color, size) =>
    setCart(c => c.filter(i => !(i.id === id && i.color === color && i.size === size)));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const toggleWishlist = (id) => {
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
    showToast(wishlist.includes(id) ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  const placeOrder = async (formData, paymentId) => {
    const order = {
      id: generateOrderId(),
      ...formData,
      items: [...cart],
      total: cartTotal + (cartTotal >= 3999 ? 0 : 99),
      paymentId,
      status: "Order Placed",
      statusIndex: 0,
      date: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN"),
    };
    setOrders(prev => [order, ...prev]);
    setCart([]);
    setCheckoutData(order);
    await sendOrderEmail(order);   // ← EmailJS notification
    setPage("order-success");
    showToast("Order placed! Confirmation email sent 🎉");
  };

  // AI Chat (general assistant)
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiChat(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);
    try {
      const productContext = products.map(p =>
        `${p.name} by ${p.brand}: ₹${p.price}, Sizes:${p.sizes.join(",")}, Colors:${p.colors.join("|")}, Fit:${p.fit}, Stock:${p.stock}`
      ).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful sneaker shopping assistant for SneakX store. Help customers find perfect sneakers, answer sizing questions, and assist with orders. Be enthusiastic, knowledgeable and concise.\n\nCurrent inventory:\n${productContext}`,
          messages: [...aiChat, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      setAiChat(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Sorry, try again!" }]);
    } catch {
      setAiChat(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again!" }]);
    }
    setAiLoading(false);
  };

  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    })
    .filter(p => filterCategory === "All" || p.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  const categories = ["All", ...new Set(products.map(p => p.category))];

  return (
    <div style={{ fontFamily: "'Syne', 'Barlow', sans-serif", background: "#0a0a0a", color: "#f0f0f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#0a0a0a;}::-webkit-scrollbar-thumb{background:#ff3c00;border-radius:3px;}
        .btn-primary{background:#ff3c00;color:#fff;border:none;padding:12px 28px;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:4px;}
        .btn-primary:hover{background:#ff5020;transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,60,0,.35);}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed;transform:none;}
        .btn-outline{background:transparent;color:#f0f0f0;border:1.5px solid #333;padding:11px 28px;font-family:'Syne',sans-serif;font-weight:600;font-size:14px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:4px;}
        .btn-outline:hover{border-color:#ff3c00;color:#ff3c00;}
        .card{background:#141414;border:1px solid #1e1e1e;border-radius:12px;overflow:hidden;transition:transform .2s,box-shadow .2s;}
        .card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(255,60,0,.09);}
        input,select,textarea{background:#1a1a1a;border:1.5px solid #2a2a2a;color:#f0f0f0;padding:12px 16px;border-radius:8px;font-family:'Barlow',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color .2s;}
        input:focus,select:focus,textarea:focus{border-color:#ff3c00;}
        select option{background:#1a1a1a;}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
        .badge-orange{background:rgba(255,60,0,.2);color:#ff3c00;border:1px solid rgba(255,60,0,.3);}
        .badge-green{background:rgba(0,200,100,.2);color:#00c864;border:1px solid rgba(0,200,100,.3);}
        .badge-blue{background:rgba(0,150,255,.2);color:#0096ff;border:1px solid rgba(0,150,255,.3);}
        .badge-red{background:rgba(255,50,50,.2);color:#ff5555;border:1px solid rgba(255,50,50,.3);}
        .grid-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;}
        .nav-link{color:#aaa;text-decoration:none;font-family:'Syne',sans-serif;font-weight:600;font-size:13px;letter-spacing:1px;text-transform:uppercase;transition:color .2s;cursor:pointer;}
        .nav-link:hover,.nav-link.active{color:#ff3c00;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideRight{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        .fade-up{animation:fadeUp .4s ease both;}
        @media(max-width:700px){.grid-products{grid-template-columns:1fr 1fr;}.hide-mobile{display:none!important;}}
        @media(max-width:440px){.grid-products{grid-template-columns:1fr;}}
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background: toast.type==="error"?"#c0392b":"#ff3c00", color:"#fff", padding:"12px 20px", borderRadius:8, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, boxShadow:"0 8px 32px rgba(0,0,0,.5)", animation:"slideRight .3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* AI CHAT BUBBLE */}
      <div style={{ position:"fixed", bottom:24, left:24, zIndex:9998 }}>
        {showAiChat && (
          <div style={{ background:"#141414", border:"1px solid #2a2a2a", borderRadius:16, width:330, marginBottom:12, boxShadow:"0 20px 60px rgba(0,0,0,.7)" }}>
            <div style={{ background:"#ff3c00", padding:"12px 16px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>🤖 SneakX AI Assistant</span>
              <span onClick={() => setShowAiChat(false)} style={{ cursor:"pointer", fontSize:20, lineHeight:1 }}>×</span>
            </div>
            <div style={{ height:270, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
              {aiChat.length === 0 && (
                <p style={{ color:"#555", fontSize:13, fontFamily:"'Barlow',sans-serif", lineHeight:1.7 }}>
                  Hi! Ask me about sizes, styles, care tips, or let me find the perfect sneaker for you 👟
                </p>
              )}
              {aiChat.map((m, i) => (
                <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", background:m.role==="user"?"#ff3c00":"#1e1e1e", color:"#fff", padding:"9px 13px", borderRadius:m.role==="user"?"12px 12px 0 12px":"12px 12px 12px 0", fontSize:13, fontFamily:"'Barlow',sans-serif", maxWidth:"88%", lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div style={{ alignSelf:"flex-start", background:"#1e1e1e", padding:"9px 16px", borderRadius:"12px 12px 12px 0", fontSize:13, color:"#555" }}>
                  Thinking…
                </div>
              )}
            </div>
            <div style={{ padding:"10px 12px", borderTop:"1px solid #1e1e1e", display:"flex", gap:8 }}>
              <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAiMessage()} placeholder="Ask anything…" style={{ flex:1, padding:"8px 12px", fontSize:13 }} />
              <button onClick={sendAiMessage} className="btn-primary" style={{ padding:"8px 14px", fontSize:13 }}>→</button>
            </div>
          </div>
        )}
        <button onClick={() => setShowAiChat(!showAiChat)} style={{ background:"#ff3c00", border:"none", borderRadius:"50%", width:52, height:52, fontSize:22, cursor:"pointer", boxShadow:"0 4px 20px rgba(255,60,0,.45)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {showAiChat ? "×" : "🤖"}
        </button>
      </div>

      {/* NAVBAR */}
      <nav style={{ background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", borderBottom:"1px solid #1a1a1a", position:"sticky", top:0, zIndex:1000, padding:"0 24px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div onClick={() => setPage("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, background:"#ff3c00", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>👟</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:-1 }}>SNEAK<span style={{ color:"#ff3c00" }}>X</span></span>
          </div>
          <div style={{ display:"flex", gap:28, alignItems:"center" }} className="hide-mobile">
            {[["home","Home"],["shop","Shop"],["track","Track Order"],["contact","Contact"]].map(([p,l]) => (
              <span key={p} onClick={() => setPage(p)} className={`nav-link${page===p?" active":""}`}>{l}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <span onClick={() => setPage("wishlist")} style={{ cursor:"pointer", position:"relative", fontSize:20 }}>
              ❤️{wishlist.length>0&&<span style={{ position:"absolute", top:-6, right:-6, background:"#ff3c00", borderRadius:"50%", width:16, height:16, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{wishlist.length}</span>}
            </span>
            <span onClick={() => setPage("cart")} style={{ cursor:"pointer", position:"relative", fontSize:20 }}>
              🛒{cartCount>0&&<span style={{ position:"absolute", top:-6, right:-6, background:"#ff3c00", borderRadius:"50%", width:16, height:16, fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{cartCount}</span>}
            </span>
            <button onClick={() => setPage(adminLoggedIn?"admin":"admin-login")} className="btn-outline" style={{ padding:"7px 16px", fontSize:12 }}>
              {adminLoggedIn?"🛡 Admin":"Admin"}
            </button>
          </div>
        </div>
      </nav>

      {/* PAGES */}
      {page==="home"        && <HomePage products={products} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />}
      {page==="shop"        && <ShopPage products={filteredProducts} categories={categories} filterCategory={filterCategory} setFilterCategory={setFilterCategory} sortBy={sortBy} setSortBy={setSortBy} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />}
      {page==="product"     && <ProductPage product={selectedProduct} setPage={setPage} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} products={products} setSelectedProduct={setSelectedProduct} />}
      {page==="cart"        && <CartPage cart={cart} removeFromCart={removeFromCart} setCart={setCart} cartTotal={cartTotal} setPage={setPage} />}
      {page==="checkout"    && <CheckoutPage cart={cart} cartTotal={cartTotal} placeOrder={placeOrder} setPage={setPage} showToast={showToast} />}
      {page==="order-success"&&<OrderSuccessPage order={checkoutData} setPage={setPage} />}
      {page==="track"       && <TrackPage orders={orders} trackOrderId={trackOrderId} setTrackOrderId={setTrackOrderId} trackResult={trackResult} setTrackResult={setTrackResult} />}
      {page==="wishlist"    && <WishlistPage products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />}
      {page==="contact"     && <ContactPage />}
      {page==="admin-login" && <AdminLoginPage setAdminLoggedIn={setAdminLoggedIn} setPage={setPage} showToast={showToast} />}
      {page==="admin"&&adminLoggedIn&&<AdminDashboard products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} setPage={setPage} setAdminLoggedIn={setAdminLoggedIn} adminTab={adminTab} setAdminTab={setAdminTab} editProduct={editProduct} setEditProduct={setEditProduct} showToast={showToast} />}

      {/* FOOTER */}
      <footer style={{ background:"#080808", borderTop:"1px solid #1a1a1a", padding:"48px 24px 24px", marginTop:80 }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:40, marginBottom:40 }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, marginBottom:16 }}>SNEAK<span style={{ color:"#ff3c00" }}>X</span></div>
              <p style={{ color:"#555", fontSize:13, lineHeight:1.9, fontFamily:"'Barlow',sans-serif" }}>Premium sneakers for every lifestyle. From streets to stadiums, we've got your sole covered.</p>
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:16, fontSize:12, letterSpacing:2, textTransform:"uppercase", color:"#ff3c00" }}>Shop</div>
              {["Running","Lifestyle","Training","Skate"].map(l=>(
                <div key={l} onClick={()=>{setFilterCategory(l);setPage("shop");}} style={{ color:"#555", fontSize:13, marginBottom:9, cursor:"pointer", fontFamily:"'Barlow',sans-serif", transition:"color .2s" }} onMouseEnter={e=>e.target.style.color="#ff3c00"} onMouseLeave={e=>e.target.style.color="#555"}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:16, fontSize:12, letterSpacing:2, textTransform:"uppercase", color:"#ff3c00" }}>Help</div>
              {["Order Tracking","Size Guide","Returns & Refunds","FAQ"].map(l=>(
                <div key={l} style={{ color:"#555", fontSize:13, marginBottom:9, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:16, fontSize:12, letterSpacing:2, textTransform:"uppercase", color:"#ff3c00" }}>Contact</div>
              <p style={{ color:"#555", fontSize:13, lineHeight:2.1, fontFamily:"'Barlow',sans-serif" }}>📧 Yearoneofthe@gmail.com<br/>📍 India<br/>⏰ Mon–Sat · 9AM–6PM IST</p>
            </div>
          </div>
          <div style={{ borderTop:"1px solid #1a1a1a", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <p style={{ color:"#333", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>© 2025 SneakX. All rights reserved.</p>
            <div style={{ display:"flex", gap:10 }}>
              {["UPI","Razorpay","Stripe","COD"].map(p=>(
                <span key={p} style={{ background:"#1a1a1a", color:"#555", padding:"4px 10px", borderRadius:4, fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>{p}</span>
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

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featured.length), 4000);
    return () => clearInterval(t);
  }, [featured.length]);

  return (
    <div>
      {/* HERO */}
      <section style={{ background:"linear-gradient(135deg,#0a0a0a 0%,#111 50%,#0a0a0a 100%)", padding:"80px 24px 100px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"8%", right:"4%", width:480, height:480, background:"radial-gradient(circle,rgba(255,60,0,.07) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1280, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <div className="fade-up">
            <div className="badge badge-orange" style={{ marginBottom:20 }}>New Season 2025</div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(40px,6vw,80px)", lineHeight:1.03, letterSpacing:-3, marginBottom:20 }}>
              STEP INTO<br/>YOUR <span style={{ color:"#ff3c00" }}>POWER</span>
            </h1>
            <p style={{ color:"#777", fontSize:17, lineHeight:1.9, marginBottom:36, fontFamily:"'Barlow',sans-serif", fontWeight:300 }}>
              Discover premium sneakers from the world's top brands. Every pair engineered for performance, designed for culture.
            </p>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <button className="btn-primary" onClick={()=>setPage("shop")} style={{ fontSize:15, padding:"15px 38px" }}>Shop Now →</button>
              <button className="btn-outline" onClick={()=>setPage("track")} style={{ fontSize:15 }}>Track Order</button>
            </div>
            <div style={{ display:"flex", gap:40, marginTop:52 }}>
              {[["500+","Products"],["50K+","Customers"],["100%","Authentic"]].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:"#ff3c00" }}>{n}</div>
                  <div style={{ color:"#555", fontSize:11, letterSpacing:2, textTransform:"uppercase", fontFamily:"'Barlow',sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ background:"linear-gradient(135deg,#1a1a1a,#111)", borderRadius:24, overflow:"hidden", aspectRatio:"1", position:"relative", border:"1px solid #222" }}>
              <img src={featured[heroIdx]?.images[0]} alt={featured[heroIdx]?.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"opacity .5s" }} />
              <div style={{ position:"absolute", bottom:24, left:24, right:24, background:"rgba(10,10,10,.9)", backdropFilter:"blur(12px)", borderRadius:12, padding:"16px 20px", border:"1px solid #222" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16 }}>{featured[heroIdx]?.name}</div>
                    <div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>{featured[heroIdx]?.brand}</div>
                  </div>
                  <div style={{ color:"#ff3c00", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22 }}>{formatPrice(featured[heroIdx]?.price)}</div>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:14, justifyContent:"center" }}>
              {featured.map((_,i)=>(
                <div key={i} onClick={()=>setHeroIdx(i)} style={{ width:i===heroIdx?24:8, height:8, borderRadius:4, background:i===heroIdx?"#ff3c00":"#222", cursor:"pointer", transition:"all .3s" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ padding:"72px 24px 80px", maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:36 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:34, letterSpacing:-1 }}>Featured <span style={{ color:"#ff3c00" }}>Picks</span></h2>
          <button className="btn-outline" onClick={()=>setPage("shop")} style={{ padding:"8px 20px", fontSize:12 }}>View All →</button>
        </div>
        <div className="grid-products">
          {products.slice(0,6).map(p=>(
            <ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />
          ))}
        </div>
      </section>

      {/* BANNER */}
      <section style={{ background:"#ff3c00", padding:"64px 24px", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(24px,4vw,52px)", marginBottom:14, letterSpacing:-2 }}>FREE SHIPPING ON ORDERS OVER ₹3,999</h2>
        <p style={{ fontSize:16, opacity:.85, fontFamily:"'Barlow',sans-serif", marginBottom:28 }}>Pan-India delivery · 7-day returns · 100% authentic guarantee</p>
        <button onClick={()=>setPage("shop")} style={{ background:"#fff", color:"#ff3c00", border:"none", padding:"14px 38px", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, cursor:"pointer", borderRadius:4, letterSpacing:1 }}>SHOP NOW</button>
      </section>
    </div>
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================
function ProductCard({ product, setPage, setSelectedProduct, addToCart, toggleWishlist, wishlist }) {
  const [hover, setHover] = useState(false);
  const discount = getDiscount(product.originalPrice, product.price);
  return (
    <div className="card">
      <div style={{ position:"relative", aspectRatio:"1", overflow:"hidden", cursor:"pointer" }} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onClick={()=>{setSelectedProduct(product);setPage("product");}}>
        <img src={product.images[hover&&product.images[1]?1:0]} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .5s", transform:hover?"scale(1.04)":"scale(1)" }} />
        <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:6 }}>
          {product.featured&&<span className="badge badge-orange">Featured</span>}
          <span className="badge badge-green">-{discount}%</span>
        </div>
        <div onClick={e=>{e.stopPropagation();toggleWishlist(product.id);}} style={{ position:"absolute", top:12, right:12, width:36, height:36, background:"rgba(10,10,10,.85)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, cursor:"pointer" }}>
          {wishlist.includes(product.id)?"❤️":"🤍"}
        </div>
      </div>
      <div style={{ padding:"16px 20px 20px" }}>
        <div style={{ color:"#555", fontSize:11, fontFamily:"'Barlow',sans-serif", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{product.brand} · {product.category}</div>
        <div onClick={()=>{setSelectedProduct(product);setPage("product");}} style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, marginBottom:10, cursor:"pointer" }}>{product.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#ff3c00" }}>{formatPrice(product.price)}</span>
          <span style={{ color:"#333", fontSize:13, textDecoration:"line-through", fontFamily:"'Barlow',sans-serif" }}>{formatPrice(product.originalPrice)}</span>
        </div>
        <button className="btn-primary" onClick={()=>{setSelectedProduct(product);setPage("product");}} style={{ width:"100%", padding:"10px" }}>View Details</button>
      </div>
    </div>
  );
}

// ============================================================
// SHOP PAGE
// ============================================================
function ShopPage({ products, categories, filterCategory, setFilterCategory, sortBy, setSortBy, searchQuery, setSearchQuery, setPage, setSelectedProduct, addToCart, toggleWishlist, wishlist }) {
  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"48px 24px" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:40, letterSpacing:-2, marginBottom:8 }}>All <span style={{ color:"#ff3c00" }}>Sneakers</span></h1>
      <p style={{ color:"#555", fontFamily:"'Barlow',sans-serif", marginBottom:32 }}>{products.length} products</p>
      <div style={{ display:"flex", gap:14, marginBottom:36, flexWrap:"wrap" }}>
        <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="🔍  Search sneakers, brands…" style={{ flex:1, minWidth:200 }} />
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{ width:"auto", minWidth:140 }}>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:"auto", minWidth:170 }}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>
      {products.length===0?(
        <div style={{ textAlign:"center", padding:"80px 0", color:"#333" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>👟</div>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20 }}>No sneakers found</p>
        </div>
      ):(
        <div className="grid-products">
          {products.map(p=><ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 🆕 AI SIZE RECOMMENDER WIDGET (Extension 3)
// ============================================================
function AISizeRecommender({ product }) {
  const [open, setOpen] = useState(false);
  const [footLength, setFootLength] = useState("");
  const [footWidth, setFootWidth] = useState("standard");
  const [usualSize, setUsualSize] = useState("");
  const [activity, setActivity] = useState("casual");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    if (!footLength || !usualSize) { alert("Please enter foot length and usual size"); return; }
    setLoading(true);
    setResult(null);
    const r = await getAISizeRecommendation(product, footLength, footWidth, usualSize, activity);
    setResult(r);
    setLoading(false);
  };

  return (
    <div style={{ marginBottom:24 }}>
      <button onClick={()=>setOpen(!open)} style={{ background:"rgba(0,150,255,.08)", border:"1.5px solid rgba(0,150,255,.25)", color:"#0096ff", padding:"10px 18px", borderRadius:8, cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:8, transition:"all .2s", width:"100%" }}>
        🤖 AI Size Recommender {open?"▲":"▼"}
      </button>
      {open && (
        <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"0 0 12px 12px", padding:20, marginTop:-1 }}>
          <p style={{ color:"#666", fontSize:13, fontFamily:"'Barlow',sans-serif", marginBottom:16, lineHeight:1.6 }}>
            Let AI find your perfect size for <strong style={{ color:"#f0f0f0" }}>{product.name}</strong>
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#555", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 }}>Foot Length (cm)</label>
              <input type="number" placeholder="e.g. 26.5" value={footLength} onChange={e=>setFootLength(e.target.value)} style={{ padding:"9px 12px", fontSize:13 }} />
            </div>
            <div>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#555", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 }}>Usual Size (UK)</label>
              <input type="number" placeholder="e.g. 9" value={usualSize} onChange={e=>setUsualSize(e.target.value)} style={{ padding:"9px 12px", fontSize:13 }} />
            </div>
            <div>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#555", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 }}>Foot Width</label>
              <select value={footWidth} onChange={e=>setFootWidth(e.target.value)} style={{ padding:"9px 12px", fontSize:13 }}>
                <option value="narrow">Narrow</option>
                <option value="standard">Standard</option>
                <option value="wide">Wide</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#555", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 }}>Activity</label>
              <select value={activity} onChange={e=>setActivity(e.target.value)} style={{ padding:"9px 12px", fontSize:13 }}>
                <option value="casual">Casual / Daily</option>
                <option value="running">Running / Sport</option>
                <option value="training">Training / Gym</option>
                <option value="skate">Skate / Street</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleGet} disabled={loading} style={{ width:"100%", padding:"11px", fontSize:13 }}>
            {loading ? "AI is thinking… 🤔" : "Get My Size →"}
          </button>
          {result && (
            <div style={{ marginTop:16, background:"rgba(0,150,255,.07)", border:"1px solid rgba(0,150,255,.2)", borderRadius:10, padding:16 }}>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, lineHeight:1.8, color:"#ccc", whiteSpace:"pre-wrap" }}>{result}</p>
            </div>
          )}
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
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"48px 24px" }}>
      <button onClick={()=>setPage("shop")} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:14, marginBottom:32, display:"flex", alignItems:"center", gap:8 }}>← Back to Shop</button>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, marginBottom:80 }}>
        {/* Gallery */}
        <div>
          <div style={{ borderRadius:16, overflow:"hidden", aspectRatio:"1", marginBottom:12, border:"1px solid #222", background:"#141414" }}>
            <img src={product.images[activeImg]} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {product.images.map((img,i)=>(
              <div key={i} onClick={()=>setActiveImg(i)} style={{ width:80, height:80, borderRadius:8, overflow:"hidden", cursor:"pointer", border:`2px solid ${activeImg===i?"#ff3c00":"#2a2a2a"}`, flex:"0 0 80px" }}>
                <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            <span className="badge badge-orange">{product.category}</span>
            <span className={`badge ${product.stock>10?"badge-green":product.stock>0?"badge-orange":"badge-red"}`}>
              {product.stock>10?"In Stock":product.stock>0?`Only ${product.stock} left`:"Out of Stock"}
            </span>
          </div>
          <div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{product.brand}</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(26px,3vw,38px)", letterSpacing:-1, marginBottom:20, lineHeight:1.1 }}>{product.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
            <span style={{ color:"#ff3c00", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36 }}>{formatPrice(product.price)}</span>
            <div>
              <div style={{ color:"#444", fontSize:14, textDecoration:"line-through", fontFamily:"'Barlow',sans-serif" }}>{formatPrice(product.originalPrice)}</div>
              <div style={{ color:"#00c864", fontSize:12, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>Save {formatPrice(product.originalPrice-product.price)}</div>
            </div>
          </div>

          {/* Color picker */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:"uppercase", marginBottom:10, color:"#888" }}>Color — <span style={{ color:"#f0f0f0" }}>{selectedColor}</span></div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {product.colors.map(c=>(
                <button key={c} onClick={()=>setSelectedColor(c)} style={{ padding:"6px 14px", borderRadius:6, border:`2px solid ${selectedColor===c?"#ff3c00":"#2a2a2a"}`, background:selectedColor===c?"rgba(255,60,0,.1)":"#1a1a1a", color:"#f0f0f0", cursor:"pointer", fontFamily:"'Barlow',sans-serif", fontSize:12, transition:"all .2s" }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:"uppercase", marginBottom:10, color:"#888" }}>Size (UK) {selectedSize&&<span style={{ color:"#f0f0f0" }}>— {selectedSize}</span>}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {product.sizes.map(s=>(
                <button key={s} onClick={()=>setSelectedSize(s)} style={{ width:48, height:48, borderRadius:8, border:`2px solid ${selectedSize===s?"#ff3c00":"#2a2a2a"}`, background:selectedSize===s?"rgba(255,60,0,.15)":"#1a1a1a", color:selectedSize===s?"#ff3c00":"#f0f0f0", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, transition:"all .2s" }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:"uppercase", color:"#888" }}>Qty:</span>
            <div style={{ display:"flex", alignItems:"center", border:"1.5px solid #2a2a2a", borderRadius:8, overflow:"hidden" }}>
              <button onClick={()=>setQty(Math.max(1,qty-1))} style={{ width:36, height:36, background:"#1a1a1a", border:"none", color:"#f0f0f0", cursor:"pointer", fontSize:18 }}>−</button>
              <span style={{ width:40, textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:700 }}>{qty}</span>
              <button onClick={()=>setQty(qty+1)} style={{ width:36, height:36, background:"#1a1a1a", border:"none", color:"#f0f0f0", cursor:"pointer", fontSize:18 }}>+</button>
            </div>
          </div>

          {/* 🆕 AI Size Recommender */}
          <AISizeRecommender product={product} />

          <div style={{ display:"flex", gap:12, marginBottom:12 }}>
            <button className="btn-primary" onClick={handleAddToCart} style={{ flex:1, padding:"13px" }}>Add to Cart 🛒</button>
            <button onClick={()=>toggleWishlist(product.id)} style={{ width:50, height:50, background:"#1a1a1a", border:"1.5px solid #2a2a2a", borderRadius:8, fontSize:20, cursor:"pointer" }}>
              {wishlist.includes(product.id)?"❤️":"🤍"}
            </button>
          </div>
          <button className="btn-outline" onClick={()=>{handleAddToCart();if(selectedSize)setPage("checkout");}} style={{ width:"100%", padding:"12px", background:"rgba(255,60,0,.06)" }}>Buy Now →</button>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:24 }}>
            {[["🚚","Free Delivery","Over ₹3999"],["↩️","7-Day Return","Easy returns"],["✅","Authentic","100% genuine"]].map(([icon,title,sub])=>(
              <div key={title} style={{ textAlign:"center", padding:"12px 8px", background:"#141414", borderRadius:8, border:"1px solid #1e1e1e" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11 }}>{title}</div>
                <div style={{ color:"#555", fontSize:10, fontFamily:"'Barlow',sans-serif" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:"1px solid #1e1e1e", marginBottom:28, display:"flex", gap:28 }}>
        {["description","specs"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ background:"none", border:"none", borderBottom:`2px solid ${tab===t?"#ff3c00":"transparent"}`, color:tab===t?"#ff3c00":"#555", padding:"12px 0", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:1, textTransform:"uppercase", transition:"all .2s" }}>{t}</button>
        ))}
      </div>
      {tab==="description"&&<p style={{ color:"#aaa", lineHeight:1.9, fontFamily:"'Barlow',sans-serif", fontSize:15, maxWidth:720 }}>{product.description}</p>}
      {tab==="specs"&&(
        <div style={{ maxWidth:500 }}>
          {[["Brand",product.brand],["Category",product.category],["Sizing",product.fit.replace(/-/g," ")],["Arch Support",product.arch],["Width",product.width],["Available Sizes",product.sizes.join(", ")],["Stock",`${product.stock} units`]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #1a1a1a" }}>
              <span style={{ color:"#555", fontFamily:"'Barlow',sans-serif", fontSize:14 }}>{k}</span>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, textTransform:"capitalize" }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {similar.length>0&&(
        <div style={{ marginTop:64 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, letterSpacing:-1, marginBottom:28 }}>You May Also <span style={{ color:"#ff3c00" }}>Like</span></h2>
          <div className="grid-products">
            {similar.map(p=><ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />)}
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
  if (cart.length===0) return (
    <div style={{ textAlign:"center", padding:"120px 24px" }}>
      <div style={{ fontSize:64, marginBottom:20 }}>🛒</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, marginBottom:12 }}>Your cart is empty</h2>
      <button className="btn-primary" onClick={()=>setPage("shop")} style={{ marginTop:8 }}>Shop Now →</button>
    </div>
  );

  const delivery = cartTotal >= 3999 ? 0 : 99;

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, letterSpacing:-1, marginBottom:36 }}>Shopping <span style={{ color:"#ff3c00" }}>Cart</span></h1>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:28 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {cart.map((item,i)=>(
            <div key={i} className="card" style={{ padding:20, display:"flex", gap:18, alignItems:"center" }}>
              <img src={item.images[0]} alt={item.name} style={{ width:88, height:88, objectFit:"cover", borderRadius:10, flex:"0 0 88px" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:4 }}>{item.name}</div>
                <div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif", marginBottom:10 }}>{item.brand} · {item.color} · Size {item.size}</div>
                <div style={{ display:"flex", alignItems:"center", border:"1.5px solid #2a2a2a", borderRadius:6, overflow:"hidden", width:"fit-content" }}>
                  <button onClick={()=>{if(item.qty>1)setCart(c=>c.map((x,idx)=>idx===i?{...x,qty:x.qty-1}:x));else removeFromCart(item.id,item.color,item.size);}} style={{ width:30, height:30, background:"#1a1a1a", border:"none", color:"#f0f0f0", cursor:"pointer" }}>−</button>
                  <span style={{ width:32, textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{item.qty}</span>
                  <button onClick={()=>setCart(c=>c.map((x,idx)=>idx===i?{...x,qty:x.qty+1}:x))} style={{ width:30, height:30, background:"#1a1a1a", border:"none", color:"#f0f0f0", cursor:"pointer" }}>+</button>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#ff3c00", fontSize:18 }}>{formatPrice(item.price*item.qty)}</div>
                <button onClick={()=>removeFromCart(item.id,item.color,item.size)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:12, fontFamily:"'Barlow',sans-serif", marginTop:8 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:28, height:"fit-content", position:"sticky", top:80 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:22 }}>Order Summary</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#777", fontFamily:"'Barlow',sans-serif", fontSize:14 }}>
              <span>Subtotal</span><span>{formatPrice(cartTotal)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#777", fontFamily:"'Barlow',sans-serif", fontSize:14 }}>
              <span>Delivery</span><span style={{ color:"#00c864" }}>{delivery===0?"FREE":formatPrice(delivery)}</span>
            </div>
            <div style={{ borderTop:"1px solid #2a2a2a", paddingTop:12, display:"flex", justifyContent:"space-between", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20 }}>
              <span>Total</span><span style={{ color:"#ff3c00" }}>{formatPrice(cartTotal+delivery)}</span>
            </div>
          </div>
          <button className="btn-primary" onClick={()=>setPage("checkout")} style={{ width:"100%", padding:"14px" }}>Checkout →</button>
          <button className="btn-outline" onClick={()=>setPage("shop")} style={{ width:"100%", padding:"11px", marginTop:10 }}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHECKOUT PAGE  (Extension 1 — Razorpay integrated)
// ============================================================
function CheckoutPage({ cart, cartTotal, placeOrder, setPage, showToast }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"", city:"", state:"", pincode:"", paymentMethod:"Razorpay", upiId:"" });
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");
  const delivery = cartTotal >= 3999 ? 0 : 99;
  const total = cartTotal + delivery;

  const validateStep1 = () => {
    const required = ["name","email","phone","address","city","state","pincode"];
    for (let f of required) if (!form[f]) { alert(`Please fill: ${f}`); return false; }
    if (!/^\d{10}$/.test(form.phone)) { alert("Enter valid 10-digit mobile number"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert("Enter valid email"); return false; }
    if (!/^\d{6}$/.test(form.pincode)) { alert("Enter valid 6-digit pincode"); return false; }
    return true;
  };

  const handlePay = () => {
    setPayError("");
    setProcessing(true);
    const orderId = generateOrderId();

    if (form.paymentMethod === "Razorpay") {
      openRazorpay({
        amount: total,
        orderId,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        onSuccess: (paymentId) => {
          setProcessing(false);
          placeOrder(form, paymentId);
        },
        onFailure: (reason) => {
          setProcessing(false);
          if (reason !== "DISMISSED") {
            setPayError("Payment failed: " + reason);
            showToast("Payment failed ❌", "error");
          }
        },
      });
      // Razorpay opens a modal; processing state will resolve via callbacks
      setTimeout(() => setProcessing(false), 500);
    } else if (form.paymentMethod === "COD") {
      setTimeout(() => {
        setProcessing(false);
        placeOrder(form, "COD_" + Date.now());
      }, 1200);
    } else {
      // Stripe / UPI demo
      setTimeout(() => {
        setProcessing(false);
        placeOrder(form, form.paymentMethod.toUpperCase() + "_DEMO_" + Date.now());
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, letterSpacing:-1, marginBottom:10 }}>Checkout</h1>

      {/* Step indicator */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:36 }}>
        {["Delivery","Payment","Confirm"].map((s,i)=>(
          <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:step>i+1?"#00c864":step===i+1?"#ff3c00":"#1a1a1a", border:`2px solid ${step>=i+1?"transparent":"#2a2a2a"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:"#fff" }}>
              {step>i+1?"✓":i+1}
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, color:step===i+1?"#ff3c00":"#444" }}>{s}</span>
            {i<2&&<div style={{ width:28, height:2, background:step>i+1?"#ff3c00":"#1e1e1e" }} />}
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:28 }}>
        <div>
          {/* STEP 1 */}
          {step===1&&(
            <div className="card" style={{ padding:32 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, marginBottom:24 }}>Delivery Details</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {[["name","Full Name","text"],["email","Email","email"],["phone","Mobile (10 digits)","tel"],["pincode","Pincode","text"]].map(([f,p,t])=>(
                  <div key={f}>
                    <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>{p}</label>
                    <input type={t} placeholder={p} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} />
                  </div>
                ))}
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Full Address</label>
                  <textarea placeholder="House no., Street, Area…" rows={3} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{ resize:"none" }} />
                </div>
                {[["city","City"],["state","State"]].map(([f,p])=>(
                  <div key={f}>
                    <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>{p}</label>
                    <input placeholder={p} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={()=>{ if(validateStep1()) setStep(2); }} style={{ marginTop:24, padding:"13px 32px" }}>Continue to Payment →</button>
            </div>
          )}

          {/* STEP 2 */}
          {step===2&&(
            <div className="card" style={{ padding:32 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, marginBottom:24 }}>Payment Method</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
                {[
                  ["Razorpay","⚡ Razorpay — UPI, Cards, Net Banking","Recommended for India"],
                  ["UPI","💳 UPI Direct","Any UPI app"],
                  ["Stripe","🌍 Card Payment (Stripe)","Visa / Mastercard"],
                  ["COD","📦 Cash on Delivery","Pay when delivered"],
                ].map(([val,label,sub])=>(
                  <label key={val} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:form.paymentMethod===val?"rgba(255,60,0,.08)":"#1a1a1a", border:`2px solid ${form.paymentMethod===val?"#ff3c00":"#2a2a2a"}`, borderRadius:10, cursor:"pointer", transition:"all .2s" }}>
                    <input type="radio" name="payment" value={val} checked={form.paymentMethod===val} onChange={e=>setForm({...form,paymentMethod:e.target.value})} style={{ width:"auto" }} />
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{label}</div>
                      <div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>{sub}</div>
                    </div>
                    {val==="Razorpay"&&<span className="badge badge-green" style={{ marginLeft:"auto" }}>Recommended</span>}
                  </label>
                ))}
              </div>
              {form.paymentMethod==="UPI"&&(
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>UPI ID</label>
                  <input placeholder="yourname@upi" value={form.upiId} onChange={e=>setForm({...form,upiId:e.target.value})} />
                </div>
              )}
              <div style={{ background:"rgba(0,150,255,.06)", border:"1px solid rgba(0,150,255,.15)", borderRadius:10, padding:14, marginBottom:20 }}>
                <p style={{ color:"#7ab3cc", fontSize:12, fontFamily:"'Barlow',sans-serif", lineHeight:1.7 }}>
                  🔒 <strong>Razorpay</strong> opens a secure popup to complete payment. Replace <code style={{ background:"#1a1a1a", padding:"1px 5px", borderRadius:3 }}>CONFIG.RAZORPAY_KEY_ID</code> at the top of this file with your real Test/Live key.
                </p>
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <button className="btn-outline" onClick={()=>setStep(1)} style={{ padding:"12px 24px" }}>← Back</button>
                <button className="btn-primary" onClick={()=>setStep(3)} style={{ flex:1, padding:"13px" }}>Review Order →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&(
            <div className="card" style={{ padding:32 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, marginBottom:24 }}>Confirm & Pay</h2>
              <div style={{ background:"#111", borderRadius:10, padding:18, marginBottom:16 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:"uppercase", color:"#ff3c00", marginBottom:10 }}>Delivery To</div>
                <p style={{ fontFamily:"'Barlow',sans-serif", color:"#bbb", lineHeight:1.9, fontSize:14 }}>{form.name}<br/>{form.email} · {form.phone}<br/>{form.address}, {form.city}, {form.state} — {form.pincode}</p>
              </div>
              <div style={{ background:"#111", borderRadius:10, padding:18, marginBottom:20 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:"uppercase", color:"#ff3c00", marginBottom:10 }}>Payment</div>
                <p style={{ fontFamily:"'Barlow',sans-serif", color:"#bbb", fontSize:14 }}>{form.paymentMethod}{form.upiId?` · ${form.upiId}`:""}</p>
              </div>
              {payError&&(
                <div style={{ background:"rgba(255,50,50,.1)", border:"1px solid rgba(255,50,50,.25)", borderRadius:8, padding:"10px 14px", color:"#ff7070", fontSize:13, fontFamily:"'Barlow',sans-serif", marginBottom:16 }}>{payError}</div>
              )}
              <div style={{ display:"flex", gap:12 }}>
                <button className="btn-outline" onClick={()=>setStep(2)} style={{ padding:"12px 24px" }}>← Back</button>
                <button className="btn-primary" onClick={handlePay} disabled={processing} style={{ flex:1, padding:"13px", fontSize:15 }}>
                  {processing ? "Processing… ⏳" : `Pay ${formatPrice(total)} →`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card" style={{ padding:24, height:"fit-content", position:"sticky", top:80 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, marginBottom:20 }}>Order Summary</h3>
          {cart.map((item,i)=>(
            <div key={i} style={{ display:"flex", gap:12, marginBottom:14, paddingBottom:14, borderBottom:"1px solid #1a1a1a" }}>
              <img src={item.images[0]} alt={item.name} style={{ width:54, height:54, objectFit:"cover", borderRadius:8 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{item.name}</div>
                <div style={{ color:"#555", fontSize:11, fontFamily:"'Barlow',sans-serif" }}>{item.color} · Sz {item.size} × {item.qty}</div>
                <div style={{ color:"#ff3c00", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginTop:3 }}>{formatPrice(item.price*item.qty)}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid #2a2a2a", paddingTop:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Barlow',sans-serif", color:"#666", fontSize:13, marginBottom:8 }}><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Barlow',sans-serif", color:"#666", fontSize:13, marginBottom:10 }}><span>Delivery</span><span style={{ color:"#00c864" }}>{delivery===0?"FREE":formatPrice(delivery)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#ff3c00" }}><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ORDER SUCCESS
// ============================================================
function OrderSuccessPage({ order, setPage }) {
  if (!order) return null;
  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
      <div style={{ fontSize:80, marginBottom:20 }}>🎉</div>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:40, letterSpacing:-2, marginBottom:12 }}>Order <span style={{ color:"#00c864" }}>Confirmed!</span></h1>
      <p style={{ color:"#777", fontFamily:"'Barlow',sans-serif", fontSize:16, marginBottom:32 }}>Thank you, {order.name}! Your order has been placed successfully.</p>
      <div className="card" style={{ padding:32, textAlign:"left", marginBottom:28 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:20 }}>
          {[["Order ID",order.id],["Payment ID",order.paymentId],["Total",formatPrice(order.total)],["Est. Delivery",order.estimatedDelivery]].map(([k,v])=>(
            <div key={k}>
              <div style={{ color:"#555", fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{k}</div>
              <div style={{ fontFamily:"'Barlow',sans-serif", fontWeight:600, color:k==="Total"?"#ff3c00":"#f0f0f0" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#111", borderRadius:10, padding:16 }}>
          {order.items.map((item,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Barlow',sans-serif", fontSize:13, padding:"4px 0", color:"#bbb" }}>
              <span>{item.name} · {item.color} · Sz{item.size} × {item.qty}</span>
              <span style={{ color:"#ff3c00" }}>{formatPrice(item.price*item.qty)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"rgba(0,200,100,.08)", border:"1px solid rgba(0,200,100,.2)", borderRadius:10, padding:14, marginBottom:28 }}>
        <p style={{ color:"#00c864", fontFamily:"'Barlow',sans-serif", fontSize:14 }}>📧 Order confirmation + admin notification sent via EmailJS</p>
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button className="btn-primary" onClick={()=>setPage("track")}>Track Order →</button>
        <button className="btn-outline" onClick={()=>setPage("shop")}>Continue Shopping</button>
      </div>
    </div>
  );
}

// ============================================================
// TRACK ORDER
// ============================================================
function TrackPage({ orders, trackOrderId, setTrackOrderId, trackResult, setTrackResult }) {
  const handleTrack = () => {
    const found = orders.find(o => o.id.toLowerCase()===trackOrderId.toLowerCase().trim());
    setTrackResult(found || "not-found");
  };

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"64px 24px" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:40, letterSpacing:-2, marginBottom:8 }}>Track <span style={{ color:"#ff3c00" }}>Order</span></h1>
      <p style={{ color:"#555", fontFamily:"'Barlow',sans-serif", marginBottom:36 }}>Enter your order ID for live status updates</p>
      <div style={{ display:"flex", gap:12, marginBottom:36 }}>
        <input value={trackOrderId} onChange={e=>setTrackOrderId(e.target.value)} placeholder="e.g. SNK12345678" onKeyDown={e=>e.key==="Enter"&&handleTrack()} style={{ flex:1 }} />
        <button className="btn-primary" onClick={handleTrack} style={{ padding:"12px 28px" }}>Track</button>
      </div>
      {trackResult==="not-found"&&(
        <div style={{ background:"rgba(255,50,50,.07)", border:"1px solid rgba(255,50,50,.2)", borderRadius:12, padding:28, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>❌</div>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700 }}>Order not found</p>
          <p style={{ color:"#555", fontSize:13, fontFamily:"'Barlow',sans-serif", marginTop:8 }}>Double-check the order ID</p>
        </div>
      )}
      {trackResult&&trackResult!=="not-found"&&(
        <div className="card" style={{ padding:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22 }}>{trackResult.id}</div>
              <div style={{ color:"#555", fontFamily:"'Barlow',sans-serif", fontSize:13 }}>Placed {new Date(trackResult.date).toLocaleDateString("en-IN")}</div>
            </div>
            <span className="badge badge-green">{trackResult.status}</span>
          </div>
          {/* Progress bar */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>Progress</span>
              <span style={{ color:"#ff3c00", fontSize:12, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>{Math.round(((trackResult.statusIndex+1)/TRACKING_STATUSES.length)*100)}%</span>
            </div>
            <div style={{ height:6, background:"#1a1a1a", borderRadius:3 }}>
              <div style={{ height:"100%", width:`${((trackResult.statusIndex+1)/TRACKING_STATUSES.length)*100}%`, background:"linear-gradient(90deg,#ff3c00,#ff6030)", borderRadius:3, transition:"width .6s" }} />
            </div>
          </div>
          {TRACKING_STATUSES.map((status,i)=>{
            const done = i<=trackResult.statusIndex;
            const active = i===trackResult.statusIndex;
            return (
              <div key={status} style={{ display:"flex", gap:14 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:"0 0 auto" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:active?"#ff3c00":done?"#00c864":"#1a1a1a", border:`2px solid ${done?active?"#ff3c00":"#00c864":"#2a2a2a"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:700 }}>
                    {done&&!active?"✓":i+1}
                  </div>
                  {i<TRACKING_STATUSES.length-1&&<div style={{ width:2, height:22, background:i<trackResult.statusIndex?"#00c864":"#1a1a1a" }} />}
                </div>
                <div style={{ paddingBottom:20 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:active?700:500, fontSize:14, color:active?"#ff3c00":done?"#f0f0f0":"#444" }}>{status}</div>
                  {active&&<div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>Current status</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {orders.length>0&&!trackResult&&(
        <div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:14, color:"#555" }}>Recent Orders</h3>
          {orders.slice(0,3).map(o=>(
            <div key={o.id} onClick={()=>{setTrackOrderId(o.id);setTrackResult(o);}} className="card" style={{ padding:16, marginBottom:10, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{o.id}</div>
                <div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>{new Date(o.date).toLocaleDateString("en-IN")} · {o.items.length} item(s)</div>
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
// WISHLIST
// ============================================================
function WishlistPage({ products, wishlist, toggleWishlist, setPage, setSelectedProduct, addToCart }) {
  const wishProducts = products.filter(p=>wishlist.includes(p.id));
  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"48px 24px" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, letterSpacing:-1, marginBottom:32 }}>My <span style={{ color:"#ff3c00" }}>Wishlist</span></h1>
      {wishProducts.length===0?(
        <div style={{ textAlign:"center", padding:"80px 0" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🤍</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24 }}>Wishlist is empty</h2>
          <button className="btn-primary" onClick={()=>setPage("shop")} style={{ marginTop:20 }}>Explore Sneakers →</button>
        </div>
      ):(
        <div className="grid-products">
          {wishProducts.map(p=><ProductCard key={p.id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} />)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CONTACT
// ============================================================
function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ maxWidth:800, margin:"0 auto", padding:"64px 24px" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:40, letterSpacing:-2, marginBottom:8 }}>Contact <span style={{ color:"#ff3c00" }}>Us</span></h1>
      <p style={{ color:"#555", fontFamily:"'Barlow',sans-serif", marginBottom:40 }}>Questions about sizing, orders, or returns? We're here to help.</p>
      {sent?(
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>✉️</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24, color:"#00c864" }}>Message Sent!</h2>
          <p style={{ color:"#555", fontFamily:"'Barlow',sans-serif", marginTop:8 }}>We'll reply within 24 hours.</p>
        </div>
      ):(
        <div className="card" style={{ padding:40 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {[["name","Your Name"],["email","Email"]].map(([f,p])=>(
              <div key={f}>
                <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>{p}</label>
                <input placeholder={p} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} />
              </div>
            ))}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Subject</label>
              <input placeholder="How can we help?" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Message</label>
              <textarea placeholder="Tell us…" rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} style={{ resize:"none" }} />
            </div>
          </div>
          <button className="btn-primary" onClick={()=>setSent(true)} style={{ marginTop:20, padding:"13px 36px" }}>Send Message →</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN LOGIN
// ============================================================
function AdminLoginPage({ setAdminLoggedIn, setPage, showToast }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const handleLogin = () => {
    if (form.email==="admin@sneakx.com"&&form.password==="admin123") {
      setAdminLoggedIn(true); setPage("admin");
      showToast("Welcome back, Admin! 🛡");
    } else setError("Invalid credentials. Demo: admin@sneakx.com / admin123");
  };
  return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="card" style={{ width:"100%", maxWidth:420, padding:48 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:56, height:56, background:"#ff3c00", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 16px" }}>🛡</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, letterSpacing:-1 }}>Admin Login</h1>
        </div>
        {[["email","Email","email","admin@sneakx.com"],["password","Password","password","••••••••"]].map(([f,p,t,ph])=>(
          <div key={f} style={{ marginBottom:16 }}>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>{p}</label>
            <input type={t} placeholder={ph} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
        ))}
        {error&&<div style={{ background:"rgba(255,50,50,.1)", border:"1px solid rgba(255,50,50,.2)", borderRadius:8, padding:"10px 14px", color:"#ff7070", fontSize:13, fontFamily:"'Barlow',sans-serif", marginBottom:14 }}>{error}</div>}
        <button className="btn-primary" onClick={handleLogin} style={{ width:"100%", padding:"14px", marginTop:4 }}>Login</button>
        <p style={{ color:"#333", fontSize:12, textAlign:"center", marginTop:18, fontFamily:"'Barlow',sans-serif" }}>admin@sneakx.com / admin123</p>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ products, setProducts, orders, setOrders, setPage, setAdminLoggedIn, adminTab, setAdminTab, editProduct, setEditProduct, showToast }) {
  const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
  const tabs = [["dashboard","📊 Overview"],["products","👟 Products"],["orders","📦 Orders"],["add-product","➕ Add Product"]];

  const updateOrderStatus = (orderId, newStatus) => {
    const idx = TRACKING_STATUSES.indexOf(newStatus);
    setOrders(orders.map(o=>o.id===orderId?{...o,status:newStatus,statusIndex:idx}:o));
    showToast("Status updated!");
  };
  const deleteProduct = (id) => {
    if(confirm("Delete this product?")) { setProducts(products.filter(p=>p.id!==id)); showToast("Product deleted"); }
  };

  return (
    <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:30, letterSpacing:-1 }}>Admin <span style={{ color:"#ff3c00" }}>Dashboard</span></h1>
          <p style={{ color:"#555", fontFamily:"'Barlow',sans-serif", fontSize:13 }}>SneakX Control Panel</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-outline" onClick={()=>setPage("home")} style={{ padding:"8px 16px", fontSize:12 }}>← View Site</button>
          <button onClick={()=>{setAdminLoggedIn(false);setPage("home");}} style={{ background:"rgba(255,50,50,.08)", border:"1px solid rgba(255,50,50,.2)", color:"#ff7070", padding:"8px 16px", borderRadius:6, cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600 }}>Logout</button>
        </div>
      </div>

      <div style={{ display:"flex", gap:4, borderBottom:"1px solid #1a1a1a", marginBottom:32, flexWrap:"wrap" }}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setAdminTab(id)} style={{ padding:"10px 20px", background:"none", border:"none", borderBottom:`2px solid ${adminTab===id?"#ff3c00":"transparent"}`, color:adminTab===id?"#ff3c00":"#555", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {adminTab==="dashboard"&&(
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:18, marginBottom:32 }}>
            {[["Total Revenue",formatPrice(totalRevenue),"📈","#ff3c00"],["Total Orders",orders.length,"📦","#7c3aed"],["Products",products.length,"👟","#059669"],["Customers",new Set(orders.map(o=>o.email)).size,"👥","#f59e0b"]].map(([label,val,icon,color])=>(
              <div key={label} className="card" style={{ padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ color:"#555", fontSize:11, fontFamily:"'Syne',sans-serif", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color }}>{val}</div>
                  </div>
                  <div style={{ fontSize:28 }}>{icon}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
            <div className="card" style={{ padding:24 }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:18 }}>Recent Orders</h3>
              {orders.length===0?<p style={{ color:"#444", fontFamily:"'Barlow',sans-serif", fontSize:14 }}>No orders yet</p>:orders.slice(0,5).map(o=>(
                <div key={o.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13 }}>{o.id}</div>
                    <div style={{ color:"#555", fontSize:11, fontFamily:"'Barlow',sans-serif" }}>{o.name}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:"#ff3c00", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{formatPrice(o.total)}</div>
                    <span className="badge badge-green" style={{ fontSize:9 }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:24 }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:18 }}>Low Stock Alerts</h3>
              {products.filter(p=>p.stock<30).map(p=>(
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13 }}>{p.name}</div>
                  <span className={`badge ${p.stock<10?"badge-red":"badge-orange"}`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {adminTab==="products"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22 }}>Products ({products.length})</h2>
            <button className="btn-primary" onClick={()=>setAdminTab("add-product")}>+ Add Product</button>
          </div>
          {products.map(p=>(
            <div key={p.id} className="card" style={{ padding:18, display:"flex", gap:16, alignItems:"center", marginBottom:12 }}>
              <img src={p.images[0]} alt={p.name} style={{ width:68, height:68, objectFit:"cover", borderRadius:10, flex:"0 0 68px" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{p.name}</div>
                <div style={{ color:"#555", fontSize:12, fontFamily:"'Barlow',sans-serif" }}>{p.brand} · {p.category} · Stock: {p.stock}</div>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#ff3c00", fontSize:17 }}>{formatPrice(p.price)}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{setEditProduct(p);setAdminTab("add-product");}} style={{ background:"rgba(0,150,255,.1)", border:"1px solid rgba(0,150,255,.2)", color:"#0096ff", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600 }}>Edit</button>
                <button onClick={()=>deleteProduct(p.id)} style={{ background:"rgba(255,50,50,.1)", border:"1px solid rgba(255,50,50,.2)", color:"#ff5555", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDERS */}
      {adminTab==="orders"&&(
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, marginBottom:22 }}>Orders ({orders.length})</h2>
          {orders.length===0?<div style={{ textAlign:"center", padding:"60px 0", color:"#333" }}><div style={{ fontSize:40, marginBottom:12 }}>📦</div><p style={{ fontFamily:"'Syne',sans-serif", fontWeight:600 }}>No orders yet</p></div>:orders.map(o=>(
            <div key={o.id} className="card" style={{ padding:24, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17 }}>{o.id}</div>
                  <div style={{ color:"#666", fontFamily:"'Barlow',sans-serif", fontSize:13 }}>{o.name} · {o.email} · {o.phone}</div>
                  <div style={{ color:"#444", fontFamily:"'Barlow',sans-serif", fontSize:12 }}>📍 {o.address}, {o.city}, {o.state} — {o.pincode}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:"#ff3c00", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20 }}>{formatPrice(o.total)}</div>
                  <div style={{ color:"#444", fontSize:11, fontFamily:"'Barlow',sans-serif" }}>Pay ID: {o.paymentId}</div>
                </div>
              </div>
              <div style={{ background:"#111", borderRadius:8, padding:12, marginBottom:14 }}>
                {o.items.map((item,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", color:"#bbb", fontFamily:"'Barlow',sans-serif", fontSize:13, padding:"3px 0" }}>
                    <span>{item.name} · {item.color} · Sz{item.size} × {item.qty}</span>
                    <span style={{ color:"#ff3c00" }}>{formatPrice(item.price*item.qty)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:12, color:"#666" }}>Update Status:</span>
                <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)} style={{ width:"auto", padding:"6px 12px", fontSize:13 }}>
                  {TRACKING_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <span className="badge badge-blue">{o.paymentMethod}</span>
                <span style={{ color:"#444", fontSize:11, fontFamily:"'Barlow',sans-serif" }}>{new Date(o.date).toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PRODUCT */}
      {adminTab==="add-product"&&(
        <AddEditProductForm products={products} setProducts={setProducts} editProduct={editProduct} setEditProduct={setEditProduct} setAdminTab={setAdminTab} showToast={showToast} />
      )}
    </div>
  );
}

// ============================================================
// ADD / EDIT PRODUCT FORM
// ============================================================
function AddEditProductForm({ products, setProducts, editProduct, setEditProduct, setAdminTab, showToast }) {
  const blank = { name:"", brand:"", price:"", originalPrice:"", category:"Running", description:"", stock:"", featured:false, fit:"true-to-size", arch:"neutral", width:"standard", images:["",""], colors:["White","Black"], sizes:[7,8,9,10] };
  const [form, setForm] = useState(editProduct||blank);
  const [colorsStr, setColorsStr] = useState((editProduct?.colors||["White","Black"]).join(", "));

  const handleSave = () => {
    if (!form.name||!form.brand||!form.price) { alert("Name, Brand and Price are required"); return; }
    const product = {
      ...form,
      id: editProduct?editProduct.id:Date.now(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice)||Number(form.price),
      stock: Number(form.stock)||0,
      colors: colorsStr.split(",").map(c=>c.trim()).filter(Boolean),
      images: form.images.filter(Boolean),
      tags: [],
    };
    if (editProduct) { setProducts(products.map(p=>p.id===editProduct.id?product:p)); showToast("Product updated ✅"); }
    else { setProducts([...products, product]); showToast("Product added 🎉"); }
    setEditProduct(null);
    setAdminTab("products");
  };

  return (
    <div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24, marginBottom:26 }}>{editProduct?"Edit":"Add New"} Product</h2>
      <div className="card" style={{ padding:36 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
          {[["name","Product Name","text"],["brand","Brand","text"],["price","Price (₹)","number"],["originalPrice","Original Price (₹)","number"],["stock","Stock Quantity","number"]].map(([f,p,t])=>(
            <div key={f}>
              <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>{p}</label>
              <input type={t} placeholder={p} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} />
            </div>
          ))}
          <div>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Category</label>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {["Running","Lifestyle","Training","Skate"].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Fit</label>
            <select value={form.fit} onChange={e=>setForm({...form,fit:e.target.value})}>
              {["true-to-size","runs-small","runs-large"].map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Arch</label>
            <select value={form.arch} onChange={e=>setForm({...form,arch:e.target.value})}>
              {["neutral","high","flat"].map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Width</label>
            <select value={form.width} onChange={e=>setForm({...form,width:e.target.value})}>
              {["narrow","standard","wide"].map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Image URL 1</label>
            <input placeholder="https://images.unsplash.com/…" value={form.images[0]} onChange={e=>setForm({...form,images:[e.target.value,form.images[1]]})} />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Image URL 2 (hover)</label>
            <input placeholder="https://…" value={form.images[1]} onChange={e=>setForm({...form,images:[form.images[0],e.target.value]})} />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Colors (comma separated)</label>
            <input placeholder="White/Red, Triple Black, Blue" value={colorsStr} onChange={e=>setColorsStr(e.target.value)} />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:10 }}>Sizes (UK — click to toggle)</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[5,6,7,8,9,10,11,12].map(s=>(
                <button key={s} type="button" onClick={()=>setForm({...form,sizes:form.sizes.includes(s)?form.sizes.filter(x=>x!==s):[...form.sizes,s].sort()})}
                  style={{ width:44, height:44, borderRadius:8, border:`2px solid ${form.sizes.includes(s)?"#ff3c00":"#2a2a2a"}`, background:form.sizes.includes(s)?"rgba(255,60,0,.15)":"#1a1a1a", color:form.sizes.includes(s)?"#ff3c00":"#f0f0f0", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, transition:"all .2s" }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontFamily:"'Syne',sans-serif", fontSize:10, color:"#666", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Description</label>
            <textarea placeholder="Describe the sneaker…" rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ resize:"none" }} />
          </div>
          <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:12 }}>
            <input type="checkbox" id="feat" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} style={{ width:"auto" }} />
            <label htmlFor="feat" style={{ fontFamily:"'Syne',sans-serif", fontSize:14, cursor:"pointer" }}>Mark as Featured</label>
          </div>
        </div>
        <div style={{ display:"flex", gap:12, marginTop:28 }}>
          <button className="btn-primary" onClick={handleSave} style={{ padding:"13px 36px" }}>{editProduct?"Update":"Add"} Product ✓</button>
          <button className="btn-outline" onClick={()=>{setEditProduct(null);setAdminTab("products");}} style={{ padding:"12px 24px" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
