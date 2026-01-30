import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Crown, User, AlertCircle, CheckCircle2 } from "lucide-react";

interface AccessUser {
  id: string;
  email: string;
  role: "owner" | "member";
  name: string;
}

interface ManageAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company_id: string;
}

export const ManageAccessModal = ({ open, onOpenChange, company_id }: ManageAccessModalProps) => {
  const [isOwner, setIsOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [planLimit, setPlanLimit] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [userToRemove, setUserToRemove] = useState<AccessUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  

  const usedAccess = users.length;
  const isLimitReached = usedAccess >= planLimit;

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setLoading(true);

      const [{ data: company }, { data: companyUsers }, { data: myAccess }] = await Promise.all([
        supabase
          .from("companies")
          .select("max_dashboard_users")
          .eq("id", company_id)
          .single(),

        supabase
          .from("company_users")
          .select("id, email, role, name")
          .eq("company_id", company_id)
          .order("created_at"),

        supabase
            .from("company_users")
            .select("role")
            .eq("company_id", company_id)
            .eq("email", (await supabase.auth.getUser()).data.user?.email)
            .single(),
      ]);

      if (company) setPlanLimit(company.max_dashboard_users ?? 0);
      if (companyUsers) setUsers(companyUsers);
      setIsOwner(myAccess?.role === "owner");

      setLoading(false);
    };

    loadData();
  }, [open, company_id]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    
    // Check if email already exists
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      setFeedback({ type: "error", message: "Este email já possui acesso" });
      return;
    }
    
    if (isLimitReached) {
      setFeedback({ type: "error", message: "Limite de acessos do plano atingido" });
      return;
    }
    
    const { data, error } = await supabase
      .from("company_users")
      .insert({
        company_id: company_id,
        email: email.trim(),
        role: "member",
        name: email.split("@")[0],
      })
      .select()
      .single();

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    setUsers((prev) => [...prev, data]);
    setEmail("");
    setFeedback({ type: "success", message: "Acesso adicionado com sucesso" });
  };

  const handleRemoveConfirm = async () => {
    if (!userToRemove) return;
    await supabase
      .from("company_users")
      .delete()
      .eq("id", userToRemove.id);

    setUsers((prev) => prev.filter((u) => u.id !== userToRemove.id));
    setUserToRemove(null);
    setFeedback({ type: "success", message: "Acesso removido com sucesso" });
  };

    const plans = [
    {
        name: "Essencial",
        price: "R$ 49,90/mês",
        description: "Ideal para pequenas equipes",
        features: [
        "Até 100 feedbacks/mês",
        "1 acesso ao dashboard"
        ],
    },
    {
        name: "Profissional",
        price: "R$ 97,00/mês",
        description: "Para empresas em crescimento",
        features: [
        "Feedbacks ilimitados",
        "Até 3 acessos ao dashboard"
        ],
    },
    {
        name: "Avançado",
        price: "R$ 147,00/mês",
        description: "Para times estruturados",
        features: [
        "Usuários ilimitados",
        "Até 5 acessos ao dashboard",
        "Suporte prioritário",
        ],
    },
    {
        name: "Premium",
        price: "R$ 197,00/mês",
        description: "Para operações maiores",
        features: [
        "Usuários ilimitados",
        "Até 10 acessos ao dashboard",
        "Suporte prioritário",
        ],
    },
    ];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Gerenciar acessos ao dashboard
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Convide pessoas responsáveis pela análise dos feedbacks.
          </DialogDescription>
        </DialogHeader>

        {/* Status Section */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Acessos utilizados</span>
          <Badge variant="outline" className="text-base px-3 py-1">
            <span className={isLimitReached ? "text-destructive" : "text-primary"}>
              {usedAccess}
            </span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-muted-foreground">{planLimit}</span>
          </Badge>
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              feedback.type === "success"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {feedback.message}
          </div>
        )}

        {/* Users List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <Label className="text-sm font-medium text-muted-foreground">Usuários com acesso</Label>
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  {user.role === "owner" ? (
                    <Crown className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{user.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.role === "owner" ? "Responsável" : "Membro"}
                  </span>
                </div>
              </div>
              {isOwner && user.role === "member" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setUserToRemove(user)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Access */}
        <div className="space-y-3 pt-2 border-t border-border">
          <Label className="text-sm font-medium text-muted-foreground">Adicionar novo acesso</Label>
          
          {isOwner ? (
            isLimitReached ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Você atingiu o limite de acessos do seu plano.
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowPlans((prev) => !prev)}>
                {showPlans ? "Ocultar planos" : "Ver planos"}
              </Button>
                {showPlans && (
                <div className="mt-4 max-h-[400px] overflow-y-auto pr-2 pb-3 space-y-4">
                    {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className="border rounded-lg p-4 bg-muted/50"
                    >
                        <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <span className="font-bold">{plan.price}</span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                        {plan.description}
                        </p>

                        <ul className="mt-3 space-y-1 text-sm">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                            <span className="text-green-500">✔</span>
                            {feature}
                            </li>
                        ))}
                        </ul>
                    </div>
                    ))}
                </div>
                )}

            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="flex-1 h-10"
              />
              <Button onClick={handleInvite} className="gap-2 h-10 px-4 py-0">
                <UserPlus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          )
         ) : (
              <div className="text-sm text-muted-foreground">
                Apenas o responsável pode gerenciar acessos.
              </div>
          )}
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
        <AlertDialog
            open={!!userToRemove}
            onOpenChange={() => setUserToRemove(null)}
        >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso de <strong>{userToRemove?.email}</strong>? 
              Esta pessoa não poderá mais acessar o dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#F7F7F8] text-[#3C3946] hover:bg-[#f0f0f4]/80 rounded-xl h-10 px-4 py-2 text-[14px] font-medium transition-colors border border-[#E2E2E2]">
            Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveConfirm}
              className="bg-[#EF4444] text-white hover:bg-[#EF4444]/90 rounded-xl h-10 px-4 py-2 text-[14px] font-medium transition-colors border-none"
            >
              Remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

