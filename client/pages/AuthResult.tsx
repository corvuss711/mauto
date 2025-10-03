import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export default function AuthResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processOAuthResult = async () => {
            try {
                // Only rely on session-based authentication
                const params = new URLSearchParams(location.search);
                const isNew = params.get('new') === '1';

                const response = await fetch('/api/me', {
                    credentials: 'include',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (!response.ok) throw new Error('Failed to fetch user session');
                const userData = await response.json();
                if (!userData.authenticated || !userData.user?.id) {
                    throw new Error('User not authenticated');
                }
                const userId = String(userData.user.id);
                // Optionally set userID in localStorage for legacy code
                localStorage.setItem('userID', userId);
                if (isNew) {
                    toast({
                        title: 'Welcome to Manacle!',
                        description: 'Your account has been created successfully.',
                        variant: 'default'
                    });
                    setTimeout(() => {
                        navigate('/?new=1', { replace: true });
                    }, 1000);
                } else {
                    toast({
                        title: 'Welcome back!',
                        description: 'You have been signed in successfully.',
                        variant: 'default'
                    });
                    window.dispatchEvent(new Event('user-login'));
                    setTimeout(() => {
                        navigate('/auto-site', { replace: true });
                    }, 800);
                }
            } catch (error) {
                console.error('[AuthResult] Error processing OAuth result:', error);
                setIsProcessing(false);
                toast({
                    title: 'Authentication Error',
                    description: 'Failed to complete sign in. Please try again.',
                    variant: 'destructive'
                });
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            }
        };
        processOAuthResult();
    }, [navigate, location.search, toast]);

    if (isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Completing sign in...</p>
                    <p className="text-sm text-muted-foreground mt-2">Please wait while we set up your account.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <p className="text-lg text-destructive">Authentication failed. Redirecting...</p>
            </div>
        </div>
    );
}
