const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('studyplatform_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any = {};

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    const rawText = await response.text().catch(() => '');
    if (rawText.trim().startsWith('{')) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText.substring(0, 180) };
      }
    } else if (rawText.includes('<!DOCTYPE html>') || rawText.includes('<html')) {
      // In case an unrouted HTML 404/200 was served
      data = {
        error: `La ruta de la API (${endpoint}) no fue procesada por el servidor (HTTP ${response.status}).`,
      };
    } else {
      data = { error: rawText || `Error HTTP ${response.status}: ${response.statusText}` };
    }
  }

  if (!response.ok) {
    throw new ApiError(data.error || `Error en la petición (${response.status})`, response.status, data.details);
  }

  return data;
}
