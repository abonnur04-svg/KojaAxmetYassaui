import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  token: localStorage.getItem('base44_auth_token'),
});

export default base44;
