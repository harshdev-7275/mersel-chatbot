import useAuthStore from "@/store/auth-store";
import { API_URL } from "../../env";
import axios from "axios"
const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    }
  });
export async function authenticateUser(credentials: any) {
  const { setToken, setUserId } = useAuthStore.getState(); // No more 'unknown' type error
  console.log("credentials", credentials)
 

  const response = await api.post('/conversation/get_token', credentials);
  console.log("response", response.data)
  if (response.status !== 200) {
    throw new Error('Authentication failed');
  }

  const { token } =  response.data;
  setUserId(credentials.username);
  setToken(token); // Safely set the token
}
