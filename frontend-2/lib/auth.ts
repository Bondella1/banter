import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

export async function login(username: string, password: string) {
  const { data } = await axios.post(`${API}/api/token/`, { username, password });
  // store tokens
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  // set default header
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
