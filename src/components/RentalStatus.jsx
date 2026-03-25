import React, { useState } from 'react';
import { Clock, MapPin, Users, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PendingBookingsList = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      title: "Elegant Parisian Hideaway",
      location: "Central Paris",
      guests: 2,
      dates: "Dec 12-14",
      nights: 2,
      pointsPerNight: 5845,
      totalPoints: 13198,
      serviceFee: 1200,
      taxes: 308,
      rating: 4.9,
      status: "pending",
      submittedAt: "2 hours ago",
      hostResponse: "within 24 hours",
      instantBook: false
    },
    {
      id: 2,
      title: "Modern Tokyo Apartment",
      location: "Shibuya, Tokyo",
      guests: 3,
      dates: "Jan 5-8",
      nights: 3,
      pointsPerNight: 7200,
      totalPoints: 23940,
      serviceFee: 1500,
      taxes: 440,
      rating: 4.8,
      status: "confirmed",
      submittedAt: "1 day ago",
      hostResponse: "confirmed",
      instantBook: true
    },
    {
      id: 3,
      title: "Cozy Mountain Cabin",
      location: "Aspen, Colorado",
      guests: 4,
      dates: "Feb 15-18",
      nights: 3,
      pointsPerNight: 4200,
      totalPoints: 14760,
      serviceFee: 900,
      taxes: 360,
      rating: 4.7,
      status: "declined",
      submittedAt: "3 days ago",
      hostResponse: "declined",
      instantBook: false
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'declined': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatPoints = (points) => {
    return points.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
        <p className="text-gray-600">Track your reservation requests and confirmed stays</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{booking.title}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{booking.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{booking.dates}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">★ {booking.rating}</span>
                    {booking.instantBook && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                        Instant Book
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Total Points</div>
                  <div className="text-2xl font-bold text-blue-600">{formatPoints(booking.totalPoints)} pts</div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Points Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Points Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{formatPoints(booking.pointsPerNight)} × {booking.nights} nights</span>
                      <span>{formatPoints(booking.pointsPerNight * booking.nights)} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span>{formatPoints(booking.serviceFee)} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & fees</span>
                      <span>{formatPoints(booking.taxes)} pts</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">{formatPoints(booking.totalPoints)} pts</span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted</span>
                      <span>{booking.submittedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Host Response</span>
                      <span className={booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'declined' ? 'text-red-600' : 'text-yellow-600'}>
                        {booking.hostResponse}
                      </span>
                    </div>
                    {booking.status === 'confirmed' && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-green-800 font-medium">✓ Booking Confirmed</div>
                        <div className="text-green-700 text-xs mt-1">You'll receive confirmation details via email</div>
                      </div>
                    )}
                    {booking.status === 'pending' && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="text-yellow-800 font-medium">⏳ Awaiting Response</div>
                        <div className="text-yellow-700 text-xs mt-1">Host typically responds within 24 hours</div>
                      </div>
                    )}
                    {booking.status === 'declined' && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="text-red-800 font-medium">✗ Request Declined</div>
                        <div className="text-red-700 text-xs mt-1">Host is unavailable for these dates</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Protection Banner */}
            <div className="bg-green-50 border-t border-green-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Your Points Booking is Protected</span>
                </div>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  View Details
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs text-green-700">
                <div>✓ 24/7 Customer Support</div>
                <div>✓ Secure Points Processing</div>
                <div>✓ Full Points Refund Protection</div>
                <div>✓ Host Verification</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (hidden when bookings exist) */}
      {bookings.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Your booking requests will appear here once submitted</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Exploring
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingBookingsList;