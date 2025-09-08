import { useState, useCallback } from "react";
// import http from "../lib/http";

export function useRecs() {
  const [recs, setRecs] = useState([]);

  const loadRecs = useCallback(async (userId) => {
    // Later: const { data } = await http.get('/api/recommendations');
    // The backend uses the JWT to return personalized recs.
    setRecs([
      { id: "p1", title: "Trout Feed 1", subtitle: "Popular this week" },
      { id: "p2", title: "Trout Feed 2", subtitle: "Based on your views" },
    ]);
  }, []);

  return { recs, loadRecs };
}
