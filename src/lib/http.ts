const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const TOKEN_KEY = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

type TokenListener = () => void;

const tokenListeners = new Set<TokenListener>();

function notifyTokenChange() {
  for (const listener of tokenListeners) listener();
}

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY.access),
  getRefresh: () => localStorage.getItem(TOKEN_KEY.refresh),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY.access, access);
    localStorage.setItem(TOKEN_KEY.refresh, refresh);
    notifyTokenChange();
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY.access);
    localStorage.removeItem(TOKEN_KEY.refresh);
    notifyTokenChange();
  },
  subscribe: (listener: TokenListener) => {
    tokenListeners.add(listener);
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === TOKEN_KEY.access ||
        event.key === TOKEN_KEY.refresh
      ) {
        listener();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      tokenListeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  },
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { message?: unknown };
    const message =
      typeof body.message === "string" ? body.message : res.statusText;
    return new ApiError(res.status, message);
  } catch {
    return new ApiError(res.status, res.statusText);
  }
}

let refreshPromise: Promise<void> | null = null;

async function executeRefresh(): Promise<void> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) {
    tokenStore.clear();
    throw new ApiError(401, "리프레시 토큰이 없습니다.");
  }

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    tokenStore.clear();
    throw await parseErrorResponse(res);
  }

  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  tokenStore.set(data.accessToken, data.refreshToken);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

function buildHeaders(auth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function executeRequest<T>(
  path: string,
  method: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw await parseErrorResponse(res);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers = buildHeaders(auth);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = executeRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    await refreshPromise;

    const retryHeaders = buildHeaders(auth);
    return executeRequest<T>(path, method, retryHeaders, body);
  }

  if (!res.ok) throw await parseErrorResponse(res);
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
