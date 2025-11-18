import http from "../lib/http.jsx";

// -----------------------------
// CATEGORY
// -----------------------------
export async function getCategories() {
  const { data } = await http.get("/admin/catalog/categories");
  return data;
}

export async function createCategory(payload) {
  const { data } = await http.post("/admin/catalog/categories", payload);
  return data;
}

export async function updateCategory(id, payload) {
  const { data } = await http.put(`/admin/catalog/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id) {
  await http.delete(`/admin/catalog/categories/${id}`);
  return true;
}

// -----------------------------
// PRODUCT
// -----------------------------
export async function getAdminProducts() {
  const { data } = await http.get("/admin/catalog/products");
  return data;
}

export async function createProduct(payload) {
  const { data } = await http.post("/admin/catalog/products", payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await http.put(`/admin/catalog/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  await http.delete(`/admin/catalog/products/${id}`);
  return true;
}
