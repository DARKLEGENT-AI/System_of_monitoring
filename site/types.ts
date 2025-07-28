export interface SystemData {
  cpu: number;
  ram: number;
  session_seconds: number;
}

export interface LoginResponse {
  login: string;
  role: 'user' | 'admin';
}

export interface Process {
    pid: number;
    name: string;
    cpu: number;
    ram: number;
}

export interface AdminPCSummaryData {
  id: string;
  name: string;
  status: 'Свободен' | 'Занят';
}

export interface AdminPCData {
  id:string;
  name: string;
  status: 'Свободен' | 'Занят';
  cpu: number;
  ram: number;
  ip: string;
  user?: string;
  session_seconds?: number;
  processes?: Process[];
}

export interface AddPCRequest {
  pc_id: number;
  pc_name: string;
  ip: string;
}