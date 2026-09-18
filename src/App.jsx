import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, Heart,
  Menu, Search, ShoppingBag, Sparkles, Star, Truck, User, X, Instagram,
  MessageCircle, MapPin, Phone, Clock3, SlidersHorizontal, Plus, Pencil,
  Trash2, Package, LayoutDashboard, LogOut, Save
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";

const brand = {
  name: "AbioStore",
  whatsapp: "2349152910157",
  phone: "0915 291 0157",
  address: "14 Akpakpava Road, Benin City, Edo State"
};

const products = [
  { id: 1, name: "Aurelia Satin Dress", category: "Women", price: 68500, oldPrice: 79000, tag: "Bestseller", color: "Champagne", sizes: ["S","M","L","XL"], image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85", desc: "Fluid satin with a soft drape, sculpted waist and an effortless evening silhouette." },
  { id: 2, name: "Noir Tailored Set", category: "Women", price: 92000, tag: "New", color: "Black", sizes: ["S","M","L"], image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85", desc: "A sharp two-piece set cut for a clean, confident silhouette from day to dinner." },
  { id: 3, name: "Edo Linen Shirt", category: "Men", price: 42000, tag: "Essential", color: "Sand", sizes: ["M","L","XL","XXL"], image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85", desc: "Breathable premium linen with relaxed tailoring and a beautifully understated finish." },
  { id: 4, name: "Luna Pleated Midi", category: "Women", price: 57500, color: "Ivory", sizes: ["S","M","L","XL"], image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85", desc: "A feminine pleated midi designed to move beautifully through every occasion." },
  { id: 5, name: "Atlas Knit Polo", category: "Men", price: 38500, tag: "New", color: "Olive", sizes: ["M","L","XL","XXL"], image: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=85", desc: "Textured knit polo with a refined collar and easy luxury for everyday wear." },
  { id: 6, name: "Mini Muse Set", category: "Children", price: 29500, color: "Blush", sizes: ["2Y","4Y","6Y","8Y","10Y"], image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", desc: "Playful, polished and made for little celebrations and big personalities." },
  { id: 7, name: "Sienna Occasion Gown", category: "Women", price: 110000, tag: "Limited", color: "Terracotta", sizes: ["S","M","L"], image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=85", desc: "Statement occasionwear with a dramatic neckline and graceful floor-length fall." },
  { id: 8, name: "Monarch Relaxed Suit", category: "Men", price: 125000, tag: "Signature", color: "Stone", sizes: ["M","L","XL","XXL"], image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85", desc: "Relaxed modern tailoring with a soft shoulder and versatile separates." }
];

const format = n => "₦" + n.toLocaleString("en-NG");

const ADMIN_PIN = "2468"; // Local fallback only when Supabase is not configured.

function dbToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price) || 0,
    oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    tag: row.tag || "",
    color: row.color || "",
    sizes: row.sizes || [],
    image: row.image || row.images?.[0] || "",
    images: row.images || (row.image ? [row.image] : []),
    desc: row.description || "",
    stock: Number(row.stock) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function productToRow(form, images, id) {
  const cover = images[0] || form.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85";
  return {
    ...(id ? { id } : {}),
    name: form.name.trim(),
    category: form.category,
    price: Number(form.price) || 0,
    old_price: form.oldPrice ? Number(form.oldPrice) : null,
    tag: form.tag.trim(),
    color: form.color.trim(),
    sizes: form.sizes.split(",").map(x => x.trim()).filter(Boolean),
    description: form.description.trim(),
    stock: Math.max(0, Number(form.stock) || 0),
    image: cover,
    images
  };
}

async function fetchCatalog() {
  if (!supabase) return products;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(dbToProduct);
}

async function uploadProductImages(files) {
  if (!supabase) return [];
  const urls = [];
  for (const file of files) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
    const path = `products/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function Logo({ onClick }) {
  return <button className="logo" onClick={onClick} aria-label="AbioStore home"><span>A</span>ABIOSTORE</button>;
}

function ProductCard({ product, liked, onLike, onOpen, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap" onClick={() => onOpen(product)}>
        <img src={product.image} alt={product.name} className="product-image" />
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <button className={liked ? "heart-btn liked" : "heart-btn"} onClick={e => { e.stopPropagation(); onLike(product.id); }} aria-label="Wishlist">
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>
        <button className="quick-add" onClick={e => { e.stopPropagation(); onAdd(product); }}>Quick add <ArrowRight size={15}/></button>
      </div>
      <div className="product-info">
        <div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div>
        <div className="price">{format(product.price)}{product.oldPrice && <del>{format(product.oldPrice)}</del>}</div>
      </div>
      <div className="rating"><Star size={13} fill="currentColor"/> 4.9 <span>(24)</span></div>
    </article>
  );
}

function Header({ page, setPage, cartCount, wishlistCount, onSearch, onCart }) {
  const [menu, setMenu] = useState(false);
  return <header className="site-header">
    <div className="announcement">Complimentary delivery in Benin City on orders over ₦100,000 <span>✦</span> Shop the new season</div>
    <div className="nav">
      <button className="mobile-menu" onClick={() => setMenu(!menu)}><Menu/></button>
      <Logo onClick={() => setPage("home")} />
      <nav className={menu ? "nav-links open" : "nav-links"}>
        {["Shop","Women","Men","Children","Lookbook","About"].map(item =>
          <button key={item} onClick={() => { setPage(item === "Shop" ? "shop" : item.toLowerCase()); setMenu(false); }}>{item}</button>
        )}
      </nav>
      <div className="nav-actions">
        <button onClick={onSearch} aria-label="Search"><Search size={20}/></button>
        <button onClick={() => setPage("wishlist")} className="nav-count" aria-label="Wishlist"><Heart size={20}/>{wishlistCount > 0 && <b>{wishlistCount}</b>}</button>
        <button onClick={onCart} className="nav-count" aria-label="Cart"><ShoppingBag size={20}/>{cartCount > 0 && <b>{cartCount}</b>}</button>
      </div>
    </div>
  </header>;
}

function Home({ setPage, onOpen, catalog }) {
  const featured = catalog.slice(0,4);
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow"><Sparkles size={15}/> The new AbioStore</p>
        <h1>Wear your<br/><em>beautiful.</em><br/>every day.</h1>
        <p className="hero-text">Modern fashion for women, men and little ones — thoughtfully selected in Edo State.</p>
        <div className="hero-actions"><button className="btn dark" onClick={() => setPage("shop")}>Explore collection <ArrowRight size={17}/></button><button className="text-btn" onClick={() => setPage("lookbook")}>View lookbook</button></div>
      </div>
      <div className="hero-visual">
        <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
        <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=90" alt="AbioStore new season fashion"/>
        <div className="hero-stamp">EST.<br/><strong>2026</strong><br/>EDO · NIGERIA</div>
      </div>
    </section>
    <section className="marquee"><div>NEW SEASON <span>✦</span> MADE FOR YOU <span>✦</span> BENIN CITY <span>✦</span> NEW SEASON <span>✦</span> MADE FOR YOU <span>✦</span></div></section>
    <section className="section intro">
      <div><p className="eyebrow">A little about us</p><h2>Everyday pieces.<br/><em>Exceptional feeling.</em></h2></div>
      <div className="intro-copy"><p>AbioStore is a family fashion house built around the belief that getting dressed should feel effortless, expressive and distinctly yours.</p><button className="text-btn" onClick={() => setPage("about")}>Our story <ArrowRight size={16}/></button></div>
    </section>
    <section className="section collection">
      <div className="section-head"><div><p className="eyebrow">Curated for you</p><h2>The Abio edit</h2></div><button className="text-btn" onClick={() => setPage("shop")}>Shop all <ArrowRight size={16}/></button></div>
      <div className="product-grid">{featured.map(p => <ProductCard key={p.id} product={p} onOpen={onOpen} onLike={() => {}} onAdd={() => {}} />)}</div>
    </section>
    <section className="editorial">
      <div className="editorial-image"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=90" alt="Fashion editorial"/></div>
      <div className="editorial-copy"><p className="eyebrow">The Abio philosophy</p><h2>Less noise.<br/><em>More style.</em></h2><p>From relaxed tailoring to occasion pieces, our collections are chosen to live beautifully in your wardrobe — not just on a screen.</p><button className="btn outline" onClick={() => setPage("lookbook")}>Discover the lookbook</button></div>
    </section>
    <section className="service-strip">
      <div><Truck/><h4>Delivery across Nigeria</h4><p>Fast, reliable dispatch</p></div>
      <div><Heart/><h4>Curated with care</h4><p>Pieces worth keeping</p></div>
      <div><MessageCircle/><h4>Shop on WhatsApp</h4><p>We're one message away</p></div>
    </section>
  </main>;
}

function Shop({ category="All", setPage, onOpen, wishlist, onLike, onAdd, catalog }) {
  const [active, setActive] = useState(category === "All" ? "All" : category);
  const [sort, setSort] = useState("Featured");
  const [filterOpen, setFilterOpen] = useState(false);
  const filtered = useMemo(() => {
    let list = active === "All" ? [...catalog] : catalog.filter(p => p.category === active);
    if (sort === "Price: Low") list.sort((a,b)=>a.price-b.price);
    if (sort === "Price: High") list.sort((a,b)=>b.price-a.price);
    return list;
  }, [active, sort]);
  return <main className="page">
    <div className="shop-hero"><p className="eyebrow">The collection</p><h1>Find your <em>next</em> favourite.</h1><p>Pieces for the moments you plan — and the ones you don't.</p></div>
    <div className="shop-toolbar">
      <div className="filter-tabs">{["All","Women","Men","Children"].map(c => <button className={active===c?"active":""} onClick={()=>setActive(c)} key={c}>{c}</button>)}</div>
      <div className="sort"><button onClick={()=>setFilterOpen(!filterOpen)}><SlidersHorizontal size={16}/> Sort: {sort}<ChevronDown size={15}/></button>{filterOpen && <div className="sort-menu">{["Featured","Price: Low","Price: High"].map(s=><button key={s} onClick={()=>{setSort(s);setFilterOpen(false)}}>{s}{sort===s&&<Check size={14}/>}</button>)}</div>}</div>
    </div>
    <div className="product-grid shop-grid">{filtered.map(p=><ProductCard key={p.id} product={p} liked={wishlist.includes(p.id)} onLike={onLike} onOpen={onOpen} onAdd={onAdd}/>)}</div>
  </main>;
}

function ProductDetail({ product, onBack, onAdd, liked, onLike }) {
  const [size,setSize]=useState(product.sizes[1] || product.sizes[0]);
  const [qty,setQty]=useState(1);
  return <main className="detail page">
    <button className="back-btn" onClick={onBack}><ChevronLeft size={17}/> Back to collection</button>
    <div className="detail-grid">
      <div className="detail-photo"><img src={product.image} alt={product.name}/><span>{product.tag || "ABIO EDIT"}</span></div>
      <div className="detail-copy"><p className="eyebrow">{product.category} / {product.color}</p><h1>{product.name}</h1><div className="detail-rating"><Star fill="currentColor" size={14}/> 4.9 <span>24 reviews</span></div><div className="detail-price">{format(product.price)} {product.oldPrice && <del>{format(product.oldPrice)}</del>}</div><p className="detail-desc">{product.desc}</p>
      <div className="choice"><div className="choice-head"><span>Size</span><button>Size guide</button></div><div className="size-row">{product.sizes.map(s=><button className={size===s?"selected":""} onClick={()=>setSize(s)} key={s}>{s}</button>)}</div></div>
      <div className="choice"><div className="choice-head"><span>Quantity</span></div><div className="quantity"><button onClick={()=>setQty(Math.max(1,qty-1))}>−</button><b>{qty}</b><button onClick={()=>setQty(qty+1)}>+</button></div></div>
      <div className="detail-actions"><button className="btn dark wide" onClick={()=>onAdd(product, size, qty)}>Add to bag — {format(product.price*qty)} <ShoppingBag size={18}/></button><button className={liked?"wish-large liked":"wish-large"} onClick={()=>onLike(product.id)}><Heart fill={liked?"currentColor":"none"}/></button></div>
      <div className="detail-perks"><p><Truck size={18}/><span><b>Delivery</b> 2–5 business days across Nigeria.</span></p><p><Check size={18}/><span><b>Easy exchange</b> Contact us within 48 hours.</span></p></div>
      </div>
    </div>
  </main>;
}

function Drawer({ cart, onClose, onRemove, onCheckout }) {
  const total=cart.reduce((s,i)=>s+i.product.price*i.qty,0);
  return <div className="overlay"><aside className="drawer"><div className="drawer-head"><h2>Your bag <span>{cart.reduce((s,i)=>s+i.qty,0)}</span></h2><button onClick={onClose}><X/></button></div>{cart.length===0?<div className="empty"><ShoppingBag size={38}/><h3>Your bag is waiting.</h3><p>Add something beautiful to get started.</p></div>:<><div className="drawer-items">{cart.map(i=><div className="cart-item" key={i.product.id+i.size}><img src={i.product.image} alt=""/><div><p className="eyebrow">{i.product.category}</p><h4>{i.product.name}</h4><small>Size {i.size} · Qty {i.qty}</small><strong>{format(i.product.price*i.qty)}</strong><button onClick={()=>onRemove(i.product.id,i.size)}>Remove</button></div></div>)}</div><div className="drawer-footer"><div><span>Subtotal</span><strong>{format(total)}</strong></div><small>Delivery calculated at checkout.</small><button className="btn dark wide" onClick={onCheckout}>Checkout <ArrowRight size={17}/></button><a className="whatsapp-link" href={"https://wa.me/"+brand.whatsapp+"?text="+encodeURIComponent("Hello AbioStore, I'd like to order from my bag.")} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Order via WhatsApp</a></div></>}</aside></div>;
}

function SearchOverlay({ onClose, onOpen, catalog }) {
  const [q,setQ]=useState("");
  const results=catalog.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.category.toLowerCase().includes(q.toLowerCase()));
  return <div className="overlay search-overlay"><div className="search-box"><div className="search-head"><p className="eyebrow">Search AbioStore</p><button onClick={onClose}><X/></button></div><div className="search-input"><Search/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Try “satin”, “men”, “dress”..." /></div><div className="search-results">{q ? results.map(p=><button key={p.id} onClick={()=>{onOpen(p);onClose()}}><img src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category} · {format(p.price)}</small></span><ArrowRight size={16}/></button>) : <p className="search-hint">Search our women’s, men’s and children’s collections.</p>}</div></div></div>;
}

function Checkout({ cart, setPage, onDone }) {
  const total=cart.reduce((s,i)=>s+i.product.price*i.qty,0);
  const [method,setMethod]=useState("Paystack");
  const [submitted,setSubmitted]=useState(false);
  if(submitted) return <main className="success page"><div className="success-icon"><Check size={35}/></div><p className="eyebrow">Order received</p><h1>Thank you for<br/><em>choosing Abio.</em></h1><p>Your order request has been received. We'll contact you shortly to confirm delivery and payment.</p><div className="order-number">ORDER #AB{Math.floor(100000+Math.random()*899999)}</div><button className="btn dark" onClick={()=>setPage("home")}>Back to AbioStore</button></main>;
  return <main className="checkout page"><button className="back-btn" onClick={()=>setPage("home")}><ChevronLeft size={17}/> Continue shopping</button><div className="checkout-grid"><section><p className="eyebrow">Secure checkout</p><h1>Almost <em>yours.</em></h1><div className="form-card"><h3>Contact details</h3><div className="two-input"><input placeholder="First name"/><input placeholder="Last name"/></div><input placeholder="Email address"/><input placeholder="Phone number"/><h3>Delivery address</h3><input placeholder="Street address"/><div className="two-input"><input placeholder="City"/><input placeholder="State"/></div><h3>Payment</h3><div className="payment-options">{["Paystack","Flutterwave","Bank Transfer","Cash / Pay at Store"].map(m=><button className={method===m?"payment active":"payment"} onClick={()=>setMethod(m)} key={m}><span>{method===m?<Check size={15}/>:<i/>}</span><b>{m}</b><small>{m==="Paystack"||m==="Flutterwave"?"Secure online payment":"We'll send instructions after order"}</small></button>)}</div><button className="btn dark wide" onClick={()=>setSubmitted(true)}>Place order · {format(total)} <ArrowRight size={17}/></button><p className="secure-note">🔒 Your details are only used to process this order.</p></div></section><aside className="checkout-summary"><h3>Your order</h3>{cart.map(i=><div className="summary-item" key={i.product.id}><img src={i.product.image} alt=""/><div><b>{i.product.name}</b><small>{i.size} × {i.qty}</small></div><strong>{format(i.product.price*i.qty)}</strong></div>)}<div className="summary-total"><span>Subtotal</span><b>{format(total)}</b></div><div className="summary-total"><span>Delivery</span><span>Calculated after order</span></div></aside></div></main>;
}

function InfoPage({ type, setPage }) {
  const data = type==="about" ? {ey:"Our story",title:<>Fashion with a<br/><em>family feeling.</em></>,copy:"AbioStore is a family-owned fashion house in Edo State, Nigeria. We bring together pieces that feel current without chasing every trend — clothes that make sense in real wardrobes, real celebrations and real life."} : {ey:"Visit us",title:<>Come say<br/><em>hello.</em></>,copy:"Find the AbioStore experience in the heart of Benin City. Visit in person, call us, or send a WhatsApp message and our team will help you find your next favourite."};
  return <main className="info-page page"><div className="info-copy"><p className="eyebrow">{data.ey}</p><h1>{data.title}</h1><p>{data.copy}</p><div className="contact-list"><div><MapPin/><span><b>Address</b>{brand.address}</span></div><div><Phone/><span><b>Phone</b>{brand.phone}</span></div><div><MessageCircle/><span><b>WhatsApp</b>Available daily</span></div><div><Clock3/><span><b>Hours</b>Mon – Sat · 9:00 – 18:00</span></div></div><a className="btn dark" href={"https://wa.me/"+brand.whatsapp} target="_blank" rel="noreferrer">Chat with Abio <MessageCircle size={17}/></a></div><div className="info-image"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=90" alt="AbioStore fashion"/></div></main>;
}


function Admin({ catalog, setCatalog, setPage }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(isSupabaseConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const empty = { name:"", price:"", oldPrice:"", category:"Women", sizes:"S, M, L", color:"Black", description:"", stock:"10", tag:"", image:"", images:[] };
  const [form, setForm] = useState(empty);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        setCheckingAuth(false);
        return;
      }
      const { data: allowed, error: adminError } = await supabase.rpc("is_admin");
      if (adminError || !allowed) {
        await supabase.auth.signOut();
        setError("This account is not authorized as an AbioStore owner.");
      } else {
        setLoggedIn(true);
      }
      setCheckingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session || !active) return;
      const { data: allowed } = await supabase.rpc("is_admin");
      if (active && allowed) setLoggedIn(true);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(empty);
    setImageFiles([]);
  };

  const edit = p => {
    setEditing(p.id);
    setForm({
      name:p.name || "", price:p.price || "", oldPrice:p.oldPrice || "",
      category:p.category || "Women", sizes:(p.sizes || []).join(", "),
      color:p.color || "", description:p.desc || "", stock:p.stock ?? 0,
      tag:p.tag || "", image:p.image || "", images:p.images || (p.image ? [p.image] : [])
    });
    setImageFiles([]);
    setTab("products");
  };

  const photo = e => {
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, 5 - (form.images?.length || 0)));
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const removePreview = index => {
    setForm(f => {
      const images = (f.images || []).filter((_, i) => i !== index);
      return { ...f, images, image: images[0] || "" };
    });
  };

  const login = async e => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      if (pin === ADMIN_PIN) setLoggedIn(true);
      else setError("Incorrect demo PIN.");
      return;
    }
    setSaving(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (loginError) {
      setError(loginError.message);
      setSaving(false);
      return;
    }
    const { data: allowed, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || !allowed) {
      await supabase.auth.signOut();
      setError("This account is not authorized as an AbioStore owner.");
      setSaving(false);
      return;
    }
    setLoggedIn(true);
    setSaving(false);
  };

  const submit = async e => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const uploaded = await uploadProductImages(imageFiles);
      const existing = (form.images || []).filter(src => src.startsWith("http"));
      const images = [...existing, ...uploaded].slice(0, 5);
      const row = productToRow(form, images, editing);

      if (supabase) {
        const result = editing
          ? await supabase.from("products").update(row).eq("id", editing).select().single()
          : await supabase.from("products").insert(row).select().single();
        if (result.error) throw result.error;
        const saved = dbToProduct(result.data);
        setCatalog(prev => editing ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]);
        setEditing(saved.id);
        setForm(f => ({ ...f, image:saved.image, images:saved.images }));
      } else {
        const item = {
          id: editing || Date.now(),
          name: row.name, category: row.category, price: row.price,
          ...(row.old_price ? {oldPrice:row.old_price} : {}),
          tag: row.tag, color: row.color, sizes: row.sizes,
          image: row.image, images: row.images, desc: row.description, stock: row.stock
        };
        const next = editing ? catalog.map(p => p.id === editing ? item : p) : [item, ...catalog];
        setCatalog(next);
        window.localStorage.setItem("abiostore_products_v1", JSON.stringify(next));
        setEditing(item.id);
        setForm(f => ({ ...f, image:item.image, images:item.images }));
      }
    } catch (saveError) {
      setError(saveError.message || "Could not save the product.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    const item = catalog.find(p => p.id === id);
    if (!item || !window.confirm("Delete " + item.name + "?")) return;
    setError("");
    setSaving(true);
    try {
      if (supabase) {
        const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
        if (deleteError) throw deleteError;
      } else {
        const next = catalog.filter(p => p.id !== id);
        setCatalog(next);
        window.localStorage.setItem("abiostore_products_v1", JSON.stringify(next));
      }
      setCatalog(prev => prev.filter(p => p.id !== id));
      if (editing === id) resetForm();
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the product.");
    } finally {
      setSaving(false);
    }
  };

  const lock = async () => {
    if (supabase) await supabase.auth.signOut();
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setPin("");
  };

  if (checkingAuth) return <main className="admin-login"><div className="admin-login-card"><p className="eyebrow">Owner access</p><h1>Checking <em>access.</em></h1><p>Verifying your AbioStore owner account…</p></div></main>;

  if (!loggedIn) return <main className="admin-login">
    <div className="admin-login-card">
      <button className="admin-back" onClick={()=>setPage("home")}><ChevronLeft size={17}/> Back to store</button>
      <div className="admin-mark"><span>A</span></div>
      <p className="eyebrow">Owner access</p>
      <h1>Store <em>Admin.</em></h1>
      <p>{isSupabaseConfigured ? "Sign in with the owner account you created in Supabase." : "Supabase is not configured yet, so the temporary local admin gate is active."}</p>
      <form onSubmit={login}>
        {isSupabaseConfigured ? <>
          <label>Email address</label>
          <input autoFocus type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="owner@example.com"/>
          <label>Password</label>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/>
        </> : <>
          <label>Temporary owner PIN</label>
          <input autoFocus type="password" inputMode="numeric" maxLength="8" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Enter PIN"/>
        </>}
        {error && <small className="admin-error">{error}</small>}
        <button className="btn dark wide" type="submit" disabled={saving}>{saving ? "Signing in…" : "Enter admin"} <ArrowRight size={17}/></button>
      </form>
      {!isSupabaseConfigured && <div className="admin-demo-note">Temporary PIN: <b>2468</b> · connect Supabase before launch</div>}
    </div>
  </main>;

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-brand"><div className="admin-mark small"><span>A</span></div><b>ABIOSTORE</b><small>OWNER PANEL</small></div>
      <button className={tab==="dashboard"?"admin-nav active":"admin-nav"} onClick={()=>setTab("dashboard")}><LayoutDashboard size={17}/> Dashboard</button>
      <button className={tab==="products"?"admin-nav active":"admin-nav"} onClick={()=>setTab("products")}><Package size={17}/> Products</button>
      <div className="admin-side-note"><b>Shared catalogue</b><span>Products are stored in Supabase and visible to every customer.</span></div>
      <button className="admin-nav admin-logout" onClick={lock}><LogOut size={17}/> Lock panel</button>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar">
        <div><p className="eyebrow">AbioStore / Owner</p><h1>{tab==="dashboard"?"Good morning.":editing?"Edit product.":"Add a product."}</h1></div>
        <div className="admin-top-actions"><button className="btn outline" onClick={()=>setPage("home")}>View store</button>{tab==="products"&&<button className="btn dark" onClick={resetForm}><Plus size={16}/> New product</button>}</div>
      </header>

      {error && <div className="admin-notice"><X size={14}/>{error}</div>}

      {tab==="dashboard" && <div className="admin-dashboard">
        <div className="admin-stat"><span>Products</span><b>{catalog.length}</b><small>Shared catalogue</small></div>
        <div className="admin-stat"><span>In stock</span><b>{catalog.filter(p=>(p.stock??0)>0).length}</b><small>Available products</small></div>
        <div className="admin-stat"><span>Low stock</span><b>{catalog.filter(p=>(p.stock??0)<=5).length}</b><small>5 units or fewer</small></div>
        <div className="admin-stat"><span>Categories</span><b>{new Set(catalog.map(p=>p.category)).size}</b><small>Women, men & children</small></div>
        <div className="admin-section-head"><div><p className="eyebrow">Catalogue</p><h2>Products</h2></div><button className="text-btn" onClick={()=>setTab("products")}>Manage products <ArrowRight size={15}/></button></div>
        <div className="admin-product-list">{catalog.slice(0,8).map(p=><div className="admin-product-row" key={p.id}>
          <img src={p.image} alt=""/><div><b>{p.name}</b><span>{p.category}</span></div><strong>{format(p.price)}</strong><span className={(p.stock??0)<=5?"stock low":"stock"}>{p.stock??0} stock</span><button onClick={()=>edit(p)}><Pencil size={16}/></button>
        </div>)}</div>
      </div>}

      {tab==="products" && <div className="admin-products">
        <div className="admin-form-card">
          <div className="admin-form-title"><div><p className="eyebrow">Owner product management</p><h2>{editing?"Update product":"Add a product"}</h2></div></div>
          <form onSubmit={submit}>
            <div className="admin-fields two"><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Aurelia Satin Dress"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Women</option><option>Men</option><option>Children</option></select></label></div>
            <div className="admin-fields three"><label>Price (₦)<input required type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Old price (₦)<input type="number" min="0" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/></label><label>Stock<input type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label></div>
            <div className="admin-fields two"><label>Sizes<input value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} placeholder="S, M, L, XL"/></label><label>Colors<input value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="Black"/></label></div>
            <div className="admin-fields two"><label>Tag<input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="New / Bestseller"/></label><label>Image URL<input value={form.image.startsWith("http")?form.image:""} onChange={e=>setForm({...form,image:e.target.value})} placeholder="Optional"/></label></div>
            <label className="admin-label">Description<textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the product..."/></label>
            <label className="upload-box"><input type="file" accept="image/*" multiple onChange={photo}/><span><Plus size={22}/><b>Upload real product photos</b><small>Stored in Supabase Storage · up to 5 photos</small></span></label>
            {(form.images?.length > 0 || imageFiles.length > 0) && <div className="admin-photo-grid">
              {form.images.map((src,i)=><div key={"saved-"+i}><img src={src} alt={"Product photo "+(i+1)}/><button type="button" onClick={()=>removePreview(i)}><Trash2 size={13}/></button></div>)}
              {imageFiles.map((file,i)=><div key={"new-"+i}><img src={URL.createObjectURL(file)} alt={"New product photo "+(i+1)}/><button type="button" onClick={()=>setImageFiles(files=>files.filter((_,idx)=>idx!==i))}><Trash2 size={13}/></button></div>)}
            </div>}
            <div className="admin-form-actions"><button className="btn dark" type="submit" disabled={saving}><Save size={16}/>{saving?"Saving…":editing?"Save changes":"Add product"}</button>{editing&&<button type="button" className="btn danger" onClick={()=>remove(editing)} disabled={saving}><Trash2 size={16}/> Delete product</button>}</div>
          </form>
        </div>
        <div className="admin-catalog-card"><div className="admin-form-title"><div><p className="eyebrow">Current catalogue</p><h2>{catalog.length} products</h2></div></div>
          {catalog.map(p=><div className="admin-product-row compact" key={p.id}><img src={p.image} alt=""/><div><b>{p.name}</b><span>{p.category} · {format(p.price)}</span></div><span className="stock">{p.stock??0}</span><button onClick={()=>edit(p)}><Pencil size={15}/></button><button onClick={()=>remove(p.id)}><Trash2 size={15}/></button></div>)}
        </div>
      </div>}
      <p className="admin-storage-note">{isSupabaseConfigured ? "Shared database connected. Product changes are available to customers on every device." : "Temporary browser storage is active. Add Supabase environment variables before launch."}</p>
    </section>
  </main>;
}


export default function App() {
  const [page,setPage]=useState("home");
  const [selected,setSelected]=useState(null);
  const [cart,setCart]=useState([]);
  const [wishlist,setWishlist]=useState([]);
  const [catalog,setCatalog]=useState(products);
  const [catalogError,setCatalogError]=useState("");

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    fetchCatalog().then(next => { if (active) setCatalog(next); }).catch(error => {
      console.error(error);
      if (active) setCatalogError("Could not load the shared catalogue.");
    });
    const channel = supabase
      .channel("abiostore-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, payload => {
        setCatalog(current => {
          if (payload.eventType === "INSERT") {
            const item = dbToProduct(payload.new);
            return current.some(p => p.id === item.id) ? current : [item, ...current];
          }
          if (payload.eventType === "UPDATE") {
            const item = dbToProduct(payload.new);
            return current.map(p => p.id === item.id ? item : p);
          }
          if (payload.eventType === "DELETE") return current.filter(p => p.id !== payload.old.id);
          return current;
        });
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);
  const [drawer,setDrawer]=useState(false);
  const [search,setSearch]=useState(false);
  const openProduct=p=>{setSelected(p);setPage("product");window.scrollTo(0,0)};
  const addToCart=(product,size=product.sizes[0],qty=1)=>{setCart(c=>{const found=c.find(i=>i.product.id===product.id&&i.size===size);return found?c.map(i=>i===found?{...i,qty:i.qty+qty}:i):[...c,{product,size,qty}]});setDrawer(true)};
  const toggleLike=id=>setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);
  const remove=(id,size)=>setCart(c=>c.filter(i=>!(i.product.id===id&&i.size===size)));
  const render=()=>{
    if(page==="home") return <Home setPage={setPage} onOpen={openProduct} catalog={catalog}/>;
    if(page==="shop"||["women","men","children"].includes(page)) return <Shop category={page==="shop"?"All":page[0].toUpperCase()+page.slice(1)} setPage={setPage} onOpen={openProduct} wishlist={wishlist} onLike={toggleLike} onAdd={addToCart} catalog={catalog}/>;
    if(page==="product"&&selected) return <ProductDetail product={selected} onBack={()=>setPage("shop")} onAdd={addToCart} liked={wishlist.includes(selected.id)} onLike={toggleLike}/>;
    if(page==="wishlist") return <main className="page"><div className="shop-hero compact"><p className="eyebrow">Saved for later</p><h1>Your <em>wishlist.</em></h1></div>{wishlist.length?<div className="product-grid shop-grid">{catalog.filter(p=>wishlist.includes(p.id)).map(p=><ProductCard key={p.id} product={p} liked onLike={toggleLike} onOpen={openProduct} onAdd={addToCart}/>)}</div>:<div className="empty-page"><Heart size={38}/><h2>Nothing saved yet.</h2><p>Tap the heart on anything you love and it will live here.</p><button className="btn dark" onClick={()=>setPage("shop")}>Explore collection</button></div>}</main>;
    if(page==="checkout") return <Checkout cart={cart} setPage={setPage} onDone={()=>{}}/>;
    if(page==="about"||page==="store") return <InfoPage type={page} setPage={setPage}/>;
    if(page==="lookbook") return <main className="lookbook page"><div className="shop-hero compact"><p className="eyebrow">Spring / Summer 2026</p><h1>The <em>Abio</em> lookbook.</h1></div><div className="look-grid">{catalog.slice(0,6).map((p,i)=><button key={p.id} className={"look-card look-"+i} onClick={()=>openProduct(p)}><img src={p.image} alt={p.name}/><span>{p.name} <ArrowUpRight size={15}/></span></button>)}</div></main>;
    return null;
  };
  if(page==="admin") return <Admin catalog={catalog} setCatalog={setCatalog} setPage={setPage}/>;
  return <><Header page={page} setPage={setPage} cartCount={cart.reduce((s,i)=>s+i.qty,0)} wishlistCount={wishlist.length} onSearch={()=>setSearch(true)} onCart={()=>setDrawer(true)}/>{catalogError && <div className="admin-notice">{catalogError}</div>}{render()}<footer className="footer"><div><Logo onClick={()=>setPage("home")}/><p>Modern fashion, thoughtfully chosen.<br/>Benin City, Edo State.</p></div><div className="footer-links"><div><b>Explore</b><button onClick={()=>setPage("shop")}>Shop</button><button onClick={()=>setPage("lookbook")}>Lookbook</button><button onClick={()=>setPage("about")}>Our story</button></div><div><b>Help</b><button onClick={()=>setPage("store")}>Visit store</button><button onClick={()=>setPage("admin")}>Store Admin</button><a href={"https://wa.me/"+brand.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a><a href={"tel:"+brand.phone.replace(/\s/g,"")}>Call us</a></div></div><div className="footer-bottom"><span>© 2026 AbioStore. All rights reserved.</span><span>Made in Edo · <Instagram size={14}/></span></div></footer>{drawer&&<Drawer cart={cart} onClose={()=>setDrawer(false)} onRemove={remove} onCheckout={()=>{setDrawer(false);setPage("checkout")}}/>}{search&&<SearchOverlay onClose={()=>setSearch(false)} onOpen={openProduct} catalog={catalog}/>}</>;
}
