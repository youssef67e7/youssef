export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface IApiErrorResponse {
  success: boolean;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  errors?: Record<string, string[]>;
}
