import React, { useEffect, useState, useRef } from 'react';
import { FiClock, FiCreditCard, FiShield, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PaymentInitialization = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const rzpInstanceRef = useRef(null); // Ref to store Razorpay instance

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("paymentData"));
      if (data) {
        setPaymentData(data);
        initializeRazorpay(data);
      } else {
        setError("Payment data not found");
      }
    } catch (err) {
      setError("Failed to parse payment data");
      console.error("Payment data error:", err);
    } finally {
      setLoading(false);
    }

    // Cleanup function to close Razorpay modal
    return () => {
      if (rzpInstanceRef.current) {
        try {
          rzpInstanceRef.current.close();
        } catch (e) {
          console.log("Error closing Razorpay modal:", e);
        }
      }
    };
  }, []);

  const initializeRazorpay = (data) => {
    const loadScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadScript().then(success => {
      if (!success) {
        setError("Failed to load Razorpay SDK");
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: "Study Material Purchase",
        description: "Secure payment for educational materials",
        image: "https://your-logo-url.com/logo.png",
        handler: function (response) {
          // Payment success handler
          toast.success(
            <div className="flex items-start">
              <FiCheck className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <p className="font-bold text-gray-800">Payment Successful!</p>
                <p className="text-gray-600">You will receive the material within 3 days</p>
              </div>
            </div>,
            { 
              duration: 5000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              }
            }
          );
          
          // Close modal before navigating
          if (rzpInstanceRef.current) {
            rzpInstanceRef.current.close();
          }
          
          // Navigate after toast is visible
          setTimeout(() => navigate('/student/material'), 2000);
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
          contact: "9999999999"
        },
        notes: data.notes,
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: () => {
            // Handle modal close
            toast.error(
              <div className="flex items-start">
                <FiX className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                <div>
                  <p className="font-bold text-gray-800">Payment Not Completed</p>
                  <p className="text-gray-600">If amount was deducted, it will be refunded within 5-7 days</p>
                </div>
              </div>,
              { 
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                }
              }
            );
            
            // Close modal before navigating
            if (rzpInstanceRef.current) {
              rzpInstanceRef.current.close();
            }
            
            // Navigate after toast is visible
            setTimeout(() => navigate('/student/material'), 2000);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzpInstanceRef.current = rzp; // Store instance in ref
      
      rzp.on('payment.failed', function (response) {
        // Payment failed handler
        toast.error(
          <div className="flex items-start">
            <FiX className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="font-bold text-gray-800">Payment Failed!</p>
              <p className="text-gray-600">Your money will be refunded within 5-7 days</p>
            </div>
          </div>,
          { 
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            }
          }
        );
        
        // Close modal before navigating
        if (rzpInstanceRef.current) {
          rzpInstanceRef.current.close();
        }
        
        // Navigate after toast is visible
        setTimeout(() => navigate('/student/material'), 2000);
      });

      rzp.open();
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAmount = (amount) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Initializing payment gateway...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <FiInfo className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Payment Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            fontSize: '16px',
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Complete Your Payment
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Secure transaction via Razorpay Payment Gateway
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Payment Summary */}
              <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center">
                    <FiShield className="h-8 w-8 mr-2" />
                    <span className="text-xl font-bold">Secure Payment</span>
                  </div>
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {paymentData.status.toUpperCase()}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
                  <div className="h-1 w-20 bg-indigo-300 rounded mb-4"></div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Order ID</span>
                      <span className="font-mono">{paymentData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount</span>
                      <span className="font-bold">{formatAmount(paymentData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currency</span>
                      <span>{paymentData.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created At</span>
                      <span>{formatDate(paymentData.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Expiry</span>
                      <span>{paymentData.notes.payment_expiry}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-10 text-indigo-200">
                  <FiInfo className="mr-2" />
                  <p className="text-sm">Your payment details are securely encrypted</p>
                </div>
              </div>

              {/* Payment Gateway Info */}
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-6">
                  <FiCreditCard className="h-8 w-8 text-indigo-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Payment Gateway</h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Payment Processor</span>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 border-2 border-dashed rounded-xl mr-2"></div>
                      <span className="font-medium">Razorpay</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Due</span>
                      <span className="font-bold text-gray-900">{formatAmount(paymentData.amount_due)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="text-green-600">{formatAmount(paymentData.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attempts</span>
                      <span>{paymentData.attempts}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <FiClock className="text-yellow-500 mr-3 flex-shrink-0" />
                  <p className="text-yellow-700">
                    Your payment window will expire in {paymentData.notes.payment_expiry}.
                    Complete the payment before it expires.
                  </p>
                </div>

                <div className="text-center mt-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mr-2"></div>
                    <p className="text-gray-600">Waiting for Razorpay payment modal...</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    If the payment window doesn't open automatically, check your popup blocker settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-2">
              <a href="#" className="hover:text-indigo-600">Terms</a>
              <a href="#" className="hover:text-indigo-600">Privacy</a>
              <a href="#" className="hover:text-indigo-600">Security</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentInitialization;