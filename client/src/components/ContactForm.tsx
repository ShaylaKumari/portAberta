import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useContactForm } from "@/hooks/useContactForm";

export function ContactForm() {
  const {
    form,
    loading,
    success,
    error,
    handleChange,
    handleSubmit,
  } = useContactForm();

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardContent className="p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={form.company}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={handleChange}
              className="min-h-[120px]"
            />
          </div>

          {success && (
            <p className="text-green-600 text-sm">
              Mensagem enviada com sucesso!
            </p>
          )}

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Send className="w-4 h-4" />
            {loading ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
