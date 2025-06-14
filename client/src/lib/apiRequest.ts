const BASE_URL = "https://localhost:7144/api";

export const apiRequest = async (method: string, path: string, data?: any) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : null,
  });

  if (!res.ok) {
    throw new Error(`API ${method} ${path} failed with status ${res.status}`);
  }

  return res.json();
};

export const apiGet = async (path: string) => {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
};
