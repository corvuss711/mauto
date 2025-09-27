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
                // Mark session as present (consistent with regular login)
                localStorage.setItem('manacle_session', 'true');

                // Check URL parameters for fallback user info (in case session doesn't work)
                const params = new URLSearchParams(location.search);
                const urlUserId = params.get('uid');
                const urlEmail = params.get('email');
                const isNew = params.get('new') === '1';



                // First try to get user data from the session

                const response = await fetch('/api/me', {
                    credentials: 'include',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });

                let userData = null;
                let userId = null;

                if (response.ok) {
                    userData = await response.json();
                    console.log('[AuthResult] /api/me response:', userData);

                    if (userData.authenticated && userData.user?.id) {
                        userId = String(userData.user.id);
                        console.log('[AuthResult] Got user ID from session:', userId);
                    }
                }

                // Fallback: Use URL parameters if session didn't work
                if (!userId && urlUserId) {
                    userId = decodeURIComponent(urlUserId);
                    console.log('[AuthResult] Using fallback user ID from URL:', userId);

                    // Verify this user exists in database by trying to save a dummy form step
                    try {
                        const verifyResponse = await fetch('/api/save-step', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                step_number: 0,
                                form_data: {},
                                user_id: userId
                            })
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('User verification failed');
                        }
                        console.log('[AuthResult] User verification successful');
                    } catch (verifyError) {
                        console.error('[AuthResult] User verification failed:', verifyError);
                        throw new Error('Invalid user credentials');
                    }
                }

                if (!userId) {
                    throw new Error('No user ID available from session or URL parameters');
                }

                // Clear any existing session data to prevent conflicts
                localStorage.removeItem('autoSiteLoggedOut');
                // Only clear tracking if this is actually a different user
                const lastUserID = localStorage.getItem('autoSiteLastUserID');
                if (lastUserID && lastUserID !== userId) {
                    console.log('[AuthResult] Different user detected, clearing tracking');
                    localStorage.removeItem('currentLoadedUserId');
                } else {
                    console.log('[AuthResult] Same user or no previous user, preserving tracking');
                }
                
                // Set userID in localStorage (same as regular login/signup)
                localStorage.setItem('userID', userId);
                console.log('[AuthResult] SUCCESS - userID set in localStorage:', userId);                // Ensure clean session state for Google OAuth users
                localStorage.setItem('manacle_session', 'true');

                if (isNew) {
                    // New user - redirect to home page
                    console.log('[AuthResult] New user detected, redirecting to home');
                    toast({
                        title: 'Welcome to Manacle!',
                        description: 'Your account has been created successfully.',
                        variant: 'default'
                    });
                    setTimeout(() => {
                        navigate('/?new=1', { replace: true });
                    }, 1000);
                } else {
                    // Existing user - redirect to auto-site
                    console.log('[AuthResult] Existing user detected, redirecting to auto-site');
                    toast({
                        title: 'Welcome back!',
                        description: 'You have been signed in successfully.',
                        variant: 'default'
                    });

                    // Trigger user login event to handle form state
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

                // Redirect to login page after a delay
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
