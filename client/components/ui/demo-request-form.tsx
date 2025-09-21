import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, Globe, Mail, Phone, Building, User, Lock, Star, ChevronDown, Users, Briefcase, Layers, MapPin, X, CheckCircle, AlertCircle, CreditCard, Settings, Plus, Minus } from "lucide-react";
import { TrustedByCompanies } from "./trusted-by-companies";
import { CompanyEllipse } from "./company-ellipse";
import { DynamicPricing } from "../../pages/DynamicPricing";

interface FormData {
    // user_name: string;
    // password: string;
    email: string;
    mobile: string;
    otp: string;
    company_name: string;
    company_title: string;
    website: string;
    address: string;
    // no_employees: number;
    contact_per_name: string;
    application_type: number;
}

interface PricingTier {
    name: string;
    price: string;
    period: string;
    features: string[];
    popular?: boolean;
    minUsers: number;
    maxUsers: number;
    trialDays: number;
}

interface PlanDetail {
    id: number;
    plan_name: string;
    duration: string;
    base_price_per_user: string;
    base_price_per_user_internal?: string;
    base_price_per_user_external?: string;
    discount: string | null;
    min_users: number;
    max_users: number;
    trial_days: number;
    base_price_per_internal_user_per_month?: number;
    base_price_per_external_user_per_month?: number;
}

interface Plan {
    plan_name: string;
    plan_id: number;
    features_list: string[];
    plan_details: PlanDetail[];
}

interface ApiResponse {
    response: boolean;
    data: { [key: string]: Plan };
}

const applicationTypes = [
    { value: 1, label: "SFA (Sales Force Automation)", icon: Briefcase, gradient: "from-orange-500 to-amber-500" },
    { value: 2, label: "HRMS (Human Resource Management)", icon: Users, gradient: "from-blue-500 to-indigo-500" },
    { value: 3, label: "SFA + HRMS (Combined Solution)", icon: Layers, gradient: "from-purple-500 to-fuchsia-500" }
];

// Static fallback data - commented out for now, will be used as fallback
/*
const pricingData = {
    1: { // SFA
        title: "SFA Solutions",
        tiers: [
            {
                name: "Silver",
                price: "₹2,999",
                period: "/month",
                features: ["Up to 10 users", "Basic reporting", "Mobile app access", "Email support"]
            },
            {
                name: "Gold",
                price: "₹4,999",
                period: "/month",
                popular: true,
                features: ["Up to 50 users", "Advanced analytics", "Custom reports", "Priority support", "API access"]
            },
            {
                name: "Platinum",
                price: "₹7,999",
                period: "/month",
                features: ["Unlimited users", "AI-powered insights", "Custom integrations", "24/7 support", "White-label option"]
            }
        ]
    },
    2: { // HRMS
        title: "HRMS Solutions",
        tiers: [
            {
                name: "Essential",
                price: "₹1,999",
                period: "/month",
                features: ["Up to 25 employees", "Basic HR functions", "Attendance tracking", "Email support"]
            },
            {
                name: "Professional",
                price: "₹3,999",
                period: "/month",
                popular: true,
                features: ["Up to 100 employees", "Payroll management", "Performance tracking", "Priority support", "Mobile app"]
            },
            {
                name: "Enterprise",
                price: "₹6,999",
                period: "/month",
                features: ["Unlimited employees", "Advanced analytics", "Custom workflows", "24/7 support", "Multi-location"]
            }
        ]
    },
    3: { // Combined
        title: "SFA + HRMS Bundle",
        tiers: [
            {
                name: "Starter",
                price: "₹3,999",
                period: "/month",
                features: ["Complete SFA + HRMS", "Up to 25 users", "Basic features", "Email support"]
            },
            {
                name: "Business",
                price: "₹7,999",
                period: "/month",
                popular: true,
                features: ["Advanced SFA + HRMS", "Up to 100 users", "Full feature set", "Priority support", "Integrations"]
            },
            {
                name: "Ultimate",
                price: "₹12,999",
                period: "/month",
                features: ["Enterprise SFA + HRMS", "Unlimited users", "AI-powered insights", "24/7 support", "Custom solutions"]
            }
        ]
    }
};
*/

// Fallback static data based on API response structure
const fallbackPricingData: { [key: number]: Plan } = {
    1: {
        plan_name: "Silver",
        plan_id: 1,
        features_list: [
            "User, Dealer & Distributor Creation",
            "Secondary sales (Retailer orders)",
            "Beat plan orders",
            "Scheme & discount handling",
            "Attendance marking",
            "Expense claim submission & approvals"
        ],
        plan_details: [
            {
                id: 1,
                plan_name: "Silver",
                duration: "monthly",
                base_price_per_user: "300.00",
                discount: null,
                min_users: 5,
                max_users: 10,
                trial_days: 10
            },
            {
                id: 2,
                plan_name: "Silver",
                duration: "quaterly",
                base_price_per_user: "250.00",
                discount: null,
                min_users: 11,
                max_users: 50,
                trial_days: 10
            },
            {
                id: 3,
                plan_name: "Silver",
                duration: "half_yearly",
                base_price_per_user: "200.00",
                discount: null,
                min_users: 51,
                max_users: 100,
                trial_days: 15
            },
            {
                id: 4,
                plan_name: "Silver",
                duration: "yearly",
                base_price_per_user: "180.00",
                discount: null,
                min_users: 101,
                max_users: 200,
                trial_days: 10
            }
        ]
    },
    2: {
        plan_name: "Gold",
        plan_id: 2,
        features_list: [
            "User, Dealer & Distributor Creation",
            "Secondary sales (Retailer orders)",
            "Beat plan orders",
            "Scheme & discount handling",
            "Attendance marking",
            "Expense claim submission & approvals"
        ],
        plan_details: [
            {
                id: 5,
                plan_name: "Gold",
                duration: "monthly",
                base_price_per_user: "400.00",
                discount: null,
                min_users: 1,
                max_users: 10,
                trial_days: 15
            },
            {
                id: 6,
                plan_name: "Gold",
                duration: "quaterly",
                base_price_per_user: "500.00",
                discount: null,
                min_users: 11,
                max_users: 50,
                trial_days: 15
            },
            {
                id: 7,
                plan_name: "Gold",
                duration: "half_yearly",
                base_price_per_user: "550.00",
                discount: null,
                min_users: 51,
                max_users: 150,
                trial_days: 15
            },
            {
                id: 8,
                plan_name: "Gold",
                duration: "yearly",
                base_price_per_user: "585.00",
                discount: null,
                min_users: 151,
                max_users: 250,
                trial_days: 15
            }
        ]
    },
    3: {
        plan_name: "Platinum",
        plan_id: 3,
        features_list: [
            "User, Dealer & Distributor Creation",
            "Secondary sales (Retailer orders)",
            "Beat plan orders",
            "Scheme & discount handling",
            "Attendance marking",
            "Expense claim submission & approvals"
        ],
        plan_details: [
            {
                id: 9,
                plan_name: "Platinum",
                duration: "monthly",
                base_price_per_user: "450.00",
                discount: null,
                min_users: 5,
                max_users: 10,
                trial_days: 10
            },
            {
                id: 10,
                plan_name: "Platinum",
                duration: "quaterly",
                base_price_per_user: "500.00",
                discount: null,
                min_users: 11,
                max_users: 40,
                trial_days: 10
            },
            {
                id: 11,
                plan_name: "Platinum",
                duration: "half_yearly",
                base_price_per_user: "550.00",
                discount: null,
                min_users: 41,
                max_users: 250,
                trial_days: 10
            },
            {
                id: 12,
                plan_name: "Platinum",
                duration: "yearly",
                base_price_per_user: "650.00",
                discount: null,
                min_users: 251,
                max_users: 1000,
                trial_days: 10
            }
        ]
    }
};

// Tenure options
const tenureOptions = [
    { value: "yearly", label: "Yearly", popular: true },
    { value: "half_yearly", label: "Half Yearly", popular: false },
    { value: "quaterly", label: "Quarterly", popular: false },
    { value: "monthly", label: "Monthly", popular: false }
];

// Testimonials data for the carousel
const testimonials = [
    {
        name: "Rajeev Pandey EDP (IT)",
        company: "Baidyanath",
        photo: "/customers/rajeev-pandey.jpg",
        review: "mSELL truly knows what they are doing. They helped our biggest problem of expiry on Distributor end through Their DMS. Thank you mSELL.",
        rating: 5,
    },
    {
        name: "RD Mishra (CIO)",
        company: "Om Sweets & Snacks",
        photo: "/customers/rd-mishra.jpg",
        review: "From sweets outlets to FMCG products the leap was tough, thanks to mSELL and their SFA solution to bring out the full potential of our sales force.",
        rating: 5,
    },
    {
        name: "Piyush Pant",
        company: "Neha Herbal",
        photo: "/customers/piyush-pant.jpg",
        review: "I knew we had a salesforce efficiency problem and needed it to be resolved ASAP. Thanks to mSELL for the rescue. Keep going mSELL.",
        rating: 5,
    },
];

// Stats data for the showcase
const statsData = [
    { label: "Happy Customers", value: 250, suffix: "+", color: "from-blue-500 to-blue-600", bgColor: "from-blue-50 to-blue-100", darkBgColor: "from-blue-900/20 to-blue-800/20" },
    { label: "Years Experience", value: 15, suffix: "+", color: "from-orange-500 to-orange-600", bgColor: "from-orange-50 to-orange-100", darkBgColor: "from-orange-900/20 to-orange-800/20" },
    { label: "Success Rate", value: 99.9, suffix: "%", color: "from-green-500 to-green-600", bgColor: "from-green-50 to-green-100", darkBgColor: "from-orange-900/20 to-orange-800/20" },
    { label: "Support Availability", value: 24, suffix: "x7", color: "from-pink-500 to-pink-600", bgColor: "from-pink-50 to-pink-100", darkBgColor: "from-blue-900/20 to-blue-800/20" }
];

// Company logos data
const companyLogos = [
    "baidyanath_logo.png", "haldirams_logo.png", "havmor_logo.png", "dsgroup_logo.png",
    "gcfoods_logo.png", "mantra_logo.png", "Bambino_Logo.png", "Cloud9beverages_logo.png",
    "HBL_logo.png", "aeris_logo.png", "aipl_logo.png", "babaji_logo.png",
    "btw_logo.png", "delhitourism_logo.png", "elco_logo.png", "finegrow_logo.png",
    "flemingofood_logo.png", "gudnini_logo.png", "hindkush_logo.png", "hitkari_logo.png",
    "inforcare_logo.png", "kbz_logo.png", "laborate_logo.png", "mahesh_namkeen_logo.png"
];

// Counter animation hook
const useCounter = (end: number, duration: number = 2000, startAnimation: boolean = false) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!startAnimation) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(end * easeOutQuart));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [end, duration, startAnimation]);

    return count;
};

// Simple counter component for stats display
const SimpleStatCounter = ({ stat }: { stat: typeof statsData[0] }) => {
    const [isVisible, setIsVisible] = useState(false);
    const count = useCounter(stat.value, 2000, isVisible);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <>
            {count}{stat.suffix}
        </>
    );
};

// Counter component for individual stats
const StatCounter = ({ stat, index }: { stat: typeof statsData[0], index: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    const count = useCounter(stat.value, 2000, isVisible);

    return (
        <motion.div
            className={`bg-gradient-to-br ${stat.bgColor} dark:${stat.darkBgColor} rounded-2xl p-6 shadow-lg relative overflow-hidden group cursor-pointer border border-gray-200/50 dark:border-slate-600/50 text-center`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                    delay: index * 0.1,
                    duration: 0.5,
                    onComplete: () => setIsVisible(true)
                }
            }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, y: -2 }}
        >
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

            <div className="relative z-10">
                <div className={`text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {count}{stat.suffix}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                </div>
            </div>

            {/* Hover effect */}
            <motion.div
                className="absolute inset-0 border-2 border-transparent group-hover:border-orange-200 dark:group-hover:border-orange-700 rounded-2xl transition-colors duration-300"
                initial={false}
            />

            {/* Professional pulse effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 rounded-2xl`}
                    animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
        </motion.div>
    );
};

export function DemoRequestForm() {
    const [currentStep, setCurrentStep] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormStep');
            // Always check if we have corresponding form data when we have a saved step
            if (saved) {
                const step = parseInt(saved);
                const hasFormData = localStorage.getItem('demoFormData');
                const hasCustomPlanData = localStorage.getItem('demoFormCustomPlan');
                const hasPlanData = localStorage.getItem('demoFormPlan');

                // If we have a step > 1 but no supporting data, reset to step 1
                if (step > 1 && !hasFormData && !hasCustomPlanData && !hasPlanData) {
                    localStorage.removeItem('demoFormStep');
                    return 1;
                }

                return step >= 1 && step <= 3 ? step : 1;
            }
        }
        return 1;
    });
    // Direction-aware animations: 1 forward, -1 backward
    const [direction, setDirection] = useState<1 | -1>(1);
    // Navigation lock during transitions to prevent stuck states
    const [navLock, setNavLock] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [showCompanyCodeGuide, setShowCompanyCodeGuide] = useState(false);
    const [showCompanyNameGuide, setShowCompanyNameGuide] = useState(false);
    const [isCompanyCodeFocused, setIsCompanyCodeFocused] = useState(false);
    const [isCompanyNameFocused, setIsCompanyNameFocused] = useState(false);

    // Custom Plan Flow States - Simplified
    const [isCustomPlanView, setIsCustomPlanView] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormCustomPlan');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.isCustomPlanView || false;
                } catch {
                    return false;
                }
            }
        }
        return false;
    });

    // Custom plan state variables
    const [customPlanDescription, setCustomPlanDescription] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormCustomPlan');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.customPlanDescription || '';
                } catch {
                    return '';
                }
            }
        }
        return '';
    });

    const [selectedServices, setSelectedServices] = useState<Array<{ id: number, name?: string, category?: string, generic_name: string, external_price_per_user: string | number, application_type?: string }>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormCustomPlan');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.selectedServices || [];
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    const [customPlanPricing, setCustomPlanPricing] = useState({
        monthly: 500,
        quarterly: 475,
        halfYearly: 450,
        yearly: 400
    });

    // Additional custom plan states
    const [showCustomPlan, setShowCustomPlan] = useState(true);
    const [customPlanMessage, setCustomPlanMessage] = useState('');

    // Services data state
    const [availableServices, setAvailableServices] = useState<Array<{ id: number, name?: string, category?: string, generic_name: string, external_price_per_user: string | number, application_type?: string }>>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [servicesError, setServicesError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormData');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return {
                        // user_name: parsed.user_name || "",
                        // password: parsed.password || "",
                        email: parsed.email || "",
                        mobile: parsed.mobile || "",
                        otp: parsed.otp || "",
                        company_name: parsed.company_name || "",
                        company_title: parsed.company_title || "",
                        website: parsed.website || "",
                        address: parsed.address || "",
                        // no_employees: parsed.no_employees || 0,
                        contact_per_name: parsed.contact_per_name || "",
                        application_type: parsed.application_type || 0
                    };
                } catch {
                    return {
                        // user_name: "",
                        // password: "",
                        email: "",
                        mobile: "",
                        otp: "",
                        company_name: "",
                        company_title: "",
                        website: "",
                        address: "",
                        // no_employees: 0,
                        contact_per_name: "",
                        application_type: 0
                    };
                }
            }
        }
        return {
            // user_name: "",
            // password: "",
            email: "",
            mobile: "",
            otp: "",
            company_name: "",
            company_title: "",
            website: "",
            address: "",
            // no_employees: 0,
            contact_per_name: "",
            application_type: 0
        };
    });

    const [selectedPlan, setSelectedPlan] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('demoFormPlan') || null;
        }
        return null;
    });

    // New state variables for dynamic plan loading
    const [plans, setPlans] = useState<{ [key: string]: Plan }>({});
    const [plansLoading, setPlansLoading] = useState(false);
    const [plansError, setPlansError] = useState<string | null>(null);
    const [selectedTenure, setSelectedTenure] = useState("yearly");
    const [isTenureDropdownOpen, setIsTenureDropdownOpen] = useState(false);

    // Dynamic pricing navigation state
    const [showDynamicPricing, setShowDynamicPricing] = useState(false);
    const [selectedPlanForPricing, setSelectedPlanForPricing] = useState<number | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormCustomPlan');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.selectedPlanForPricing || null;
                } catch {
                    return null;
                }
            }
        }
        return null;
    });

    const [isFromCustomPlan, setIsFromCustomPlan] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormCustomPlan');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.isFromCustomPlan || false;
                } catch {
                    return false;
                }
            }
        }
        return false;
    });

    const [customPlanData, setCustomPlanData] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormCustomPlan');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.customPlanData || null;
                } catch {
                    return null;
                }
            }
        }
        return null;
    });

    // Track if component has been initialized to avoid clearing OTP on initial load
    const [isInitialized, setIsInitialized] = useState(false);

    // Track if we're currently resetting due to localStorage being cleared
    const [isResettingFromClearedStorage, setIsResettingFromClearedStorage] = useState(false);

    // OTP related states
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(() => {
        // Check localStorage for OTP verification status
        if (typeof window !== 'undefined') {
            return localStorage.getItem('mobile_otp_verified') === 'true';
        }
        return false;
    });
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [otpVerificationMessage, setOtpVerificationMessage] = useState('');
    const otpCountdownRef = useRef<NodeJS.Timeout | null>(null);

    // Store the last verified mobile number to track changes
    const [lastVerifiedMobile, setLastVerifiedMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('verified_mobile_number') || '';
        }
        return '';
    });

    // Monitor mobile number changes and clear verification if mobile changes
    useEffect(() => {
        if (formData.mobile && lastVerifiedMobile && formData.mobile !== lastVerifiedMobile) {
            console.log('[Mobile Change] Mobile number changed, clearing verification status');
            setIsOtpVerified(false);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('mobile_otp_verified');
                localStorage.removeItem('verified_mobile_number');
            }
            setLastVerifiedMobile('');
        }
    }, [formData.mobile, lastVerifiedMobile]);

    // Set initialized flag after first render to prevent clearing OTP on initial load
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    // Check localStorage consistency and reset custom plan states if localStorage is cleared
    useEffect(() => {
        const checkLocalStorageConsistency = () => {
            if (typeof window !== 'undefined') {
                const hasFormData = localStorage.getItem('demoFormData');
                const hasCustomPlanData = localStorage.getItem('demoFormCustomPlan');
                const hasFormStep = localStorage.getItem('demoFormStep');
                const hasPlanData = localStorage.getItem('demoFormPlan');

                // If localStorage was manually cleared or doesn't exist, reset all states
                if (!hasFormData && !hasCustomPlanData && !hasFormStep && !hasPlanData) {
                    // Check if component state suggests we should have localStorage data
                    const shouldHaveData = currentStep > 1 ||
                        isCustomPlanView ||
                        selectedServices.length > 0 ||
                        customPlanData ||
                        selectedPlan ||
                        formData.email ||
                        formData.mobile ||
                        formData.company_name ||
                        formData.application_type > 0;

                    if (shouldHaveData) {
                        console.log('[LocalStorage Check] Detected cleared localStorage, resetting all states');
                        setIsResettingFromClearedStorage(true);

                        // Reset all form states
                        setCurrentStep(1);
                        setIsCustomPlanView(false);
                        setSelectedServices([]);
                        setCustomPlanDescription('');
                        setCustomPlanData(null);
                        setIsFromCustomPlan(false);
                        setSelectedPlanForPricing(null);
                        setShowDynamicPricing(false);
                        handlePlanSelection(null);

                        // Reset form data
                        setFormData({
                            email: "",
                            mobile: "",
                            otp: "",
                            company_name: "",
                            company_title: "",
                            website: "",
                            address: "",
                            contact_per_name: "",
                            application_type: 0
                        });

                        // Reset errors
                        setErrors({});

                        // Reset URL to step 1
                        if (typeof window !== 'undefined') {
                            const currentUrl = new URL(window.location.href);
                            currentUrl.searchParams.set('step', '1');
                            currentUrl.searchParams.delete('view');
                            currentUrl.searchParams.delete('plan');
                            window.history.replaceState({ step: 1 }, '', currentUrl.toString());
                        }

                        // Reset the flag after a brief delay to allow state updates to complete
                        setTimeout(() => {
                            setIsResettingFromClearedStorage(false);
                        }, 200);
                    }
                }
            }
        };

        // Check on mount
        checkLocalStorageConsistency();

        // Check when window gains focus (user might have cleared localStorage in dev tools)
        const handleFocus = () => {
            setTimeout(checkLocalStorageConsistency, 100);
        };

        window.addEventListener('focus', handleFocus);

        // Periodic check every 2 seconds
        const interval = setInterval(checkLocalStorageConsistency, 2000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, [currentStep, isCustomPlanView, selectedServices, customPlanData, selectedPlan, formData.email, formData.mobile, formData.company_name, formData.application_type]); // Add dependencies to check when these change

    // Browser history management for form steps
    useEffect(() => {
        // Initialize browser history state on component mount
        if (typeof window !== 'undefined') {
            const currentUrl = new URL(window.location.href);
            const urlStep = currentUrl.searchParams.get('step');
            const urlView = currentUrl.searchParams.get('view');
            const urlPlan = currentUrl.searchParams.get('plan');

            // Handle URL parameters on initial load
            if (urlStep) {
                const stepNum = parseInt(urlStep);
                if (stepNum >= 1 && stepNum <= 2) {
                    if (urlView === 'pricing' && urlPlan) {
                        // Initialize pricing view
                        setSelectedPlanForPricing(parseInt(urlPlan));
                        setShowDynamicPricing(true);
                        if (stepNum !== currentStep) {
                            setCurrentStep(stepNum);
                        }
                    } else if (urlView === 'custom') {
                        // Initialize custom plan view
                        setIsCustomPlanView(true);
                        setShowDynamicPricing(false);
                        if (stepNum !== currentStep) {
                            setCurrentStep(stepNum);
                        }
                    } else if (stepNum !== currentStep) {
                        // Initialize regular form step
                        setCurrentStep(stepNum);
                    }
                }
            } else {
                // If URL doesn't have step parameter, add it
                currentUrl.searchParams.set('step', currentStep.toString());
                window.history.replaceState({ step: currentStep }, '', currentUrl.toString());
            }
        }
    }, []);

    // Update URL when step changes
    useEffect(() => {
        // Don't update URL during reset process
        if (isResettingFromClearedStorage) {
            return;
        }

        if (typeof window !== 'undefined' && currentStep) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('step', currentStep.toString());

            // Use pushState for navigation (not replaceState) to create browser history
            window.history.pushState({ step: currentStep }, '', currentUrl.toString());
        }
    }, [currentStep, isResettingFromClearedStorage]);

    // Listen for browser back/forward button clicks
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state && typeof event.state.step === 'number') {
                const targetStep = event.state.step;

                // Prevent navigation lock issues
                if (navLock) return;

                // Handle pricing view navigation
                if (event.state.view === 'pricing' && event.state.planId) {
                    setSelectedPlanForPricing(event.state.planId);
                    setShowDynamicPricing(true);
                    setIsCustomPlanView(false);
                    setCurrentStep(targetStep);
                } else if (event.state.view === 'custom') {
                    // Handle custom plan view navigation
                    setIsCustomPlanView(true);
                    setShowDynamicPricing(false);
                    setSelectedPlanForPricing(null);
                    setCurrentStep(targetStep);
                } else if (event.state.isCustomPlan && event.state.previousStep) {
                    // Handle back navigation from custom plan pricing
                    // When going back from custom plan pricing, go to the previous step that was stored
                    const previousStep = event.state.previousStep;
                    const previousView = event.state.previousView;

                    setShowDynamicPricing(false);
                    setSelectedPlanForPricing(null);

                    if (previousView === 'custom') {
                        // Return to custom plan view
                        setIsCustomPlanView(true);
                        setCurrentStep(previousStep);

                        // Update URL to show custom plan view
                        if (typeof window !== 'undefined') {
                            const currentUrl = new URL(window.location.href);
                            currentUrl.searchParams.set('step', previousStep.toString());
                            currentUrl.searchParams.set('view', 'custom');
                            currentUrl.searchParams.delete('plan');
                            currentUrl.searchParams.delete('fromCustom');
                            window.history.replaceState({ step: previousStep, view: 'custom' }, '', currentUrl.toString());
                        }
                    } else {
                        // Return to regular step view
                        setIsCustomPlanView(false);

                        // Set direction and navigate to the previous step
                        const newDirection = previousStep > currentStep ? 1 : -1;
                        setDirection(newDirection);
                        setCurrentStep(previousStep);
                    }
                } else {
                    // Regular form navigation
                    setShowDynamicPricing(false);
                    setSelectedPlanForPricing(null);
                    setIsCustomPlanView(false);

                    // Determine direction based on step comparison
                    const newDirection = targetStep > currentStep ? 1 : -1;
                    setDirection(newDirection);

                    // Update step without creating new history entry
                    setCurrentStep(targetStep);
                }

                saveToLocalStorage();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // If no step in state, try to get from URL
                const urlParams = new URLSearchParams(window.location.search);
                const urlStep = urlParams.get('step');
                const urlView = urlParams.get('view');
                const urlPlan = urlParams.get('plan');
                const fromCustom = urlParams.get('fromCustom');

                if (urlStep) {
                    const stepNum = parseInt(urlStep);
                    if (stepNum >= 1 && stepNum <= 3) {
                        if (urlView === 'pricing' && urlPlan) {
                            setSelectedPlanForPricing(parseInt(urlPlan));
                            setShowDynamicPricing(true);
                            setIsCustomPlanView(false);
                            setCurrentStep(stepNum);
                        } else if (urlView === 'custom') {
                            setIsCustomPlanView(true);
                            setShowDynamicPricing(false);
                            setSelectedPlanForPricing(null);
                            setCurrentStep(stepNum);
                        } else if (fromCustom === 'true' && urlPlan === '999') {
                            // Handle custom plan pricing URL
                            setSelectedPlanForPricing(999);
                            setShowDynamicPricing(true);
                            setIsCustomPlanView(false);
                            setIsFromCustomPlan(true);
                            setCurrentStep(stepNum);
                        } else {
                            setShowDynamicPricing(false);
                            setSelectedPlanForPricing(null);
                            setIsCustomPlanView(false);
                            const newDirection = stepNum > currentStep ? 1 : -1;
                            setDirection(newDirection);
                            setCurrentStep(stepNum);
                        }
                        saveToLocalStorage();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [currentStep, navLock]);

    // API function to fetch plans
    const fetchPlans = async (applicationType: number) => {
        setPlansLoading(true);
        setPlansError(null);

        try {
            const requestBody = {
                application_type: applicationType.toString()
            };

            const response = await fetch('/api/get-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.response && data.data && Object.keys(data.data).length > 0) {
                setPlans(data.data);
                setPlansError(null);
            } else {
                // No plans available for this application type
                setPlans({});
                setPlansError("No plans available for the selected application type");
            }
        } catch (error) {
            // Use fallback data when API fails
            const fallbackPlans: { [key: string]: Plan } = {};
            Object.keys(fallbackPricingData).forEach(key => {
                if (parseInt(key) === applicationType) {
                    fallbackPlans[key] = fallbackPricingData[parseInt(key)];
                }
            });
            setPlans(fallbackPlans);
            setPlansError("Using offline data - API unavailable");
        } finally {
            setPlansLoading(false);
        }
    };

    // API function to fetch services
    const fetchServices = async (applicationType: string) => {
        setServicesLoading(true);
        setServicesError(null);

        console.log('[Fetch Services] Starting for application type:', applicationType);

        try {
            const requestBody = {
                application_type: applicationType
            };

            console.log('[Fetch Services] Request body:', requestBody);

            const response = await fetch('/api/get-services-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('[Fetch Services] Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[Fetch Services] Response data:', data);

            if (data.response && data.data && Array.isArray(data.data) && data.data.length > 0) {
                console.log('[Fetch Services] Services found:', data.data.length);
                setAvailableServices(data.data);
                setServicesError(null);
                setShowCustomPlan(true);
                setCustomPlanMessage("");
            } else {
                console.log('[Fetch Services] No services available from API');
                // No services available from API
                setAvailableServices([]);
                setShowCustomPlan(false);
                setCustomPlanMessage("No services available");
                setServicesError("No services found for this application type");
            }
        } catch (error) {
            // No fallback data - just show error state
            console.error('[Fetch Services] Error:', error);
            setAvailableServices([]);
            setShowCustomPlan(false);
            setCustomPlanMessage("Services unavailable");
            setServicesError("Failed to load services. Please try again later.");
        } finally {
            setServicesLoading(false);
            console.log('[Fetch Services] Completed');
        }
    };

    // Call fetchServices when component mounts - only if application type is already selected
    useEffect(() => {
        if (formData.application_type > 0) {
            fetchServices(formData.application_type.toString());
        }
    }, []);

    // Auto-save custom plan data to localStorage when it changes
    useEffect(() => {
        // Don't save during reset process
        if (isResettingFromClearedStorage) {
            return;
        }

        // Only auto-save if localStorage has valid data or if we have actual form data
        // This prevents re-saving when localStorage has been manually cleared
        if (typeof window !== 'undefined') {
            const hasFormData = localStorage.getItem('demoFormData');
            const hasFormStep = localStorage.getItem('demoFormStep');

            // Don't auto-save if localStorage was manually cleared and we're in a reset state
            if (!hasFormData && !hasFormStep && currentStep === 1 && !isCustomPlanView && selectedServices.length === 0) {
                return;
            }
        }

        saveToLocalStorage();
    }, [isCustomPlanView, selectedServices, customPlanDescription, customPlanData, isFromCustomPlan, selectedPlanForPricing, currentStep, isResettingFromClearedStorage]);

    // Function to transform API data to pricing card format - Updated to show yearly pricing
    const getCurrentPricingData = () => {
        if (Object.keys(plans).length === 0) {
            return null;
        }

        const planKeys = Object.keys(plans);
        const planArray = planKeys.map(key => plans[key]);

        // Always show yearly pricing using base_price_per_external_user_per_month from yearly plan
        const tiers: PricingTier[] = planArray.map((plan, index) => {
            // Find the yearly plan detail to get the yearly monthly price
            const yearlyDetail = plan.plan_details.find(detail => detail.duration === "yearly");

            if (!yearlyDetail) {
                // Fallback to first available plan detail if yearly not found
                const fallbackDetail = plan.plan_details[0];
                const monthlyPrice = fallbackDetail.base_price_per_external_user_per_month || parseFloat(fallbackDetail.base_price_per_user_external || fallbackDetail.base_price_per_user || "0");
                return {
                    name: plan.plan_name,
                    price: `₹${monthlyPrice.toFixed(2)}`,
                    period: "/month",
                    features: plan.features_list,
                    popular: index === 1, // Make the second plan popular (Gold)
                    minUsers: fallbackDetail.min_users,
                    maxUsers: fallbackDetail.max_users,
                    trialDays: fallbackDetail.trial_days
                };
            }

            // Use base_price_per_external_user_per_month from yearly plan for display
            const monthlyPrice = yearlyDetail.base_price_per_external_user_per_month || parseFloat(yearlyDetail.base_price_per_user_external || yearlyDetail.base_price_per_user || "0");

            return {
                name: plan.plan_name,
                price: `₹${monthlyPrice.toFixed(2)}`,
                period: "/month",
                features: plan.features_list,
                popular: index === 1, // Make the second plan popular (Gold)
                minUsers: yearlyDetail.min_users,
                maxUsers: yearlyDetail.max_users,
                trialDays: yearlyDetail.trial_days
            };
        });

        return {
            title: `${applicationTypes.find(type => type.value === formData.application_type)?.label || 'Solutions'} - Plans`,
            tiers
        };
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [hasSelectedBefore, setHasSelectedBefore] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('demoFormHasSelected') === 'true';
        }
        return false;
    });

    // Alert system state
    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        type: 'success' | 'error' | 'warning';
        title: string;
        message: string;
    }>({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    // API submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{
        success: boolean;
        message: string;
        showResultPage: boolean;
    }>({
        success: false,
        message: '',
        showResultPage: false
    });




    // Function to close result page
    const closeResultPage = () => {
        setSubmissionResult({ success: false, message: '', showResultPage: false });

        // If this was a successful submission, ensure we're on step 1
        if (submissionResult.success) {
            setCurrentStep(1);
            if (typeof window !== 'undefined') {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('step', '1');
                currentUrl.searchParams.delete('view');
                currentUrl.searchParams.delete('plan');
                currentUrl.searchParams.delete('fromCustom');
                window.history.replaceState({ step: 1 }, '', currentUrl.toString());
            }
        }
    };

    // OTP functions
    const sendOtp = async () => {
        if (!formData.mobile || formData.mobile.length < 10) {

            showAlert('error', 'Invalid Mobile Number', 'Please enter a valid 10-digit mobile number');
            return;
        }

        const cleanMobile = formData.mobile.replace(/\D/g, '');
        const isResendOperation = isOtpSent;


        setOtpLoading(true);
        try {
            const requestPayload = {
                mobile: cleanMobile,
                request_type: "SENT"
            };


            const response = await fetch('/api/otp-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });

            console.log('[OTP Send] Raw response status:', response.status);
            console.log('[OTP Send] Raw response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('[OTP Send] Complete response data:', JSON.stringify(data, null, 2));


            // Handle cases where HTTP status is not OK but response contains error details
            if (!response.ok && data && (data.message || data.error)) {
                console.log('[OTP Send] HTTP error with message:', data.message || data.error);
                const errorMessage = data.message || data.error || data.msg || 'Failed to send OTP. Please try again.';
                showAlert('error', 'OTP Send Failed', errorMessage);
                return;
            }

            if (data.success === true || data.response === true) {
                const isResend = isOtpSent; // Check if this is a resend operation
                console.log('[OTP Send] Success - OTP', isResend ? 'resent' : 'sent', 'successfully');

                setIsOtpSent(true);
                setCanResendOtp(false);
                setOtpCountdown(30);
                setOtpSentMessage(isResend ? 'OTP resent successfully to your mobile number' : 'OTP sent successfully to your mobile number');
                setOtpVerificationMessage(''); // Clear any previous verification message

                console.log('[OTP Send] State updated - isOtpSent: true, countdown: 30, canResendOtp: false');

                // Start countdown timer
                if (otpCountdownRef.current) clearInterval(otpCountdownRef.current);
                otpCountdownRef.current = setInterval(() => {
                    setOtpCountdown(prev => {
                        if (prev <= 1) {
                            console.log('[OTP Send] Countdown completed - enabling resend');
                            setCanResendOtp(true);
                            if (otpCountdownRef.current) clearInterval(otpCountdownRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                // No modal alert for success - using inline message instead
            } else {
                console.log('[OTP Send] Failed - Server response indicates failure:', data.message);
                // Improved error message handling - check multiple possible message fields
                const errorMessage = data.message || data.error || data.msg ||
                    (data.success === false ? 'Failed to send OTP. Please try again.' : 'Failed to send OTP. Please try again.');
                showAlert('error', 'OTP Send Failed', errorMessage);
            }
        } catch (error) {
            console.error('[OTP Send] Network error:', error);
            // Check if the error has response data with a message
            if (error instanceof Error && error.message.includes('Failed to fetch')) {
                showAlert('error', 'Network Error', 'Failed to send OTP. Please check your connection and try again.');
            } else {
                showAlert('error', 'Network Error', 'Failed to send OTP. Please check your connection and try again.');
            }
        } finally {
            setOtpLoading(false);
            console.log('[OTP Send] Process completed - otpLoading set to false');
        }
    };

    const validateOtp = async () => {
        if (!formData.otp || formData.otp.length < 4) {
            console.log('[OTP Validation] Validation failed - Invalid OTP length:', formData.otp?.length || 0);
            showAlert('error', 'Invalid OTP', 'Please enter the OTP sent to your mobile number');
            return;
        }

        const cleanMobile = formData.mobile.replace(/\D/g, '');
        console.log('[OTP Validation] Starting OTP validation for mobile:', cleanMobile, 'with OTP:', formData.otp);

        setOtpLoading(true);
        try {
            const requestPayload = {
                mobile: cleanMobile,
                request_type: "VALIDATE",
                otp: formData.otp
            };
            console.log('[OTP Validation] Request payload:', requestPayload);

            const response = await fetch('/api/otp-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });

            console.log('[OTP Validation] Raw response status:', response.status);
            console.log('[OTP Validation] Raw response ok:', response.ok);
            console.log('[OTP Validation] Raw response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('[OTP Validation] Complete response data:', JSON.stringify(data, null, 2));

            // Handle cases where HTTP status is not OK but response contains error details
            if (!response.ok && data && (data.message || data.error)) {
                console.log('[OTP Validation] HTTP error with message:', data.message || data.error);
                const errorMessage = data.message || data.error || data.msg || 'Invalid OTP. Please try again.';
                showAlert('error', 'OTP Validation Failed', errorMessage);
                setIsOtpVerified(false);
                console.log('[OTP Validation] State updated - isOtpVerified: false');
                return;
            }

            if (data.success === true || data.response === true) {
                console.log('[OTP Validation] Success - OTP validated successfully');
                setIsOtpVerified(true);

                // Store verification status and mobile number in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('mobile_otp_verified', 'true');
                    localStorage.setItem('verified_mobile_number', formData.mobile);
                    console.log('[OTP Validation] Verification status stored in localStorage');
                }

                // Update the last verified mobile state
                setLastVerifiedMobile(formData.mobile);

                setOtpVerificationMessage('Mobile number verified successfully');
                setOtpSentMessage(''); // Clear the sent message
                console.log('[OTP Validation] State updated - isOtpVerified: true');
                // No modal alert for success - using inline message instead
            } else {
                console.log('[OTP Validation] Failed - Server response indicates invalid OTP:', data.message);
                // Improved error message handling - check multiple possible message fields
                const errorMessage = data.message || data.error || data.msg ||
                    (data.success === false ? 'Invalid OTP. Please try again.' : 'Invalid OTP. Please try again.');
                showAlert('error', 'OTP Validation Failed', errorMessage);
                setIsOtpVerified(false);
                console.log('[OTP Validation] State updated - isOtpVerified: false');
            }
        } catch (error) {
            console.error('[OTP Validation] Network error:', error);
            // Check if the error has response data with a message
            if (error instanceof Error && error.message.includes('Failed to fetch')) {
                showAlert('error', 'Network Error', 'Failed to validate OTP. Please check your connection and try again.');
            } else {
                showAlert('error', 'Network Error', 'Failed to validate OTP. Please check your connection and try again.');
            }
            setIsOtpVerified(false);
            console.log('[OTP Validation] Error state - isOtpVerified: false');
        } finally {
            setOtpLoading(false);
            console.log('[OTP Validation] Process completed - otpLoading set to false');
        }
    };

    // Reset OTP states when mobile number changes (but not on initial load)
    useEffect(() => {
        if (isInitialized && formData.mobile) {
            // Only reset if the mobile number is different from the verified one
            if (lastVerifiedMobile && formData.mobile !== lastVerifiedMobile) {
                setIsOtpSent(false);
                setIsOtpVerified(false);
                setOtpSentMessage('');
                setOtpVerificationMessage('');
                setFormData(prev => ({ ...prev, otp: '' }));
                if (otpCountdownRef.current) {
                    clearInterval(otpCountdownRef.current);
                    setOtpCountdown(0);
                    setCanResendOtp(false);
                }
            }
        }
    }, [formData.mobile, isInitialized, lastVerifiedMobile]);

    // Cleanup countdown on unmount
    useEffect(() => {
        return () => {
            if (otpCountdownRef.current) {
                clearInterval(otpCountdownRef.current);
            }
        };
    }, []);

    // Debounced save handle
    const saveTimeoutRef = useRef<number | null>(null);

    // Modern alert function
    const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
        setAlertConfig({ show: true, type, title, message });
        // Auto-hide after 4 seconds for success/warning, keep error alerts open
        if (type !== 'error') {
            setTimeout(() => {
                setAlertConfig(prev => ({ ...prev, show: false }));
            }, 4000);
        }
    };

    // Save to localStorage function (guarded)
    const saveToLocalStorage = () => {
        if (typeof window !== 'undefined') {
            // Check if localStorage was manually cleared by checking for the absence of any demo form keys
            const hasAnyDemoFormData = localStorage.getItem('demoFormData') ||
                localStorage.getItem('demoFormStep') ||
                localStorage.getItem('demoFormPlan') ||
                localStorage.getItem('demoFormCustomPlan');

            // If form is effectively empty and on first step with no plan, don't persist
            const isEmptyForm =
                // !formData.user_name &&
                // !formData.password &&
                !formData.email &&
                !formData.mobile &&
                !formData.company_name &&
                !formData.company_title &&
                !formData.website &&
                !formData.address &&
                // formData.no_employees === 0 &&
                !formData.contact_per_name &&
                formData.application_type === 0 &&
                !selectedPlan &&
                currentStep === 1 &&
                !isCustomPlanView &&
                selectedServices.length === 0;

            // If localStorage was manually cleared and form is in reset state, don't save anything
            if (!hasAnyDemoFormData && isEmptyForm) {
                console.log('[SaveToLocalStorage] Detected cleared localStorage with empty form, skipping save');
                return;
            }

            // If form is empty (regardless of localStorage state), clear everything
            if (isEmptyForm) {
                localStorage.removeItem('demoFormData');
                localStorage.removeItem('demoFormStep');
                localStorage.removeItem('demoFormPlan');
                localStorage.removeItem('demoFormCustomPlan');
                return;
            }

            localStorage.setItem('demoFormData', JSON.stringify(formData));
            localStorage.setItem('demoFormStep', currentStep.toString());

            if (selectedPlan) {
                localStorage.setItem('demoFormPlan', selectedPlan);
            } else {
                localStorage.removeItem('demoFormPlan');
            }

            // Save custom plan data
            const customPlanState = {
                isCustomPlanView,
                selectedServices,
                customPlanDescription,
                customPlanData,
                isFromCustomPlan,
                selectedPlanForPricing
            };
            localStorage.setItem('demoFormCustomPlan', JSON.stringify(customPlanState));
        }
    };

    // Handle plan selection with localStorage
    const handlePlanSelection = (planName: string | null) => {
        // Trigger celebration only on first selection
        if (planName && !hasSelectedBefore) {
            setShowCelebration(true);
            setHasSelectedBefore(true);
            localStorage.setItem('demoFormHasSelected', 'true');
            setTimeout(() => setShowCelebration(false), 2500);
        }

        setSelectedPlan(planName);
        // Only persist when a plan is actually selected; avoid re-creating cleared keys
        if (planName) {
            if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = window.setTimeout(saveToLocalStorage, 100);
        }

        // Auto-scroll to pricing section on selection for large portraits
        if (planName) {
            setTimeout(() => {
                const pricingSection = document.querySelector('[data-pricing-section]');
                if (pricingSection) {
                    const rect = pricingSection.getBoundingClientRect();
                    const isLargePortrait = window.innerHeight > window.innerWidth && window.innerHeight > 800;

                    if (isLargePortrait) {
                        // Scroll to show caption and cards without needing additional scroll
                        window.scrollTo({
                            top: window.pageYOffset + rect.top - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 150); // Small delay to allow for card animation
        }
    };

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [currentStep]);



    // Testimonial carousel state
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const nextTestimonial = () => setTestimonialIndex((i) => (i + 1) % testimonials.length);
    const prevTestimonial = () => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

    // Auto-slide effect for testimonials
    useEffect(() => {
        const timer = setTimeout(() => {
            nextTestimonial();
        }, 5000);
        return () => clearTimeout(timer);
    }, [testimonialIndex]);

    // Fetch plans when application type changes
    useEffect(() => {
        if (formData.application_type > 0) {
            fetchPlans(formData.application_type);
            fetchServices(formData.application_type.toString());
        } else {
            setPlans({});
            setPlansError(null);
            setAvailableServices([]);
            setShowCustomPlan(false);
            setCustomPlanMessage('');
        }
    }, [formData.application_type]);

    // Note: remove any test-only localStorage clearing on mount

    const handleInputChange = (field: keyof FormData, value: string | number) => {
        const prevApplicationType = formData.application_type;
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }

        // Reset selected plan when application type changes
        if (field === 'application_type') {
            handlePlanSelection(null);
            setIsDropdownOpen(false); // Close dropdown after selection

            // Auto-scroll to pricing section when application type is first selected
            if (prevApplicationType === 0 && typeof value === 'number' && value > 0) {
                setTimeout(() => {
                    // Find the step 3 container with the icon and solution selector
                    const step3Container = document.querySelector('[data-step3-container]');

                    if (step3Container) {
                        const rect = step3Container.getBoundingClientRect();
                        const isLargePortrait = window.innerHeight > window.innerWidth && window.innerHeight > 800;
                        const isMobile = window.innerWidth < 768;

                        // Calculate optimal scroll position to show icon, title, and cards
                        let offsetTop = 60; // Default offset

                        if (isLargePortrait) {
                            offsetTop = 40; // Less offset for large portraits to show more content
                        } else if (isMobile) {
                            offsetTop = 80; // More offset for mobile for better spacing
                        }

                        window.scrollTo({
                            top: window.pageYOffset + rect.top - offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }, 300); // Wait for dropdown animation and pricing cards to appear
            }
        }

        // Save to localStorage after state update (debounced)
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = window.setTimeout(saveToLocalStorage, 120);
    };

    const validateStep1 = (): boolean => {
        const newErrors: any = {};

        // Company Code validation with enhanced restrictions
        if (!formData.company_name?.trim()) newErrors.company_name = "Company Code is required";
        else if (formData.company_name.includes(' ')) newErrors.company_name = "Company Code cannot contain spaces";
        else if (/[@#$%^&*()+=\[\]{}|\\:";'<>?,./]/.test(formData.company_name)) {
            newErrors.company_name = "Company Code cannot contain special characters like @, #, $, etc.";
        }

        if (!formData.company_title?.trim()) newErrors.company_title = "Company Name is required";

        if (!formData.website) newErrors.website = "Website is required";
        else if (!/^https?:\/\//.test(formData.website) && !/^www\./.test(formData.website)) {
            newErrors.website = "Website must start with http://, https://, or www.";
        }

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.mobile) newErrors.mobile = "Mobile number is required";
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be 10 digits";

        if (!formData.contact_per_name?.trim()) newErrors.contact_per_name = "Contact person name is required";
        if (!formData.address?.trim()) newErrors.address = "Address is required";

        // Always set the field errors first so they show up
        setErrors(newErrors);

        // Check if there are basic field validation errors
        if (Object.keys(newErrors).length > 0) {
            return false;
        }

        // Now check OTP verification only if basic fields are valid
        // TODO: Temporarily commented out OTP verification requirement - will uncomment later
        /*
        if (!isOtpVerified) {
            if (formData.mobile && formData.mobile.length === 10) {
                showAlert('warning', 'Mobile Verification Required', 'Please verify your mobile number with OTP to continue');
            } else {
                showAlert('error', 'Mobile Number Required', 'Please enter a valid mobile number and verify it with OTP');
            }
            return false;
        }
        */

        return true;
    };

    // const validateStep2 = (): boolean => {
    //     // This function is no longer needed as step 2 has been merged with step 1
    //     return true;
    // };

    const handleNext = () => {
        if (navLock) return;
        if (currentStep === 1 && validateStep1()) {
            setDirection(1);
            setNavLock(true);
            setCurrentStep(2);
            saveToLocalStorage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setNavLock(false), 350);

            // Update URL
            if (typeof window !== 'undefined') {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('step', '2');
                window.history.pushState({ step: 2 }, '', currentUrl.toString());
            }
        } else if (currentStep === 2) {
            // Handle custom plan flow
            if (isCustomPlanView && customPlanData) {
                // User is in custom plan view and has already calculated pricing
                // Navigate to step 3 with custom plan data
                setDirection(1);
                setNavLock(true);
                setCurrentStep(3);
                setShowDynamicPricing(true);
                setSelectedPlanForPricing(999); // Custom plan ID
                setIsFromCustomPlan(true);
                saveToLocalStorage();

                // Scroll to pricing section after a delay to ensure component is rendered
                setTimeout(() => {
                    const pricingSection = document.querySelector('[data-pricing-section="true"]');
                    if (pricingSection) {
                        pricingSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    setNavLock(false);
                }, 500); // Increased delay to ensure DynamicPricing component is fully rendered

                // Update URL
                if (typeof window !== 'undefined') {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('step', '3');
                    currentUrl.searchParams.set('plan', '999');
                    currentUrl.searchParams.set('fromCustom', 'true');
                    currentUrl.searchParams.delete('view');
                    window.history.pushState({
                        step: 3,
                        planId: 999,
                        isCustomPlan: true,
                        fromCustomPlan: true,
                        previousStep: 2,
                        previousView: 'custom'
                    }, '', currentUrl.toString());
                }
            } else {
                // Regular flow - go to step 3 (pricing selection)
                setDirection(1);
                setNavLock(true);
                setCurrentStep(3);
                saveToLocalStorage();

                // For regular flow, scroll to top initially, but if DynamicPricing appears, scroll to it
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Check for pricing section after navigation animation
                setTimeout(() => {
                    const pricingSection = document.querySelector('[data-pricing-section="true"]');
                    if (pricingSection) {
                        pricingSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                    setNavLock(false);
                }, 500);

                // Update URL
                if (typeof window !== 'undefined') {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('step', '3');
                    window.history.pushState({ step: 3 }, '', currentUrl.toString());
                }
            }
        }
    };

    const handleBack = () => {
        if (navLock) return;
        if (currentStep > 1) {
            setDirection(-1);
            setNavLock(true);
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            saveToLocalStorage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setNavLock(false), 350);

            // Update URL
            if (typeof window !== 'undefined') {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('step', newStep.toString());
                window.history.pushState({ step: newStep }, '', currentUrl.toString());
            }
        }
    };

    const clearForm = () => {
        // Cancel any pending debounced saves to avoid re-creating keys
        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        // Set reset flag to prevent auto-save during clear
        setIsResettingFromClearedStorage(true);

        // Clear all localStorage items
        localStorage.removeItem('demoFormData');
        localStorage.removeItem('demoFormStep');
        localStorage.removeItem('demoFormPlan');
        localStorage.removeItem('demoFormCustomPlan');
        localStorage.removeItem('demoFormHasSelected');

        // Clear OTP verification status on form clear
        localStorage.removeItem('mobile_otp_verified');
        localStorage.removeItem('verified_mobile_number');
        console.log('[Form Clear] All localStorage data cleared');

        // Reset form data
        setFormData({
            email: "",
            mobile: "",
            otp: "",
            company_name: "",
            company_title: "",
            website: "",
            address: "",
            contact_per_name: "",
            application_type: 0
        });

        // Reset plan selection
        handlePlanSelection(null);

        // Reset step to 1
        setCurrentStep(1);
        setErrors({});

        // Reset custom plan state variables
        setIsCustomPlanView(false);
        setSelectedServices([]);
        setCustomPlanDescription('');
        setCustomPlanData(null);
        setIsFromCustomPlan(false);
        setSelectedPlanForPricing(null);
        setShowDynamicPricing(false);

        // Reset OTP verification states
        setIsOtpSent(false);
        setIsOtpVerified(false);
        setOtpLoading(false);
        setOtpCountdown(0);
        setCanResendOtp(false);
        setOtpSentMessage('');
        setOtpVerificationMessage('');
        setLastVerifiedMobile('');

        // Reset other form states
        setHasSelectedBefore(false);
        setPlans({});
        setPlansError(null);
        setAvailableServices([]);
        setServicesError(null);
        setSelectedTenure("yearly");

        // Reset URL to step 1 and remove all query parameters
        if (typeof window !== 'undefined') {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('step', '1');
            currentUrl.searchParams.delete('view');
            currentUrl.searchParams.delete('plan');
            currentUrl.searchParams.delete('fromCustom');
            window.history.replaceState({ step: 1 }, '', currentUrl.toString());
        }

        // Ensure nothing persists immediately after
        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        console.log('[Form Clear] All states reset to initial values');

        // Clear reset flag after state updates complete
        setTimeout(() => {
            setIsResettingFromClearedStorage(false);
        }, 300);
    };

    const handleSubmit = async () => {


        setIsSubmitting(true);

        try {
            // Get the selected plan details
            const currentPlans = getCurrentPricingData();
            if (!currentPlans) {
                throw new Error('No plans available');
            }

            const selectedPlanData = currentPlans.tiers.find(plan => plan.name === selectedPlan);

            if (!selectedPlanData) {
                throw new Error('Selected plan data not found');
            }

            // Find the correct plan based on selected plan name (Silver/Gold/Platinum)
            const planEntry = Object.entries(plans).find(([key, plan]) => {
                // Match plan name with selected plan (case-insensitive)
                return plan.plan_name.toLowerCase().includes(selectedPlan.toLowerCase()) ||
                    selectedPlan.toLowerCase().includes(plan.plan_name.toLowerCase());
            });

            if (!planEntry) {
                throw new Error(`Plan not found for selected plan: ${selectedPlan}`);
            }

            const [planKey, planData] = planEntry;

            // Find the specific plan detail for the selected tenure
            const planDetail = planData.plan_details.find(detail => detail.duration === selectedTenure);

            if (!planDetail) {
                throw new Error(`Plan detail not found for tenure: ${selectedTenure} in plan: ${planData.plan_name}`);
            }
            // Prepare the API request body with correct IDs from get-plan API response
            const requestBody = {
                company_name: formData.company_name,
                company_title: formData.company_title,
                // user_name: formData.user_name,
                // password: formData.password,
                website: formData.website,
                email: formData.email,
                state_code: null, // Default state code as per your example
                address: formData.address,
                contact_per_name: formData.contact_per_name,
                landline: "", // Not collected in form
                mobile: formData.mobile,
                otp: formData.otp, // Include OTP for verification
                application_type: formData.application_type,
                pricing_id: planDetail.id, // ID from plan_details array for selected tenure
                plan_id: planData.plan_id, // Plan ID (silver/gold/platinum from get-plan API)
                num_users: selectedPlanData.minUsers // Using minimum users from selected plan (direct selection without DynamicPricing)
            };

            // Debug logging for frontend
            // console.log('🔍 Frontend Debug - Selected Plan Mapping:');
            // console.log('Selected Plan Name:', selectedPlan);
            // console.log('Selected Tenure:', selectedTenure);
            // console.log('Found Plan Data:', planData.plan_name);
            // console.log('Plan ID (from get-plan API):', planData.plan_id);
            // console.log('Plan Detail ID (pricing_id):', planDetail.id);
            // console.log('Plan Detail Duration:', planDetail.duration);
            // console.log('Final Request Body:', requestBody);

            // Make the API call through our proxy
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            let responseData;
            const contentType = response.headers.get('content-type');

            try {
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json();
                } else {
                    // Handle non-JSON responses (HTML error pages, etc.)
                    const textResponse = await response.text();
                    throw new Error('Server returned invalid response format');
                }
            } catch (parseError) {
                throw new Error('Invalid response format from server');
            }

            // Check for success conditions - either response.response === true OR success keywords in message
            const isSuccessResponse = responseData.response === true ||
                (responseData.message && (
                    responseData.message.toLowerCase().includes('payment successful') ||
                    responseData.message.toLowerCase().includes('created') ||
                    responseData.message.toLowerCase().includes('success')
                ));

            if (response.ok && isSuccessResponse) {
                // Success
                // Use the actual success message from API and append hardcoded message
                const apiMessage = responseData.message &&
                    (responseData.message.toLowerCase().includes('payment successful') ||
                        responseData.message.toLowerCase().includes('created') ||
                        responseData.message.toLowerCase().includes('success'))
                    ? responseData.message
                    : 'Demo request submitted successfully!';

                const successMessage = apiMessage + '\n\nOur team will connect with you shortly and your credentials will be shared via email within 24 hours.';

                setSubmissionResult({
                    success: true,
                    message: successMessage,
                    showResultPage: true
                });

                // Clear form after successful submission
                clearForm();

                // Immediately update the URL to show step 1
                if (typeof window !== 'undefined') {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('step', '1');
                    currentUrl.searchParams.delete('view');
                    currentUrl.searchParams.delete('plan');
                    currentUrl.searchParams.delete('fromCustom');
                    window.history.replaceState({ step: 1 }, '', currentUrl.toString());
                }
            } else {
                // Failure
                const failureMessage = responseData.message || 'Failed to submit demo request. Please try again.';

                setSubmissionResult({
                    success: false,
                    message: failureMessage,
                    showResultPage: true
                });
            }
        } catch (error) {
            const networkErrorMessage = 'Network error occurred. Please check your connection and try again.';

            setSubmissionResult({
                success: false,
                message: networkErrorMessage,
                showResultPage: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Navigation functions for dynamic pricing flow
    const handleGoToPricing = (planName: string) => {
        // Find the plan ID from the plan name
        const planEntry = Object.entries(plans).find(([key, plan]) =>
            plan.plan_name.toLowerCase() === planName.toLowerCase()
        );

        if (planEntry) {
            const [, plan] = planEntry;
            setSelectedPlanForPricing(plan.plan_id);
            setShowDynamicPricing(true);

            // Update URL to show pricing view
            if (typeof window !== 'undefined') {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('step', '2');
                currentUrl.searchParams.set('view', 'pricing');
                currentUrl.searchParams.set('plan', plan.plan_id.toString());
                window.history.pushState({ step: 2, view: 'pricing', planId: plan.plan_id }, '', currentUrl.toString());
            }
        } else {
            console.error('Plan not found:', planName, 'Available plans:', Object.values(plans).map(p => p.plan_name));
        }
    };

    const handleBackToForm = () => {
        setShowDynamicPricing(false);
        setSelectedPlanForPricing(null);

        // Update URL to go back to step 2 form view
        if (typeof window !== 'undefined') {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('step', '2');
            currentUrl.searchParams.delete('view');
            currentUrl.searchParams.delete('plan');
            window.history.pushState({ step: 2 }, '', currentUrl.toString());
        }
    };

    const handleCompleteDemoFromPricing = async (planId: number, pricingId: number, numberOfUsers: number) => {
        // Update form data with selected plan and pricing details
        const updatedFormData = {
            ...formData,
            plan_id: planId,
            pricing_id: pricingId
        };

        // Submit to process-payment API
        setIsSubmitting(true);

        console.log('[Dynamic Pricing] Starting API call with data:', {
            planId,
            pricingId,
            numberOfUsers,
            formData: {
                company_name: formData.company_name,
                email: formData.email,
                mobile: formData.mobile,
                application_type: formData.application_type
            }
        });

        try {
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_name: formData.company_name,
                    company_title: formData.company_title,
                    website: formData.website,
                    email: formData.email,
                    state_code: null,
                    address: formData.address,
                    contact_per_name: formData.contact_per_name,
                    landline: "",
                    mobile: formData.mobile,
                    otp: formData.otp,
                    application_type: formData.application_type,
                    pricing_id: pricingId,
                    plan_id: planId,
                    num_users: numberOfUsers // Use the final number of users from DynamicPricing
                })
            });

            let responseData;
            const contentType = response.headers.get('content-type');

            try {
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json();
                } else {
                    // Handle non-JSON responses (HTML error pages, etc.)
                    const textResponse = await response.text();
                    console.error('[Dynamic Pricing] Non-JSON response:', textResponse);
                    throw new Error('Server returned invalid response format. Please try again later.');
                }
            } catch (parseError) {
                console.error('[Dynamic Pricing] JSON parse error:', parseError);
                throw new Error('Invalid response format from server. Please try again.');
            }

            console.log('[Dynamic Pricing] API Response:', responseData);

            // Check for success conditions - either response.response === true OR success keywords in message
            const isSuccessResponse = responseData.response === true ||
                responseData.success === true ||
                (responseData.message && (
                    responseData.message.toLowerCase().includes('payment successful') ||
                    responseData.message.toLowerCase().includes('created') ||
                    responseData.message.toLowerCase().includes('success')
                ));

            if (response.ok && isSuccessResponse) {
                // Success - use actual API message if available
                const apiMessage = responseData.message &&
                    (responseData.message.toLowerCase().includes('payment successful') ||
                        responseData.message.toLowerCase().includes('created') ||
                        responseData.message.toLowerCase().includes('success'))
                    ? responseData.message
                    : 'Demo request submitted successfully!';

                const successMessage = apiMessage + '\n\nOur team will connect with you shortly and your credentials will be shared via email within 24 hours.';

                setSubmissionResult({
                    success: true,
                    message: successMessage,
                    showResultPage: true
                });
                clearForm();
                setShowDynamicPricing(false);
            } else {
                // Failure - extract detailed error message from API response
                let errorMessage = 'Failed to submit demo request. Please try again.';

                if (responseData) {
                    // Try multiple possible error message fields
                    errorMessage = responseData.message ||
                        responseData.error ||
                        responseData.msg ||
                        responseData.details ||
                        (responseData.errors && Array.isArray(responseData.errors) ? responseData.errors.join(', ') : '') ||
                        (responseData.data && responseData.data.message) ||
                        errorMessage;

                    // Don't include status details in user-facing message
                }

                console.error('[Dynamic Pricing] API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    responseData: responseData
                });

                console.log('[Dynamic Pricing] Setting error submission result:', {
                    success: false,
                    message: errorMessage,
                    showResultPage: true
                });

                setSubmissionResult({
                    success: false,
                    message: errorMessage,
                    showResultPage: true
                });
            }
        } catch (error) {
            console.error('[Dynamic Pricing] Network/Parse error:', error);

            // Provide more specific error messages based on error type
            let errorMessage = 'Network error occurred. Please check your connection and try again.';

            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
            } else if (error instanceof SyntaxError) {
                errorMessage = 'Server response format error. Please try again later.';
            } else if (error.message) {
                // Use the specific error message if available
                errorMessage = error.message;
            }

            console.log('[Dynamic Pricing] Setting network error submission result:', {
                success: false,
                message: errorMessage,
                showResultPage: true
            });

            setSubmissionResult({
                success: false,
                message: errorMessage,
                showResultPage: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Custom plan submit function
    const handleCustomPlanSubmit = async () => {
        if (selectedServices.length === 0) {
            showAlert('error', 'No Services Selected', 'Please select at least one service for your custom plan.');
            return;
        }

        try {
            // Call backend API to calculate custom plan pricing
            const response = await fetch('/api/calculate-custom-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedServices: selectedServices,
                    applicationTypeId: formData.application_type
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.response && data.data) {
                // Set custom plan data and navigate to step 3
                setCustomPlanData(data.data);
                setSelectedPlanForPricing(999); // Set special custom plan ID
                setIsFromCustomPlan(true);
                setCurrentStep(3);
                setShowDynamicPricing(true);

                // Save all custom plan data to localStorage
                saveToLocalStorage();

                // Update URL
                if (typeof window !== 'undefined') {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('step', '3');
                    currentUrl.searchParams.set('plan', '999'); // Custom plan ID
                    currentUrl.searchParams.set('fromCustom', 'true'); // Track that this came from custom plan
                    currentUrl.searchParams.delete('view');
                    window.history.pushState({
                        step: 3,
                        planId: 999,
                        isCustomPlan: true,
                        fromCustomPlan: true,
                        previousStep: 2, // When going back, should go to step 2
                        previousView: 'custom' // Should return to custom plan view
                    }, '', currentUrl.toString());
                }
            } else {
                throw new Error('Failed to calculate custom plan pricing');
            }
        } catch (error) {
            console.error('Error calculating custom plan:', error);
            showAlert('error', 'Calculation Error', 'Failed to calculate custom plan pricing. Please try again.');
        }
    };

    const stepVariants = {
        enter: { opacity: 0, scale: 0.98 },
        center: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.25, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    } as const;

    const inputVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <>
            {/* Result Page */}
            {submissionResult.showResultPage && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50/80 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
                    >
                        {submissionResult.success ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
                                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </motion.div>
                                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                                    Success!
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {submissionResult.message}
                                </p>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3, type: "spring" }}
                                    className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </motion.div>
                                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                                    Failure
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {submissionResult.message}
                                </p>
                            </>
                        )}
                        <Button
                            onClick={() => {
                                if (submissionResult.success) {
                                    // Navigate to home page
                                    window.location.href = '/';
                                } else {
                                    // Just close the modal for failures
                                    closeResultPage();
                                }
                            }}
                            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl"
                        >
                            {submissionResult.success ? 'Return to Home' : 'Close'}
                        </Button>
                    </motion.div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50/80 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50 py-8 px-4 relative overflow-hidden">
                {/* Enhanced Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-yellow-200/20 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-full blur-3xl"></div>
                    {/* Additional decorative elements */}
                    <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-200/10 to-pink-200/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute top-3/4 left-1/3 w-24 h-24 bg-gradient-to-r from-green-200/10 to-emerald-200/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-full blur-2xl animate-pulse"></div>

                    {/* Floating particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-orange-300/40 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [-20, -40, -20],
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 3,
                            }}
                        />
                    ))}
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Progress Indicator */}
                    <motion.div
                        className="mb-4 md:mb-6 lg:mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 shadow-lg border border-white/20 dark:border-slate-700/20">
                            <div className="flex items-center justify-center mb-3 md:mb-4">
                                <div className="flex items-center">
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} className="flex items-center">
                                            <motion.div
                                                className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold shadow-md ${step <= currentStep
                                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                                    : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600"
                                                    }`}
                                                animate={{
                                                    scale: step === currentStep ? 1.1 : 1,
                                                    boxShadow: step === currentStep
                                                        ? "0 0 20px rgba(249, 115, 22, 0.4)"
                                                        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                                }}
                                                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                            >
                                                {step < currentStep ? (
                                                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                                                ) : (
                                                    <span className="text-xs md:text-sm font-bold">{step}</span>
                                                )}
                                                {step === currentStep && (
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full border-2 border-orange-300"
                                                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                )}
                                            </motion.div>
                                            {step < 3 && (
                                                <div className="relative w-8 md:w-12 h-1.5 mx-2 md:mx-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: step < currentStep ? "100%" : "0%" }}
                                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center px-1">
                                <motion.h1
                                    className="text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-1 md:mb-2"
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Request Your Demo
                                </motion.h1>
                                <motion.p
                                    className="text-gray-600 dark:text-gray-300 text-xs md:text-sm lg:text-base"
                                    key={`subtitle-${currentStep}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    {currentStep === 1 && "Provide your business details for a customized experience"}
                                    {currentStep === 2 && "Select the solution that fits your needs best"}
                                    {currentStep === 3 && "Choose your plan and customize pricing options"}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className={`${currentStep === 2 || currentStep === 3 ? 'max-w-7xl mx-auto mb-8 lg:mb-12 xl:mb-8' : 'max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch mb-12 lg:mb-16 xl:mb-20'}`}>
                        {/* Enhanced Form Section */}
                        <motion.div
                            className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-3 md:p-4 xl:p-3 shadow-2xl border border-white/20 dark:border-slate-700/30 relative overflow-visible ${currentStep === 2 || currentStep === 3 ? 'w-full col-span-2' : 'flex flex-col'}`}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Enhanced decorative elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 via-amber-200/15 to-transparent dark:from-orange-500/10 dark:via-amber-500/8 rounded-br-full blur-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-blue-200/20 via-indigo-200/15 to-transparent dark:from-blue-500/10 dark:via-indigo-500/8 rounded-tl-full blur-2xl"></div>
                            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-purple-100/10 to-pink-100/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

                            {/* Subtle border glow */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
                            <AnimatePresence mode="wait">
                                {/* Step 1: Company Details */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                    >
                                        <div className="text-center mb-4 lg:mb-6 xl:mb-4">
                                            <motion.div
                                                className="relative w-12 h-12 lg:w-14 lg:h-14 xl:w-12 xl:h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4 xl:mb-3 shadow-xl"
                                                whileHover={{ scale: 1.02 }}
                                                initial={{ rotateX: -15 }}
                                                animate={{ rotateX: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-xl" />
                                                <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                                                <Building className="w-5 h-5 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-white relative z-10 drop-shadow-lg" />
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-30 blur-md animate-pulse" />
                                            </motion.div>
                                            <motion.h2
                                                className="text-xl lg:text-2xl xl:text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-2 lg:mb-3 xl:mb-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Business Information
                                            </motion.h2>
                                            <motion.p
                                                className="text-gray-600 dark:text-gray-300 text-sm lg:text-base xl:text-sm leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Tell us about your business and contact details
                                            </motion.p>
                                        </div>
                                        <div className="space-y-4 flex-1 min-h-0 px-1">

                                            {/* Company Name and Company Code - Side by Side */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <motion.div variants={inputVariants} transition={{ delay: 0.1 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                            <Building className="w-3 h-3 text-white" />
                                                        </div>
                                                        Company Name
                                                        {/* Question Mark Icon with Tooltip - Hidden on small screens */}
                                                        <div className="relative ml-2 hidden md:block">
                                                            <div
                                                                className="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center cursor-help transition-colors duration-200"
                                                                onMouseEnter={() => setShowCompanyNameGuide(true)}
                                                                onMouseLeave={() => setShowCompanyNameGuide(false)}
                                                                onClick={() => setShowCompanyNameGuide(!showCompanyNameGuide)}
                                                            >
                                                                <span className="text-white text-xs font-bold">?</span>
                                                            </div>

                                                            {/* Company Name Guide Tooltip */}
                                                            <AnimatePresence>
                                                                {showCompanyNameGuide && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="absolute top-full mt-2 w-64 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3 shadow-lg backdrop-blur-sm z-50 md:left-0 lg:left-1/2 lg:transform lg:-translate-x-1/2"
                                                                    >
                                                                        <div className="flex items-start space-x-2">
                                                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                            </div>
                                                                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                                <p className="font-medium mb-1">Enter full company name</p>
                                                                                <p className="text-blue-600 dark:text-blue-400">Like ABC Pvt Ltd, XYZ Corporation, etc.</p>
                                                                            </div>
                                                                        </div>
                                                                        {/* Arrow pointing up */}
                                                                        <div className="absolute -top-1 w-2 h-2 bg-blue-50 dark:bg-blue-900/20 border-l border-t border-blue-200 dark:border-blue-700/50 rotate-45 md:left-4 lg:left-1/2 lg:transform lg:-translate-x-1/2"></div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </label>
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            value={formData.company_title}
                                                            onFocus={() => setIsCompanyNameFocused(true)}
                                                            onBlur={() => setIsCompanyNameFocused(false)}
                                                            onChange={(e) => handleInputChange("company_title", e.target.value)}
                                                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.company_title ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                }`}
                                                            placeholder="Full company name (e.g., ABC Corp Pvt Ltd)"
                                                        />

                                                        {/* Small screen description - shows when typing */}
                                                        <AnimatePresence>
                                                            {(isCompanyNameFocused || formData.company_title.length > 0) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="md:hidden mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg"
                                                                >
                                                                    <div className="flex items-start space-x-2">
                                                                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                        </div>
                                                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                            <p className="font-medium mb-1">Enter full company name</p>
                                                                            <p className="text-blue-600 dark:text-blue-400">Like ABC Pvt Ltd, XYZ Corporation, etc.</p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                    </div>
                                                    {errors.company_title && (
                                                        <motion.p
                                                            className="text-red-500 text-sm mt-2 flex items-center"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                            {errors.company_title}
                                                        </motion.p>
                                                    )}
                                                </motion.div>

                                                <motion.div variants={inputVariants} transition={{ delay: 0.2 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                            <Building className="w-3 h-3 text-white" />
                                                        </div>
                                                        Company Code
                                                        {/* Question Mark Icon with Tooltip - Hidden on small screens */}
                                                        <div className="relative ml-2 hidden md:block">
                                                            <div
                                                                className="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center cursor-help transition-colors duration-200"
                                                                onMouseEnter={() => setShowCompanyCodeGuide(true)}
                                                                onMouseLeave={() => setShowCompanyCodeGuide(false)}
                                                                onClick={() => setShowCompanyCodeGuide(!showCompanyCodeGuide)}
                                                            >
                                                                <span className="text-white text-xs font-bold">?</span>
                                                            </div>

                                                            {/* Company Code Guide Tooltip - Responsive positioning */}
                                                            <AnimatePresence>
                                                                {showCompanyCodeGuide && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="absolute top-full mt-2 w-64 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3 shadow-lg backdrop-blur-sm z-50 md:-right-16 lg:right-0"
                                                                    >
                                                                        <div className="flex items-start space-x-2">
                                                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                            </div>
                                                                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                                <p className="font-medium mb-1">This becomes your login ID</p>
                                                                                <p className="text-blue-600 dark:text-blue-400">Use lowercase letters only, no spaces or special characters like @, #, $, etc.</p>
                                                                            </div>
                                                                        </div>
                                                                        {/* Arrow pointing up */}
                                                                        <div className="absolute -top-1 w-2 h-2 bg-blue-50 dark:bg-blue-900/20 border-l border-t border-blue-200 dark:border-blue-700/50 rotate-45 md:right-20 lg:right-4"></div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </label>
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            value={formData.company_name}
                                                            onFocus={() => setIsCompanyCodeFocused(true)}
                                                            onBlur={() => setIsCompanyCodeFocused(false)}
                                                            onChange={(e) => {
                                                                // Enhanced restriction: only allow alphanumeric characters
                                                                const cleanValue = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                                handleInputChange("company_name", cleanValue);
                                                            }}
                                                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.company_name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                }`}
                                                            placeholder="e.g. abc, company, demo123"
                                                        />

                                                        {/* Small screen description - shows when typing */}
                                                        <AnimatePresence>
                                                            {(isCompanyCodeFocused || formData.company_name.length > 0) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="md:hidden mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg"
                                                                >
                                                                    <div className="flex items-start space-x-2">
                                                                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                        </div>
                                                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                            <p className="font-medium mb-1">This becomes your login ID</p>
                                                                            <p className="text-blue-600 dark:text-blue-400">Use lowercase letters only, no spaces or special characters like @, #, $, etc.</p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                    </div>
                                                    {errors.company_name && (
                                                        <motion.p
                                                            className="text-red-500 text-sm mt-2 flex items-center"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                            {errors.company_name}
                                                        </motion.p>
                                                    )}
                                                </motion.div>
                                            </div>

                                            {/* Website and Email - Side by Side */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <motion.div variants={inputVariants} transition={{ delay: 0.3 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                            <Globe className="w-3 h-3 text-white" />
                                                        </div>
                                                        Website
                                                    </label>
                                                    <div className="relative group">
                                                        <input
                                                            type="url"
                                                            value={formData.website}
                                                            onChange={(e) => handleInputChange("website", e.target.value)}
                                                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.website ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                }`}
                                                            placeholder="https://www.example.com"
                                                        />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                    </div>
                                                    {errors.website && (
                                                        <motion.p
                                                            className="text-red-500 text-sm mt-2 flex items-center"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                            {errors.website}
                                                        </motion.p>
                                                    )}
                                                </motion.div>

                                                <motion.div variants={inputVariants} transition={{ delay: 0.4 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mr-2 shadow-sm">
                                                            <Mail className="w-3 h-3 text-white" />
                                                        </div>
                                                        Email Address
                                                    </label>
                                                    <div className="relative group">
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.email ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                }`}
                                                            placeholder="Enter your email address"
                                                        />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                    </div>
                                                    {errors.email && (
                                                        <motion.p
                                                            className="text-red-500 text-sm mt-2 flex items-center"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                            {errors.email}
                                                        </motion.p>
                                                    )}
                                                </motion.div>
                                            </div>

                                            {/* Contact Person Name and Mobile Number - Side by Side */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                                <motion.div variants={inputVariants} transition={{ delay: 0.5 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                            <User className="w-3 h-3 text-white" />
                                                        </div>
                                                        Contact Person
                                                    </label>
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            value={formData.contact_per_name}
                                                            onChange={(e) => handleInputChange("contact_per_name", e.target.value)}
                                                            className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.contact_per_name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                }`}
                                                            placeholder="Full name of contact person"
                                                        />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                    </div>
                                                    {errors.contact_per_name && (
                                                        <motion.p
                                                            className="text-red-500 text-sm mt-2 flex items-center"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                            {errors.contact_per_name}
                                                        </motion.p>
                                                    )}
                                                </motion.div>

                                                {/* Mobile Number Verification Section */}
                                                <motion.div variants={inputVariants} transition={{ delay: 0.6 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center mr-2 shadow-sm">
                                                            <Phone className="w-3 h-3 text-white" />
                                                        </div>
                                                        Mobile Number
                                                    </label>

                                                    {/* Mobile Number Input */}
                                                    <div className="space-y-2">
                                                        <div className="flex gap-3 items-end lg:flex-col lg:items-stretch lg:gap-2">
                                                            <div className="flex-1 lg:w-full">
                                                                <div className="relative group">
                                                                    <input
                                                                        type="tel"
                                                                        value={formData.mobile}
                                                                        onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, ''))}
                                                                        className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.mobile ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                            } ${isOtpVerified ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
                                                                        placeholder="10-digit mobile number"
                                                                        maxLength={10}
                                                                        disabled={isOtpVerified}
                                                                    />
                                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                                    {isOtpVerified && (
                                                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Verify Number Button - Responsive positioning */}
                                                            <div className="lg:hidden">
                                                                {/* Small/Medium screens: Button next to input */}
                                                                {formData.mobile.length === 10 && !isOtpSent && !isOtpVerified && (
                                                                    <Button
                                                                        onClick={sendOtp}
                                                                        disabled={otpLoading}
                                                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                                    >
                                                                        {otpLoading ? 'Sending...' : 'Verify Number'}
                                                                    </Button>
                                                                )}

                                                                {/* Resend OTP Button */}
                                                                {isOtpSent && canResendOtp && !isOtpVerified && (
                                                                    <Button
                                                                        onClick={sendOtp}
                                                                        disabled={otpLoading}
                                                                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                                    >
                                                                        {otpLoading ? 'Sending...' : 'Resend OTP'}
                                                                    </Button>
                                                                )}

                                                                {/* Countdown Timer */}
                                                                {isOtpSent && otpCountdown > 0 && !isOtpVerified && (
                                                                    <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-medium whitespace-nowrap">
                                                                        Resend in {otpCountdown}s
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Large screens: Button below input */}
                                                        <div className="hidden lg:block">
                                                            {formData.mobile.length === 10 && !isOtpSent && !isOtpVerified && (
                                                                <Button
                                                                    onClick={sendOtp}
                                                                    disabled={otpLoading}
                                                                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {otpLoading ? 'Sending...' : 'Verify Number'}
                                                                </Button>
                                                            )}

                                                            {/* Resend OTP Button */}
                                                            {isOtpSent && canResendOtp && !isOtpVerified && (
                                                                <Button
                                                                    onClick={sendOtp}
                                                                    disabled={otpLoading}
                                                                    className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {otpLoading ? 'Sending...' : 'Resend OTP'}
                                                                </Button>
                                                            )}

                                                            {/* Countdown Timer */}
                                                            {isOtpSent && otpCountdown > 0 && !isOtpVerified && (
                                                                <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-medium text-center">
                                                                    Resend in {otpCountdown}s
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* OTP Input Field */}
                                                        {isOtpSent && !isOtpVerified && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="space-y-3"
                                                            >
                                                                <div className="flex gap-3 items-center">
                                                                    <div className="flex-1">
                                                                        <input
                                                                            type="text"
                                                                            value={formData.otp}
                                                                            onChange={(e) => handleInputChange("otp", e.target.value.replace(/\D/g, ''))}
                                                                            className="w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200"
                                                                            placeholder="Enter OTP"
                                                                            maxLength={6}
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        onClick={validateOtp}
                                                                        disabled={otpLoading || formData.otp.length < 4}
                                                                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                                    >
                                                                        {otpLoading ? 'Verifying...' : 'Verify OTP'}
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        )}

                                                        {/* Mobile Error */}
                                                        {errors.mobile && (
                                                            <motion.p
                                                                className="text-red-500 text-sm flex items-center"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                            >
                                                                <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                                {errors.mobile}
                                                            </motion.p>
                                                        )}

                                                        {/* OTP Messages */}
                                                        {otpSentMessage && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span>{otpSentMessage}</span>
                                                            </motion.div>
                                                        )}

                                                        {otpVerificationMessage && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span>{otpVerificationMessage}</span>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Address - Full Width */}
                                            <motion.div variants={inputVariants} transition={{ delay: 0.7 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <MapPin className="w-3 h-3 text-white" />
                                                    </div>
                                                    Address
                                                </label>
                                                <div className="relative group">
                                                    <textarea
                                                        value={formData.address}
                                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                                        rows={3}
                                                        className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white resize-none transition-all duration-200 group-hover:border-blue-300 ${errors.address ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Complete business address"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                </div>
                                                {errors.address && (
                                                    <motion.p
                                                        className="text-red-500 text-sm mt-2 flex items-center"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                    >
                                                        <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                                                        {errors.address}
                                                    </motion.p>
                                                )}
                                            </motion.div>

                                            {/* Commented out Number of Employees field */}
                                            {/*
                                            <motion.div variants={inputVariants} transition={{ delay: 0.5 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Users className="w-3 h-3 text-white" />
                                                    </div>
                                                    Number of Employees
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        value={formData.no_employees || ''}
                                                        onChange={(e) => handleInputChange("no_employees", parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300"
                                                        placeholder="Total number of employees"
                                                        min="1"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                </div>
                                            </motion.div>
                                            */}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Old Step 2: Create Credentials - COMMENTED OUT DUE TO MERGE */}
                                {/*
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                    >
                                        <div className="text-center mb-4 lg:mb-6 xl:mb-4">
                                            <motion.div
                                                className="relative w-12 h-12 lg:w-14 lg:h-14 xl:w-12 xl:h-12 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4 xl:mb-3 shadow-xl"
                                                whileHover={{ scale: 1.05, rotateY: 10 }}
                                                initial={{ rotateX: -15 }}
                                                animate={{ rotateX: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-xl" />
                                                <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                                                <User className="w-5 h-5 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-white relative z-10 drop-shadow-lg" />
                                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl opacity-30 blur-md animate-pulse" />
                                            </motion.div>
                                            <motion.h2
                                                className="text-xl lg:text-2xl xl:text-xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-2 lg:mb-3 xl:mb-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Create your credentials
                                            </motion.h2>
                                            <motion.p
                                                className="text-gray-600 dark:text-gray-300 text-sm lg:text-base xl:text-sm leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Set up your account with secure login credentials
                                            </motion.p>
                                        </div>
                                        <div className="space-y-2 lg:space-y-3 xl:space-y-2 flex-1 min-h-0 px-1">
                                            ... all the old step 2 content ...
                                        </div>
                                    </motion.div>
                                )}
                                */}

                                {/* Step 2: Application Type & Pricing (previously Step 3) */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step3"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="text-center"
                                        data-step3-container
                                    >
                                        <div className="text-center mb-4 lg:mb-6 xl:mb-4 relative">
                                            {/* Customize Your Own Plan Button - Top Right */}
                                            {showCustomPlan ? (
                                                <>
                                                    {/* Large screens - aligned with Previous button */}
                                                    <motion.div
                                                        className="absolute top-8 right-12 z-10 hidden lg:block"
                                                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 300 }}
                                                    >
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setIsCustomPlanView(true);

                                                                // Update URL to show custom plan view
                                                                if (typeof window !== 'undefined') {
                                                                    const currentUrl = new URL(window.location.href);
                                                                    currentUrl.searchParams.set('step', '2');
                                                                    currentUrl.searchParams.set('view', 'custom');
                                                                    currentUrl.searchParams.delete('plan');
                                                                    window.history.pushState({ step: 2, view: 'custom' }, '', currentUrl.toString());
                                                                }
                                                            }}
                                                            className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-400/30"
                                                        >
                                                            {/* Shimmer effect */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                                                            {/* Pulsing glow */}
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl opacity-30 group-hover:opacity-50 blur-sm animate-pulse" />

                                                            <Settings className="w-4 h-4 relative z-10 transition-transform group-hover:rotate-45 duration-300" />
                                                            <span className="relative z-10 text-sm">Customize Your Own Plan</span>

                                                            {/* Sparkle effect */}
                                                            <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
                                                            <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
                                                        </motion.button>
                                                    </motion.div>

                                                    {/* Medium screens - closer to edge */}
                                                    <motion.div
                                                        className="absolute top-0 right-0 z-10 hidden md:block lg:hidden"
                                                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 300 }}
                                                    >
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setIsCustomPlanView(true);

                                                                // Update URL to show custom plan view
                                                                if (typeof window !== 'undefined') {
                                                                    const currentUrl = new URL(window.location.href);
                                                                    currentUrl.searchParams.set('step', '2');
                                                                    currentUrl.searchParams.set('view', 'custom');
                                                                    currentUrl.searchParams.delete('plan');
                                                                    window.history.pushState({ step: 2, view: 'custom' }, '', currentUrl.toString());
                                                                }
                                                            }}
                                                            className="group relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-400/30"
                                                        >
                                                            <Settings className="w-4 h-4 relative z-10 transition-transform group-hover:rotate-45 duration-300" />
                                                            <span className="relative z-10 text-xs">Customize</span>
                                                        </motion.button>
                                                    </motion.div>
                                                </>
                                            ) : customPlanMessage && (
                                                <motion.div
                                                    className="absolute top-0 right-0 z-10"
                                                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    transition={{ delay: 0.3, duration: 0.4, type: "spring", stiffness: 300 }}
                                                >
                                                    <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600">
                                                        <span className="text-sm">{customPlanMessage}</span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <AnimatePresence mode="wait">
                                                {(() => {
                                                    const selected = applicationTypes.find(t => t.value === formData.application_type);
                                                    const IconComp = selected?.icon || Globe;
                                                    const gradient = selected?.gradient || "from-purple-500 to-purple-600";
                                                    return (
                                                        <motion.div
                                                            key={formData.application_type || 'default'}
                                                            initial={{ opacity: 0, scale: 0.85, rotate: -4, y: 4 }}
                                                            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.85, rotate: 4, y: -4 }}
                                                            transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
                                                            className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-12 xl:h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4 xl:mb-3 shadow-lg relative overflow-hidden`}
                                                        >
                                                            {/* pulsing ring */}
                                                            <motion.div
                                                                className="absolute inset-0 rounded-xl"
                                                                initial={{ opacity: 0.35 }}
                                                                animate={{
                                                                    boxShadow: [
                                                                        '0 0 0 0 rgba(255,255,255,0.35)',
                                                                        '0 0 0 6px rgba(255,255,255,0)',
                                                                        '0 0 0 0 rgba(255,255,255,0.35)'
                                                                    ]
                                                                }}
                                                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                                            />
                                                            {/* subtle inner glow */}
                                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.3),transparent_75%)]" />
                                                            <IconComp className="w-5 h-5 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-white relative z-10 drop-shadow" />
                                                        </motion.div>
                                                    );
                                                })()}
                                            </AnimatePresence>
                                            <h2 className="text-lg lg:text-xl xl:text-lg font-bold text-gray-800 dark:text-white mb-1 lg:mb-2 xl:mb-1 tracking-tight">
                                                Choose Your Solution
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm xl:text-xs mb-1">
                                                Pick the solution that matches your business requirements
                                            </p>
                                            <p className="text-blue-600 dark:text-blue-400 text-xs lg:text-sm xl:text-xs font-medium opacity-90">
                                                You can always change your mind during the demo!
                                            </p>
                                        </div>

                                        {/* Application Type Dropdown */}
                                        <motion.div
                                            className="relative"
                                            data-dropdown-section
                                            animate={{
                                                y: formData.application_type ? -12 : 0,
                                                scale: formData.application_type ? 0.95 : 1,
                                                marginBottom: isDropdownOpen ? 140 : (formData.application_type ? 20 : 32)
                                            }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full px-4 py-3 lg:py-4 xl:py-3 text-base lg:text-lg xl:text-base border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white flex items-center justify-between hover:border-orange-400 transition-colors"
                                            >
                                                <span className={formData.application_type === 0 ? 'text-gray-500 dark:text-gray-400' : ''}>
                                                    {formData.application_type === 0
                                                        ? 'Select Application Type'
                                                        : applicationTypes.find(type => type.value === formData.application_type)?.label
                                                    }
                                                </span>
                                                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-xl z-[9999] overflow-hidden max-h-[200px] overflow-y-auto"
                                                    >
                                                        {applicationTypes.map((type) => (
                                                            <motion.button
                                                                key={type.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInputChange("application_type", type.value);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className="w-full px-4 py-4 text-left text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-slate-600 transition-colors border-b border-gray-100 dark:border-slate-600 last:border-b-0 min-h-[56px] flex items-center"
                                                                whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                                                            >
                                                                {type.label}
                                                            </motion.button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Previous Step Button - Top Left (Large Portraits and Larger) */}
                                        <motion.div
                                            className="absolute top-8 left-12 z-10 hidden lg:block"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleBack}
                                                className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-400 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group"
                                            >
                                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                                <span className="text-sm">Previous</span>
                                            </motion.button>
                                        </motion.div>

                                        {/* Tenure Selection Dropdown - Commented out for new pricing flow */}
                                        {/*
                                        <AnimatePresence>
                                            {formData.application_type > 0 && (
                                                <motion.div>
                                                    // Tenure dropdown content would be here
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        */}

                                        {/* Custom Plan View or Dynamic Pricing Cards */}
                                        <AnimatePresence>
                                            {isCustomPlanView ? (
                                                <motion.div
                                                    key="custom-plan"
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{
                                                        duration: 0.4,
                                                        delay: 0.1,
                                                        ease: "easeOut"
                                                    }}
                                                    className="w-full space-y-6"
                                                >
                                                    {/* Back Buttons - Side by Side */}
                                                    <div className="flex gap-4 items-center">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                setIsCustomPlanView(false);

                                                                // Update URL to go back to regular plan selection
                                                                if (typeof window !== 'undefined') {
                                                                    const currentUrl = new URL(window.location.href);
                                                                    currentUrl.searchParams.set('step', '2');
                                                                    currentUrl.searchParams.delete('view');
                                                                    currentUrl.searchParams.delete('plan');
                                                                    window.history.pushState({ step: 2 }, '', currentUrl.toString());
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                                                        >
                                                            <ArrowLeft className="w-4 h-4" />
                                                            Back to Plans
                                                        </motion.button>


                                                    </div>

                                                    {/* Custom Plan Header */}
                                                    <div className="text-center mb-6">
                                                        <motion.h3
                                                            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            Customize Your Own Plan
                                                        </motion.h3>
                                                        <motion.p
                                                            className="text-gray-600 dark:text-gray-400"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 }}
                                                        >
                                                            Select the services you need and get a personalized pricing
                                                        </motion.p>
                                                    </div>

                                                    {/* Plan Name Input */}
                                                    <motion.div
                                                        className="mb-6 max-w-5xl mx-auto"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 }}
                                                    >
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                            Plan Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={customPlanDescription}
                                                            onChange={(e) => setCustomPlanDescription(e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                                            placeholder="Enter your custom plan name..."
                                                        />
                                                    </motion.div>

                                                    {/* Services Bucketing Section */}
                                                    <motion.div
                                                        className="space-y-6"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.5 }}
                                                    >
                                                        {/* Services Header */}
                                                        <div className="text-center">
                                                            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                                                Select Your Services
                                                            </h4>
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                {formData.application_type ? `Available services for ${applicationTypes.find(t => t.value === formData.application_type)?.label}` : 'Please select an application type first'}
                                                            </p>
                                                        </div>

                                                        {servicesLoading ? (
                                                            <div className="text-center py-8">
                                                                <motion.div
                                                                    className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                />
                                                                <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
                                                            </div>
                                                        ) : availableServices.length > 0 ? (
                                                            <>
                                                                {/* Desktop: Side by side layout with drag and drop */}
                                                                <div className="hidden md:block">
                                                                    <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
                                                                        {/* Available Services */}
                                                                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                                                                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                                                Available Services
                                                                            </h5>
                                                                            <div className="space-y-3 max-h-96">
                                                                                {availableServices.filter(service =>
                                                                                    !selectedServices.find(selected => selected.id === service.id)
                                                                                ).length === 0 ? (
                                                                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                                                        <div className="w-8 h-8 mx-auto mb-2 opacity-50 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                                                            <span className="text-xs font-bold">✓</span>
                                                                                        </div>
                                                                                        <p className="text-sm">No services for selection</p>
                                                                                        <p className="text-xs mt-1 opacity-75">All services have been added</p>
                                                                                    </div>
                                                                                ) : (
                                                                                    availableServices.filter(service =>
                                                                                        !selectedServices.find(selected => selected.id === service.id)
                                                                                    ).map((service) => (
                                                                                        <div
                                                                                            key={service.id}
                                                                                            className="group p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md"
                                                                                            onClick={() => {
                                                                                                setSelectedServices(prev => [...prev, service]);
                                                                                            }}
                                                                                            draggable
                                                                                            onDragStart={(e: React.DragEvent) => {
                                                                                                e.dataTransfer.setData('service', JSON.stringify(service));
                                                                                            }}
                                                                                        >
                                                                                            <div className="flex items-start justify-between">
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight truncate">
                                                                                                        {service.generic_name}
                                                                                                    </p>
                                                                                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                                                                                        ₹{service.external_price_per_user}/user/day
                                                                                                    </p>
                                                                                                </div>
                                                                                                <div className="text-blue-500 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2">
                                                                                                    <Plus className="w-4 h-4" />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Selected Services */}
                                                                        <div
                                                                            className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 min-h-[320px]"
                                                                            onDragOver={(e) => e.preventDefault()}
                                                                            onDrop={(e) => {
                                                                                e.preventDefault();
                                                                                const serviceData = e.dataTransfer.getData('service');
                                                                                if (serviceData) {
                                                                                    const service = JSON.parse(serviceData);
                                                                                    if (!selectedServices.find(selected => selected.id === service.id)) {
                                                                                        setSelectedServices(prev => [...prev, service]);
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                                                Selected Services ({selectedServices.length})
                                                                            </h5>
                                                                            <div className="space-y-3 max-h-96">
                                                                                {selectedServices.length === 0 ? (
                                                                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                                                        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                                                        <p className="text-sm">Drag services here or click to add</p>
                                                                                    </div>
                                                                                ) : (
                                                                                    selectedServices.map((service) => (
                                                                                        <motion.div
                                                                                            key={service.id}
                                                                                            className="group p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-600 shadow-sm"
                                                                                            layout
                                                                                        >
                                                                                            <div className="flex items-start justify-between">
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight truncate">
                                                                                                        {service.generic_name}
                                                                                                    </p>
                                                                                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                                                                                        ₹{service.external_price_per_user}/user/day
                                                                                                    </p>
                                                                                                </div>
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedServices(prev =>
                                                                                                            prev.filter(s => s.id !== service.id)
                                                                                                        );
                                                                                                    }}
                                                                                                    className="text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2 p-1"
                                                                                                >
                                                                                                    <X className="w-4 h-4" />
                                                                                                </button>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    ))
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Mobile: Simple checkboxes layout */}
                                                                <div className="md:hidden">
                                                                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                                                                        <div className="space-y-3">
                                                                            {availableServices.length === 0 ? (
                                                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                                                    <div className="w-8 h-8 mx-auto mb-2 opacity-50 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                                                        <span className="text-xs font-bold">✓</span>
                                                                                    </div>
                                                                                    <p className="text-sm">No services available</p>
                                                                                    <p className="text-xs mt-1 opacity-75">Please select an application type</p>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    {availableServices.map((service) => (
                                                                                        <motion.label
                                                                                            key={service.id}
                                                                                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                                            whileTap={{ scale: 0.98 }}
                                                                                        >
                                                                                            {/* Custom styled checkbox */}
                                                                                            <div className="relative">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    checked={selectedServices.find(s => s.id === service.id) !== undefined}
                                                                                                    onChange={(e) => {
                                                                                                        if (e.target.checked) {
                                                                                                            setSelectedServices(prev => [...prev, service]);
                                                                                                        } else {
                                                                                                            setSelectedServices(prev =>
                                                                                                                prev.filter(s => s.id !== service.id)
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    className="peer sr-only"
                                                                                                />
                                                                                                <div className="w-5 h-5 bg-white dark:bg-slate-600 border-2 border-gray-300 dark:border-slate-500 rounded-md transition-all duration-200 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600 peer-checked:border-purple-500 flex items-center justify-center shadow-sm">
                                                                                                    <svg
                                                                                                        className={`w-3 h-3 text-white transition-opacity duration-200 ${selectedServices.find(s => s.id === service.id) ? 'opacity-100' : 'opacity-0'}`}
                                                                                                        fill="currentColor"
                                                                                                        viewBox="0 0 20 20"
                                                                                                    >
                                                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                                    </svg>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight truncate">
                                                                                                    {service.generic_name}
                                                                                                </p>
                                                                                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                                                                                    ₹{service.external_price_per_user}/user/day
                                                                                                </p>
                                                                                            </div>
                                                                                        </motion.label>
                                                                                    ))}

                                                                                    {/* Show message when all services are selected */}
                                                                                    {availableServices.length > 0 && selectedServices.length === availableServices.length && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, y: 10 }}
                                                                                            animate={{ opacity: 1, y: 0 }}
                                                                                            transition={{ delay: 0.2 }}
                                                                                            className="text-center py-4 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700"
                                                                                        >
                                                                                            <div className="w-6 h-6 mx-auto mb-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                                                                <span className="text-xs font-bold text-white">✓</span>
                                                                                            </div>
                                                                                            <p className="text-sm font-medium text-green-700 dark:text-green-300">All services selected</p>
                                                                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Uncheck any service above to remove it</p>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Pricing Summary */}
                                                                {selectedServices.length > 0 && (
                                                                    <div className="flex justify-center">
                                                                        <motion.div
                                                                            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white max-w-md w-full"
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            layout
                                                                        >
                                                                            <h5 className="font-bold text-lg mb-4 text-center">Custom Plan Pricing</h5>
                                                                            <div className="text-center">
                                                                                <div className="bg-white/20 rounded-lg p-4">
                                                                                    <p className="text-purple-100 text-sm mb-2">Yearly Subscription</p>
                                                                                    {(() => {
                                                                                        // Calculate total price from selected services
                                                                                        const totalPrice = selectedServices.reduce((total, service) => {
                                                                                            const price = typeof service.external_price_per_user === 'string'
                                                                                                ? parseFloat(service.external_price_per_user)
                                                                                                : service.external_price_per_user || 0;
                                                                                            return total + price;
                                                                                        }, 0);

                                                                                        // Apply formula: (price * 30 * 12 * 0.8) / 12 = price * 30 * 0.8
                                                                                        const yearlyTotal = totalPrice * 30 * 12; // Convert daily to yearly
                                                                                        const discountedYearly = yearlyTotal * 0.8; // Apply 20% discount
                                                                                        const monthlyEquivalent = discountedYearly / 12; // Convert back to monthly

                                                                                        return (
                                                                                            <>
                                                                                                <p className="font-bold text-3xl mb-1">₹{monthlyEquivalent.toFixed(0)}</p>
                                                                                                <p className="text-purple-200 text-sm">per user per month</p>
                                                                                                <p className="text-purple-300 text-xs">(billed annually)</p>
                                                                                                <div className="mt-2 text-center">
                                                                                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                                                                        20% discount applied
                                                                                                    </span>
                                                                                                </div>
                                                                                            </>
                                                                                        );
                                                                                    })()}
                                                                                </div>
                                                                            </div>

                                                                            {/* Continue Button */}
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.02 }}
                                                                                whileTap={{ scale: 0.98 }}
                                                                                onClick={handleCustomPlanSubmit}
                                                                                disabled={isSubmitting || selectedServices.length === 0}
                                                                                className="w-full mt-6 bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-purple-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {isSubmitting ? (
                                                                                    <div className="flex items-center justify-center gap-2">
                                                                                        <motion.div
                                                                                            animate={{ rotate: 360 }}
                                                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                                            className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"
                                                                                        />
                                                                                        Submitting...
                                                                                    </div>
                                                                                ) : 'Submit Custom Plan Request'}
                                                                            </motion.button>
                                                                        </motion.div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                                <p className="text-gray-600 dark:text-gray-400 mb-2">No services available</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-500">Please try selecting a different application type</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </motion.div>
                                            ) : (
                                                formData.application_type > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 30 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        transition={{
                                                            duration: 0.4,
                                                            delay: 0.1,
                                                            ease: "easeOut"
                                                        }}
                                                    >
                                                        {plansLoading ? (
                                                            <div className="text-center py-8">
                                                                <motion.div
                                                                    className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                />
                                                                <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
                                                            </div>
                                                        ) : plansError && Object.keys(plans).length === 0 ? (
                                                            <div className="text-center py-8">
                                                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                                <p className="text-gray-600 dark:text-gray-400 mb-2">No plans available for the selected application type</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-500">Please try a different solution or contact support</p>
                                                            </div>
                                                        ) : getCurrentPricingData() ? (
                                                            <>
                                                                <motion.h3
                                                                    className="text-base lg:text-lg xl:text-base font-medium mb-3 lg:mb-4 xl:mb-3 text-gray-800 dark:text-white text-center"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.15, duration: 0.3 }}
                                                                    data-pricing-section
                                                                >
                                                                    {getCurrentPricingData()?.title}
                                                                    {plansError && (
                                                                        <span className="block text-xs text-orange-600 dark:text-orange-400 mt-1 font-normal">
                                                                            {plansError}
                                                                        </span>
                                                                    )}
                                                                </motion.h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 xl:gap-5 items-stretch mt-6 lg:mt-8 xl:mt-6 transform-gpu">
                                                                    {getCurrentPricingData()?.tiers.map((tier, index) => (
                                                                        <motion.div
                                                                            key={tier.name}
                                                                            className={`group relative flex flex-col rounded-2xl border-2 shadow-xl transition-all duration-300 ease-out cursor-pointer overflow-visible transform-gpu will-change-transform backdrop-blur-sm ${tier.popular
                                                                                ? 'p-4 lg:p-5 xl:p-4 pt-6 lg:pt-8 xl:pt-6 pb-5 lg:pb-6 xl:pb-5 min-h-[420px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] xl:min-h-[500px] 2xl:min-h-[480px]'
                                                                                : 'p-4 lg:p-5 xl:p-4 pt-5 lg:pt-6 xl:pt-5 pb-5 lg:pb-6 xl:pb-5 min-h-[400px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[500px] xl:min-h-[480px] 2xl:min-h-[460px]'
                                                                                } ${selectedPlan === tier.name
                                                                                    ? tier.popular
                                                                                        ? "border-orange-300 dark:border-orange-400 bg-gradient-to-br from-orange-50/90 via-amber-50/70 to-amber-50/90 dark:from-orange-900/25 dark:via-amber-900/20 dark:to-orange-900/25 shadow-xl shadow-orange-500/20 dark:shadow-orange-900/30 z-10 ring-2 ring-orange-300/50"
                                                                                        : "border-orange-300 dark:border-orange-400 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-slate-800 dark:via-slate-700/50 dark:to-slate-800 shadow-xl shadow-orange-500/20 dark:shadow-orange-900/30 z-10 ring-2 ring-orange-300/50"
                                                                                    : tier.popular
                                                                                        ? "border-gradient-to-r from-orange-50/90 bg-gradient-to-br via-amber-50/70 to-amber-50/90 dark:from-orange-900/25 dark:via-amber-900/20 dark:to-orange-900/25 shadow-orange-200/50 dark:shadow-orange-900/30"
                                                                                        : "border-gray-200 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-slate-800 dark:via-slate-700/50 dark:to-slate-800 dark:border-slate-600 shadow-gray-200/50 dark:shadow-slate-900/50"
                                                                                } hover:border-orange-300 dark:hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/20 dark:hover:shadow-orange-900/30`}
                                                                            initial={{
                                                                                opacity: 0,
                                                                                y: 40,
                                                                                scale: 0.9,
                                                                                rotateX: 15
                                                                            }}
                                                                            animate={{
                                                                                opacity: selectedPlan && selectedPlan !== tier.name ? 0.7 : 1,
                                                                                y: selectedPlan === tier.name ? -4 : 0,
                                                                                scale: selectedPlan === tier.name ? 1.02 : 1,
                                                                                rotateX: 0,
                                                                                boxShadow: selectedPlan === tier.name ?
                                                                                    "0 15px 30px -8px rgba(249, 115, 22, 0.2), 0 0 0 1px rgba(249, 115, 22, 0.2)" :
                                                                                    "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
                                                                            }}
                                                                            transition={{
                                                                                delay: 0.2 + index * 0.1,
                                                                                duration: 0.4,
                                                                                ease: "easeOut",
                                                                                scale: { duration: 0.2, ease: "easeOut", delay: 0 }
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.98,
                                                                                transition: { duration: 0.1 }
                                                                            }}
                                                                            onClick={() => {
                                                                                // Find the plan entry for this tier
                                                                                const planEntry = Object.entries(plans).find(([key, plan]) =>
                                                                                    plan.plan_name.toLowerCase() === tier.name.toLowerCase()
                                                                                );
                                                                                if (planEntry) {
                                                                                    const [, plan] = planEntry;
                                                                                    setSelectedPlanForPricing(plan.plan_id);
                                                                                    // Navigate to step 3 (pricing customization)
                                                                                    setDirection(1);
                                                                                    setNavLock(true);
                                                                                    setCurrentStep(3);
                                                                                    saveToLocalStorage();

                                                                                    // Scroll to pricing section after navigation
                                                                                    setTimeout(() => {
                                                                                        const pricingSection = document.querySelector('[data-pricing-section="true"]');
                                                                                        if (pricingSection) {
                                                                                            pricingSection.scrollIntoView({
                                                                                                behavior: 'smooth',
                                                                                                block: 'start'
                                                                                            });
                                                                                        } else {
                                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                                        }
                                                                                        setNavLock(false);
                                                                                    }, 500);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {/* Simplified hover effect */}
                                                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 via-amber-500/8 to-yellow-500/5 dark:from-orange-400/8 dark:via-amber-400/10 dark:to-yellow-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none" />

                                                                            {/* Subtle border glow */}
                                                                            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-200 ease-out pointer-events-none ${tier.popular || selectedPlan === tier.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                                                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/15 via-amber-400/20 to-orange-400/15 blur-sm" />
                                                                            </div>
                                                                            {/* Enhanced Selection indicator */}
                                                                            {selectedPlan === tier.name && (
                                                                                <motion.div
                                                                                    className="absolute top-3 right-3 z-20"
                                                                                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                                                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                                                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                                                                                >
                                                                                    {/* Pulsing ring */}
                                                                                    <motion.div
                                                                                        className="absolute inset-0 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-30"
                                                                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                                    />
                                                                                    <div className="relative w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-800">
                                                                                        <motion.div
                                                                                            initial={{ scale: 0 }}
                                                                                            animate={{ scale: 1 }}
                                                                                            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                                                                        >
                                                                                            <Check className="w-5 h-5 text-white font-bold" />
                                                                                        </motion.div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}

                                                                            {/* Gentle glow for selected card */}
                                                                            {selectedPlan === tier.name && (
                                                                                <motion.div
                                                                                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                                                                                    initial={{ opacity: 0 }}
                                                                                    animate={{ opacity: 1 }}
                                                                                    transition={{ duration: 0.3 }}
                                                                                >
                                                                                    {/* Subtle glow */}
                                                                                    <motion.div
                                                                                        className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-amber-400/15 to-orange-400/10 rounded-2xl"
                                                                                        animate={{
                                                                                            opacity: [0.1, 0.2, 0.1]
                                                                                        }}
                                                                                        transition={{
                                                                                            duration: 3,
                                                                                            repeat: Infinity,
                                                                                            ease: "easeInOut"
                                                                                        }}
                                                                                    />
                                                                                </motion.div>
                                                                            )}

                                                                            {tier.popular && (
                                                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                                                                                    <motion.div
                                                                                        className="relative"
                                                                                        animate={selectedPlan === tier.name ? { scale: [1, 1.1, 1] } : {}}
                                                                                        transition={selectedPlan === tier.name ? { duration: 2, repeat: Infinity } : {}}
                                                                                    >
                                                                                        {/* Glow effect behind badge */}
                                                                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-md opacity-60 animate-pulse" />
                                                                                        <span className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white px-4 py-1.5 md:px-3 md:py-1 rounded-full text-sm md:text-xs font-bold shadow-xl whitespace-nowrap border border-orange-400/50 backdrop-blur-sm">
                                                                                            ⭐ Most Popular
                                                                                        </span>
                                                                                    </motion.div>
                                                                                </div>
                                                                            )}

                                                                            <div className="text-center mb-4 relative z-10">
                                                                                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">
                                                                                    {tier.name}
                                                                                </h4>
                                                                                <div className="relative">
                                                                                    <div className="relative text-3xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 dark:from-orange-400 dark:via-amber-400 dark:to-orange-500 bg-clip-text text-transparent">
                                                                                        {tier.price}
                                                                                        <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 ml-1">
                                                                                            {tier.period}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">
                                                                                        per user
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <ul className="space-y-3 text-left flex-1 relative z-10 overflow-y-auto custom-scrollbar">
                                                                                {tier.features.map((feature, featureIndex) => (
                                                                                    <motion.li
                                                                                        key={featureIndex}
                                                                                        className="flex items-center text-gray-700 dark:text-gray-200 font-medium"
                                                                                        initial={{ opacity: 0, x: -10 }}
                                                                                        animate={{ opacity: 1, x: 0 }}
                                                                                        transition={{ delay: 0.3 + featureIndex * 0.1 }}
                                                                                    >
                                                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                                                                                            <Check className="w-3 h-3 text-white font-bold" />
                                                                                        </div>
                                                                                        <span className="leading-relaxed">{feature}</span>
                                                                                    </motion.li>
                                                                                ))}
                                                                            </ul>

                                                                            {/* Plan Details Section */}
                                                                            <motion.div
                                                                                className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600 text-center relative z-10"
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: 0.6 }}
                                                                            >
                                                                                <div className="grid grid-cols-1 gap-2 text-sm">
                                                                                    <div className="flex justify-center items-center space-x-4">
                                                                                        <div className="text-gray-600 dark:text-gray-400">
                                                                                            <span className="font-semibold text-orange-600 dark:text-orange-400">{tier.minUsers}</span>
                                                                                            <span className="mx-1">-</span>
                                                                                            <span className="font-semibold text-orange-600 dark:text-orange-400">{tier.maxUsers}</span>
                                                                                            <span className="ml-1">users</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-gray-600 dark:text-gray-400">
                                                                                        <span className="font-semibold text-green-600 dark:text-green-400">{tier.trialDays}</span>
                                                                                        <span className="ml-1">days free trial</span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Select plan button */}
                                                                                <motion.button
                                                                                    className={`mt-4 w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${selectedPlanForPricing === plans[tier.name.toLowerCase().replace(/\s+/g, '_')]?.plan_id
                                                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                                                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                                                                                        }`}
                                                                                    whileHover={{ scale: 1.02 }}
                                                                                    whileTap={{ scale: 0.98 }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const planEntry = Object.entries(plans).find(([key, plan]) =>
                                                                                            plan.plan_name.toLowerCase() === tier.name.toLowerCase()
                                                                                        );
                                                                                        if (planEntry) {
                                                                                            setSelectedPlanForPricing(planEntry[1].plan_id);
                                                                                            // Navigate to step 3 (pricing customization)
                                                                                            setDirection(1);
                                                                                            setNavLock(true);
                                                                                            setCurrentStep(3);
                                                                                            saveToLocalStorage();

                                                                                            // Scroll to pricing section after navigation
                                                                                            setTimeout(() => {
                                                                                                const pricingSection = document.querySelector('[data-pricing-section="true"]');
                                                                                                if (pricingSection) {
                                                                                                    pricingSection.scrollIntoView({
                                                                                                        behavior: 'smooth',
                                                                                                        block: 'start'
                                                                                                    });
                                                                                                } else {
                                                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                                                }
                                                                                                setNavLock(false);
                                                                                            }, 500);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    Go with this plan
                                                                                </motion.button>
                                                                            </motion.div>
                                                                        </motion.div>
                                                                    )) || []}
                                                                </div>
                                                            </>
                                                        ) : null}

                                                        {/* Mobile Customize Your Own Plan Button - After Plan Cards */}
                                                        {showCustomPlan && (
                                                            <motion.div
                                                                className="flex justify-center mt-6 md:hidden"
                                                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                transition={{ delay: 0.6, duration: 0.4, type: "spring", stiffness: 300 }}
                                                            >
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => {
                                                                        setIsCustomPlanView(true);

                                                                        // Update URL to show custom plan view
                                                                        if (typeof window !== 'undefined') {
                                                                            const currentUrl = new URL(window.location.href);
                                                                            currentUrl.searchParams.set('step', '2');
                                                                            currentUrl.searchParams.set('view', 'custom');
                                                                            currentUrl.searchParams.delete('plan');
                                                                            window.history.pushState({ step: 2, view: 'custom' }, '', currentUrl.toString());
                                                                        }
                                                                    }}
                                                                    className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-400/30"
                                                                >
                                                                    {/* Shimmer effect */}
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                                                                    {/* Pulsing glow */}
                                                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl opacity-30 group-hover:opacity-50 blur-sm animate-pulse" />

                                                                    <Settings className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-45 duration-300" />
                                                                    <span className="relative z-10 text-base">Customize Your Own Plan</span>

                                                                    {/* Sparkle effect */}
                                                                    <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
                                                                    <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
                                                                </motion.button>
                                                            </motion.div>
                                                        )}

                                                        {/* Enhanced Selection prompt */}
                                                    </motion.div>
                                                )
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* Step 3: Dynamic Pricing */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3-pricing"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="w-full"
                                    >
                                        <div className="text-center mb-6">
                                            <motion.div
                                                className="relative w-12 h-12 lg:w-14 lg:h-14 xl:w-12 xl:h-12 bg-gradient-to-br from-purple-500 via-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4 xl:mb-3 shadow-xl"
                                                whileHover={{ scale: 1.02 }}
                                                initial={{ rotateX: -15 }}
                                                animate={{ rotateX: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-xl" />
                                                <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                                                <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 xl:w-5 xl:h-5 text-white relative z-10 drop-shadow-lg" />
                                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xl opacity-30 blur-md animate-pulse" />
                                            </motion.div>

                                            <motion.h3
                                                className="text-xl lg:text-2xl xl:text-xl font-bold text-gray-800 dark:text-white mb-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Customize Your Pricing
                                            </motion.h3>

                                            <motion.p
                                                className="text-gray-600 dark:text-gray-300 text-sm lg:text-base xl:text-sm"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Finalize your selection and get a personalized demo
                                            </motion.p>
                                        </div>

                                        {/* DynamicPricing Component */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="w-full"
                                            data-pricing-section="true"
                                        >
                                            <DynamicPricing
                                                selectedPlanId={selectedPlanForPricing}
                                                allPlans={isFromCustomPlan && customPlanData ? { [customPlanData.plan_id]: customPlanData } : plans}
                                                onGoBack={() => {
                                                    if (isFromCustomPlan) {
                                                        setCurrentStep(2);
                                                        setIsCustomPlanView(true);
                                                        setIsFromCustomPlan(false);
                                                        setCustomPlanData(null);
                                                        setSelectedPlanForPricing(null);
                                                        setDirection(-1);

                                                        // Update URL to go back to custom plan view
                                                        if (typeof window !== 'undefined') {
                                                            const currentUrl = new URL(window.location.href);
                                                            currentUrl.searchParams.set('step', '2');
                                                            currentUrl.searchParams.set('view', 'custom');
                                                            currentUrl.searchParams.delete('plan');
                                                            window.history.pushState({ step: 2, view: 'custom' }, '', currentUrl.toString());
                                                        }
                                                    } else {
                                                        setCurrentStep(2);
                                                        setDirection(-1);
                                                    }
                                                }}
                                                onCompleteDemo={handleCompleteDemoFromPricing}
                                                formData={formData}
                                                isSubmitting={isSubmitting}
                                                isFromCustomPlan={isFromCustomPlan}
                                                customPlanData={customPlanData}
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Enhanced Navigation Buttons */}
                            <motion.div
                                className="flex flex-col sm:flex-row justify-between gap-3 lg:gap-4 xl:gap-3 mt-6 lg:mt-8 xl:mt-6 pt-4 lg:pt-6 xl:pt-4 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-slate-600 flex-shrink-0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={currentStep === 1 || currentStep === 3}
                                        className="relative flex items-center justify-center gap-2 lg:gap-3 xl:gap-2 px-6 lg:px-8 xl:px-6 py-3 lg:py-4 xl:py-3 w-full sm:w-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-400 text-gray-700 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group lg:hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                                        <span>Previous Step</span>
                                    </Button>
                                </motion.div>

                                {currentStep < 3 && currentStep !== 2 ? (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative"
                                    >
                                        <Button
                                            onClick={handleNext}
                                            disabled={currentStep === 2 && !selectedPlanForPricing}
                                            className={`relative flex items-center justify-center gap-2 lg:gap-3 xl:gap-2 px-6 lg:px-8 xl:px-6 py-3 lg:py-4 xl:py-3 w-full sm:w-auto font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group overflow-hidden ${currentStep === 2 && !selectedPlanForPricing
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white'
                                                }`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transition-opacity duration-300 ${currentStep === 2 && !selectedPlanForPricing ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                                                }`} />
                                            <span className="relative z-10">Continue</span>
                                            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-0.5" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    // Complete Demo Request button - commented out for new pricing flow
                                    /*
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative"
                                    >
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!selectedPlan || isSubmitting}
                                            className="relative flex items-center justify-center gap-2 lg:gap-3 xl:gap-2 px-8 lg:px-10 xl:px-8 py-3 lg:py-4 xl:py-3 w-full sm:w-auto text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300" />
                                            <span className="relative z-10">
                                                {isSubmitting ? 'Processing...' : 'Complete Demo Request'}
                                            </span>
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full relative z-10"
                                                    style={{ animation: 'spin 0.8s linear infinite' }} />
                                            ) : (
                                                <Check className="w-5 h-5 relative z-10" />
                                            )}
                                        </Button>
                                    </motion.div>
                                    */
                                    // <div className="text-center">
                                    //     <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    //         {selectedPlanForPricing ? 'Plan selected! Continue to customize your pricing.' : 'Select a plan above to continue to the next step.'}
                                    //     </p>
                                    // </div>
                                    <></>
                                )}
                            </motion.div>
                        </motion.div>

                        {/* Enhanced Right Section - Only Step 1 */}
                        {currentStep === 1 && (
                            <motion.div
                                className="h-full"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {/* Stats and Testimonials Section */}
                                <div className="h-full flex flex-col gap-4">
                                    {/* Testimonials Section - Takes 55% of available height */}
                                    <motion.div
                                        className="bg-gradient-to-br from-slate-50/90 via-white to-slate-50/90 dark:from-slate-900/90 dark:via-slate-800 dark:to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden flex-[0.55] flex flex-col"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {/* Background decoration */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 via-transparent to-blue-500/3"></div>
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-200/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

                                        {/* Header */}
                                        <div className="relative z-10 bg-gradient-to-r from-orange-500/10 via-yellow-500/5 to-blue-500/10 dark:from-orange-500/20 dark:via-yellow-500/10 dark:to-blue-500/20 backdrop-blur-sm px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                                            <div className="flex items-center justify-center">
                                                <motion.div
                                                    className="flex items-center gap-2"
                                                    initial={{ scale: 0.9 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                                        Join these Leaders
                                                    </h3>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Testimonial Content */}
                                        <div className="relative z-10 p-4 flex flex-col flex-1">
                                            <div className="flex-1 flex items-center justify-center">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={testimonialIndex}
                                                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                                        className="text-center"
                                                    >
                                                        {/* Profile */}
                                                        <div className="mb-4">
                                                            <div className="relative mb-3">
                                                                <img
                                                                    src={testimonials[testimonialIndex].photo}
                                                                    alt={testimonials[testimonialIndex].name}
                                                                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 dark:border-orange-700 shadow-md mx-auto"
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[testimonialIndex].name)}&background=f97316&color=fff&size=48`;
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="text-sm font-bold text-foreground">
                                                                {testimonials[testimonialIndex].name}
                                                            </div>
                                                            <div className="text-xs font-medium bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                                                                {testimonials[testimonialIndex].company}
                                                            </div>
                                                        </div>

                                                        {/* Stars */}
                                                        <div className="flex justify-center gap-1 mb-3">
                                                            {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ scale: 0, rotate: -180 }}
                                                                    animate={{ scale: 1, rotate: 0 }}
                                                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                                                >
                                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        {/* Review */}
                                                        <p className="text-sm text-foreground/85 leading-relaxed font-medium italic px-2">
                                                            "{testimonials[testimonialIndex].review}"
                                                        </p>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>

                                            {/* Navigation dots */}
                                            <div className="flex justify-center gap-2 mt-4 flex-shrink-0">
                                                {testimonials.map((_, index) => (
                                                    <motion.button
                                                        key={index}
                                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === testimonialIndex
                                                            ? 'bg-orange-500 w-4'
                                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-orange-300'
                                                            }`}
                                                        onClick={() => setTestimonialIndex(index)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Stats Section - Takes 45% of available height */}
                                    <motion.div
                                        className="bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-slate-700/50 relative overflow-hidden flex-[0.45] flex flex-col justify-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {/* Decorative background elements */}
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200/20 to-transparent dark:from-orange-900/20 rounded-full -translate-y-10 translate-x-10"></div>
                                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-200/20 to-transparent dark:from-blue-900/20 rounded-full translate-y-8 -translate-x-8"></div>

                                        <div className="relative z-10">
                                            {/* Header */}
                                            <div className="text-center mb-6">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                                    Our Success Stats
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    Numbers that speak for themselves
                                                </p>
                                            </div>

                                            {/* Stats Grid - 2x2 layout with more spacing */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {statsData.map((stat, index) => (
                                                    <motion.div
                                                        key={stat.label}
                                                        className={`bg-gradient-to-br ${stat.bgColor} dark:${stat.darkBgColor} rounded-lg p-3 shadow-sm relative overflow-hidden border border-gray-200/30 dark:border-slate-600/30 text-center min-h-[70px] flex flex-col justify-center`}
                                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ delay: 0.4 + index * 0.1 }}
                                                    >
                                                        <div className={`text-lg font-bold mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                                            <SimpleStatCounter stat={stat} />
                                                        </div>
                                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                                                            {stat.label}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                </div>
            </div>            {/* Trusted By Companies Section - Outside main container */}
            <div className="bg-transparent">
                <CompanyEllipse />
            </div>

            {/* Celebration Popper Effect - Full Screen */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Confetti fountain from bottom center */}
                        {[...Array(80)].map((_, i) => {
                            const angle = (Math.random() - 0.5) * Math.PI; // Random angle between -90° to 90°
                            const velocity = 400 + Math.random() * 600; // Faster velocity
                            const xDistance = Math.sin(angle) * velocity;
                            const yDistance = Math.cos(angle) * velocity;

                            // Random colors
                            const colors = [
                                'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500',
                                'bg-pink-500', 'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-indigo-500',
                                'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-teal-500', 'bg-violet-500'
                            ];
                            const randomColor = colors[Math.floor(Math.random() * colors.length)];

                            // Random shapes
                            const shapeType = i % 3;
                            let shapeClass = '';

                            if (shapeType === 0) {
                                // Circle
                                shapeClass = 'rounded-full';
                            } else if (shapeType === 1) {
                                // Square
                                shapeClass = 'rounded-none';
                            } else {
                                // Triangle (using clip-path)
                                shapeClass = 'rounded-none';
                            }

                            return (
                                <motion.div
                                    key={i}
                                    className={`absolute w-3 h-3 ${randomColor} ${shapeClass}`}
                                    style={{
                                        left: '50%',
                                        bottom: '0px',
                                        transform: 'translateX(-50%)',
                                        clipPath: shapeType === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                                    }}
                                    animate={{
                                        x: [0, xDistance],
                                        y: [0, -yDistance, -yDistance + 300], // Faster arc motion
                                        rotate: [0, 720 * (Math.random() > 0.5 ? 1 : -1)], // More rotation
                                        scale: [1, 1, 0],
                                        opacity: [1, 1, 0]
                                    }}
                                    transition={{
                                        duration: 1.2 + Math.random() * 0.8, // Faster duration
                                        delay: Math.random() * 0.2, // Less delay
                                        ease: "easeOut"
                                    }}
                                />
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modern Alert Component */}
            <AnimatePresence>
                {alertConfig.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        onClick={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20 dark:border-slate-700/30 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Background decoration */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${alertConfig.type === 'success' ? 'bg-green-400' :
                                    alertConfig.type === 'error' ? 'bg-red-400' : 'bg-orange-400'
                                    }`}></div>
                                <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-15 ${alertConfig.type === 'success' ? 'bg-emerald-400' :
                                    alertConfig.type === 'error' ? 'bg-rose-400' : 'bg-amber-400'
                                    }`}></div>
                            </div>

                            {/* Alert content */}
                            <div className="flex items-start space-x-4 relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${alertConfig.type === 'success'
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                        alertConfig.type === 'error'
                                            ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                            'bg-gradient-to-br from-orange-500 to-amber-600'
                                        } shadow-lg`}
                                >
                                    {alertConfig.type === 'success' && <CheckCircle className="w-6 h-6 text-white" />}
                                    {alertConfig.type === 'error' && <AlertCircle className="w-6 h-6 text-white" />}
                                    {alertConfig.type === 'warning' && <AlertCircle className="w-6 h-6 text-white" />}
                                </motion.div>

                                <div className="flex-1 pt-1">
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                                    >
                                        {alertConfig.title}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                                    >
                                        {alertConfig.message}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Action button for errors */}
                            {alertConfig.type === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 flex justify-end"
                                >
                                    <Button
                                        onClick={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Got it
                                    </Button>
                                </motion.div>
                            )}

                            {/* Progress bar for auto-hide */}
                            {alertConfig.type !== 'error' && (
                                <motion.div
                                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-b-2xl"
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 4, ease: "linear" }}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}