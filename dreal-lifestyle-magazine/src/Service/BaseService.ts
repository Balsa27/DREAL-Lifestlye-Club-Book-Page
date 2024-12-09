export class BaseService {
    protected baseUrl = 'http://localhost:8081/api';

    protected async authRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.jwt) {
            throw new Error('Invalid response data');
        }

        return data;
    }

    protected async request<T>(endpoint: string, options: RequestInit): Promise<T> {
        const token = localStorage.getItem('jwt');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });
        console.log("fee", response)

        if (!response.ok) {
            console.log("response", response)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
}