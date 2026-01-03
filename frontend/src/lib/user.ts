import axios from 'axios';

const usersEndpoint =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/auth';

export const checkStatus = async (token: string) => {
  try {
    const response = await axios.get(`${usersEndpoint}/checkStatus`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    // const response = await axios.get(`${usersEndpoint}/checkStatus`, {
    //   withCredentials: true,
    // });
    return response.data;
  } catch (error: any) {
    console.error('Error checking user status:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${usersEndpoint}/login`,
      { email, password },
      { withCredentials: true },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const registerUser = async (
  username: string,
  email: string,
  password: string,
) => {
  try {
    const response = await axios.post(
      `${usersEndpoint}/register`,
      { username, email, password },
      { withCredentials: true },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await axios.post(
      `${usersEndpoint}/logout`,
      {},
      { withCredentials: true },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error logging out user:', error);
    throw error;
  }
};

export const fetchLoggedUser = async () => {
  try {
    const response = await axios.get(`${usersEndpoint}/me`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching logged user:', error);
    throw error;
  }
};
