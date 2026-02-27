import axios from "axios";

// Frontend chama /api/* — o servidor Express faz proxy para o NocoDB.
// Token NocoDB NUNCA aparece no bundle do frontend.
const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err.response?.data ?? err.message);
    return Promise.reject(err);
  }
);

export default apiClient;
