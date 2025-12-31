const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888';

const URL = BASE_URL + '/dashboard';

export async function getDashboardStats() {
    const response = await fetch(URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
}