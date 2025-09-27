import { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { ThemeProvider } from '../components/ui/theme-provider';
import { Header } from '../components/ui/header';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { GoogleIcon } from '../components/ui/google-icon';

const apiBase = window.location.origin;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Handle OAuth errors from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const code = urlParams.get('code');
        const message = urlParams.get('message');

        if (error === 'google_auth_failed' && code && message) {
            const decodedMessage = decodeURIComponent(message);

            if (code === 'account_conflict') {
                toast({
                    title: 'Account Conflict',
                    description: decodedMessage,
                    variant: 'destructive',
                    duration: 10000, // Show for 10 seconds for this important message
                });
            } else if (code === 'google_profile_incomplete') {
                toast({
                    title: 'Google Profile Issue',
                    description: decodedMessage,
                    variant: 'destructive',
                    duration: 8000,
                });
            } else if (code === 'account_creation_failed') {
                toast({
                    title: 'Account Creation Failed',
                    description: decodedMessage,
                    variant: 'destructive',
                    duration: 8000,
                });
            } else if (code === 'existing_account_different_provider') {
                toast({
                    title: 'Account Found',
                    description: decodedMessage,
                    variant: 'default', // Use default variant instead of destructive for this case
                    duration: 8000,
                });
            } else {
                toast({
                    title: 'Google Sign-In Failed',
                    description: decodedMessage,
                    variant: 'destructive',
                    duration: 6000,
                });
            }

            // Clean up URL parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [toast]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // toast({ title: 'Login Successful', description: 'Welcome!', variant: 'success' });
                localStorage.setItem('manacle_session', 'true');
                try {
                    const me = await fetch('/api/me', { credentials: 'include' }).then(r => r.json()).catch(() => null);
                    if (me?.user?.id) localStorage.setItem('userID', me.user.id);
                } catch { }
                window.location.href = '/auto-site';
                // try {
                //     const progressRes = await fetch("/api/load-form", { credentials: "include" });
                //     if (!progressRes.ok) throw new Error("Could not load form progress");
                //     const progressData = await progressRes.json();
                //     console.log(progressData.step_number);
                //     const formData = typeof progressData.form_data === "string"
                //         ? JSON.parse(progressData.form_data)
                //         : progressData.form_data;
                //     navigate("/auto-site", {
                //         state: {
                //             stepNumber: progressData.step_number,
                //             formData
                //         }
                //     });
                // } catch (progressErr) {
                //     toast({ title: 'Progress Load Failed', description: 'Could not load form progress. Starting at step 0.', variant: 'warning' });
                //     navigate("/auto-site", {
                //         state: {
                //             stepNumber: 0,
                //             formData: {}
                //         }
                //     });
                // }
            } else {
                toast({
                    title: 'Login Failed', description: data.error || 'Invalid credentials', variant: 'destructive'
                });
            }
        } catch (err) {
            toast({ title: 'Login Failed', description: 'Server error', variant: 'destructive' });
        }
        setIsLoading(false);
    };

    return (
        <ThemeProvider defaultTheme="light" storageKey="manacle_theme">
            <Header />
            <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/20 to-background">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.2),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary)/0.2),transparent_50%)]" />
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-foreground/20 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [-20, -100],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                <div className="relative mt-10 z-10 min-h-screen flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-md"
                    >
                        <Card className="backdrop-blur-xl bg-card/80 border-border shadow-2xl">
                            <CardHeader className="text-center pb-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-4"
                                >
                                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        Welcome Back
                                    </CardTitle>
                                    <p className="text-muted-foreground mt-2">Sign in to your account</p>
                                </motion.div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <motion.form
                                    onSubmit={handleLogin}
                                    className="space-y-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pl-4 h-12"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required
                                                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pl-4 pr-12 h-12"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <motion.div
                                                    className="flex items-center gap-2"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <motion.div
                                                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    Signing in...
                                                </motion.div>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </motion.div>
                                </motion.form>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-6 text-center"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-card text-muted-foreground">or</span>
                                        </div>
                                    </div>
                                    <motion.div
                                        className="mt-4 google-button-container"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() => { window.location.href = '/api/auth/google?intent=login'; }}
                                            className="w-full bg-secondary/80 dark:bg-background/50 border-2 border-border dark:border-border text-foreground hover:bg-secondary hover:text-foreground dark:hover:bg-background/80 dark:hover:text-foreground hover:border-primary/50 dark:hover:border-border/80 h-12 mb-2 flex items-center justify-center gap-3 transition-all duration-200"
                                        >
                                            <GoogleIcon className="w-5 h-5" />
                                            Continue with Google
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        className="signup-button-container"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/signup'}
                                            className="w-full bg-secondary/80 dark:bg-background/50 border-2 border-border dark:border-border text-foreground hover:bg-secondary hover:text-foreground dark:hover:bg-background/80 dark:hover:text-foreground hover:border-primary/50 dark:hover:border-border/80 h-12 transition-all duration-200"
                                        >
                                            Create New Account
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </ThemeProvider>
    );
}
