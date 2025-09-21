import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ArrowLeft, Star, Users, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';

// Types for the new pricing structure
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

interface DynamicPricingProps {
    selectedPlanId?: number;
    allPlans: { [key: string]: Plan };
    onGoBack: () => void;
    onCompleteDemo: (planId: number, pricingId: number, numberOfUsers: number) => void;
    formData: any;
    isSubmitting?: boolean;
    isFromCustomPlan?: boolean;
    customPlanData?: any;
}

// Tenure options for the new flow
const tenureOptions = [
    { value: "monthly", label: "1 month", duration: 1, popular: false },
    { value: "quaterly", label: "3 months", duration: 3, popular: false },
    { value: "half_yearly", label: "6 months", duration: 6, popular: false },
    { value: "yearly", label: "12 months", duration: 12, popular: true }
];

export const DynamicPricing: React.FC<DynamicPricingProps> = ({
    selectedPlanId,
    allPlans,
    onGoBack,
    onCompleteDemo,
    formData,
    isSubmitting = false,
    isFromCustomPlan = false,
    customPlanData
}) => {
    const [selectedTenure, setSelectedTenure] = useState("yearly");
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [selectedPricingDetail, setSelectedPricingDetail] = useState<PlanDetail | null>(null);
    const [numberOfUsers, setNumberOfUsers] = useState(1);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [showDemoAnimation, setShowDemoAnimation] = useState(false);

    // Store the user count for custom plans to prevent resets
    const [customPlanUserCount, setCustomPlanUserCount] = useState<number | null>(() => {
        // Try to restore from localStorage for custom plans
        if (typeof window !== 'undefined' && isFromCustomPlan) {
            const stored = localStorage.getItem('customPlanUserCount');
            return stored ? parseInt(stored, 10) : null;
        }
        return null;
    });

    // Save custom plan user count to localStorage whenever it changes
    useEffect(() => {
        if (isFromCustomPlan && customPlanUserCount !== null) {
            localStorage.setItem('customPlanUserCount', customPlanUserCount.toString());
        }
    }, [customPlanUserCount, isFromCustomPlan]);

    // Clear localStorage when not in custom plan mode
    useEffect(() => {
        if (!isFromCustomPlan && typeof window !== 'undefined') {
            localStorage.removeItem('customPlanUserCount');
        }
    }, [isFromCustomPlan]);

    // Initialize selected plan based on the plan that was clicked
    useEffect(() => {
        if (selectedPlanId && allPlans && Object.keys(allPlans).length > 0) {
            const plan = Object.values(allPlans).find(p => p.plan_id === selectedPlanId);
            if (plan) {
                setSelectedPlan(plan);
                // Set default pricing detail for yearly
                const yearlyDetail = plan.plan_details.find(detail => detail.duration === "yearly");
                if (yearlyDetail) {
                    setSelectedPricingDetail(yearlyDetail);

                    // For custom plans, try to preserve any existing user count
                    if (isFromCustomPlan) {
                        // Only set to min if we don't have a preserved count
                        if (customPlanUserCount === null) {
                            const initialCount = Math.max(yearlyDetail.min_users, 1);
                            setNumberOfUsers(initialCount);
                            setCustomPlanUserCount(initialCount);
                        }
                    } else {
                        // For regular plans, set initial number of users to min_users
                        setNumberOfUsers(yearlyDetail.min_users);
                    }
                }
            }
        }
    }, [selectedPlanId, allPlans, isFromCustomPlan, customPlanUserCount]);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Update pricing detail when tenure changes
    useEffect(() => {
        if (selectedPlan) {
            const detail = selectedPlan.plan_details.find(d => d.duration === selectedTenure);
            if (detail) {
                setSelectedPricingDetail(detail);

                // For custom plans: NEVER reset the user count, always preserve it
                if (isFromCustomPlan) {
                    // If we have a stored custom plan user count, use it
                    if (customPlanUserCount !== null && customPlanUserCount >= detail.min_users) {
                        setNumberOfUsers(customPlanUserCount);
                    }
                    // If no stored count but current count is valid, keep it
                    else if (numberOfUsers >= detail.min_users) {
                        setCustomPlanUserCount(numberOfUsers); // Store current count
                    }
                    // Only as last resort, set to minimum
                    else {
                        const minCount = Math.max(detail.min_users, 1);
                        setNumberOfUsers(minCount);
                        setCustomPlanUserCount(minCount);
                    }
                } else {
                    // For regular plans, reset to min_users (original behavior)
                    setNumberOfUsers(detail.min_users);
                }
            }
        }
    }, [selectedTenure, selectedPlan, isFromCustomPlan]);

    // Separate effect to handle initial custom plan user count preservation
    useEffect(() => {
        if (isFromCustomPlan && customPlanUserCount === null && numberOfUsers > 1) {
            setCustomPlanUserCount(numberOfUsers);
        }
    }, [isFromCustomPlan, customPlanUserCount, numberOfUsers]);

    const getPricePerUser = (planDetail: PlanDetail) => {
        // Priority: base_price_per_external_user_per_month > base_price_per_user_external > base_price_per_user
        return planDetail.base_price_per_external_user_per_month ||
            parseFloat(planDetail.base_price_per_user_external || planDetail.base_price_per_user || "0");
    };

    const calculateSavings = (currentTenure: string) => {
        if (!selectedPlan) return null;

        // Get monthly price for comparison
        const monthlyDetail = selectedPlan.plan_details.find(d => d.duration === "monthly");
        const currentDetail = selectedPlan.plan_details.find(d => d.duration === currentTenure);

        if (!monthlyDetail || !currentDetail || currentTenure === "monthly") return null;

        const monthlyPrice = getPricePerUser(monthlyDetail);
        const currentPrice = getPricePerUser(currentDetail);

        // Calculate total cost over the tenure period
        const tenureDuration = tenureOptions.find(t => t.value === currentTenure)?.duration || 1;
        const totalMonthlyEquivalent = monthlyPrice * tenureDuration;
        const totalCurrentPrice = currentPrice * tenureDuration;

        const savingsAmount = totalMonthlyEquivalent - totalCurrentPrice;
        const savingsPercentage = ((savingsAmount / totalMonthlyEquivalent) * 100);

        return {
            amount: savingsAmount,
            percentage: savingsPercentage,
            monthlyEquivalent: monthlyPrice,
            currentPrice: currentPrice
        };
    };

    const incrementUsers = () => {
        // Always allow increment, remove max limit
        const newCount = numberOfUsers + 1;
        setNumberOfUsers(newCount);

        // Store the count for custom plans to prevent resets
        if (isFromCustomPlan) {
            setCustomPlanUserCount(newCount);
        }
    };

    const decrementUsers = () => {
        if (selectedPricingDetail && numberOfUsers > selectedPricingDetail.min_users) {
            const newCount = numberOfUsers - 1;
            setNumberOfUsers(newCount);

            // Store the count for custom plans to prevent resets
            if (isFromCustomPlan) {
                setCustomPlanUserCount(newCount);
            }
        }
    };

    const calculateTotalPrice = () => {
        if (!selectedPricingDetail) return 0;
        const pricePerUser = getPricePerUser(selectedPricingDetail);
        return pricePerUser * numberOfUsers;
    };

    const calculateTotalAmount = () => {
        const monthlyTotal = calculateTotalPrice();
        const tenureDuration = tenureOptions.find(t => t.value === selectedTenure)?.duration || 1;
        return monthlyTotal * tenureDuration;
    };

    const handleTakeDemo = () => {
        setIsDemoMode(true);
        setShowDemoAnimation(true);
        setTimeout(() => setShowDemoAnimation(false), 1000);
    };

    const handleBuyPlan = () => {
        setIsDemoMode(false);
    };

    const handleCompleteDemo = () => {
        if (selectedPlan && selectedPricingDetail) {
            onCompleteDemo(selectedPlan.plan_id, selectedPricingDetail.id, numberOfUsers);
        }
    };

    // Show loading state if data is not available
    if (!allPlans || Object.keys(allPlans).length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading pricing details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedPlan) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400">No plan selected</p>
                            <button
                                onClick={onGoBack}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onGoBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to plans
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Select term length
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Lock in your savings with a longer term length.
                    </p>

                    {/* Savings Highlight */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {selectedPlan && (() => {
                                const yearlyDetail = selectedPlan.plan_details.find(d => d.duration === "yearly");
                                const monthlyDetail = selectedPlan.plan_details.find(d => d.duration === "monthly");

                                if (yearlyDetail && monthlyDetail) {
                                    const yearlyPrice = getPricePerUser(yearlyDetail);
                                    const monthlyPrice = getPricePerUser(monthlyDetail);
                                    const yearlySavings = ((monthlyPrice * 12) - (yearlyPrice * 12)) / (monthlyPrice * 12) * 100;

                                    if (yearlySavings > 0) {
                                        return (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">

                                                    <div>
                                                        <h3 className="font-semibold text-sm">Why choose yearly?</h3>
                                                        <p className="text-xs mt-1">
                                                            Save up to {yearlySavings.toFixed(0)}% compared to monthly billing.
                                                            That's ₹{((monthlyPrice - yearlyPrice) * 12).toFixed(2)} saved per user per year!
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tenure Selection */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {tenureOptions.map((tenure) => {
                                const isSelected = selectedTenure === tenure.value;
                                const currentDetail = selectedPlan?.plan_details.find(d => d.duration === tenure.value);
                                const currentPricePerUser = currentDetail ? getPricePerUser(currentDetail) : 0;
                                const savings = calculateSavings(tenure.value);

                                return (
                                    <motion.div
                                        key={tenure.value}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white'
                                            }`}
                                        onClick={() => setSelectedTenure(tenure.value)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        {/* Savings Badge */}
                                        {savings && savings.percentage > 0 && (
                                            <div className="absolute -top-2 right-4 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                Save {savings.percentage.toFixed(0)}%
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300 dark:border-gray-500'
                                                    }`}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {tenure.label}
                                                    </span>
                                                    {savings && savings.percentage > 0 && (
                                                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                            Save ₹{savings.amount.toFixed(2)} vs monthly
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                    ₹{currentPricePerUser.toFixed(2)}
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                                                        per user/month
                                                    </span>
                                                </div>
                                                {savings && savings.percentage > 0 && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                                        ₹{savings.monthlyEquivalent.toFixed(2)}
                                                        <span className="text-xs ml-1">per user/month</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Number of Users Selection */}
                        {selectedPricingDetail && (
                            <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    Select Number of Users
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Minimum: {selectedPricingDetail.min_users} users
                                        </p>
                                        {numberOfUsers === selectedPricingDetail.min_users && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                You're at the minimum required users
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={decrementUsers}
                                            disabled={numberOfUsers <= selectedPricingDetail.min_users}
                                            className={`p-2 rounded-lg border transition-all ${numberOfUsers <= selectedPricingDetail.min_users
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed dark:border-gray-700 dark:text-gray-600'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100'
                                                }`}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <div className="px-4 py-2 min-w-[80px] text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {numberOfUsers}
                                            </span>
                                        </div>
                                        <button
                                            onClick={incrementUsers}
                                            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-gray-100 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Plan Features */}
                        {selectedPlan && (
                            <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {selectedPlan.plan_name} Plan Features
                                </h3>
                                <ul className="space-y-3">
                                    {selectedPlan.features_list.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm sticky top-32">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Order Summary
                            </h3>

                            {selectedPlan && selectedPricingDetail && (
                                <>
                                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {selectedPlan.plan_name} Plan
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {numberOfUsers} users
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {tenureOptions.find(t => t.value === selectedTenure)?.label}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    ₹{getPricePerUser(selectedPricingDetail).toFixed(2)} × {numberOfUsers}
                                                </div>
                                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ₹{calculateTotalPrice().toFixed(2)}
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                                                        per month
                                                    </span>
                                                </div>
                                                {selectedTenure !== "monthly" && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        × {tenureOptions.find(t => t.value === selectedTenure)?.duration} months
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            Total Amount
                                            {selectedTenure !== "monthly" && (
                                                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                                                    ({tenureOptions.find(t => t.value === selectedTenure)?.duration} months)
                                                </span>
                                            )}
                                        </span>
                                        <motion.span
                                            className="text-xl font-bold text-gray-900 dark:text-white"
                                            animate={showDemoAnimation ? {
                                                scale: [1, 1.2, 1]
                                            } : {}}
                                            transition={{ duration: 0.5 }}
                                            style={showDemoAnimation ? {
                                                color: '#059669'
                                            } : {}}
                                        >
                                            ₹{isDemoMode ? '1.00' : calculateTotalAmount().toFixed(2)}
                                        </motion.span>
                                    </div>

                                    {/* Savings Display */}
                                    {(() => {
                                        const savings = calculateSavings(selectedTenure);
                                        if (savings && savings.percentage > 0) {
                                            const totalSavings = savings.amount * numberOfUsers;
                                            const tenureDuration = tenureOptions.find(t => t.value === selectedTenure)?.duration || 1;
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                            🎉 Your Savings
                                                        </span>
                                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                            {savings.percentage.toFixed(0)}% OFF
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-green-700 dark:text-green-300">
                                                        <div>Save ₹{totalSavings.toFixed(2)} over {tenureDuration} months</div>
                                                        <div className="mt-1">vs paying monthly (₹{(savings.monthlyEquivalent * numberOfUsers * tenureDuration).toFixed(2)})</div>
                                                    </div>
                                                </motion.div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {isDemoMode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                                        >
                                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                                Demo Mode: Only ₹1 charged for trial
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                You will be charged ₹{calculateTotalPrice().toFixed(2)}/month after {selectedPricingDetail.trial_days} days trial period
                                            </p>
                                        </motion.div>
                                    )}

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        {isDemoMode ?
                                            `Free trial for ${selectedPricingDetail.trial_days} days, then ₹${calculateTotalPrice().toFixed(2)}/month` :
                                            selectedTenure === "monthly"
                                                ? 'Amount does not include applicable taxes.'
                                                : `Total for ${tenureOptions.find(t => t.value === selectedTenure)?.duration} months. Amount does not include applicable taxes.`
                                        }
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {!isDemoMode ? (
                                            <>
                                                <Button
                                                    onClick={handleTakeDemo}
                                                    disabled={isFromCustomPlan}
                                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-200"
                                                >
                                                    {isFromCustomPlan ? 'Demo Not Available for Custom Plans' : 'Take Demo (₹1 only)'}
                                                </Button>
                                                <Button
                                                    onClick={handleCompleteDemo}
                                                    disabled={true}
                                                    variant="outline"
                                                    className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed font-semibold py-3 rounded-lg opacity-60"
                                                >
                                                    Buy This Plan (Coming Soon)
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={handleCompleteDemo}
                                                    disabled={isSubmitting || isFromCustomPlan}
                                                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-200"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            <span>Processing...</span>
                                                        </div>
                                                    ) : isFromCustomPlan ? (
                                                        'Demo Not Available for Custom Plans'
                                                    ) : (
                                                        'Start Demo (₹1)'
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={handleBuyPlan}
                                                    variant="outline"
                                                    className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:text-gray-100 font-semibold py-3 rounded-lg transition-colors"
                                                >
                                                    Buy Full Plan Instead
                                                </Button>
                                            </>
                                        )}
                                    </div>


                                    {/* <div className="mt-3 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            💳 Payment gateway integration coming soon
                                        </p>
                                    </div> */}

                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            {selectedPricingDetail.trial_days} days free trial
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
