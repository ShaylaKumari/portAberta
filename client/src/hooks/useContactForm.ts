import { useState } from "react";
import { sendContact } from "@/services/contact.service";

export function useContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await sendContact(form);
      setSuccess(true);
      setForm({ name: "", email: "", company: "", message: "" });
    } catch (err) {
      setError("Não foi possível enviar sua mensagem.");
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    loading,
    success,
    error,
    handleChange,
    handleSubmit,
  };
}
