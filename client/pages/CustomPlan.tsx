import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Plus, X, Check, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Service {
    id: number;
    service_name: string;
    generic_name: string;
    external_price_per_user: string;
}

export function CustomPlan() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const applicationType = searchParams.get('application_type');
    const companyName = searchParams.get('company_name');
    const email = searchParams.get('email');
    const mobile = searchParams.get('mobile');

    const [customPlanDescription, setCustomPlanDescription] = useState("");
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [customPlanPricing, setCustomPlanPricing] = useState({
        daily: 0,
        monthly: 0,
        quarterly: 0,
        halfYearly: 0,
        yearly: 0
    });

    // Fetch services list for custom plan
    const fetchServicesForCustomPlan = async (applicationType: string) => {
        setServicesLoading(true);
        try {
            const response = await fetch('/api/get-services-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    application_type: applicationType
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[Services API] Response:', data);

            if (data.response && data.data) {
                setAvailableServices(data.data);
            } else {
                console.error('[Services API] Invalid response format:', data);
                setAvailableServices([]);
            }
        } catch (error) {
            console.error('[Services API] Error fetching services:', error);
            setAvailableServices([]);
        } finally {
            setServicesLoading(false);
        }
    };

    // Calculate custom plan pricing
    const calculateCustomPlanPricing = (services: Service[]) => {
        const dailyTotal = services.reduce((total, service) => {
            return total + parseFloat(service.external_price_per_user || '0');
        }, 0);

        const monthly = dailyTotal * 30;
        const quarterly = monthly * 3 * 0.95; // 5% discount
        const halfYearly = monthly * 6 * 0.9; // 10% discount
        const yearly = monthly * 12 * 0.8; // 20% discount

        setCustomPlanPricing({
            daily: dailyTotal,
            monthly: monthly,
            quarterly: quarterly,
            halfYearly: halfYearly,
            yearly: yearly
        });
    };

    // Submit custom plan
    const handleCustomPlanSubmit = async () => {
        setIsSubmitting(true);

        try {
            const requestBody = {
                company_name: companyName,
                email: email,
                mobile: mobile,
                plan_type: "custom",
                custom_plan_description: customPlanDescription,
                selected_services: selectedServices.map(service => ({
                    service_id: service.id,
                    service_name: service.service_name,
                    price: service.external_price_per_user
                })),
                estimated_price: customPlanPricing.monthly,
                application_type: applicationType
            };

            console.log('Submitting custom plan request:', requestBody);

            const response = await fetch('/api/demo-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json();
            console.log('Custom plan API Response:', responseData);

            if (response.ok && (responseData.status === 'success' || responseData.response === true)) {
                setSubmitted(true);
            } else {
                alert('Failed to submit custom plan request. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting custom plan:', error);
            alert('Network error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (applicationType) {
            fetchServicesForCustomPlan(applicationType);
        }
    }, [applicationType]);

    useEffect(() => {
        calculateCustomPlanPricing(selectedServices);
    }, [selectedServices]);

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Success!</h1>
                    <p className="text-gray-600 mb-6">
                        Your custom plan request has been submitted successfully. Our team will review your requirements and contact you within 24 hours.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Go Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Demo Request
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Customize Your Own Plan
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Select the services you need and get a personalized pricing quote. Our team will review your requirements and contact you with a customized solution.
                        </p>
                    </div>
                </div>

                {/* Plan Description */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Describe Your Requirements
                    </label>
                    <textarea
                        value={customPlanDescription}
                        onChange={(e) => setCustomPlanDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        placeholder="Tell us about your specific needs, business requirements, or any custom features you're looking for..."
                        rows={4}
                    />
                </div>

                {/* Services Selection */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Select Services</h2>

                    {servicesLoading ? (
                        <div className="text-center py-8">
                            <motion.div
                                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <p className="text-gray-600">Loading services...</p>
                        </div>
                    ) : availableServices.length > 0 ? (
                        <div className="space-y-4">
                            {availableServices.map((service) => (
                                <motion.label
                                    key={service.id}
                                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                                    whileTap={{ scale: 0.98 }}
                                >
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
                                        className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 mb-1">
                                            {service.generic_name}
                                        </p>
                                        <p className="text-sm text-purple-600">
                                            ₹{service.external_price_per_user}/user/day
                                        </p>
                                    </div>
                                </motion.label>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No services available for this application type</p>
                        </div>
                    )}
                </div>

                {/* Pricing Summary */}
                {selectedServices.length > 0 && (
                    <motion.div
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="text-xl font-bold mb-4">Estimated Pricing</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-purple-100 text-sm">Monthly</p>
                                <p className="font-bold text-xl">₹{customPlanPricing.monthly.toFixed(0)}</p>
                                <p className="text-purple-200 text-xs">per user</p>
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Quarterly</p>
                                <p className="font-bold text-xl">₹{customPlanPricing.quarterly.toFixed(0)}</p>
                                <p className="text-purple-200 text-xs">5% discount</p>
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Half Yearly</p>
                                <p className="font-bold text-xl">₹{customPlanPricing.halfYearly.toFixed(0)}</p>
                                <p className="text-purple-200 text-xs">10% discount</p>
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Yearly</p>
                                <p className="font-bold text-xl">₹{customPlanPricing.yearly.toFixed(0)}</p>
                                <p className="text-purple-200 text-xs">20% discount</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Submit Button */}
                <div className="text-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCustomPlanSubmit}
                        disabled={isSubmitting || selectedServices.length === 0}
                        className="bg-purple-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                                Submitting Request...
                            </div>
                        ) : 'Submit Custom Plan Request'}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
