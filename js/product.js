document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const productItems = document.querySelectorAll(".product-item");
  
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".filter-btn.active").classList.remove("active");
        btn.classList.add("active");
  
        const filterValue = btn.getAttribute("data-filter");
  
        productItems.forEach((item) => {
          if (filterValue === "all") {
            item.style.display = "block";
          } else {
            if (item.classList.contains(filterValue)) {
              item.style.display = "block";
            } else {
              item.style.display = "none";
            }
          }
        });
      });
    });
  });



  const allProducts = document.querySelectorAll('.product-item');
  const loadMoreBtn = document.getElementById('load-more-btn');
  let visibleCount = 8;

  function updateVisibleItems() {
    allProducts.forEach((item, index) => {
      if (index < visibleCount) {
        item.classList.add('visible');
      } else {
        item.classList.remove('visible');
      }
    });

    if (visibleCount >= allProducts.length) {
      loadMoreBtn.style.display = 'none';
    }
  }

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 4;
    updateVisibleItems();
  });

  document.addEventListener('DOMContentLoaded', updateVisibleItems);
  