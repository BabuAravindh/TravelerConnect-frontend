export async function apiRequest<T>(url: string, method: string = "GET", body?: any): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Failed to ${method} data`);
  }

  return res.json();
}

export function get<T>(url: string): Promise<T> {
  return apiRequest<T>(url, "GET");
}

export function post<T>(url: string, body: any): Promise<T> {
  return apiRequest<T>(url, "POST", body);
}

export function put<T>(url: string, body: any): Promise<T> {
  return apiRequest<T>(url, "PUT", body);
}

export function remove<T>(url: string): Promise<T> {
  return apiRequest<T>(url, "DELETE");
}
