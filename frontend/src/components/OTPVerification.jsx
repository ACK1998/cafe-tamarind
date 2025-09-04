import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const OTPVerification = ({ 
  phoneNumber, 
  onVerify, 
  onResend, 
  onBack, 
  isLoading = false,
  error = null,
  success = null 
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits are filled
    if (newOtp.every(digit => digit !== '') && index === 3) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setActiveIndex(3);
      inputRefs.current[3]?.focus();
    }
  };

  const handleSubmit = (otpString) => {
    if (otpString.length === 4 && onVerify) {
      onVerify(otpString);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCountdown(30);
    } catch (error) {
      console.error('Resend failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  const clearOtp = () => {
    setOtp(['', '', '', '']);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  const otpString = otp.join('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Phone
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            We've sent a 4-digit code to
          </p>
          <p className="text-orange-600 dark:text-orange-400 font-medium">
            {phoneNumber}
          </p>
        </div>

        {/* OTP Input */}
        <div className="card p-6 mb-6 animate-slide-in-left">
          <div className="flex justify-between items-center mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter 4-digit code
            </label>
            <button
              onClick={clearOtp}
              className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-sm flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex justify-between gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => setActiveIndex(index)}
                className={`otp-input text-center ${
                  activeIndex === index ? 'ring-2 ring-orange-500' : ''
                } ${digit ? 'filled' : ''}`}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="message error mb-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="message success mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit(otpString)}
            disabled={otpString.length !== 4 || isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner w-4 h-4"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify Code'
            )}
          </button>
        </div>

        {/* Resend Section */}
        <div className="card p-6 animate-slide-in-right">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Didn't receive the code?
            </p>
            
            {countdown > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="btn-outline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Checkout
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Having trouble? Contact support at{' '}
            <a href="tel:+91-1234567890" className="text-orange-500 hover:text-orange-600">
              +91-1234567890
            </a>
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Development Mode:</strong> Check the server console for the OTP code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
