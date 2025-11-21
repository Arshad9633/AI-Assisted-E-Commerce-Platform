import axiosAuth from "./axiosAuth";

export async function fetchNotifications() {
  return axiosAuth.get("/notifications");
}

export async function markNotificationsRead() {
  return axiosAuth.post("/notifications/read");
}
