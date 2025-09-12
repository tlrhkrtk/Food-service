// Sticky navbar
window.addEventListener("scroll", function () {
    const navbarBox = document.getElementById("navbar-box");
    const navbar = document.getElementById("navbar");

    if (window.scrollY > 50) {
        navbarBox.style.position = "fixed";
        navbarBox.style.top = "0";
        navbarBox.style.left = "0";
        navbarBox.style.width = "100%";
        navbarBox.style.zIndex = "999";
        navbarBox.style.borderRadius = "0";

        navbar.style.width = "100%";
        navbar.style.borderRadius = "0";
    } else {
        navbarBox.style.position = "sticky";
        navbarBox.style.width = "";
        navbarBox.style.borderRadius = "";

        navbar.style.width = "";
        navbar.style.borderRadius = "";
    }
});

// =================================================================================================================

// Event delegate for dynamic cards..
function attachFoodBoxEvents(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return; 

    container.addEventListener('mouseover', (e) => {
        const box = e.target.closest('.food-box');
        if (!box) return;
        const caption = box.querySelector('.caption');
        if (caption) caption.style.borderRadius = '0 0 5px 5px';
    });

    container.addEventListener('mouseout', (e) => {
        const box = e.target.closest('.food-box');
        if (!box) return;
        const caption = box.querySelector('.caption');
        if (caption) caption.style.borderRadius = "100% 0% 100% 0% / 54% 100% 0% 46%";
    });
}

attachFoodBoxEvents("#food-groups");
const groupProductsContainer = document.querySelector("#group-products");
if (groupProductsContainer) attachFoodBoxEvents("#group-products");

// =================================================================================================================

// Collecting information from a json file
const foodGroupsContainer = document.getElementById("food-groups");
if (foodGroupsContainer) {
    fetch("../data.json")
        .then(res => res.json())
        .then(data => {
            const groupsData = data.product_groups || [];
            renderGroups(groupsData);
        })
        .catch(err => console.error("خطا در بارگذاری JSON:", err));

}

// =================================================================================================================

// Show groups
function renderGroups(groups) {
  const container = document.getElementById("food-groups");
  container.innerHTML = "";

  groups.forEach(group => {
    const box = document.createElement("div");
    box.className = "food-box";
    box.innerHTML = `
      <img src="${group.group_image}" alt="${group.group_title}">
      <div class="caption">
        <button data-id="${group.group_id}">${group.group_title}</button>
      </div>
    `;
    container.appendChild(box);
  });

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      const group = groups.find(g => g.group_id == id);
      if (group) renderProducts(group);
    });
  });
}

// =================================================================================================================

// Display products of a group
function renderProducts(group) {
  const container = document.getElementById("group-products");
  container.innerHTML = "";

  const details = document.getElementById("product-details");
  details.classList.remove("show"); 

  document.getElementById("group-title").textContent = group.group_title;

  group.group_products.forEach(product => {
    const box = document.createElement("div");
    box.className = "food-box";
    box.innerHTML = `
      <img src="${product.product_image[0]}" alt="${product.product_name}">
      <div class="caption">
        <button data-id="${product.product_id}">${product.product_name}</button>
      </div>
    `;
    container.appendChild(box);
  });

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();   
      const id = e.target.dataset.id;
      const product = group.group_products.find(p => p.product_id == id);
      if (product) renderProductDetails(product, group.group_id);
    });
  });

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =================================================================================================================

// Display product details
const details = document.getElementById("product-details");
const closeBtn = document.getElementById("close-details");

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    if (details) {
      details.classList.remove("show");
      details.setAttribute("aria-hidden", "true");
    }
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
  });
}

function renderProductDetails(product, groupId) {

  const productImage = document.getElementById("product-image");
  productImage.src = product.product_image[0];
  productImage.alt = product.product_name;

  const linkUrl = `product.html?group=${groupId}&product=${product.product_id}`;
  const productLink = document.getElementById("product-link");
  productLink.href = linkUrl;

  const title = document.getElementById("product-name");
  title.textContent = product.product_name;
  title.style.cursor = "pointer";
  title.onclick = () => window.location.href = linkUrl;

  const contentList = document.getElementById("product-content");
  contentList.innerHTML = "";
  product.product_content.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    contentList.appendChild(li);
  });

  details.classList.add("show"); 
  details.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =================================================================================================================

//Cart helper (exposed API)
  
(function (w, d) {
  if (w.__PD_CART_V2) return;
  const CART_KEY = "__pd_cart_v2__";
  const EVENT_UPDATED = "cart:updated:v2";

  // normalize persian/ar-numeric digits to latin digits, then parse
  function normalizeDigits(s = "") {
    if (typeof s !== "string") s = String(s || "");
    // Persian digits ۰-۹, Arabic-Indic ٠-٩
    const map = {
      "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9",
      "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9",
      ",":"", "٬":""
    };
    return s.replace(/[۰-۹٠-٩,٬]/g, ch => map[ch] ?? ch);
  }

  const toNum = v => {
    try {
      const s = normalizeDigits(String(v || ""));
      const n = Number(s.replace(/[^\d.-]/g, ""));
      return Number.isFinite(n) ? n : 0;
    } catch { return 0; }
  };

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
    updateBadges();
    w.dispatchEvent(new CustomEvent(EVENT_UPDATED, { detail: { cart: cart || [] } }));
  }

  function buildPriceKey(item) {
    const g = item.group_id ?? "";
    const p = item.product_id ?? "";
    const s = (item.size_label ?? "").toString();
    const pr = toNum(item.price_number || item.price || 0);
    return `${g}::${p}::${s}::${pr}`;
  }

  function showToast(text, opts = {}) {
    // minimal toast, inline styles to avoid   
    let c = d.getElementById("pd-toast-container");
    if (!c) {
      c = d.createElement("div");
      c.id = "pd-toast-container";
      c.setAttribute("aria-live", "polite");
      Object.assign(c.style, {
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "28px",
        zIndex: 9999,
        display: "flex",
        gap: "8px",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none"
      });
      d.body.appendChild(c);
    }

    const el = d.createElement("div");
    el.className = "pd-toast";
    el.textContent = text;
    Object.assign(el.style, {
      background: "linear-gradient(90deg,#222,#444)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      opacity: "0",
      transform: "translateY(10px)",
      transition: "opacity .28s ease, transform .28s ease",
      pointerEvents: "auto",
      maxWidth: "min(92vw,540px)",
      textAlign: "center",
      fontWeight: "600",
      direction: "rtl",
      fontFamily: "Vazirmatn, Tahoma, sans-serif"
    });
    c.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    const dur = opts.duration || 2200;
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(() => { el.remove(); }, 300);
    }, dur);
  }

  function addToCart(item) {
    // normalize item
    const cart = readCart();
    const norm = {
      group_id: item.group_id,
      product_id: item.product_id,
      product_name: item.product_name || "محصول",
      image: item.image || "",
      price_number: toNum(item.price_number),
      price_text: item.price_text || String(item.price_number || ""),
      qty: Math.max(1, Math.floor(Number(item.qty) || 1)),
      size_label: item.size_label || "",
      price_key: ""
    };
    norm.price_key = buildPriceKey(norm);

    const idx = cart.findIndex(c => c.price_key === norm.price_key);
    if (idx > -1) {
      cart[idx].qty = (Number(cart[idx].qty) || 0) + norm.qty;
    } else {
      cart.push(norm);
    }
    writeCart(cart);
    showToast(`${norm.product_name} (${norm.size_label || "سایز"}) به سبد اضافه شد — تعداد: ${norm.qty}`);
    return norm;
  }

  function removeItemByIndex(idx) {
    const cart = readCart();
    if (idx < 0 || idx >= cart.length) return false;
    cart.splice(idx, 1);
    writeCart(cart);
    showToast("آیتم حذف شد");
    return true;
  }

  function setQtyByIndex(idx, qty) {
    const cart = readCart();
    if (idx < 0 || idx >= cart.length) return false;
    cart[idx].qty = Math.max(0, Math.floor(Number(qty) || 0));
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    writeCart(cart);
    return true;
  }

  function clearCart() {
    writeCart([]);
    showToast("سبد خرید پاک شد");
  }

  function getTotal() {
    const cart = readCart();
    return cart.reduce((s, it) => s + (Number(it.price_number || 0) * Number(it.qty || 0)), 0);
  }

  function getCount() {
    const cart = readCart();
    return cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  }

  function formatCurrency(n) {
    try { return Number(n).toLocaleString() + " تومان"; } catch { return n + " تومان"; }
  }

  function updateBadges() {
    const totalCount = getCount();
    d.querySelectorAll("[data-cart-badge]").forEach(el => {
      el.textContent = totalCount;
      el.setAttribute("aria-hidden", totalCount === 0 ? "false" : "false");
    });
  }

  // expose API
  w.__PD_CART_V2 = {
    readCart,
    writeCart,
    addToCart,
    removeItemByIndex,
    setQtyByIndex,
    clearCart,
    getTotal,
    getCount,
    formatCurrency,
    updateBadges,
    EVENT_UPDATED,
    showToast 
  };

  d.addEventListener("DOMContentLoaded", updateBadges);
})(window, document);
// ================================================================================================================

//Navbar cart link (badge + redirect)
(function(){
  const CART_URL = "../pages/cart.html";
  function attachCartNav() {
    document.querySelectorAll("[data-cart-link]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        location.assign(CART_URL);
      });
    });
  }
  function init() {
    attachCartNav();
    const CART = window.__PD_CART_V2;
    if (CART) window.addEventListener(CART.EVENT_UPDATED, () => CART.updateBadges());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else { init(); }
})();

// =================================================================================================================

//Cart Page logic (render + controls)
(function () {
  const CART = window.__PD_CART_V2;
  if (!CART) {
    console.warn("Cart helper not loaded (cart page logic)");
    return;
  }

  function q(id){ return document.getElementById(id); }
  function el(tag, props = {}, children = []) {
    const e = document.createElement(tag);
    Object.keys(props).forEach(k => { if (k in e) e[k] = props[k]; else e.setAttribute(k, props[k]); });
    (children || []).forEach(c => e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const body = q("cart-body");
    const summary = q("cart-summary");
    const clearBtn = q("btn-clear-cart");
    const checkoutBtn = q("btn-checkout");

    if (!body || !summary) return;

    function renderEmpty() {
      body.innerHTML = `<div class="empty-msg">سبد خرید خالی است. <a href="../pages/index1.html" class="pd-back">ادامه خرید</a></div>`;
      summary.textContent = "";
    }

    function renderCart() {
      const cart = CART.readCart();
      CART.updateBadges();

      if (!cart.length) {
        renderEmpty();
        return;
      }

      // table
      const table = el("table", { className: "cart-items" });
      const thead = el("thead");
      thead.innerHTML = `<tr><th>تصویر</th><th>محصول</th><th>قیمت</th><th>تعداد</th><th></th></tr>`;
      table.appendChild(thead);
      const tbody = el("tbody");

      cart.forEach((it, idx) => {
        const tr = el("tr");

        // image
        const tdImg = el("td");
        const img = el("img", { src: it.image || "../images/product-01-542x448.png", alt: it.product_name });
        img.width = 84; img.height = 64; img.style.objectFit = "cover"; img.style.borderRadius = "8px";
        tdImg.appendChild(img);

        // name + size
        const tdName = el("td");
        const title = el("div", { innerHTML: `<strong>${it.product_name}</strong>` });
        const meta = el("div", { innerHTML: `<span class="small-muted">${it.size_label || ""}</span>` });
        tdName.appendChild(title); tdName.appendChild(meta);

        // price
        const tdPrice = el("td", { innerHTML: CART.formatCurrency(it.price_number) });

        // qty controls
        const tdQty = el("td");
        const qtyBox = el("div", { className: "qty-controls" });
        const btnDec = el("button", { type: "button", innerHTML: "−", title: "کم کردن" });
        const inp = el("input", { value: String(it.qty), className: "qty-input", type: "number", min: "1", inputMode: "numeric" });
        const btnInc = el("button", { type: "button", innerHTML: "+", title: "افزودن" });

        btnDec.addEventListener("click", () => {
          const newQty = Math.max(0, Number(inp.value) - 1);
          if (newQty <= 0) {
            CART.removeItemByIndex(idx);
            renderCart();
            return;
          }
          CART.setQtyByIndex(idx, newQty);
          renderCart();
        });
        btnInc.addEventListener("click", () => {
          const newQty = Math.max(1, Number(inp.value) + 1);
          CART.setQtyByIndex(idx, newQty);
          renderCart();
        });
        inp.addEventListener("change", () => {
          let v = Number(inp.value) || 1;
          if (v < 1) v = 1;
          CART.setQtyByIndex(idx, v);
          renderCart();
        });

        qtyBox.appendChild(btnDec);
        qtyBox.appendChild(inp);
        qtyBox.appendChild(btnInc);
        tdQty.appendChild(qtyBox);

        // remove
        const tdRemove = el("td");
        const btnRem = el("button", { className: "btn-link", innerHTML: "حذف" });
        btnRem.addEventListener("click", () => {
          CART.removeItemByIndex(idx);
          renderCart();
        });
        tdRemove.appendChild(btnRem);

        tr.appendChild(tdImg);
        tr.appendChild(tdName);
        tr.appendChild(tdPrice);
        tr.appendChild(tdQty);
        tr.appendChild(tdRemove);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      body.innerHTML = "";
      body.appendChild(table);

      const total = CART.getTotal();
      summary.innerHTML = `<div class="cart-summary"><div class="total-row"><span>جمع کل</span><span id="cart-total">${CART.formatCurrency(total)}</span></div></div>`;
    }

    clearBtn?.addEventListener("click", () => {
      CART.clearCart();
      renderCart();
    });

    checkoutBtn?.addEventListener("click", () => {
      if (!CART.getCount()) {
        alert("سبد خرید خالی است.");
        return;
      }
      const total = CART.getTotal();
      CART.showToast("سفارش شما ثبت موقت شد — جمع: " + CART.formatCurrency(total));
      CART.clearCart();
      renderCart();
    });

    window.addEventListener(CART.EVENT_UPDATED, () => renderCart());

    // initial
    renderCart();
  });
})();

// =================================================================================================================

//Product Details modal logic , fetch data.json ,populate images, prices 
(function () {
  const $ = id => document.getElementById(id);
  const CART = window.__PD_CART_V2;

  function formatCurrency(n) { try { return Number(n).toLocaleString() + " تومان"; } catch { return n + " تومان"; } }

  // parse qty from DOM element (supports input or span)
  function readQtyFromDOM(qtyEl) {
    if (!qtyEl) return 1;
    const raw = ("value" in qtyEl) ? (qtyEl.value ?? "") : (qtyEl.textContent ?? "");
    const digits = String(raw).replace(/[^\d۰-۹٠-٩]/g, "");
    // normalize persian digits
    const normalized = digits.replace(/[۰-۹٠-٩]/g, ch => {
      const map = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
      return map[ch] ?? ch;
    });
    const n = parseInt(normalized || "1", 10);
    return Math.max(1, isNaN(n) ? 1 : n);
  }

  // read active price card and return { priceNum, priceText, sizeLabel }
  function readActivePriceInfo(priceBoxId) {
    const pb = document.getElementById(priceBoxId);
    if (!pb) return { priceNum: 0, priceText: "", sizeLabel: "" };
    const active = pb.querySelector(".price-card.active") || pb.querySelector(".price-card");
    if (!active) return { priceNum: 0, priceText: "", sizeLabel: "" };
    const sizeLabel = (active.querySelector(".size-label")?.textContent || "").trim();
    const priceText = (active.querySelector(".price")?.textContent || "").trim();
    // normalize digits then strip non-digits
    const normalized = priceText.replace(/[۰-۹٠-٩]/g, ch => {
      const map = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"};
      return map[ch] ?? ch;
    });
    const priceNum = Number(String(normalized).replace(/[^\d.-]/g, "")) || 0;
    return { priceNum, priceText, sizeLabel };
  }

  // ids mapping (ensure these ids match your HTML)
  const ids = {
    modal: "product-details",
    closeBtn: "close-details",
    addToCart: "add-to-cart",
    productName: "product-name",
    productImage: "product-image",
    imageSmall: "image_small",
    priceBox: "price-box",
    selectedPrice: "selected-price",
    energyBar: "energy-bar",
    proteinBar: "protein-bar",
    energyValue: "energy-value",
    proteinValue: "protein-value",
    productContent: "product-content",
    heroName: "hero-name",
    breadcrumbName: "breadcrumb-name",
    qtyValue: "qty-value",
    qtyPlus: "qty-plus",
    qtyMinus: "qty-minus"
  };

  document.addEventListener("DOMContentLoaded", () => {
    const modal = $(ids.modal);
    const closeBtn = $(ids.closeBtn);
    const addToCartBtn = $(ids.addToCart);

    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("group") ? parseInt(params.get("group"), 10) : null;
    const productId = params.get("product") ? parseInt(params.get("product"), 10) : null;
    const jsonPath = "../data.json";

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
      });
    }

    if (!groupId || !productId) {
      // no params — nothing to populate automatically
      return;
    }

    fetch(jsonPath, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("fetch failed"); return r.json(); })
      .then(data => {
        const group = (data.product_groups || []).find(g => Number(g.group_id) === Number(groupId));
        if (!group) throw new Error("group not found");
        const product = (group.group_products || []).find(p => Number(p.product_id) === Number(productId));
        if (!product) throw new Error("product not found");

        const images = product.product_image || [];
        const energy = ('product_energy' in product) ? product.product_energy : 0;
        const protein = ('product_protein' in product) ? product.product_protein : 0;

        // discount for group
        const discountObj = (data.Discounts || []).find(d => Number(d.group_id) === Number(groupId));
        const discountPercent = discountObj ? Number(discountObj.discount || 0) : 0;

        // set texts & images
        const imgLarge = $(ids.productImage);
        if (imgLarge && images.length) { imgLarge.src = images[0]; imgLarge.alt = product.product_name || ""; }
        $(ids.productName).textContent = product.product_name || "";
        $(ids.heroName) && ( $(ids.heroName).textContent = product.product_name || "" );
        $(ids.breadcrumbName) && ( $(ids.breadcrumbName).textContent = product.product_name || "" );

        // thumbs
        const thumbContainer = $(ids.imageSmall);
        if (thumbContainer) {
          thumbContainer.innerHTML = "";
          images.forEach((src, ix) => {
            const t = document.createElement("img");
            t.src = src; t.alt = `${product.product_name} ${ix+1}`;
            if (ix === 0) t.classList.add("active");
            t.tabIndex = 0;
            const activate = () => {
              if (imgLarge) imgLarge.src = src;
              thumbContainer.querySelectorAll("img").forEach(i=>i.classList.remove("active"));
              t.classList.add("active");
            };
            t.addEventListener("click", activate);
            t.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }});
            thumbContainer.appendChild(t);
          });
        }

        // price cards
        const priceBox = $(ids.priceBox);
        if (priceBox) {
          priceBox.innerHTML = "";
          const priceList = product.product_price || [];
          const types = product.product_type || [];
          const setSelectedPrice = (index, rawPrice, sizeLabel) => {
            const discounted = Math.round(Number(rawPrice) * (100 - discountPercent) / 100);
            const sel = $(ids.selectedPrice);
            if (sel) sel.textContent = `قیمت انتخاب‌شده: ${formatCurrency(discounted)} — (${sizeLabel})`;
            Array.from(priceBox.querySelectorAll(".price-card")).forEach((c,i) => {
              c.classList.toggle("active", i === index);
              c.setAttribute("aria-pressed", i === index ? "true" : "false");
            });
          };

          if (!priceList.length) {
            const pc = document.createElement("div");
            pc.className = "price-card";
            pc.tabIndex = 0;
            pc.innerHTML = `<div class="size-label">قیمت</div><div class="price">نامشخص</div>`;
            priceBox.appendChild(pc);
            setSelectedPrice(0,0,"نامشخص");
          } else {
            priceList.forEach((rawPrice, i) => {
              const p = Number(rawPrice) || 0;
              const t = types[i] || `سایز ${i+1}`;
              const discounted = Math.round(p * (100 - discountPercent) / 100);
              const pc = document.createElement("div");
              pc.className = "price-card";
              pc.tabIndex = 0;
              pc.setAttribute("role","button");
              pc.setAttribute("aria-pressed","false");
              pc.innerHTML = `<div class="size-label">${t}</div><div><span class="price">${formatCurrency(discounted)}</span>${discountPercent ? `<div class="price-old" style="text-decoration:line-through;color:#999;margin-top:6px">${formatCurrency(p)}</div>` : ""}</div>`;
              pc.addEventListener("click", () => setSelectedPrice(i, p, t));
              pc.addEventListener("keydown", e => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setSelectedPrice(i,p,t); }});
              priceBox.appendChild(pc);
            });
            // default select first after paint
            setTimeout(() => { const f = priceBox.querySelector(".price-card"); if (f) f.click(); }, 10);
          }
        }

        // energy/protein bars
        const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
        const eb = $(ids.energyBar); const pb = $(ids.proteinBar);
        if (eb) eb.style.width = clamp(energy) + "%";
        if (pb) pb.style.width = clamp(protein) + "%";
        $(ids.energyValue) && ($(ids.energyValue).textContent = clamp(energy) + "%");
        $(ids.proteinValue) && ($(ids.proteinValue).textContent = clamp(protein) + "%");

        // contents
        const contentEl = $(ids.productContent);
        if (contentEl) {
          contentEl.innerHTML = "";
          (product.product_content || []).forEach(itm => {
            const li = document.createElement("li");
            li.textContent = itm;
            contentEl.appendChild(li);
          });
        }

        // qty buttons (there are ids qty-value, qty-plus, qty-minus in your HTML)
        const qtyEl = $(ids.qtyValue);
        const qtyPlus = $(ids.qtyPlus);
        const qtyMinus = $(ids.qtyMinus);
        let qtyCounter = 1;
        if (qtyEl) {
          if ("value" in qtyEl) qtyEl.value = String(qtyCounter);
          else qtyEl.textContent = String(qtyCounter);
        }
        if (qtyPlus) qtyPlus.addEventListener("click", () => {
          qtyCounter = readQtyFromDOM(qtyEl) + 1;
          if ("value" in qtyEl) qtyEl.value = String(qtyCounter); else qtyEl.textContent = String(qtyCounter);
        });
        if (qtyMinus) qtyMinus.addEventListener("click", () => {
          const cur = readQtyFromDOM(qtyEl);
          if (cur > 1) {
            qtyCounter = cur - 1;
            if ("value" in qtyEl) qtyEl.value = String(qtyCounter); else qtyEl.textContent = String(qtyCounter);
          }
        });

        // add-to-cart handler (use CART v2)
        if (addToCartBtn) {
          addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
        }
        const newAddBtn = $(ids.addToCart);
        if (newAddBtn) {
          newAddBtn.addEventListener("click", () => {
            const qty = readQtyFromDOM(qtyEl);
            const activeInfo = readActivePriceInfo(ids.priceBox);
            const item = {
              group_id: groupId,
              product_id: productId,
              product_name: product.product_name,
              price_text: activeInfo.priceText,
              price_number: activeInfo.priceNum,
              qty: qty,
              image: (images && images[0]) ? images[0] : "",
              size_label: activeInfo.sizeLabel
            };

            if (CART && typeof CART.addToCart === "function") {
              CART.addToCart(item);
              // CART.showToast is available
            } else {
              // fallback simple
              const key = "__pd_cart_v2__";
              const c = JSON.parse(localStorage.getItem(key) || "[]");
              c.push(item);
              localStorage.setItem(key, JSON.stringify(c));
              // try to update any old badge
              document.querySelectorAll("[data-cart-badge]").forEach(el => el.textContent = c.reduce((s,i)=>s+ (i.qty||0),0));
              alert("محصول افزوده شد");
            }
          });
        }

        // show modal
        if (modal) {
          modal.classList.add("show");
          modal.setAttribute("aria-hidden", "false");
          try { modal.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        }

      })
      .catch(err => {
        console.warn("product populate error:", err);
      });
  });

// =================================================================================================================

// Search logic (search for food by name from data.json)
(function () {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const details = document.getElementById("product-details");
  const productName = document.getElementById("product-name");
  const productContent = document.getElementById("product-content");
  const closeBtn = document.getElementById("close-details");

  if (!form || !input || !details || !productName || !productContent) return;

  let cachedData = null;

  function getData() {
    if (cachedData) return Promise.resolve(cachedData);
    return fetch("../data.json", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        cachedData = data;
        return data;
      });
  }

  function showProductDetails(product) {
    productContent.innerHTML = "";

    const titleEl = document.createElement("h3");
    titleEl.textContent = product.product_name;
    productContent.appendChild(titleEl);

    const link = document.createElement("a");
    link.href = `../pages/product.html?group=${product.group_id}&product=${product.product_id}`;

    const img = document.createElement("img");
    img.src = product.product_image[0] || "";
    img.alt = product.product_name;

    link.appendChild(img);
    productContent.appendChild(link);

    details.classList.add("show");

    setTimeout(() => {
      details.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function searchProducts() {
    const query = (input.value || "").trim().toLowerCase();
    if (!query) return;

    getData().then(data => {
      let results = [];

      (data.product_groups || []).forEach(group => {
        (group.group_products || []).forEach(product => {
          if (product.product_name.toLowerCase().includes(query)) {
            results.push({ ...product, group_id: group.group_id });
          }
        });
      });

      if (results.length) {
        showProductDetails(results[0]);
      } else {
        alert("محصولی پیدا نشد");
      }
    });
  }

  // Enter key
  form.addEventListener("submit", e => {
    e.preventDefault();
    searchProducts();
  });

  const searchBtn = form.querySelector(".search-btn");
  searchBtn?.addEventListener("click", searchProducts);

  closeBtn?.addEventListener("click", () => {
    details.classList.remove("show");
  });
})();

// =================================================================================================================

//Entry registration form
(function(){
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const loginMobile = document.getElementById('loginMobile');
  const loginPassword = document.getElementById('loginPassword');
  const passwordError = document.getElementById('passwordError');
  const strengthBar = document.querySelector('.strength-meter > div');

  // Clear errors
  function clearErrors(container){
    container.querySelectorAll('.error').forEach(e => e.textContent = '');
  }

  function setFieldError(inputEl, message){
    const fg = inputEl.closest('.form-group');
    if(!fg) return;
    const err = fg.querySelector('.error');
    if(err) err.textContent = message || '';
  }

  function validateIranMobile(mobile){
    // 09123456789
    const pattern = /^09\d{9}$/;
    return pattern.test(mobile);
  }

  // REGISTER VALIDATION
  function validateRegister(){
    clearErrors(registerForm);
    let ok = true;
    const firstname = document.getElementById('firstname');
    const lastname = document.getElementById('lastname');
    const mobile = document.getElementById('mobile');

    if(!firstname.value.trim()){ setFieldError(firstname,'نام الزامی است.'); ok=false; }
    if(!lastname.value.trim()){ setFieldError(lastname,'نام خانوادگی الزامی است.'); ok=false; }
    if(!validateIranMobile(mobile.value.trim())){
      setFieldError(mobile,'شماره موبایل معتبر نیست.');
      ok = false;
    }

    return ok;
  }

  // LOGIN VALIDATION
  function validateLogin(){
    clearErrors(loginForm);
    passwordError.textContent = '';
    let ok = true;

    if(!validateIranMobile(loginMobile.value.trim())){
      setFieldError(loginMobile,'شماره موبایل معتبر نیست.');
      ok = false;
    }

    const val = loginPassword.value;
    if(!val.trim()){
      passwordError.textContent = 'رمز عبور الزامی است.';
      ok = false;
    } else {
      const errors = [];
      if(val.length<8) errors.push("حداقل 8 کاراکتر");
      if(!/[A-Z]/.test(val)) errors.push("یک حرف بزرگ");
      if(!/[a-z]/.test(val)) errors.push("یک حرف کوچک");
      if(!/[0-9]/.test(val)) errors.push("یک عدد");
      if(!/[@$!%*?&]/.test(val)) errors.push("یک کاراکتر خاص @$!%*?&");

      if(errors.length){
        passwordError.textContent = 'رمز عبور باید شامل: ' + errors.join('، ');
        ok = false;
      }
    }

    return ok;
  }

  // Tabs
  tabRegister.addEventListener('click', ()=>{
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
  });
  tabLogin.addEventListener('click', ()=>{
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
  });

  // submit 
  registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(validateRegister()){
      alert('ثبت‌نام با موفقیت انجام شد ✅');
      registerForm.reset();
    }
  });

  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(validateLogin()){
      alert('ورود موفقیت‌آمیز ✅');
      loginForm.reset();
      passwordError.textContent = '';
      strengthBar.style.width = '0%';
    }
  });

  // toggle eye
  const toggleBtn = document.querySelector('.toggle-pass');
  const eyeIcon = document.getElementById('eyeIcon');

  toggleBtn.addEventListener('click', function(){
    if(loginPassword.type === 'password'){
      loginPassword.type = 'text';
      eyeIcon.innerHTML = '<path d="M17.94 17.94A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8 1.5-2.5 4.5-5.5 11-5.5 1.5 0 3 .25 4.35.75"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      loginPassword.type = 'password';
      eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
    loginPassword.focus();
  });

  // strength meter
  loginPassword.addEventListener('input', function(){
    const v = this.value;
    let score = 0;
    if(v.length>=8) score++;
    if(/[A-Z]/.test(v)) score++;
    if(/[a-z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;
    const pct = (score/5)*100;
    strengthBar.style.width = pct+'%';
    strengthBar.style.background = pct<40?'#e63946':pct<80?'#f4a261':'#2a9d8f';

    if(passwordError.textContent) passwordError.textContent='';
  });
})();
})();






