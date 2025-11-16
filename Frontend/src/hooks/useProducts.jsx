import { useEffect, useState } from "react";
import http from "../lib/http";

export function useProducts(params = { page: 0, limit: 12, sort: "createdAt:desc", search: "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await http.get("/products", {
          params,
          signal: controller.signal, // axios v1 supports AbortController
        });
        setData(res.data);
      } catch (e) {
        if (controller.signal.aborted) return;
        const status = e.response?.status;
        const msg =
          e.response?.data?.message ||
          (status === 401
            ? "Couldn’t load products (unauthorized)."
            : status === 403
            ? "You don’t have access."
            : status === 404
            ? "Products not found."
            : "Couldn’t load products. Please try again.");
        setError(msg);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();
    return () => controller.abort();
    // Only rerun when specific fields change
  }, [params.page, params.limit, params.sort, params.search]);

  return { data, loading, error };
}
