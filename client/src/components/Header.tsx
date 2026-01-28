import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
      logout(); // O contexto já cuida de tudo: signout, setUser(null) e redirect
    };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo-porta.png" 
                alt="portAberta" 
                className="h-10 w-auto"
              />
              <img 
                src="/images/logo-nome.png" 
                alt="portAberta" 
                className="h-10 w-auto"
              />
            </a>
          </Link>

          {showNav && (
            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="default" size="sm">
                    Acessar Dashboard
                  </Button>
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
