import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, Globe, Mail, Phone, Building, User, Lock, Star, ChevronDown, Users, Briefcase, Layers } from "lucide-react";
import { TrustedByCompanies } from "./trusted-by-companies";
import { CompanyEllipse } from "./company-ellipse";

interface FormData {
    user_name: string;
    password: string;
    email: string;
    mobile: string;
    company_name: string;
    company_title: string;
    website: string;
    address: string;
    landline: string;
    contact_per_name: string;
    application_type: number;
}

interface PricingTier {
    name: string;
    price: string;
    period: string;
    features: string[];
    popular?: boolean;
}

const applicationTypes = [
    { value: 1, label: "SFA (Sales Force Automation)", icon: Briefcase, gradient: "from-orange-500 to-amber-500" },
    { value: 2, label: "HRMS (Human Resource Management)", icon: Users, gradient: "from-blue-500 to-indigo-500" },
    { value: 3, label: "SFA + HRMS (Combined Solution)", icon: Layers, gradient: "from-purple-500 to-fuchsia-500" }
];

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
    { label: "Happy Customers", value: 250, suffix: "+", color: "from-blue-500 to-blue-600", bgColor: "from-blue-50 to-blue-100", darkBgColor: "from-blue-900/30 to-blue-800/20" },
    { label: "Years Experience", value: 15, suffix: "+", color: "from-orange-500 to-orange-600", bgColor: "from-orange-50 to-orange-100", darkBgColor: "from-orange-900/30 to-orange-800/20" },
    { label: "Success Rate", value: 99.9, suffix: "%", color: "from-green-500 to-green-600", bgColor: "from-green-50 to-green-100", darkBgColor: "from-orange-900/30 to-orange-800/20" },
    { label: "Support Availability", value: 24, suffix: "x7", color: "from-pink-500 to-pink-600", bgColor: "from-pink-50 to-pink-100", darkBgColor: "from-blue-900/30 to-blue-800/20" }
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
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [formData, setFormData] = useState<FormData>({
        user_name: "",
        password: "",
        email: "",
        mobile: "",
        company_name: "",
        company_title: "",
        website: "",
        address: "",
        landline: "",
        contact_per_name: "",
        application_type: 0
    });

    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Load saved data on component mount
    useEffect(() => {
        const savedData = localStorage.getItem('demoFormData');
        const savedStep = localStorage.getItem('demoFormStep');
        const savedPlan = localStorage.getItem('demoFormPlan');

        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
        if (savedStep) {
            setCurrentStep(parseInt(savedStep));
        }
        if (savedPlan) {
            setSelectedPlan(savedPlan);
        }
    }, []);

    // Save data whenever form data changes
    useEffect(() => {
        localStorage.setItem('demoFormData', JSON.stringify(formData));
    }, [formData]);

    // Save current step
    useEffect(() => {
        localStorage.setItem('demoFormStep', currentStep.toString());
    }, [currentStep]);

    // Save selected plan
    useEffect(() => {
        if (selectedPlan) {
            localStorage.setItem('demoFormPlan', selectedPlan);
        } else {
            localStorage.removeItem('demoFormPlan');
        }
    }, [selectedPlan]);

    // Auto-scroll when pricing cards appear
    useEffect(() => {
        if (formData.application_type > 0) {
            const timer = setTimeout(() => {
                const element = document.querySelector('[data-dropdown-section]');
                if (element) {
                    const elementRect = element.getBoundingClientRect();
                    const offset = window.innerHeight * 0.15;
                    window.scrollTo({
                        top: window.scrollY + elementRect.top - offset,
                        behavior: 'smooth'
                    });
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [formData.application_type]);

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

    const handleInputChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }

        // Reset selected plan when application type changes
        if (field === 'application_type') {
            setSelectedPlan(null);
        }
    };

    const validateStep1 = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.user_name.trim()) newErrors.user_name = "Username is required";
        else if (formData.user_name.includes(' ')) newErrors.user_name = "Username cannot contain spaces";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.mobile) newErrors.mobile = "Mobile number is required";
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be 10 digits";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
        else if (formData.company_name.includes(' ')) newErrors.company_name = "Company name cannot contain spaces";

        if (!formData.company_title.trim()) newErrors.company_title = "Company title is required";

        if (!formData.website) newErrors.website = "Website is required";
        else if (!/^https?:\/\//.test(formData.website) && !/^www\./.test(formData.website)) {
            newErrors.website = "Website must start with http://, https://, or www.";
        }

        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.contact_per_name.trim()) newErrors.contact_per_name = "Contact person name is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const clearForm = () => {
        setFormData({
            user_name: "",
            password: "",
            email: "",
            mobile: "",
            company_name: "",
            company_title: "",
            website: "",
            address: "",
            landline: "",
            contact_per_name: "",
            application_type: 0
        });
        setSelectedPlan(null);
        setCurrentStep(1);
        setErrors({});
        // Clear localStorage
        localStorage.removeItem('demoFormData');
        localStorage.removeItem('demoFormStep');
        localStorage.removeItem('demoFormPlan');
    };

    const handleSubmit = () => {
        if (formData.application_type === 0) {
            alert("Please select an application type");
            return;
        }

        const submissionData = {
            ...formData,
            selected_plan: selectedPlan
        };

        console.log("Form Data:", JSON.stringify(submissionData, null, 2));

        // Show success message
        alert("🎉 Demo request submitted successfully! Form will be cleared now.");

        // Clear form after successful submission with a slight delay for better UX
        setTimeout(() => {
            clearForm();
        }, 500);
    };

    const stepVariants = {
        hidden: {
            opacity: 0,
            x: 100,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.6
            }
        },
        exit: {
            opacity: 0,
            x: -100,
            scale: 0.95,
            transition: {
                duration: 0.3
            }
        }
    };

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
                        className="mb-8 md:mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
                            <div className="flex items-center justify-center mb-4 md:mb-6">
                                <div className="flex items-center">
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} className="flex items-center">
                                            <motion.div
                                                className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg ${step <= currentStep
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
                                                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                                                ) : (
                                                    <span className="text-sm md:text-base font-bold">{step}</span>
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
                                                <div className="relative w-12 md:w-20 h-2 mx-2 md:mx-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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
                            <div className="text-center px-2">
                                <motion.h1
                                    className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-2 md:mb-3"
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Request Your Demo
                                </motion.h1>
                                <motion.p
                                    className="text-gray-600 dark:text-gray-300 text-sm md:text-lg"
                                    key={`subtitle-${currentStep}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    {currentStep === 1 && "Let's start with your basic details"}
                                    {currentStep === 2 && "Tell us about your company"}
                                    {currentStep === 3 && "Choose your perfect solution"}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className={`${currentStep === 3 ? 'max-w-7xl mx-auto' : 'max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch'}`}>
                        {/* Enhanced Form Section */}
                        <motion.div
                            className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 dark:border-slate-700/30 relative overflow-hidden ${currentStep === 3 ? 'w-full col-span-2' : 'h-full flex flex-col'}`}
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
                                {/* Step 1: Basic Details */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={stepVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="text-center mb-8">
                                            <motion.div
                                                className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-xl"
                                                whileHover={{ scale: 1.05, rotateY: 10 }}
                                                initial={{ rotateX: -15 }}
                                                animate={{ rotateX: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-xl" />
                                                <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                                                <User className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
                                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl opacity-30 blur-md animate-pulse" />
                                            </motion.div>
                                            <motion.h2
                                                className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Personal Details
                                            </motion.h2>
                                            <motion.p
                                                className="text-gray-600 dark:text-gray-300 text-sm lg:text-base leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Let's start with your basic information
                                            </motion.p>
                                        </div>
                                        <div className="space-y-4">
                                            <motion.div variants={inputVariants} transition={{ delay: 0.1 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
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
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.user_name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
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
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
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
                                                        className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.password ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Enter secure password"
                                                    />
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-3.5 p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
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
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
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
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.email ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
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

                                            <motion.div variants={inputVariants} transition={{ delay: 0.4 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Phone className="w-3 h-3 text-white" />
                                                    </div>
                                                    Mobile Number
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="tel"
                                                        value={formData.mobile}
                                                        onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, ''))}
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-orange-300 ${errors.mobile ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="10-digit mobile number"
                                                        maxLength={10}
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                                </div>
                                                {errors.mobile && (
                                                    <motion.p
                                                        className="text-red-500 text-sm mt-2 flex items-center"
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

                                {/* Step 2: Company Details */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        variants={stepVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="text-center mb-8">
                                            <motion.div
                                                className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-xl"
                                                whileHover={{ scale: 1.05, rotateY: 10 }}
                                                initial={{ rotateX: -15 }}
                                                animate={{ rotateX: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-xl" />
                                                <div className="absolute inset-0.5 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                                                <Building className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-30 blur-md animate-pulse" />
                                            </motion.div>
                                            <motion.h2
                                                className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                Company Information
                                            </motion.h2>
                                            <motion.p
                                                className="text-gray-600 dark:text-gray-300 text-sm lg:text-base leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Share details about your business & organization
                                            </motion.p>
                                        </div>
                                        <div className="space-y-4">
                                            <motion.div variants={inputVariants} transition={{ delay: 0.1 }}>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center mr-2 shadow-sm">
                                                        <Building className="w-3 h-3 text-white" />
                                                    </div>
                                                    Company Name
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={formData.company_name}
                                                        onChange={(e) => handleInputChange("company_name", e.target.value.toLowerCase().replace(/\s/g, ''))}
                                                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 group-hover:border-blue-300 ${errors.company_name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""
                                                            }`}
                                                        placeholder="Company name (no spaces, lowercase)"
                                                    />
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

                                            <motion.div variants={inputVariants} transition={{ delay: 0.2 }}>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Company Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.company_title}
                                                    onChange={(e) => handleInputChange("company_title", e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white ${errors.company_title ? "border-red-500" : ""
                                                        }`}
                                                    placeholder="Full company title (e.g., ABC Corp Pvt Ltd)"
                                                />
                                                {errors.company_title && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.company_title}</p>
                                                )}
                                            </motion.div>

                                            <motion.div variants={inputVariants} transition={{ delay: 0.3 }}>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    <Globe className="w-4 h-4 inline mr-2" />
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    value={formData.website}
                                                    onChange={(e) => handleInputChange("website", e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white ${errors.website ? "border-red-500" : ""
                                                        }`}
                                                    placeholder="https://www.example.com"
                                                />
                                                {errors.website && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                                                )}
                                            </motion.div>

                                            <motion.div variants={inputVariants} transition={{ delay: 0.4 }}>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Address
                                                </label>
                                                <textarea
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                                    rows={3}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white resize-none ${errors.address ? "border-red-500" : ""
                                                        }`}
                                                    placeholder="Complete business address"
                                                />
                                                {errors.address && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                                )}
                                            </motion.div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <motion.div variants={inputVariants} transition={{ delay: 0.5 }}>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Landline (Optional)
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.landline}
                                                        onChange={(e) => handleInputChange("landline", e.target.value.replace(/\D/g, ''))}
                                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                                        placeholder="Landline number"
                                                    />
                                                </motion.div>

                                                <motion.div variants={inputVariants} transition={{ delay: 0.6 }}>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        <User className="w-4 h-4 inline mr-2" />
                                                        Contact Person
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.contact_per_name}
                                                        onChange={(e) => handleInputChange("contact_per_name", e.target.value)}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white ${errors.contact_per_name ? "border-red-500" : ""
                                                            }`}
                                                        placeholder="Full name of contact person"
                                                    />
                                                    {errors.contact_per_name && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.contact_per_name}</p>
                                                    )}
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Application Type & Pricing */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        variants={stepVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={{ duration: 0.4 }}
                                        className="text-center"
                                    >
                                        <div className="text-center mb-8">
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
                                                            className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg relative overflow-hidden`}
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
                                                            <IconComp className="w-7 h-7 md:w-8 md:h-8 text-white relative z-10 drop-shadow" />
                                                        </motion.div>
                                                    );
                                                })()}
                                            </AnimatePresence>
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">
                                                Choose Your Solution
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                                                Select the perfect application type for your business needs
                                            </p>
                                        </div>

                                        {/* Application Type Dropdown */}
                                        <motion.div
                                            className="relative"
                                            data-dropdown-section
                                            animate={{
                                                y: formData.application_type ? -20 : 0,
                                                scale: formData.application_type ? 0.9 : 1,
                                                marginBottom: isDropdownOpen ? 192 : (formData.application_type ? 32 : 48)
                                            }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full px-4 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white flex items-center justify-between hover:border-orange-400 transition-colors"
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

                                        {/* Pricing Cards */}
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
                                                    <motion.h3
                                                        className="text-lg font-medium mb-6 text-gray-800 dark:text-white"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.15, duration: 0.3 }}
                                                        data-pricing-section
                                                    >
                                                        {pricingData[formData.application_type as keyof typeof pricingData].title}
                                                    </motion.h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:items-end mt-8">
                                                        {pricingData[formData.application_type as keyof typeof pricingData].tiers.map((tier, index) => (
                                                            <motion.div
                                                                key={tier.name}
                                                                className={`relative p-6 ${tier.popular ? 'pt-10 pb-8 lg:min-h-[420px] min-h-[350px]' : 'pt-8 pb-8 min-h-[350px]'} flex flex-col rounded-xl border-2 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-visible ${selectedPlan === tier.name
                                                                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/20 shadow-2xl transform scale-105"
                                                                    : tier.popular
                                                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                                        : "border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-600"
                                                                    }`}
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 40,
                                                                    scale: 0.9
                                                                }}
                                                                animate={{
                                                                    opacity: selectedPlan && selectedPlan !== tier.name ? 0.7 : 1,
                                                                    y: 0,
                                                                    scale: selectedPlan === tier.name ? 1.05 : 1
                                                                }}
                                                                transition={{
                                                                    delay: 0.2 + index * 0.1,
                                                                    duration: 0.15,
                                                                    ease: "easeOut"
                                                                }}
                                                                whileHover={{
                                                                    scale: selectedPlan === tier.name ? 1.08 : 1.02,
                                                                    y: -8,
                                                                    rotateY: 2,
                                                                    rotateX: 5
                                                                }}
                                                                onClick={() => setSelectedPlan(selectedPlan === tier.name ? null : tier.name)}
                                                            >
                                                                {/* Selection indicator */}
                                                                {selectedPlan === tier.name && (
                                                                    <motion.div
                                                                        className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg z-10"
                                                                        initial={{ scale: 0, rotate: -180 }}
                                                                        animate={{ scale: 1, rotate: 0 }}
                                                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                    >
                                                                        <Check className="w-5 h-5 text-white" />
                                                                    </motion.div>
                                                                )}

                                                                {/* Trophy animation for selected card */}
                                                                {selectedPlan === tier.name && (
                                                                    <motion.div
                                                                        className="absolute inset-0 pointer-events-none"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{ duration: 0.3 }}
                                                                    >
                                                                        {/* Sparkles */}
                                                                        {[...Array(8)].map((_, i) => (
                                                                            <motion.div
                                                                                key={i}
                                                                                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                                                                                style={{
                                                                                    left: `${20 + (i * 10)}%`,
                                                                                    top: `${15 + (i % 3) * 20}%`
                                                                                }}
                                                                                initial={{ scale: 0, opacity: 0 }}
                                                                                animate={{
                                                                                    scale: [0, 1, 0],
                                                                                    opacity: [0, 1, 0],
                                                                                    y: [0, -20, -40],
                                                                                    rotate: [0, 180, 360]
                                                                                }}
                                                                                transition={{
                                                                                    duration: 1.5,
                                                                                    delay: i * 0.1,
                                                                                    repeat: Infinity,
                                                                                    repeatDelay: 2
                                                                                }}
                                                                            />
                                                                        ))}

                                                                        {/* Glow effect */}
                                                                        <motion.div
                                                                            className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-xl"
                                                                            animate={{
                                                                                opacity: [0.3, 0.6, 0.3],
                                                                                scale: [1, 1.02, 1]
                                                                            }}
                                                                            transition={{
                                                                                duration: 2,
                                                                                repeat: Infinity,
                                                                                ease: "easeInOut"
                                                                            }}
                                                                        />
                                                                    </motion.div>
                                                                )}

                                                                {tier.popular && (
                                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                                        <motion.span
                                                                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap"
                                                                            animate={selectedPlan === tier.name ? { scale: [1, 1.1, 1] } : {}}
                                                                            transition={selectedPlan === tier.name ? { duration: 1, repeat: Infinity } : {}}
                                                                        >
                                                                            Most Popular
                                                                        </motion.span>
                                                                    </div>
                                                                )}

                                                                <div className="text-center mb-4 relative z-10">
                                                                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                                                        {tier.name}
                                                                    </h4>
                                                                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                                                        {tier.price}
                                                                        <span className="text-lg text-gray-500 dark:text-gray-400">
                                                                            {tier.period}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ul className={`space-y-3 text-left ${!tier.popular ? 'flex-1' : ''}`}>
                                                                    {tier.features.map((feature, featureIndex) => (
                                                                        <li key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                                                                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                                                            {feature}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    {/* Selection prompt */}
                                                    {formData.application_type > 0 && (
                                                        <motion.div
                                                            className="mt-8 text-center"
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.8 }}
                                                        >
                                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                                                <p className="text-blue-800 dark:text-blue-200 font-medium">
                                                                    Click on a plan to select it (optional) - You can choose during the demo!
                                                                </p>
                                                                {selectedPlan && (
                                                                    <motion.p
                                                                        className="text-green-700 dark:text-green-300 font-semibold mt-2"
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: 0.2 }}
                                                                    >
                                                                        Selected: {selectedPlan} Plan
                                                                    </motion.p>
                                                                )}
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
                                className="flex flex-col sm:flex-row justify-between gap-4 mt-10 pt-8 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-slate-600"
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
                                        className="relative flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-400 text-gray-700 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
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
                                            className="relative flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group overflow-hidden"
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
                                            disabled={formData.application_type === 0}
                                            className={`relative flex items-center justify-center gap-3 px-10 py-4 w-full sm:w-auto text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl group overflow-hidden ${selectedPlan
                                                ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-700"
                                                : "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700"
                                                } disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <span className="relative z-10">{selectedPlan ? `Submit with ${selectedPlan} Plan` : "Complete Demo Request"}</span>
                                            <Check className="w-5 h-5 relative z-10" />
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
        </>
    );
}
