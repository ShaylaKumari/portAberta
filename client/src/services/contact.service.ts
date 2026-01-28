export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const CONTACT_URL = import.meta.env.VITE_N8N_CONTACT_URL;
const CONTACT_API_KEY = import.meta.env.VITE_CONTACT_API_KEY;

if (!CONTACT_URL) {
  throw new Error("VITE_N8N_CONTACT_URL não definida");
}

export async function sendContact(payload: ContactPayload) {
  const res = await fetch(CONTACT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONTACT_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao enviar contato: ${text}`);
  }

  return res.json();
}
