import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { AuthError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { validateRedirectUrl } from '@/lib/utils';

function getRedirectNavigationOptions(path: string) {
  const url = new URL(path, window.location.origin);
  return {
    to: url.pathname,
    search: Object.fromEntries(url.searchParams.entries()),
    hash: url.hash ? url.hash.slice(1) : undefined,
  };
}

export function SignInView() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.searchStr);
  const redirectPath = validateRedirectUrl(searchParams.get('redirect'));

  useEffect(() => {
    if (!authLoading && session && user) {
      navigate({ to: '/', replace: true });
    }
  }, [session, user, authLoading, navigate]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(account, password);
      navigate(getRedirectNavigationOptions(redirectPath));
    } catch (caught) {
      const authError = caught as AuthError;
      const message =
        authError.message === 'Invalid login credentials'
          ? '账号或密码错误'
          : '登录失败，请稍后重试';
      setError(message);
      toast({
        title: '登录失败',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-adam-bg-dark p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-4 rounded-lg bg-adam-bg-secondary-dark p-8 shadow-md">
          <div className="mb-4 flex justify-center">
            <img
              src={`${import.meta.env.BASE_URL}/cadam-logo.svg`}
              alt="CADAM Logo"
              className="w-32"
            />
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="account" className="text-white">
                账号
              </Label>
              <Input
                id="account"
                type="text"
                autoComplete="username"
                placeholder="请输入账号"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                required
                className="border-gray-700 bg-adam-bg-dark px-4 text-white placeholder:text-gray-400 max-[430px]:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="border-gray-700 bg-adam-bg-dark px-4 text-white placeholder:text-gray-400 max-[430px]:text-base"
              />
            </div>

            <Button type="submit" className="w-full p-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在登录...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
