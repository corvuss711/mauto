import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from './button';

interface PaytmPaymentProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
    onPaymentFailure: (error: string) => void;
    paymentData: {
        orderId: string;
        customerId: string;
        amount: string;
        mobile: string;
        email: string;
        planId?: number;
        pricingId?: number;
        numberOfUsers?: number;
        formData?: any;
        isCustomPlan?: boolean;
    };
}

interface PaytmParams {
    [key: string]: string;
}

export const PaytmPaymentModal: React.FC<PaytmPaymentProps> = ({
    isOpen,
    onClose,
    onPaymentSuccess,
    onPaymentFailure,
    paymentData
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);
        setPaymentStatus('processing');

        try {
            console.log('🚀 [Paytm] Initiating payment with data:', paymentData);

            // Step 1: Initialize payment with backend
            const initResponse = await fetch('/api/paytm/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const initData = await initResponse.json();

            if (!initResponse.ok || !initData.success) {
                throw new Error(initData.message || 'Failed to initialize payment');
            }

            console.log('✅ [Paytm] Transaction initiated:', initData.data);

            // Step 2: Create form and submit to Paytm with transaction token
            const { paytmParams, txnToken, txnUrl } = initData.data;

            if (!txnToken) {
                throw new Error('No transaction token received');
            }

            // Create a form dynamically to submit to Paytm
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = txnUrl;
            form.target = '_blank'; // Open in new tab for better UX

            // Add all Paytm parameters as hidden inputs
            Object.keys(paytmParams).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = paytmParams[key];
                form.appendChild(input);
            });

            // Append form to body and submit
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            console.log('📝 [Paytm] Payment form submitted with token:', txnToken.substring(0, 20) + '...');
            console.log('🔗 [Paytm] Payment URL:', txnUrl);

            // Step 3: Show payment processing state
            setPaymentStatus('processing');

            // Step 4: Start polling for payment status
            await pollPaymentStatus(paymentData.orderId);

        } catch (error) {
            console.error('❌ [Paytm] Payment failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            setError(errorMessage);
            setPaymentStatus('failed');
            onPaymentFailure(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const pollPaymentStatus = async (orderId: string) => {
        const maxAttempts = 30; // Poll for 5 minutes (10 seconds * 30)
        let attempts = 0;

        const poll = async () => {
            try {
                attempts++;
                console.log(`🔍 [Paytm] Polling payment status (attempt ${attempts}/${maxAttempts})`);

                const statusResponse = await fetch('/api/paytm/verify-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderId })
                });

                const statusData = await statusResponse.json();

                if (statusResponse.ok && statusData.success) {
                    const paymentStatus = statusData.data?.STATUS;

                    if (paymentStatus === 'TXN_SUCCESS') {
                        console.log('✅ [Paytm] Payment successful!');
                        setPaymentStatus('success');
                        onPaymentSuccess();
                        return;
                    } else if (paymentStatus === 'TXN_FAILURE') {
                        console.log('❌ [Paytm] Payment failed!');
                        setPaymentStatus('failed');
                        setError(statusData.data?.RESPMSG || 'Payment failed');
                        onPaymentFailure(statusData.data?.RESPMSG || 'Payment failed');
                        return;
                    }
                }

                // If payment is still pending and we haven't exceeded max attempts, poll again
                if (attempts < maxAttempts) {
                    setTimeout(poll, 10000); // Poll every 10 seconds
                } else {
                    console.log('⏰ [Paytm] Payment status polling timeout');
                    setPaymentStatus('failed');
                    setError('Payment status verification timeout. Please check your payment status manually.');
                    onPaymentFailure('Payment verification timeout');
                }

            } catch (error) {
                console.error('❌ [Paytm] Status polling error:', error);
                if (attempts < maxAttempts) {
                    setTimeout(poll, 10000); // Retry on error
                } else {
                    setPaymentStatus('failed');
                    setError('Unable to verify payment status');
                    onPaymentFailure('Payment verification failed');
                }
            }
        };

        // Start polling after a short delay to allow payment processing
        setTimeout(poll, 5000);
    };

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'processing':
                return <Loader className="w-8 h-8 text-blue-500 animate-spin" />;
            case 'success':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'failed':
                return <AlertCircle className="w-8 h-8 text-red-500" />;
            default:
                return <CreditCard className="w-8 h-8 text-primary" />;
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'processing':
                return 'Processing your payment... Please complete the payment in the Paytm window.';
            case 'success':
                return 'Payment completed successfully! Your demo will be processed now.';
            case 'failed':
                return error || 'Payment failed. Please try again.';
            default:
                return 'Complete your payment of ₹1 to start your demo.';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget && paymentStatus !== 'processing') {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-4"
                        >
                            {getStatusIcon()}
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {paymentStatus === 'success' ? 'Payment Successful!' :
                                paymentStatus === 'failed' ? 'Payment Failed' :
                                    paymentStatus === 'processing' ? 'Processing Payment' :
                                        'Complete Payment'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {getStatusMessage()}
                        </p>
                    </div>

                    {/* Payment Details */}
                    {paymentStatus === 'idle' && (
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Amount:</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">₹1.00</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Order ID:</span>
                                <span className="text-sm font-mono text-gray-900 dark:text-white">{paymentData.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Payment Gateway:</span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Paytm</span>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && paymentStatus === 'failed' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Payment Error</h4>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {paymentStatus === 'idle' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        'Pay ₹1'
                                    )}
                                </Button>
                            </>
                        )}

                        {paymentStatus === 'processing' && (
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Continue in Background
                            </Button>
                        )}

                        {(paymentStatus === 'success' || paymentStatus === 'failed') && (
                            <Button
                                onClick={onClose}
                                className="flex-1"
                                variant={paymentStatus === 'success' ? 'default' : 'outline'}
                            >
                                {paymentStatus === 'success' ? 'Continue' : 'Close'}
                            </Button>
                        )}
                    </div>

                    {/* Processing Note */}
                    {paymentStatus === 'processing' && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Please complete the payment in the opened Paytm window.
                                This dialog will automatically update once payment is confirmed.
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
