/**
 * @agent frontend-ux-ui
 * Bouton de déconnexion avec intégration NextAuth
 */
'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = 'outline',
  className,
  showIcon = true,
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <Button variant={variant} onClick={handleLogout} className={className}>
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      Se déconnecter
    </Button>
  );
}
