export const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function fetchWrapper(endpoint: string, options: RequestInit = {}) {
  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  };

  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
      console.warn("Acesso Negado/Expirado. Disparando evento de logout...");
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error("SESSAO_EXPIRADA");
    }

    if (!response.ok && response.status >= 500) {
      console.warn("⏳ O servidor do Render está acordando. Aguarde...");
      throw new Error("SERVIDOR_DORMINDO");
    }

    return response;
  } catch (error: any) {
    if (error.name === "TypeError" || (error.message && error.message.includes("fetch"))) {
      console.warn("⏳ Erro de rede (CORS/Timeout). O servidor do Render está acordando...");
      throw new Error("SERVIDOR_DORMINDO");
    }
    
    console.error("Erro na API:", error);
    throw error;
  }
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    fetchWrapper(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return fetchWrapper(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers,
      }
    });
  },

  put: (endpoint: string, body: any, options?: RequestInit) => 
    fetchWrapper(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } }),

  delete: (endpoint: string, options?: RequestInit) => 
    fetchWrapper(endpoint, { ...options, method: 'DELETE' }),
};