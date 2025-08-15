// Find the front and the header menu..
window.addEventListener("scroll", function () {
    const navbarBox = document.getElementById("navbar-box");
    const navbar = document.getElementById("navbar");

    if (window.scrollY > 50) {
        // Fix and fill the entire width..
        navbarBox.style.position = "fixed";
        navbarBox.style.top = "0";
        navbarBox.style.left = "0";
        navbarBox.style.width = "100%";
        navbarBox.style.zIndex = "999";
        navbarBox.style.borderRadius = "0";

        // Remove container constraint to fill width..
        navbar.style.width = "100%";
        navbar.style.borderRadius = "0";
    } else {
        // Return to the initial state..
        navbarBox.style.position = "sticky";
        navbarBox.style.width = "";
        navbarBox.style.borderRadius = "";

        navbar.style.width = "";
        navbar.style.borderRadius = "";
    }
});

// =================================================================================================================

// Add event listener to each food box..
document.querySelectorAll('.food-box').forEach(box => {
    box.addEventListener('mouseenter', () => {
        const caption = box.querySelector('.caption');
        caption.style.borderRadius = '0 0 5px 5px'; // Current rectangle mode..
        caption.style.transition = 'border-radius 0.3s ease'; // Software animation..
    });

    box.addEventListener('mouseleave', () => {
        const caption = box.querySelector('.caption');
        caption.style.borderRadius = "100% 0% 100% 0% / 54% 100% 0% 46%"; // Return to sloped mode..
    });
});
