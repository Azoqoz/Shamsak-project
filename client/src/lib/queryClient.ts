import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Utility function to throw an error if the response is not OK
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Make an API request with automatic retries for server errors
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  retryAttempts: number = 2
): Promise<Response> {
  const doRequest = async (attempt: number): Promise<Response> => {
    try {
      console.log(`API Request: ${method} ${url}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      };
      
      if (data) {
        headers['Content-Type'] = 'application/json';
      }
      
      const res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
        cache: 'no-cache', // Disable caching to ensure fresh data
        redirect: 'follow'
      });

      if (!res.ok) {
        // Only log the error, but don't throw
        // This will allow the caller to handle the error appropriately
        console.warn(`API Request Error (${res.status} ${res.statusText}): ${method} ${url}`);
        
        // For certain types of errors, retry the request
        if (attempt < retryAttempts && (res.status >= 500 || res.status === 429)) {
          // Network errors or server errors should be retried
          const delay = Math.min(1000 * 2 ** attempt, 5000); // Exponential backoff with max 5s delay
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return doRequest(attempt + 1);
        }
      }
      
      return res;
    } catch (error) {
      console.error(`Network error during ${method} request to ${url}:`, error);
      
      // Retry network errors
      if (attempt < retryAttempts) {
        const delay = Math.min(1000 * 2 ** attempt, 5000);
        console.log(`Network error, retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return doRequest(attempt + 1);
      }
      
      throw error;
    }
  };
  
  return doRequest(0);
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function with proper generic typing
 */
export function getQueryFn<TQueryFnData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TQueryFnData> {
  const { on401: unauthorizedBehavior } = options;
  
  return async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    const doFetch = async (attempt: number, maxAttempts: number = 2): Promise<TQueryFnData> => {
      try {
        console.log(`Query: GET ${url}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
        
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache', // Disable caching to ensure fresh data
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          console.log(`Auth required for ${url}, configured to return null`);
          return null as unknown as TQueryFnData;
        }

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`API Error (${res.status}) on ${url}:`, errorText);
          
          // For 5xx server errors or rate limits, retry the request
          if (attempt < maxAttempts && (res.status >= 500 || res.status === 429)) {
            const delay = Math.min(1000 * 2 ** attempt, 5000);
            console.log(`Server error, retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return doFetch(attempt + 1, maxAttempts);
          }
          
          throw new Error(errorText || res.statusText || `Error ${res.status}`);
        }

        return await res.json();
      } catch (error) {
        console.error(`Query error on ${url}:`, error);
        
        // Retry network errors
        if (attempt < maxAttempts && error instanceof TypeError) {
          const delay = Math.min(1000 * 2 ** attempt, 5000);
          console.log(`Network error, retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return doFetch(attempt + 1, maxAttempts);
        }
        
        throw error;
      }
    };
    
    return doFetch(0);
  };
}

/**
 * Configure and export the global query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<unknown>({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 60000, // 1 minute
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
