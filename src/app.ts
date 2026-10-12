
interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  tags?: string[];
}

interface DiscountedProduct extends Product {
  discountPercent: number;
}

let products: Product[] = [
  { id: 1, name: "Laptop", price: 55000, inStock: true, tags: ["Electronics"] },
  { id: 2, name: "Wireless Mouse", price: 799, inStock: true, tags: ["Accessories"] },
  { id: 3, name: "Keyboard", price: 1499, inStock: false, tags: ["Accessories"] },
  { id: 4, name: "USB Cable", price: 299, inStock: true, tags: ["Electronics"] }
];

const productForm = document.querySelector<HTMLFormElement>("#productForm")!;
const nameInput = document.querySelector<HTMLInputElement>("#name")!;
const priceInput = document.querySelector<HTMLInputElement>("#price")!;
const stockInput = document.querySelector<HTMLInputElement>("#inStock")!;
const tagsInput = document.querySelector<HTMLInputElement>("#tags")!;
const searchInput = document.querySelector<HTMLInputElement>("#search")!;
const tableBody = document.querySelector<HTMLTableSectionElement>("#productRows")!;
const totalCount = document.querySelector<HTMLElement>("#totalCount")!;
const stockCount = document.querySelector<HTMLElement>("#stockCount")!;
const message = document.querySelector<HTMLElement>("#message")!;

function getAvailableProducts(items: Product[]): Product[] {
  return items.filter(product => product.inStock);
}

function calculateDiscount(
  price: number,
  discountPercent: number = 10
): number {
  return price * (1 - discountPercent / 100);
}

function applyBulkDiscount(
  prices: number[],
  discountRate: number
): number[] {
  return prices.map(price => calculateDiscount(price, discountRate));
}

function applyDiscountToProducts(
  items: Product[]
): DiscountedProduct[] {
  return items.map(product => ({
    ...product,
    price: calculateDiscount(product.price),
    discountPercent: 10
  }));
}

function printProductInfo(product: Product): void {
  console.log(
    `Product: ${product.name}, Price: ₹${product.price}, ` +
    `In Stock: ${product.inStock}, ID: ${product.id}`
  );
}

function renderProducts(): void {
  const query = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    (product.tags ?? []).some(tag =>
      tag.toLowerCase().includes(query)
    )
  );

  tableBody.innerHTML = "";

  filteredProducts.forEach(product => {
    const row = document.createElement("tr");

    const status = product.inStock
      ? '<span class="badge available">In Stock</span>'
      : '<span class="badge unavailable">Out of Stock</span>';

    row.innerHTML = `
      <td>${product.id}</td>
      <td>${escapeHtml(product.name)}</td>
      <td>₹${product.price.toFixed(2)}</td>
      <td>${status}</td>
      <td>${escapeHtml((product.tags ?? []).join(", ") || "—")}</td>
      <td>
        <button class="discount-btn" data-discount="${product.id}">
          10% Off
        </button>
        <button class="delete-btn" data-delete="${product.id}">
          Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  totalCount.textContent = String(products.length);
  stockCount.textContent = String(getAvailableProducts(products).length);
}

function escapeHtml(value: string): string {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

productForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || !Number.isFinite(price) || price <= 0) {
    message.textContent = "Enter a name and a price greater than zero.";
    return;
  }

  const newProduct: Product = {
    id: Math.max(0, ...products.map(product => product.id)) + 1,
    name,
    price,
    inStock: stockInput.checked,
    tags: tagsInput.value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean)
  };

  products.push(newProduct);
  printProductInfo(newProduct);

  productForm.reset();
  message.textContent = "Product added successfully!";
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

tableBody.addEventListener("click", event => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) return;

  const deleteId = target.dataset.delete;
  const discountId = target.dataset.discount;

  if (deleteId !== undefined) {
    products = products.filter(product => product.id !== Number(deleteId));
    message.textContent = "Product deleted.";
    renderProducts();
  }

  if (discountId !== undefined) {
    products = applyDiscountToProducts(
      products.filter(product => product.id === Number(discountId))
    ).length
      ? products.map(product => {
          if (product.id !== Number(discountId)) return product;

          return {
            ...product,
            price: calculateDiscount(product.price),
            tags: [...(product.tags ?? [])]
          };
        })
      : products;

    message.textContent = "10% discount applied.";
    renderProducts();
  }
});

renderProducts();
