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
    if (!container) return; // اگر container وجود نداشت، ادامه نده

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
      e.stopPropagation(); // جلوگیری از bubble
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

closeBtn.addEventListener("click", () => {
  details.classList.remove("show"); 
});

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

// Product details modal logic (clean, readable, English comments)
(function () {

  const log = (...args) => console.log("[pd-combined]", ...args);
  const warn = (...args) => console.warn("[pd-combined]", ...args);
  const $ = id => document.getElementById(id);

  // Set text only if element is empty
  function safeSetTextIfEmpty(id, text) {
    const el = $(id);
    if (!el) return false;
    if (!((el.textContent || "").trim().length)) {
      el.textContent = text;
      return true;
    }
    return false;
  }

  // Force set text (overwrite)
  function safeSetTextForce(id, text) {
    const el = $(id);
    if (!el) return false;
    el.textContent = text;
    return true;
  }

  // Set image src only if empty
  function safeSetImgIfEmpty(id, src) {
    const el = $(id);
    if (!el || el.tagName !== "IMG") return false;
    if (!el.src || !el.src.trim()) {
      el.src = src;
      return true;
    }
    return false;
  }

  // Format number as currency string with "تومان"
  function formatCurrency(n) {
    try { return Number(n).toLocaleString() + " تومان"; }
    catch { return n + " تومان"; }
  }

  // IDs used in the markup
  // Update these if your HTML uses different ids
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
    topBadge: "top-badge",
    heroName: "hero-name",
    breadcrumbName: "breadcrumb-name",
    qtyValue: "qty-value", 
    qtyPlus: "qty-plus",
    qtyMinus: "qty-minus"
  };

  // DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    const modal = $(ids.modal);
    const closeBtn = $(ids.closeBtn);
    const addToCartBtn = $(ids.addToCart);

    if (!modal) {
      warn("Modal element not found (#product-details). Script will continue but some features may not work.");
    }

    // Close handler for modal
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
      });
    }

    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("group") ? parseInt(params.get("group"), 10) : null;
    const productId = params.get("product") ? parseInt(params.get("product"), 10) : null;

    const jsonPath = "../data.json";
    let populated = false;

    // Utility: read quantity live from DOM
    // Supports either an <input> (value) or a text element (textContent)
    // Returns a sanitized integer >= 1
    function readQtyFromDOM() {
      const el = $(ids.qtyValue);
      if (!el) return 1;
      const raw = ("value" in el) ? (el.value ?? "") : (el.textContent ?? "");
      const digitsOnly = raw.toString().replace(/[^\d]/g, "");
      const n = parseInt(digitsOnly || "1", 10);
      return Math.max(1, isNaN(n) ? 1 : n);
    }

    // Utility: get active price text from price-box
    function readActivePriceText() {
      const active = document.querySelector(`#${ids.priceBox} .price-card.active`)
                  || document.querySelector(`#${ids.priceBox} .price-card`);
      return active ? (active.querySelector(".price")?.textContent || "") : "";
    }

    // Utility: push item to localStorage cart
    function addToCartItem(item) {
      try {
        const key = "cart_demo_v1";
        const cart = JSON.parse(localStorage.getItem(key) || "[]");
        cart.push(item);
        localStorage.setItem(key, JSON.stringify(cart));
        return true;
      } catch (e) {
        warn("Failed to write cart to localStorage:", e);
        return false;
      }
    }

    // Main: fetch and populate product details
    function mainFetchAndPopulate() {
      if (!groupId || !productId) {
        log("No group/product in URL — skipping main fetch.");
        return Promise.resolve(false);
      }

      return fetch(jsonPath, { cache: "no-store" })
        .then(res => {
          if (!res.ok) throw new Error("Fetch JSON failed: " + res.status);
          return res.json();
        })
        .then(data => {
          const group = (data.product_groups || []).find(g => Number(g.group_id) === Number(groupId));
          if (!group) { warn("Group not found:", groupId); throw new Error("group-not-found"); }
          const product = (group.group_products || []).find(p => Number(p.product_id) === Number(productId));
          if (!product) { warn("Product not found:", productId); throw new Error("product-not-found"); }

          // Images, nutrition
          const images = product.product_image || product.image_product || [];
          const energy = ('product_energy' in product) ? product.product_energy : (('energy_product' in product) ? product.energy_product : 0);
          const protein = ('product_protein' in product) ? product.product_protein : (('protein_product' in product) ? product.protein_product : 0);

          // Discounts (if any)
          const discountObj = (data.Discounts || []).find(d => Number(d.group_id) === Number(groupId));
          const discountPercent = discountObj ? Number(discountObj.discount || 0) : 0;

          // Set product title
          safeSetTextForce(ids.productName, product.product_name || "محصول");

          // Main image
          const imgLarge = $(ids.productImage);
          if (imgLarge && images.length) {
            imgLarge.src = images[0];
            imgLarge.alt = product.product_name || "Product image";
          } else if (imgLarge) {
            imgLarge.src = imgLarge.src || "";
            imgLarge.alt = imgLarge.alt || "No image";
          }

          // Thumbnails
          const thumbContainer = $(ids.imageSmall);
          if (thumbContainer) {
            thumbContainer.innerHTML = "";
            images.forEach((src, idx) => {
              const thumb = document.createElement("img");
              thumb.src = src;
              thumb.alt = `${product.product_name || "Image"} ${idx + 1}`;
              thumb.tabIndex = 0;
              thumb.role = "button";
              thumb.setAttribute("aria-label", `Show image ${idx + 1}`);
              if (idx === 0) thumb.classList.add("active");
              const activate = () => {
                if (imgLarge) imgLarge.src = src;
                Array.from(thumbContainer.querySelectorAll("img")).forEach(i => i.classList.remove("active"));
                thumb.classList.add("active");
              };
              thumb.addEventListener("click", activate);
              thumb.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }});
              thumbContainer.appendChild(thumb);
            });
          }

          // Prices: build price-card list and provide selection behavior
          const priceBox = $(ids.priceBox);
          if (priceBox) {
            priceBox.innerHTML = "";
            const priceList = (product.product_price || []);
            const setSelectedPrice = (index, rawPrice, sizeLabel) => {
              const discounted = Math.round(Number(rawPrice) * (100 - discountPercent) / 100);
              const sel = $(ids.selectedPrice);
              if (sel) sel.textContent = `قیمت انتخاب‌شده: ${formatCurrency(discounted)} — (${sizeLabel})`;
              Array.from(priceBox.querySelectorAll(".price-card")).forEach((c, i) => {
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
              setSelectedPrice(0, 0, "نامشخص");
            } else {
              priceList.forEach((rawPrice, i) => {
                const p = Number(rawPrice) || 0;
                const t = (product.product_type || [])[i] || `سایز ${i + 1}`;
                const discounted = Math.round(p * (100 - discountPercent) / 100);
                const pc = document.createElement("div");
                pc.className = "price-card";
                pc.tabIndex = 0;
                pc.setAttribute("role", "button");
                pc.setAttribute("aria-pressed", "false");
                pc.innerHTML = `<div class="size-label">${t}</div><div><span class="price">${formatCurrency(discounted)}</span>${discountPercent ? `<div class="price-old" style="text-decoration:line-through;color:#999;margin-top:6px">${formatCurrency(p)}</div>` : ""}</div>`;
                pc.addEventListener("click", () => setSelectedPrice(i, p, t));
                pc.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPrice(i, p, t); }});
                priceBox.appendChild(pc);
              });
              // Default: select first
              setTimeout(() => {
                const first = priceBox.querySelector(".price-card");
                if (first) first.click();
              }, 10);
            }
          }

          // Energy / Protein bars
          const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
          if ($(ids.energyBar)) $(ids.energyBar).style.width = clamp(energy) + "%";
          if ($(ids.proteinBar)) $(ids.proteinBar).style.width = clamp(protein) + "%";
          if ($(ids.energyValue)) $(ids.energyValue).textContent = clamp(energy) + "%";
          if ($(ids.proteinValue)) $(ids.proteinValue).textContent = clamp(protein) + "%";

          // Contents list
          const contentEl = $(ids.productContent);
          if (contentEl) {
            contentEl.innerHTML = "";
            (product.product_content || []).forEach(item => {
              const li = document.createElement("li");
              li.textContent = item;
              contentEl.appendChild(li);
            });
          }

          // Add-to-cart handler: remove previous handlers and attach a fresh one
          if (addToCartBtn) {
            addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
          }
          const newAddBtn = $(ids.addToCart);
          if (newAddBtn) {
            newAddBtn.addEventListener("click", () => {
              const qty = readQtyFromDOM();
              const priceText = readActivePriceText();
              const item = {
                group_id: groupId,
                product_id: productId,
                product_name: product.product_name,
                price: priceText,
                qty: qty
              };
              const ok = addToCartItem(item);
              if (ok) alert(`محصول به سبد افزوده شد:\n${product.product_name}\n${priceText}\nتعداد: ${qty}`);
              else alert("خطا در افزودن محصول به سبد. دوباره تلاش کنید.");
            });
          }

          // Show modal
          if (modal) {
            modal.classList.add("show");
            modal.setAttribute("aria-hidden", "false");
            try { modal.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          }

          // Hero / breadcrumb / badge
          safeSetTextForce(ids.heroName, product.product_name || "");
          safeSetTextForce(ids.breadcrumbName, product.product_name || "");
          if ($(ids.topBadge)) $(ids.topBadge).textContent = (product.product_name || "").slice(0, 20);

          try { document.title = (product.product_name || "محصول") + " — صفحه محصول"; } catch (e) {}

          populated = true;
          window.__PD_POPULATED = true;
          try { window.dispatchEvent(new CustomEvent('pd:populated', { detail: { groupId, productId } })); } catch (e) {}
          log("main populate finished for product:", product.product_name);

          return true;
        });
    } // end mainFetchAndPopulate

    mainFetchAndPopulate().catch(err => {
      warn("mainFetchAndPopulate error (will allow fallback):", err);
    });

    // Fallback (if main didn't populate)
    let fallbackTimer = null;
    const onPopulated = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener('pd:populated', onPopulated);
      log("received pd:populated — fallback cancelled.");
    };
    window.addEventListener('pd:populated', onPopulated);

    const FALLBACK_MS = 800;
    fallbackTimer = setTimeout(() => {
      window.removeEventListener('pd:populated', onPopulated);
      if (window.__PD_POPULATED || populated) {
        log("main already populated — no fallback.");
        return;
      }
      log("running safe fallback (no fetch here) — will read body data-attributes if present.");
      const ds = document.body?.dataset || {};
      if (ds.productName) {
        const name = ds.productName;
        safeSetTextIfEmpty(ids.heroName, name);
        safeSetTextIfEmpty(ids.breadcrumbName, name);
        safeSetTextIfEmpty(ids.productName, name);
        if (ds.productImage) safeSetImgIfEmpty(ids.productImage, ds.productImage);
        const tb = $(ids.topBadge);
        if (tb && (!tb.textContent || !tb.textContent.trim())) tb.textContent = (ds.productShort || name.slice(0, 18));
        log("fallback populated from body data-attributes:", name);
        return;
      }
      if (ds.groupId && ds.productId) {
        log("body has groupId/productId but fallback doesn't fetch — consider adding data-product-name or let main fetch run.");
        return;
      }
      log("fallback: no data-product-name in body and main did not populate — nothing done (non-destructive).");
    }, FALLBACK_MS);

    // Stepper quantity logic
    // - keeps a small internal counter for quick +/- UI
    // - always reads quantity from DOM when needed (e.g. on add-to-cart)
    // - supports both <input> and non-editable element
    let qtyCounter = 1;
    const qtyEl = $(ids.qtyValue);
    const qtyPlus = $(ids.qtyPlus);
    const qtyMinus = $(ids.qtyMinus);

    if (qtyEl && qtyPlus && qtyMinus) {
      // initialize display
      if ("value" in qtyEl) {
        if (!qtyEl.value || !qtyEl.value.toString().trim()) qtyEl.value = String(qtyCounter);
      } else {
        if (!qtyEl.textContent || !qtyEl.textContent.trim()) qtyEl.textContent = String(qtyCounter);
      }

      // + button
      qtyPlus.addEventListener("click", () => {
        qtyCounter = readQtyFromDOM() + 1;
        if ("value" in qtyEl) qtyEl.value = String(qtyCounter);
        else qtyEl.textContent = String(qtyCounter);
      });

      // - button
      qtyMinus.addEventListener("click", () => {
        const cur = readQtyFromDOM();
        if (cur > 1) {
          qtyCounter = cur - 1;
          if ("value" in qtyEl) qtyEl.value = String(qtyCounter);
          else qtyEl.textContent = String(qtyCounter);
        }
      });

      // If qtyEl is an input, listen for direct user edits and sanitize
      if ("value" in qtyEl) {
        qtyEl.addEventListener("input", () => {
          const v = readQtyFromDOM();
          qtyCounter = v;
          qtyEl.value = String(qtyCounter); 
        });
      }
    }
  }); 
})(); 




