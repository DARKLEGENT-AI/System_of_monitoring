import { SystemData, LoginResponse, AdminPCData, AdminPCSummaryData, AddPCRequest } from '../types';

export const loginUser = async (login: string, pass: string): Promise<LoginResponse | null> => {
  // To test without a running backend, you can uncomment these lines:
  // if (login.toLowerCase() === 'admin' && pass === 'admin') {
  //   return { login: 'Администратор', role: 'admin' };
  // }
  // if (login.toLowerCase() === 'user' && pass === 'user') {
  //    return { login, role: 'user' };
  // }
  
  try {
    const response = await fetch("http://localhost:8000/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password: pass })
    });
    const data = await response.json();
    if (data.status === "ok" && data.role) {
      return { login: data.login || login, role: data.role };
    }
    return null;
  } catch (error) {
    console.error("Login API failed:", error);
    return null;
  }
};

export const fetchAdminPCs = async (): Promise<AdminPCSummaryData[]> => {
  try {
    const response = await fetch('http://localhost:8000/admin/pcs');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch(e) {
    console.error("Failed to fetch admin PCs:", e);
    throw e;
  }
};

export const fetchPCDetails = async (id: string): Promise<AdminPCData> => {
  try {
    const response = await fetch(`http://localhost:8000/admin/pc/${id}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok for pc id ${id}`);
    }
    return await response.json();
  } catch(e) {
    console.error(`Failed to fetch PC details for id ${id}:`, e);
    throw e;
  }
};

export const addPC = async (data: AddPCRequest): Promise<void> => {
    const response = await fetch('http://localhost:8000/admin/add_pc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    // If the HTTP status is not 'ok', we might have a server-level error or
    // a structured failure response.
    if (!response.ok) {
        try {
            // The body might contain a JSON with a 'reason' for the failure.
            const errorResult = await response.json();
            throw new Error(errorResult.reason || `Ошибка сервера: ${response.status}`);
        } catch (e) {
            // If the body is not JSON or parsing fails, throw a generic HTTP error.
            throw new Error(`Ошибка сервера: ${response.statusText || response.status}`);
        }
    }
    
    // If the HTTP status is 'ok', we still need to check the application-level status in the body.
    const result = await response.json();
    
    // As per the API spec, `reachable: false` or `status: "fail"` indicates a logical failure (e.g., ping fail).
    if (result.status === 'fail' || result.reachable === false) {
        const errorMessage = result.reason || 'ПК не отвечает.';
        throw new Error(errorMessage);
    }
    
    // Otherwise, the operation was successful and the function returns void.
};

export const fetchSystemData = async (username: string): Promise<SystemData> => {
  try {
    const response = await fetch(`http://localhost:8000/user/${username}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch system data:", error);
    throw error;
  }
};
