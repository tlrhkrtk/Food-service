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

// Product details modal logic
(function(){
  
  const log = (...a) => console.log("[pd-combined]", ...a);
  const warn = (...a) => console.warn("[pd-combined]", ...a);
  const $ = id => document.getElementById(id);

  function safeSetTextIfEmpty(id, text) {
    const el = $(id);
    if (!el) return false;
    if ((el.textContent || "").trim().length === 0) {
      el.textContent = text;
      return true;
    }
    return false;
  }
  function safeSetTextForce(id, text) {
    const el = $(id);
    if (!el) return false;
    el.textContent = text;
    return true;
  }
  function safeSetImgIfEmpty(id, src) {
    const el = $(id);
    if (!el || el.tagName !== "IMG") return false;
    if (!el.src || el.src.trim() === "") {
      el.src = src;
      return true;
    }
    return false;
  }
  function formatCurrency(n){
    try { return Number(n).toLocaleString() + " تومان"; } catch(e){ return n + " تومان"; }
  }

  // ids used in the page (adjust if your HTML ids are different)
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
    breadcrumbName: "breadcrumb-name"
  };

  // DOMContentLoaded 
  document.addEventListener("DOMContentLoaded", () => {
    const modal = $(ids.modal);
    const closeBtn = $(ids.closeBtn);
    const addToCartBtn = $(ids.addToCart);

    if (!modal) {
      warn("عنصر مودال (#product-details) پیدا نشد — اجرای اسکریپت ادامه می‌یابد اما برخی عملیات ناتمام خواهند بود.");
    }

    // close handler (unchanged behavior)
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        try { history.replaceState(null, "", location.pathname); } catch(e){}
      });
    }

    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const groupIdParam = params.get("group");
    const productIdParam = params.get("product");
    const groupId = groupIdParam ? parseInt(groupIdParam) : null;
    const productId = productIdParam ? parseInt(productIdParam) : null;

    // JSON path - adjust if needed
    const jsonPath = "../data.json";

    // Flag to indicate main populate succeeded
    let populated = false;

    // Main fetch + populate function (same logic as your original)
    const mainFetchAndPopulate = () => {
      if (!groupId || !productId) {
        log("پارامتر group یا product در URL مشخص نشده — main fetch عبور می‌کند.");
        return Promise.resolve(false);
      }

      return fetch(jsonPath, { cache: "no-store" })
        .then(res => {
          if (!res.ok) throw new Error("خطا در دریافت JSON: " + res.status);
          return res.json();
        })
        .then(data => {
          // find group and product
          const group = (data.product_groups || []).find(g => Number(g.group_id) === Number(groupId));
          if (!group) { warn("گروه پیدا نشد:", groupId); throw new Error("group-not-found"); }
          const product = (group.group_products || []).find(p => Number(p.product_id) === Number(productId));
          if (!product) { warn("محصول پیدا نشد:", productId); throw new Error("product-not-found"); }

          // get images, energy, protein
          const images = product.product_image || product.image_product || [];
          const energy = ('product_energy' in product) ? product.product_energy : (('energy_product' in product) ? product.energy_product : 0);
          const protein = ('product_protein' in product) ? product.product_protein : (('protein_product' in product) ? product.protein_product : 0);

          // discount
          const discountObj = (data.Discounts || []).find(d => Number(d.group_id) === Number(groupId));
          const discountPercent = discountObj ? Number(discountObj.discount || 0) : 0;

          // set product title (force) — main script should set content
          safeSetTextForce(ids.productName, product.product_name || "محصول");

          // image large
          const imgLarge = $(ids.productImage);
          if (imgLarge && images.length > 0) {
            imgLarge.src = images[0];
            imgLarge.alt = product.product_name || "تصویر محصول";
          } else if (imgLarge) {
            imgLarge.src = imgLarge.src || "";
            imgLarge.alt = imgLarge.alt || "بدون تصویر";
          }

          // thumbnails (rebuild)
          const smallContainer = $(ids.imageSmall);
          if (smallContainer) {
            smallContainer.innerHTML = "";
            images.forEach((src, idx) => {
              const thumb = document.createElement("img");
              thumb.src = src;
              thumb.alt = (product.product_name || "تصویر") + " " + (idx + 1);
              thumb.tabIndex = 0;
              thumb.role = "button";
              thumb.setAttribute("aria-label", `نمایش تصویر ${idx+1}`);
              if (idx === 0) thumb.classList.add("active");
              const activate = () => {
                if (imgLarge) imgLarge.src = src;
                Array.from(smallContainer.querySelectorAll("img")).forEach(i => i.classList.remove("active"));
                thumb.classList.add("active");
              };
              thumb.addEventListener("click", activate);
              thumb.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
              });
              smallContainer.appendChild(thumb);
            });
          }

          // prices
          const priceBox = $(ids.priceBox);
          if (priceBox) {
            priceBox.innerHTML = "";
            const types = product.product_type || [];
            const prices = product.product_price || [];
            let selectedIndex = 0;
            const setSelectedPrice = (index, rawPrice, sizeLabel) => {
              selectedIndex = index;
              const discounted = Math.round(Number(rawPrice) * (100 - discountPercent) / 100);
              const sel = $(ids.selectedPrice);
              if (sel) sel.textContent = `قیمت انتخاب‌شده: ${formatCurrency(discounted)} — (${sizeLabel})`;
              Array.from(priceBox.querySelectorAll(".price-card")).forEach((c, i) => {
                c.classList.toggle("active", i === index);
                c.setAttribute("aria-pressed", i === index ? "true" : "false");
              });
            };

            if ((product.product_price || []).length === 0) {
              const pc = document.createElement("div");
              pc.className = "price-card";
              pc.tabIndex = 0;
              pc.innerHTML = `<div class="size-label">قیمت</div><div class="price">نامشخص</div>`;
              priceBox.appendChild(pc);
              setSelectedPrice(0, 0, "نامشخص");
            } else {
              (product.product_price || []).forEach((rawPrice, i) => {
                const p = Number(rawPrice) || 0;
                const t = (product.product_type || [])[i] || `سایز ${i+1}`;
                const discounted = Math.round(p * (100 - discountPercent) / 100);
                const pc = document.createElement("div");
                pc.className = "price-card";
                pc.tabIndex = 0;
                pc.setAttribute("role", "button");
                pc.setAttribute("aria-pressed", "false");
                pc.innerHTML = `<div class="size-label">${t}</div><div><span class="price">${formatCurrency(discounted)}</span>${discountPercent?`<div class="price-old" style="text-decoration:line-through;color:#999;margin-top:6px">${formatCurrency(p)}</div>`:""}</div>`;
                pc.addEventListener("click", () => setSelectedPrice(i, p, t));
                pc.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPrice(i, p, t); }});
                priceBox.appendChild(pc);
              });
              // default select first
              setTimeout(()=> {
                const first = priceBox.querySelector(".price-card");
                if (first) first.click();
              }, 10);
            }
          }

          // energy/protein
          const clamp = v => { let n = Number(v); if (isNaN(n)) return 0; return Math.max(0, Math.min(100, n)); };
          const energyVal = clamp(energy);
          const proteinVal = clamp(protein);
          const eBar = $(ids.energyBar), pBar = $(ids.proteinBar), eVal = $(ids.energyValue), pVal = $(ids.proteinValue);
          if (eBar) eBar.style.width = energyVal + "%";
          if (pBar) pBar.style.width = proteinVal + "%";
          if (eVal) eVal.textContent = energyVal + "%";
          if (pVal) pVal.textContent = proteinVal + "%";

          // contents
          const contentList = $(ids.productContent);
          if (contentList) {
            contentList.innerHTML = "";
            (product.product_content || []).forEach(item => {
              const li = document.createElement("li");
              li.textContent = item;
              contentList.appendChild(li);
            });
          }

          // add to cart handler (simple localStorage example)
          if (addToCartBtn) {
            // remove previous handler to avoid duplicate listeners
            addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
          }
          const newAddBtn = $(ids.addToCart);
          if (newAddBtn) {
            newAddBtn.addEventListener("click", () => {
              // chosen price detection
              const activeCard = document.querySelector("#" + ids.priceBox + " .price-card.active") || document.querySelector("#" + ids.priceBox + " .price-card");
              const priceText = activeCard ? (activeCard.querySelector(".price")?.textContent || "") : "";
              const chosenPrice = priceText;
              const cart = JSON.parse(localStorage.getItem("cart_demo_v1") || "[]");
              cart.push({ group_id: groupId, product_id: productId, product_name: product.product_name, price: chosenPrice, qty: 1 });
              localStorage.setItem("cart_demo_v1", JSON.stringify(cart));
              alert(`محصول به سبد افزوده شد:\n${product.product_name}\n${chosenPrice}`);
            });
          }

          // show modal
          if (modal) {
            modal.classList.add("show");
            modal.setAttribute("aria-hidden", "false");
            try { modal.scrollIntoView({ behavior: "smooth", block: "center" }); } catch(e){}
          }

          // update hero & breadcrumb & badge (force)
          safeSetTextForce(ids.heroName, product.product_name || "");
          safeSetTextForce(ids.breadcrumbName, product.product_name || "");
          const topBadge = $(ids.topBadge);
          if (topBadge) topBadge.textContent = (product.product_name || "").slice(0,20);

          // update document title
          try { document.title = (product.product_name || "محصول") + " — صفحه محصول"; } catch(e){}

          // mark as populated and notify others
          populated = true;
          try {
            window.__PD_POPULATED = true;
            window.dispatchEvent(new CustomEvent('pd:populated', { detail: { groupId, productId } }));
          } catch(e){}

          log("main populate finished for product:", product.product_name);
          return true;
        });
    };

    // call main and handle errors
    mainFetchAndPopulate().catch(err => {
      warn("mainFetchAndPopulate error (will allow fallback):", err);
    });

    //  safe fallback only if main did not populate
    // If main sets pd_populated it will dispatch event — listen and cancel fallback
    let fallbackTimer = null;
    const onPopulated = () => {
      // main succeeded: cancel fallback
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener('pd:populated', onPopulated);
      log("received pd:populated — fallback cancelled.");
    };
    window.addEventListener('pd:populated', onPopulated);

    // fallback after short delay if main didn't populate
    const FALLBACK_MS = 800;
    fallbackTimer = setTimeout(() => {
      window.removeEventListener('pd:populated', onPopulated);
      if (window.__PD_POPULATED || populated) {
        log("main already populated — no fallback.");
        return;
      }
      log("running safe fallback (no fetch here) — will read body data-attributes if present.");
      const ds = document.body?.dataset || {};
      // if body has productName use it
      if (ds.productName) {
        const name = ds.productName;
        // set only if empty to avoid overwriting main script
        safeSetTextIfEmpty(ids.heroName, name);
        safeSetTextIfEmpty(ids.breadcrumbName, name);
        safeSetTextIfEmpty(ids.productName, name);
        if (ds.productImage) safeSetImgIfEmpty(ids.productImage, ds.productImage);
        const tb = $(ids.topBadge);
        if (tb && (!tb.textContent || !tb.textContent.trim())) tb.textContent = (ds.productShort || name.slice(0,18));
        log("fallback populated from body data-attributes:", name);
        return;
      }

      // if body has groupId & productId but we don't want to fetch here — we stop
      if (ds.groupId && ds.productId) {
        log("body has groupId/productId but fallback doesn't fetch — consider adding data-product-name or let main fetch run.");
        return;
      }

      log("fallback: no data-product-name in body and main did not populate — nothing done (non-destructive).");
    }, FALLBACK_MS);

  }); 
})(); 








