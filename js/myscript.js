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

    container.addEventListener('mouseover', (e) => {
        const box = e.target.closest('.food-box');
        if (!box) return;
        const caption = box.querySelector('.caption');
        caption.style.borderRadius = '0 0 5px 5px';
    });

    container.addEventListener('mouseout', (e) => {
        const box = e.target.closest('.food-box');
        if (!box) return;
        const caption = box.querySelector('.caption');
        caption.style.borderRadius = "100% 0% 100% 0% / 54% 100% 0% 46%";
    });

    container.addEventListener('click', (e) => {
        const button = e.target.closest('.caption button');
        if (!button) return;
        const box = e.target.closest('.food-box');
        const details = box.querySelector('.product-details');
        if (details) {
          details.style.display = details.style.display === 'block' ? 'none' : 'block';
        }
        e.stopPropagation();
    });
}

// attach events to both food groups and products containers
attachFoodBoxEvents("#food-groups");
attachFoodBoxEvents("#group-products");

// =================================================================================================================

fetch("../Products.txt")
  .then(res => res.json())
  .then(data => {
    const groups = data.product_groups;
    renderGroups(groups);
  });

  // Show groups..
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
      renderProducts(group);
    

    });
  });
}

// =================================================================================================================

// Display products of a group..
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
          <img src="${product.product_image}" alt="${product.product_name}">
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
            renderProductDetails(product);
        });
    });

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =================================================================================================================

// Display product details in static HTML with links..
const details = document.getElementById("product-details");
const closeBtn = document.getElementById("close-details");

closeBtn.addEventListener("click", () => {
    details.classList.remove("show"); 
});

// Display product details..
function renderProductDetails(product) {
    document.getElementById("product-image").src = product.product_image;
    document.getElementById("product-image").alt = product.product_name;
    document.getElementById("product-link").href = product.product_image;
    document.getElementById("product-name").textContent = product.product_name;
    document.getElementById("product-price").textContent = "قیمت: " + product.product_price.toLocaleString() + " تومان";

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





