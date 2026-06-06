import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Smartphone, 
  QrCode, 
  Globe, 
  RefreshCw, 
  HelpCircle,
  Clock,
  Check,
  X,
  CreditCard as DebitCardIcon
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  customerName: string;
  customerMobile: string;
  onPaymentSuccess: (details: any) => void;
  onPaymentFailure: (errorMsg: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  paymentMethodId,
  paymentMethodName,
  customerName,
  customerMobile,
  onPaymentSuccess,
  onPaymentFailure
}: PaymentModalProps) {
  // Input fields state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(customerName || '');
  
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [netbankingUser, setNetbankingUser] = useState('');
  const [netbankingPass, setNetbankingPass] = useState('');

  // Execution states
  const [processingStage, setProcessingStage] = useState<'idle' | 'authorizing' | 'success' | 'failure'>('idle');
  const [stageMessage, setStageMessage] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [gatewayError, setGatewayError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Clean form errors when gateway changes
  useEffect(() => {
    setValidationError('');
    setGatewayError('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setUpiId('');
    setSelectedBank('');
    setNetbankingUser('');
    setNetbankingPass('');
    setShowOtpScreen(false);
    setProcessingStage('idle');
  }, [paymentMethodId]);

  if (!isOpen) return null;

  // Format Expiry dynamically: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 4) raw = raw.slice(0, 4);
    if (raw.length > 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Format Card Number dynamically: xxxx xxxx xxxx xxxx
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 16) raw = raw.slice(0, 16);
    const matches = raw.match(/.{1,4}/g);
    setCardNumber(matches ? matches.join(' ') : raw);
  };

  // Format CVV: max 3/4 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 4) setCardCvv(raw);
  };

  // Basic validation function before contacting payment network
  const validateForm = (): boolean => {
    setValidationError('');
    
    // Cards
    if (paymentMethodId === 'debit_cards' || paymentMethodId === 'cards') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15 || cleanNum.length > 16) {
        setValidationError('Please input a valid 15 or 16-digit debit/credit card number.');
        return false;
      }
      
      const expiryRule = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRule.test(cardExpiry)) {
        setValidationError('Invalid expiry format. Utilize MM/YY (Example: 10/28).');
        return false;
      }
      
      // Parse expiry month and year
      const [mStr, yStr] = cardExpiry.split('/');
      const month = parseInt(mStr, 10);
      const year = parseInt(`20${yStr}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        setValidationError('The input card expiry date has already lapsed.');
        return false;
      }

      if (cardCvv.length < 3) {
        setValidationError('Please input a valid 3-digit security code (CVV).');
        return false;
      }

      if (!cardName.trim()) {
        setValidationError('Cardholder signature name is required.');
        return false;
      }
    }

    // UPI
    if (['gpay', 'phonepe', 'bhim', 'upi'].includes(paymentMethodId)) {
      if (!upiId.trim() || !upiId.includes('@')) {
        setValidationError('Please write a proper UPI Virtual Payment Address (Example: pre-auth@okhdfcbank).');
        return false;
      }
    }

    // Net Banking
    if (paymentMethodId === 'netbanking') {
      if (!selectedBank) {
        setValidationError('Please choose a serving retail banking partner.');
        return false;
      }
      if (!netbankingUser.trim() || !netbankingPass.trim()) {
        setValidationError('Dynamic banking credentials cannot be left blank.');
        return false;
      }
    }

    return true;
  };

  // Launch simulated payment flow
  const handlePaymentSubmit = async (e: React.FormEvent, simulateSuccess = true) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessingStage('authorizing');
    setStageMessage('Establishing secure 256-bit SSL pipeline connection...');
    await delay(1000);

    if (paymentMethodId === 'debit_cards' || paymentMethodId === 'cards') {
      setStageMessage('Authenticating Mastercard/Visa SafePass network routing...');
      await delay(1200);
      // Trigger OTP authentication view
      setShowOtpScreen(true);
      setStageMessage('Verified 3D Secure protocol. Checking 6-digit banking OTP pass...');
      return;
    }

    // Direct simulation step for UPI / Netbanking
    setStageMessage(`Verifying sufficient funds with client banking branch via ${paymentMethodName}...`);
    await delay(1500);
    setStageMessage('Synchronizing order payload authorization...');
    await delay(800);

    triggerCompletion(simulateSuccess);
  };

  // Trigger simulated OTP process
  const handleVerifyOtp = async (e: React.FormEvent, simulateSuccess = true) => {
    e.preventDefault();
    if (otpValue.length < 4) {
      setValidationError('OTP verification pin must be 6 or 4 digits.');
      return;
    }

    setProcessingStage('authorizing');
    setStageMessage('Validating 3D Secure securePass with issuer database...');
    await delay(1200);
    
    setShowOtpScreen(false);
    triggerCompletion(simulateSuccess);
  };

  // Finalize payment state inside the database
  const triggerCompletion = async (success: boolean) => {
    setProcessingStage('authorizing');
    setValidationError('');
    setStageMessage('Synchronizing billing transaction database registers...');

    try {
      // Sync order payment status inside server
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: success ? 'Completed' : 'Failed',
          notes: success 
            ? `Verified success via ${paymentMethodName} gateway transaction at ${new Date().toISOString()}`
            : `Declined during credit gateway authentication phase.`,
          orderStatus: success ? 'Placed' : 'Cancelled'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (success) {
          setProcessingStage('success');
          setStageMessage('Payment approved successfully! Dispatched kitchen order receipt.');
          await delay(1500);
          onPaymentSuccess(data.order);
        } else {
          setProcessingStage('failure');
          setGatewayError('Transaction refused. Insufficient account credit or authentication lockout.');
          onPaymentFailure('Billing transaction failed on authorization gateway level.');
        }
      } else {
        setProcessingStage('failure');
        setGatewayError('Billing sync endpoint rejected payload. Server responded with an error.');
        onPaymentFailure('Payload synchronization failed.');
      }
    } catch (e) {
      setProcessingStage('failure');
      setGatewayError('Unable to route network protocols securely (Status 502 Gateway Connection Issue).');
      onPaymentFailure('Network connection failure during payment verification.');
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="fixed inset-0 bg-[#0c0404]/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      
      {/* Absolute Secure Badge floating */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-red-950/90 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
        <Lock className="w-3 h-3 text-emerald-500" /> Secure SSL 256-bit Encrypted Checkout
      </div>

      <AnimatePresence mode="wait">
        
        {/* Authorizing Animation Panel */}
        {processingStage === 'authorizing' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md bg-stone-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
          >
            <div className="relative w-20 h-20 mx-auto">
              <Loader2 className="w-20 h-20 text-orange-500 animate-spin absolute inset-0" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-neutral-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-black text-white text-lg tracking-wide uppercase">Processing Secure Payment</h3>
              <p className="text-neutral-400 text-xs font-mono max-w-xs mx-auto leading-relaxed">{stageMessage}</p>
            </div>

            <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-orange-600 animate-pulse w-3/4 duration-1000" />
            </div>

            <p className="text-[10px] text-neutral-500 font-sans">
              Please avoid clicking your back button, reloading the gateway, or navigating away from this billing terminal.
            </p>
          </motion.div>
        )}

        {/* Failed Transaction screen */}
        {processingStage === 'failure' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md bg-stone-900 border border-red-900/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-950 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-black text-rose-500 text-lg uppercase tracking-wider">Transaction Declined</h3>
              <p className="text-neutral-300 text-xs leading-relaxed max-w-xs mx-auto">
                {gatewayError || 'The financial network returned an error code. Check balance or credentials.'}
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setProcessingStage('idle')}
                className="flex-1 py-3 bg-red-950 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 hover:text-white transition duration-200 cursor-pointer"
              >
                🔄 Try Alternative Form
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-700 transition duration-200 cursor-pointer"
              >
                Close Gateway
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Interactive Input Terminal */}
        {processingStage === 'idle' && !showOtpScreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200"
          >
            {/* Header branding */}
            <div className="bg-[#800020] text-amber-300 p-6 flex justify-between items-center relative">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-black tracking-widest bg-amber-500 text-red-950 px-1.5 py-0.5 rounded leading-none">BHAGWATI PAY</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100 opacity-80">Terminal</span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-serif pt-1">
                  Secure checkout portal
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 text-amber-100 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Bill Info ribbon */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex justify-between items-center text-xs font-sans">
              <div>
                <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Tag Ticket ID</span>
                <span className="font-mono text-neutral-800 font-bold">TRK-{orderId}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Secure Amount due</span>
                <span className="text-sm font-black text-rose-800">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Main checkout layout */}
            <form onSubmit={(e) => handlePaymentSubmit(e, true)} className="p-6 space-y-4 text-left">
              
              {/* Payment Gateway Header Label */}
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">Method:</span>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded-md font-bold text-xs uppercase font-sans border flex items-center gap-1.5">
                  {paymentMethodId === 'debit_cards' && <CreditCard className="w-3.5 h-3.5 text-neutral-600" />}
                  {['gpay', 'phonepe', 'bhim'].includes(paymentMethodId) && <Smartphone className="w-3.5 h-3.5 text-orange-600" />}
                  {paymentMethodId === 'netbanking' && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                  {paymentMethodName}
                </span>
              </div>

              {/* Validation errors */}
              {validationError && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-[11px] font-bold text-red-800 leading-relaxed">
                  ⚠️ {validationError}
                </div>
              )}

              {/* CARD PAYMENT FORM */}
              {(paymentMethodId === 'debit_cards' || paymentMethodId === 'cards') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 placeholder-neutral-400"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-neutral-400 pointer-events-none">
                        <DebitCardIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 text-center placeholder-neutral-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">CVV Code</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 text-center placeholder-neutral-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">Cardholder Signature Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name as printed on plastic slab"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 placeholder-neutral-400"
                    />
                  </div>
                </div>
              )}

              {/* UPI PAYMENT FORM (Renders customized scan code + address field) */}
              {['gpay', 'phonepe', 'bhim', 'upi'].includes(paymentMethodId) && (
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60 text-center space-y-3">
                    <div className="w-36 h-36 bg-white border border-neutral-200 rounded-xl mx-auto flex flex-col items-center justify-center p-3.5 relative overflow-hidden group shadow-inner">
                      
                      {/* Animated Laser line for Scan effect */}
                      <div className="absolute left-0 right-0 h-0.5 bg-red-600 top-2 animate-bounce opacity-75" />
                      
                      {/* Stylized custom SVG QR Code to stay 100% real without loading broken URLs */}
                      <svg className="w-full h-full text-stone-800" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0,0h40v40H0V0z M10,10v20h20V10H10z M60,0h40v40H60V0z M70,10v20h20V10H70z M0,60h40v40H0V60z M10,70v20h20V70H10z M60,60h10v10H60V60z M80,60h10v10H80V60z M70,70h10v10H70V70z M90,70h10v10H90V70z M60,80h10v20H60V80z M80,80h20v10H80V80z M90,90h10v10H90V90z" />
                        <rect x="18" y="18" width="4" height="4" />
                        <rect x="78" y="18" width="4" height="4" />
                        <rect x="18" y="78" width="4" height="4" />
                        <rect x="48" y="12" width="4" height="20" />
                        <rect x="42" y="48" width="20" height="4" />
                        <rect x="12" y="48" width="20" height="4" />
                        <rect x="78" y="48" width="10" height="4" />
                        <rect x="48" y="78" width="4" height="10" />
                      </svg>
                      
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-rose-950 uppercase tracking-widest block">Scan Unified QR-Code</span>
                      <p className="text-[9px] text-neutral-400">Open GPay, PhonePe or any Indian BHIM UPI engine to scan Pune thali invoice securely</p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <span className="bg-white px-3.5 text-[9px] font-black text-neutral-400 uppercase tracking-widest relative z-10">Or Pay via UPI ID alias</span>
                    <hr className="absolute inset-0 border-t border-neutral-200" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">UPI ID Address</label>
                    <input
                      type="text"
                      placeholder="e.g., cellnumber@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 placeholder-neutral-400"
                    />
                  </div>
                </div>
              )}

              {/* NET BANKING FORM */}
              {paymentMethodId === 'netbanking' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">Choose Banking Partner</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 font-bold"
                    >
                      <option value="">-- Choose Serving Bank --</option>
                      <option value="sbi">State Bank of India (SBI)</option>
                      <option value="hdfc">HDFC Retail Bank</option>
                      <option value="icici">ICICI Bank Private</option>
                      <option value="axis">Axis Corporate Net Banking</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">Customer / User ID</label>
                    <input
                      type="text"
                      placeholder="Your retail bank login ID"
                      value={netbankingUser}
                      onChange={(e) => setNetbankingUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 placeholder-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">NetBanking Passcode</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={netbankingPass}
                      onChange={(e) => setNetbankingPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 focus:bg-white text-neutral-800 placeholder-neutral-400"
                    />
                  </div>
                </div>
              )}

              {/* Simulator Action Block Panel */}
              <div className="bg-amber-50 p-4 border border-amber-300/40 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-amber-200/75">
                  <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1">
                    🟢 Developer Sandbox Simulator Actions
                  </span>
                  <span className="text-[8px] tracking-wider px-1 bg-amber-200 border border-amber-300 text-amber-900 uppercase font-black rounded">
                    Test Mode Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handlePaymentSubmit(e, true)}
                    className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-serif font-black text-[10px] uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3 shrink-0" /> Pay (Succeed)
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePaymentSubmit(e, false)}
                    className="py-2.5 px-3 bg-rose-700 hover:bg-rose-800 text-white font-serif font-black text-[10px] uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3 shrink-0" /> Pay (Decline)
                  </button>
                </div>
              </div>

              {/* Secure authorization actions */}
              <button
                type="submit"
                className="w-full py-4 text-sm font-sans font-extrabold text-white bg-green-600 hover:bg-green-700 rounded-2xl flex items-center justify-center gap-2 transition hover:shadow-lg hover:shadow-green-500/10 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
                <span>Authorize & Clear ₹{totalAmount.toFixed(2)}</span>
              </button>
            </form>
          </motion.div>
        )}

        {/* 3D SECURE OTP CODE POPUP SCREEN */}
        {showOtpScreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 text-left"
          >
            <div className="bg-[#800020] text-amber-300 p-6 flex items-center gap-2 border-b">
              <Lock className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider">3D Secure VerifiedPass</h3>
                <span className="text-[9px] text-amber-200 opacity-90 block font-mono">Order Tag: TRK-{orderId}</span>
              </div>
            </div>

            <form onSubmit={(e) => handleVerifyOtp(e, true)} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-900 border border-amber-200/50 leading-relaxed">
                A verification passcode has been generated for your mobile or secure security token. Enter it below to conclude validation.
              </div>

              {validationError && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-[11px] font-bold text-red-800 leading-relaxed">
                  ⚠️ {validationError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-wider">6-Digit SMS PIN OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-3.5 text-center bg-neutral-50 border border-neutral-300 rounded-xl text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#800020] focus:bg-white text-neutral-800 placeholder-neutral-300"
                />
              </div>

              <div className="bg-amber-100 p-3.5 border border-amber-300/40 rounded-xl space-y-3">
                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest block">Sandbox SIM controls</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[9px] uppercase rounded-lg transition cursor-pointer flex items-center justify-center"
                  >
                    ✅ Correct PIN
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleVerifyOtp(e, false)}
                    className="py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[9px] uppercase rounded-lg transition cursor-pointer flex items-center justify-center"
                  >
                    ❌ Incorrect PIN
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#800020] hover:bg-red-950 font-bold text-xs text-white uppercase rounded-xl shadow transition duration-250 cursor-pointer text-center"
              >
                Conclude Transaction Authentication
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
