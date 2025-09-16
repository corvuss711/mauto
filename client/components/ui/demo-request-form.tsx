import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, Globe, Mail, Phone, Building, User, Lock, Star, ChevronDown, Users, Briefcase, Layers, MapPin, X, CheckCircle, AlertCircle } from "lucide-react";
import { TrustedByCompanies } from "./trusted-by-companies";
import { CompanyEllipse } from "./company-ellipse";

interface FormData {
    user_name: string;
    password: string;
    email: string;
    mobile: string;
    otp: string;
    company_name: string;
    company_title: string;
    website: string;
    address: string;
    no_employees: number;
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
    discount: string | null;
    min_users: number;
    max_users: number;
    trial_days: number;
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
                duration: "quarterly",
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
                duration: "quarterly",
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
                duration: "quarterly",
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
    { value: "quarterly", label: "Quarterly", popular: false },
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
            whileHover={{ scale: 1.05, y: -5 }}
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
            const step = saved ? parseInt(saved) : 1;
            return step >= 1 && step <= 3 ? step : 1;
        }
        return 1;
    });
    // Direction-aware animations: 1 forward, -1 backward
    const [direction, setDirection] = useState<1 | -1>(1);
    // Navigation lock during transitions to prevent stuck states
    const [navLock, setNavLock] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [showCompanyCodeGuide, setShowCompanyCodeGuide] = useState(false);

    const [formData, setFormData] = useState<FormData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('demoFormData');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return {
                        user_name: parsed.user_name || "",
                        password: parsed.password || "",
                        email: parsed.email || "",
                        mobile: parsed.mobile || "",
                        otp: parsed.otp || "",
                        company_name: parsed.company_name || "",
                        company_title: parsed.company_title || "",
                        website: parsed.website || "",
                        address: parsed.address || "",
                        no_employees: parsed.no_employees || 0,
                        contact_per_name: parsed.contact_per_name || "",
                        application_type: parsed.application_type || 0
                    };
                } catch {
                    return {
                        user_name: "",
                        password: "",
                        email: "",
                        mobile: "",
                        otp: "",
                        company_name: "",
                        company_title: "",
                        website: "",
                        address: "",
                        no_employees: 0,
                        contact_per_name: "",
                        application_type: 0
                    };
                }
            }
        }
        return {
            user_name: "",
            password: "",
            email: "",
            mobile: "",
            otp: "",
            company_name: "",
            company_title: "",
            website: "",
            address: "",
            no_employees: 0,
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

    // OTP related states
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [otpVerificationMessage, setOtpVerificationMessage] = useState('');
    const otpCountdownRef = useRef<NodeJS.Timeout | null>(null);

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

    // Function to transform API data to pricing card format
    const getCurrentPricingData = () => {
        if (Object.keys(plans).length === 0) {
            return null;
        }

        const planKeys = Object.keys(plans);
        const planArray = planKeys.map(key => plans[key]);

        // Filter plans by selected tenure and transform to PricingTier format
        const tiers: PricingTier[] = planArray.map((plan, index) => {
            // Find the plan detail for the selected tenure
            const planDetail = plan.plan_details.find(detail => detail.duration === selectedTenure);

            if (!planDetail) {
                // Fallback to first available plan detail if selected tenure not found
                const fallbackDetail = plan.plan_details[0];
                return {
                    name: plan.plan_name,
                    price: `₹${parseFloat(fallbackDetail.base_price_per_user).toFixed(0)}`,
                    period: `/${fallbackDetail.duration.replace('_', ' ')}`,
                    features: plan.features_list,
                    popular: index === 1, // Make the second plan popular (Gold)
                    minUsers: fallbackDetail.min_users,
                    maxUsers: fallbackDetail.max_users,
                    trialDays: fallbackDetail.trial_days
                };
            }

            return {
                name: plan.plan_name,
                price: `₹${parseFloat(planDetail.base_price_per_user).toFixed(0)}`,
                period: `/${planDetail.duration.replace('_', ' ')}`,
                features: plan.features_list,
                popular: index === 1, // Make the second plan popular (Gold)
                minUsers: planDetail.min_users,
                maxUsers: planDetail.max_users,
                trialDays: planDetail.trial_days
            };
        });

        return {
            title: `${applicationTypes.find(type => type.value === formData.application_type)?.label || 'Solutions'} - ${tenureOptions.find(t => t.value === selectedTenure)?.label} Plans`,
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
    };

    // OTP functions
    const sendOtp = async () => {
        if (!formData.mobile || formData.mobile.length < 10) {
            console.log('[OTP Send] Validation failed - Invalid mobile number:', formData.mobile);
            showAlert('error', 'Invalid Mobile Number', 'Please enter a valid 10-digit mobile number');
            return;
        }

        const cleanMobile = formData.mobile.replace(/\D/g, '');
        const isResendOperation = isOtpSent;
        console.log('[OTP Send] Starting OTP', isResendOperation ? 'resend' : 'generation', 'for mobile:', cleanMobile);

        setOtpLoading(true);
        try {
            const requestPayload = {
                mobile: cleanMobile,
                request_type: "SENT"
            };
            console.log('[OTP Send] Request payload:', requestPayload);

            const response = await fetch('/api/otp-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });

            console.log('[OTP Send] Response status:', response.status);
            console.log('[OTP Send] Response ok:', response.ok);

            const data = await response.json();
            console.log('[OTP Send] Response data:', data);

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

            console.log('[OTP Validation] Response status:', response.status);
            console.log('[OTP Validation] Response ok:', response.ok);

            const data = await response.json();
            console.log('[OTP Validation] Response data:', data);

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

    // Reset OTP states when mobile number changes
    useEffect(() => {
        if (formData.mobile) {
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
    }, [formData.mobile]);

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

            // If form is effectively empty and on first step with no plan, don't persist
            const isEmptyForm =
                !formData.user_name &&
                !formData.password &&
                !formData.email &&
                !formData.mobile &&
                !formData.company_name &&
                !formData.company_title &&
                !formData.website &&
                !formData.address &&
                formData.no_employees === 0 &&
                !formData.contact_per_name &&
                formData.application_type === 0 &&
                !selectedPlan &&
                currentStep === 1;

            if (isEmptyForm) {
                localStorage.removeItem('demoFormData');
                localStorage.removeItem('demoFormStep');
                localStorage.removeItem('demoFormPlan');
                return;
            }
            localStorage.setItem('demoFormData', JSON.stringify(formData));
            localStorage.setItem('demoFormStep', currentStep.toString());
            if (selectedPlan) {
                localStorage.setItem('demoFormPlan', selectedPlan);
            } else {
                localStorage.removeItem('demoFormPlan');
            }
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
        } else {
            setPlans({});
            setPlansError(null);
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
        const newErrors: Partial<FormData> = {};

        if (!formData.company_name?.trim()) newErrors.company_name = "Company Code is required";
        else if (formData.company_name.includes(' ')) newErrors.company_name = "Company Code cannot contain spaces";

        if (!formData.company_title?.trim()) newErrors.company_title = "Company Name is required";

        if (!formData.website) newErrors.website = "Website is required";
        else if (!/^https?:\/\//.test(formData.website) && !/^www\./.test(formData.website)) {
            newErrors.website = "Website must start with http://, https://, or www.";
        }

        if (!formData.address?.trim()) newErrors.address = "Address is required";
        if (!formData.contact_per_name?.trim()) newErrors.contact_per_name = "Contact person name is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Partial<FormData> = {};

        // First validate all basic fields
        if (!formData.user_name?.trim()) newErrors.user_name = "Username is required";
        else if (formData.user_name.includes(' ')) newErrors.user_name = "Username cannot contain spaces";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.mobile) newErrors.mobile = "Mobile number is required";
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be 10 digits";

        // Always set the field errors first so they show up
        setErrors(newErrors);

        // Check if there are basic field validation errors
        if (Object.keys(newErrors).length > 0) {
            return false;
        }

        // Now check OTP verification only if basic fields are valid
        if (!isOtpVerified) {
            if (formData.mobile && formData.mobile.length === 10) {
                showAlert('warning', 'Mobile Verification Required', 'Please verify your mobile number with OTP to continue');
            } else {
                showAlert('error', 'Mobile Number Required', 'Please enter a valid mobile number and verify it with OTP');
            }
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (navLock) return;
        if (currentStep === 1 && validateStep1()) {
            setDirection(1);
            setNavLock(true);
            setCurrentStep(2);
            saveToLocalStorage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setNavLock(false), 350);
        } else if (currentStep === 2 && validateStep2()) {
            setDirection(1);
            setNavLock(true);
            setCurrentStep(3);
            saveToLocalStorage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setNavLock(false), 350);
        }
    };

    const handleBack = () => {
        if (navLock) return;
        if (currentStep > 1) {
            setDirection(-1);
            setNavLock(true);
            setCurrentStep(currentStep - 1);
            saveToLocalStorage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setNavLock(false), 350);
        }
    };

    const clearForm = () => {
        // Cancel any pending debounced saves to avoid re-creating keys
        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        localStorage.removeItem('demoFormData');
        localStorage.removeItem('demoFormStep');
        localStorage.removeItem('demoFormPlan');
        localStorage.removeItem('demoFormHasSelected');

        setFormData({
            user_name: "",
            password: "",
            email: "",
            mobile: "",
            otp: "",
            company_name: "",
            company_title: "",
            website: "",
            address: "",
            no_employees: 0,
            contact_per_name: "",
            application_type: 0
        });
        handlePlanSelection(null);
        setCurrentStep(1);
        setErrors({});
        // Ensure nothing persists immediately after
        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        setHasSelectedBefore(false);
    };

    const handleSubmit = async () => {
        if (!selectedPlan) {
            showAlert('warning', 'Plan Selection Required', 'Please select a pricing plan to continue with your demo request.');
            return;
        }

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
                user_name: formData.user_name,
                password: formData.password,
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
                num_users: selectedPlanData.minUsers // Using minimum users from selected plan
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
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50/80 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50 z-50 flex items-center justify-center p-4">
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
                                    {currentStep === 2 && "Create your account credentials to get started"}
                                    {currentStep === 3 && "Select the solution that fits your needs best"}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className={`${currentStep === 3 ? 'max-w-7xl mx-auto mb-8 lg:mb-12 xl:mb-8' : 'max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch mb-12 lg:mb-16 xl:mb-20'}`}>
                        {/* Enhanced Form Section */}
                        <motion.div
                            className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-3 md:p-4 xl:p-3 shadow-2xl border border-white/20 dark:border-slate-700/30 relative overflow-visible ${currentStep === 3 ? 'w-full col-span-2' : 'flex flex-col'}`}
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
                                                whileHover={{ scale: 1.05, rotateY: 10 }}
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
                                                Company Information
                                            </motion.h2>
                                            <motion.p
                                                className="text-gray-600 dark:text-gray-300 text-sm lg:text-base xl:text-sm leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Help us understand your business to personalize your experience
                                            </motion.p>
                                        </div>
                                        <div className="space-y-2 lg:space-y-3 xl:space-y-2 flex-1 min-h-0 px-1">


                                            <motion.div variants={inputVariants} transition={{ delay: 0.2 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Building className="w-3 h-3 text-white" />
                                                    </div>
                                                    Company Name
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={formData.company_title}
                                                        onChange={(e) => handleInputChange("company_title", e.target.value)}
                                                        className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.company_title ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Full company name (e.g., ABC Corp Pvt Ltd)"
                                                    />
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

                                            <motion.div variants={inputVariants} transition={{ delay: 0.1 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Building className="w-3 h-3 text-white" />
                                                    </div>
                                                    Company Code
                                                    {/* Question Mark Icon with Tooltip - Hidden on mobile */}
                                                    <div className="relative ml-2 hidden md:block">
                                                        <div
                                                            className="w-4 h-4 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center cursor-help transition-colors duration-200"
                                                            onMouseEnter={() => setShowCompanyCodeGuide(true)}
                                                            onMouseLeave={() => setShowCompanyCodeGuide(false)}
                                                            onClick={() => setShowCompanyCodeGuide(!showCompanyCodeGuide)}
                                                        >
                                                            <span className="text-white text-xs font-bold">?</span>
                                                        </div>

                                                        {/* Company Code Guide Tooltip for Medium and larger screens */}
                                                        <AnimatePresence>
                                                            {showCompanyCodeGuide && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3 shadow-lg backdrop-blur-sm z-50"
                                                                >
                                                                    <div className="flex items-start space-x-2">
                                                                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                        </div>
                                                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                            <p className="font-medium mb-1">This becomes your login ID</p>
                                                                            <p className="text-blue-600 dark:text-blue-400">Use lowercase letters only, no spaces. This will be used to access your demo solutions.</p>
                                                                        </div>
                                                                    </div>
                                                                    {/* Arrow pointing up */}
                                                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-50 dark:bg-blue-900/20 border-l border-t border-blue-200 dark:border-blue-700/50 rotate-45"></div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={formData.company_name}
                                                        onChange={(e) => {
                                                            handleInputChange("company_name", e.target.value.toLowerCase().replace(/\s/g, ''));
                                                            // Show guide on mobile when typing starts
                                                            if (window.innerWidth < 768 && e.target.value.length > 0) {
                                                                setShowCompanyCodeGuide(true);
                                                            }
                                                        }}
                                                        onFocus={() => {
                                                            // Show guide on mobile when focused and has content
                                                            if (window.innerWidth < 768 && formData.company_name.length > 0) {
                                                                setShowCompanyCodeGuide(true);
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            // Hide guide on mobile when blurred
                                                            if (window.innerWidth < 768) {
                                                                setShowCompanyCodeGuide(false);
                                                            }
                                                        }}
                                                        className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.company_name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="e.g. abc, company"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                </div>

                                                {/* Mobile Guide Tooltip - Shows below input when typing and takes space in layout */}
                                                <AnimatePresence>
                                                    {showCompanyCodeGuide && window.innerWidth < 768 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3 shadow-lg backdrop-blur-sm md:hidden overflow-hidden"
                                                        >
                                                            <div className="flex items-start space-x-2">
                                                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                </div>
                                                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                                                    <p className="font-medium mb-1">This becomes your login ID</p>
                                                                    <p className="text-blue-600 dark:text-blue-400">Use lowercase letters only, no spaces. This will be used to access your demo solutions.</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
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

                                            <motion.div variants={inputVariants} transition={{ delay: 0.3 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
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
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
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

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-3">
                                                <motion.div variants={inputVariants} transition={{ delay: 0.5 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
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

                                                <motion.div variants={inputVariants} transition={{ delay: 0.6 }}>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
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
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Create Credentials */}
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
                                            <motion.div variants={inputVariants} transition={{ delay: 0.1 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 lg:mb-3 xl:mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <User className="w-3 h-3 text-white" />
                                                    </div>
                                                    Username
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={formData.user_name}
                                                        onChange={(e) => handleInputChange("user_name", e.target.value)}
                                                        className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.user_name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Enter username (no spaces)"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                </div>
                                                {errors.user_name && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.user_name}</p>
                                                )}
                                            </motion.div>

                                            <motion.div variants={inputVariants} transition={{ delay: 0.2 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-red-400 to-pink-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Lock className="w-3 h-3 text-white" />
                                                    </div>
                                                    Password
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.password}
                                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                                        className={`w-full px-3 py-2.5 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.password ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Enter secure password"
                                                    />
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-2.5 p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </motion.button>
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                </div>
                                                {errors.password && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                                )}
                                            </motion.div>

                                            <motion.div variants={inputVariants} transition={{ delay: 0.3 }}>
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
                                                        className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.email ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Enter your email address"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
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

                                            {/* Mobile Number and OTP Section */}
                                            <motion.div variants={inputVariants} transition={{ delay: 0.4 }} className="space-y-4">
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Phone className="w-3 h-3 text-white" />
                                                    </div>
                                                    Mobile Number Verification
                                                </label>

                                                {/* Mobile Number Input - Half Width */}
                                                <div className="flex gap-3 items-end">
                                                    <div className="flex-1 max-w-xs">
                                                        <div className="relative group">
                                                            <input
                                                                type="tel"
                                                                value={formData.mobile}
                                                                onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, ''))}
                                                                className={`w-full px-3 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.mobile ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                                    } ${isOtpVerified ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
                                                                placeholder="10-digit mobile number"
                                                                maxLength={10}
                                                                disabled={isOtpVerified}
                                                            />
                                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                            {isOtpVerified && (
                                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Verify Number Button */}
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

                                                {/* OTP Input Field */}
                                                {isOtpSent && !isOtpVerified && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="space-y-3"
                                                    >
                                                        <div className="flex gap-3 items-center">
                                                            <div className="flex-1 max-w-xs">
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
                                                                disabled={otpLoading || !formData.otp || formData.otp.length < 4}
                                                                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                            >
                                                                {otpLoading ? 'Validating...' : 'Validate OTP'}
                                                            </Button>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Enter the 6-digit OTP sent to your mobile number
                                                        </p>
                                                    </motion.div>
                                                )}

                                                {/* Inline Success Messages */}
                                                {otpSentMessage && !isOtpVerified && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        {otpSentMessage}
                                                    </motion.div>
                                                )}

                                                {otpVerificationMessage && isOtpVerified && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        {otpVerificationMessage}
                                                    </motion.div>
                                                )}

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
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Application Type & Pricing */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="text-center"
                                        data-step3-container
                                    >
                                        <div className="text-center mb-4 lg:mb-6 xl:mb-4">
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
                                            <p className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm xl:text-xs">
                                                Pick the solution that matches your business requirements
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

                                        {/* Tenure Selection Dropdown */}
                                        <AnimatePresence>
                                            {formData.application_type > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.05,
                                                        ease: "easeOut"
                                                    }}
                                                    className="mb-6 flex flex-col items-center"
                                                >
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                                                        Choose Billing Tenure
                                                    </label>
                                                    <div className="relative w-72">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsTenureDropdownOpen(!isTenureDropdownOpen)}
                                                            className="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white flex items-center justify-between hover:border-orange-400 transition-all duration-200"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {tenureOptions.find(t => t.value === selectedTenure)?.label}
                                                                {tenureOptions.find(t => t.value === selectedTenure)?.popular && (
                                                                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <ChevronDown className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 flex-shrink-0 ml-2 ${isTenureDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {isTenureDropdownOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-xl z-[9999] overflow-hidden"
                                                                >
                                                                    {tenureOptions.map((tenure) => (
                                                                        <motion.button
                                                                            key={tenure.value}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedTenure(tenure.value);
                                                                                setIsTenureDropdownOpen(false);
                                                                            }}
                                                                            className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-slate-600 transition-all duration-150 ease-out border-b border-gray-100 dark:border-slate-600 last:border-b-0 flex items-center justify-between"
                                                                            whileHover={{
                                                                                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                                                                                scale: 1.01,
                                                                                transition: { duration: 0.15, ease: "easeOut" }
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.98,
                                                                                transition: { duration: 0.1 }
                                                                            }}
                                                                        >
                                                                            <span>{tenure.label}</span>
                                                                            {tenure.popular && (
                                                                                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                                                                                    Recommended
                                                                                </span>
                                                                            )}
                                                                        </motion.button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Dynamic Pricing Cards */}
                                        <AnimatePresence>
                                            {formData.application_type > 0 && (
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
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 xl:gap-5 lg:items-end mt-6 lg:mt-8 xl:mt-6 transform-gpu">
                                                                {getCurrentPricingData()?.tiers.map((tier, index) => (
                                                                    <motion.div
                                                                        key={tier.name}
                                                                        className={`group relative p-4 lg:p-5 xl:p-4 mx-1 ${tier.popular ? 'pt-6 lg:pt-8 xl:pt-6 pb-5 lg:pb-6 xl:pb-5 lg:min-h-[380px] xl:min-h-[340px] min-h-[320px]' : 'pt-5 lg:pt-6 xl:pt-5 pb-5 lg:pb-6 xl:pb-5 min-h-[320px] lg:min-h-[350px] xl:min-h-[310px]'} flex flex-col rounded-2xl border-2 shadow-xl transition-all duration-300 ease-out cursor-pointer overflow-visible transform-gpu will-change-transform backdrop-blur-sm ${selectedPlan === tier.name
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
                                                                        onClick={() => handlePlanSelection(selectedPlan === tier.name ? null : tier.name)}
                                                                    >
                                                                        {/* Enhanced gradient overlay with shimmer effect */}
                                                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 via-amber-500/10 to-yellow-500/5 dark:from-orange-400/10 dark:via-amber-400/15 dark:to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                                                        {/* Shimmer effect on hover */}
                                                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                                                                            <motion.div
                                                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 -skew-x-12"
                                                                                initial={{ x: '-100%' }}
                                                                                animate={{ x: '200%' }}
                                                                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                                                            />
                                                                        </div>

                                                                        {/* Subtle border glow */}
                                                                        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${tier.popular || selectedPlan === tier.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
                                                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 via-amber-400/30 to-orange-400/20 blur-sm" />
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
                                                                        <ul className={`space-y-3 text-left ${!tier.popular ? 'flex-1' : ''} relative z-10`}>
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
                                                                            className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 text-center relative z-10"
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
                                                                        </motion.div>
                                                                    </motion.div>
                                                                )) || []}
                                                            </div>
                                                        </>
                                                    ) : null}

                                                    {/* Enhanced Selection prompt */}
                                                    {formData.application_type > 0 && getCurrentPricingData() && (
                                                        <motion.div
                                                            className="mt-8 text-center"
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.8 }}
                                                        >
                                                            <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50/80 to-purple-50 dark:from-blue-900/25 dark:via-indigo-900/20 dark:to-purple-900/25 rounded-xl p-5 border border-blue-200/60 dark:border-blue-700/60 shadow-lg backdrop-blur-sm overflow-hidden">
                                                                {/* Subtle animated background */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-indigo-400/10 to-purple-400/5 animate-pulse" />

                                                                <div className="relative z-10">
                                                                    <p className="text-blue-800 dark:text-blue-200 font-semibold text-lg mb-2">
                                                                        Click on a plan to select it (optional)
                                                                    </p>
                                                                    <p className="text-blue-700 dark:text-blue-300 text-sm opacity-90">
                                                                        You can always change your mind during the demo!
                                                                    </p>

                                                                    {selectedPlan && (
                                                                        <motion.div
                                                                            className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700"
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.2 }}
                                                                        >
                                                                            <p className="text-green-800 dark:text-green-200 font-semibold text-base flex items-center justify-center gap-2">
                                                                                ✅ Selected: <span className="text-green-700 dark:text-green-300">{selectedPlan} Plan</span>
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
                                        disabled={currentStep === 1}
                                        className="relative flex items-center justify-center gap-2 lg:gap-3 xl:gap-2 px-6 lg:px-8 xl:px-6 py-3 lg:py-4 xl:py-3 w-full sm:w-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-400 text-gray-700 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                                        <span>Previous Step</span>
                                    </Button>
                                </motion.div>

                                {currentStep < 3 ? (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative"
                                    >
                                        <Button
                                            onClick={handleNext}
                                            className="relative flex items-center justify-center gap-2 lg:gap-3 xl:gap-2 px-6 lg:px-8 xl:px-6 py-3 lg:py-4 xl:py-3 w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <span className="relative z-10">Continue</span>
                                            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-0.5" />
                                        </Button>
                                    </motion.div>
                                ) : (
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
                                )}
                            </motion.div>
                        </motion.div>

                        {/* Enhanced Right Section - Steps 1 and 2 */}
                        {(currentStep === 1 || currentStep === 2) && (
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
                                                        whileHover={{ scale: 1.2 }}
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
            </div>

            {/* Trusted By Companies Section - Outside main container */}
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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