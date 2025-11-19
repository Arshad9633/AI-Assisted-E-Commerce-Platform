import http from "../lib/http";

export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post("/admin/upload/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.url;
}
