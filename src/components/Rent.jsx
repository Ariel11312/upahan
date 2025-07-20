import { useState } from 'react';
import { Calendar, CreditCard, Users, MapPin, Shield, Zap, Clock } from 'lucide-react';

export default function BookingRequestPage() {
  const [selectedPayment, setSelectedPayment] = useState('instant');
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { id: 1, title: "Payment Plan", icon: CreditCard },
    { id: 2, title: "Confirmation", icon: Shield },
    { id: 3, title: "Complete", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
  

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Preview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  🏛️
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Elegant Parisian Hideaway
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Central Paris</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>2 guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Dec 12-14</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      ★ 4.9 Superhost
                    </div>
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      Instant Book
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              
              {/* Points Payment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    i
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Points-Based Payment System</h4>
                    <p className="text-blue-800 text-sm">
                      Base payment will not be deducted. Only points will be deducted from your account for this booking. 
                      We don't have online payment for this system.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setCurrentStep(2)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium mt-6 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Continue to Confirmation (Points Only)
              </button>
            </div>

            {/* Security Features */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Points Booking is Protected
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-green-800">
                <div>✓ 24/7 Customer Support</div>
                <div>✓ Secure Points Processing</div>
                <div>✓ Full Points Refund Protection</div>
                <div>✓ Host Verification</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>5,845 points × 2 nights</span>
                  <span>11,690 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>1,200 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees</span>
                  <span>308 pts</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Points Required</span>
                    <span className="text-indigo-600">13,198 pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <div className="text-center">
                  <div className="text-purple-600 font-medium text-sm">🔥 Limited Availability</div>
                  <div className="text-purple-800 text-xs mt-1">
                    Only 2 similar properties left for your dates
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="font-medium mb-3">Cancellation Policy</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>✓ Free cancellation before Dec 11</p>
                <p>✓ 50% refund if cancelled 48hrs before</p>
                <button className="text-indigo-600 hover:text-indigo-700 underline">
                  View full policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}