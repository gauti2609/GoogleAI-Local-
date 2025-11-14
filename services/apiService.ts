import { Masters, MappingSuggestion, FinancialEntity, EntityType, AllData } from '../types.ts';

const API_URL = '/api'; // Assuming the frontend is served by the same server as the backend API

async function fetchWithAuth(url: string, options: RequestInit = {}, token: string) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    // For DELETE requests, a 204 No Content is a success but response.json() will fail.
    if (response.status === 204) {
      return null;
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'An API error occurred');
  }
  // Handle cases where the response might be empty
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// --- Auth ---
export const login = async (email: string, password: string): Promise<{ access_token: string }> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
};

export const register = async (email: string, password: string): Promise<any> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return response.json();
};

// --- Entities ---
export const getEntities = (token: string): Promise<FinancialEntity[]> => {
  return fetchWithAuth(`${API_URL}/entities`, {}, token);
};

export const createEntity = (token: string, name: string, entityType: EntityType): Promise<FinancialEntity> => {
  return fetchWithAuth(`${API_URL}/entities`, {
    method: 'POST',
    body: JSON.stringify({ name, entityType }),
  }, token);
};

export const getEntityData = (token: string, entityId: string): Promise<AllData> => {
    return fetchWithAuth(`${API_URL}/entities/${entityId}`, {}, token);
};

export const updateEntity = (token: string, entityId: string, data: AllData): Promise<FinancialEntity> => {
    return fetchWithAuth(`${API_URL}/entities/${entityId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }, token);
};

export const deleteEntity = (token: string, entityId: string): Promise<null> => {
    return fetchWithAuth(`${API_URL}/entities/${entityId}`, {
        method: 'DELETE',
    }, token);
}


// --- AI Service ---
export const getMappingSuggestion = async (
  token: string,
  ledgerName: string,
  masters: Masters,
): Promise<MappingSuggestion | null> => {
  try {
    const suggestion = await fetchWithAuth(`${API_URL}/ai/suggest-mapping`, {
      method: 'POST',
      body: JSON.stringify({ ledgerName, masters }),
    }, token);

    if (suggestion && suggestion.majorHeadCode && suggestion.minorHeadCode && suggestion.groupingCode) {
      return suggestion as MappingSuggestion;
    }
    return null;
  } catch (error) {
    console.error('Error fetching mapping suggestion from backend:', error);
    alert('Failed to get AI suggestion. Please check your network connection.');
    return null;
  }
};