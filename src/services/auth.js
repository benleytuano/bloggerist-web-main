import apiClient from "@/services/AxiosInstance";

export async function isAuthenticated() {
  try {
    const response = await apiClient.get("/user");

    if (response.status === 200) {
      if (response.data.username) {
        return true;
      }
    }
  } catch (error) {
    if (error.response.status === 401) {
      console.log("Unauthorized! Consider redirecting to login.");
      return false;
    }
  }
}
