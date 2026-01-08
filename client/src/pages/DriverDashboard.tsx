import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { driverApi } from '../api';
import { Search, Truck, Package, Calendar, CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';
import type { Pickup } from '../types';

const DriverDashboard: React.FC = () => {
  const [step, setStep] = useState<'search' | 'verify' | 'reserve' | 'success'>('search');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [truckPlate, setTruckPlate] = useState('');
  const [trailerNumber, setTrailerNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverCompany, setDriverCompany] = useState('');
  const [destination, setDestination] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [foundPickup, setFoundPickup] = useState<Pickup | null>(null);
  const [reservedPickup, setReservedPickup] = useState<Pickup | null>(null);

  // Verify reference mutation
  const verifyMutation = useMutation({
    mutationFn: (ref: string) => driverApi.verifyReference(ref),
    onSuccess: (data) => {
      if (data.exists && data.pickup) {
        setFoundPickup(data.pickup);
        // Check if already reserved by this driver
        if (data.pickup.status === 'RESERVED' || data.pickup.status === 'LOADING' || data.pickup.status === 'LOADED' || data.pickup.status === 'COMPLETED') {
          setReservedPickup(data.pickup);
          setStep('success');
        } else {
          setStep('verify');
        }
      }
    },
  });

  // Reserve pickup mutation
  const reserveMutation = useMutation({
    mutationFn: () => driverApi.reservePickup({
      referenceNumber,
      truckPlate,
      trailerNumber: trailerNumber || undefined,
      driverName,
      driverCompany,
      destination,
      notes: additionalNotes || undefined,
    }),
    onSuccess: (data) => {
      setReservedPickup(data);
      setStep('success');
    },
  });

  // Start loading mutation
  const startLoadingMutation = useMutation({
    mutationFn: () => driverApi.startLoading(reservedPickup!.id),
    onSuccess: (data) => {
      setReservedPickup(data);
    },
  });

  // Confirm loaded mutation
  const confirmLoadedMutation = useMutation({
    mutationFn: () => driverApi.confirmLoaded(reservedPickup!.id),
    onSuccess: (data) => {
      setReservedPickup(data.pickup);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceNumber.trim()) {
      verifyMutation.mutate(referenceNumber.trim().toUpperCase());
    }
  };

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (truckPlate.trim()) {
      reserveMutation.mutate();
    }
  };

  const handleReset = () => {
    setStep('search');
    setReferenceNumber('');
    setTruckPlate('');
    setTrailerNumber('');
    setDriverName('');
    setDriverCompany('');
    setDestination('');
    setAdditionalNotes('');
    setFoundPickup(null);
    setReservedPickup(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step 1: Search for Pickup */}
      {step === 'search' && (
        <div className="card animate-fade-in">
          <div className="text-center mb-8">
            <p className="text-gray-600">Enter your reference number to get started</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                placeholder="REF-12345"
                className="input-field uppercase"
                required
                disabled={verifyMutation.isPending}
              />
            </div>

            {verifyMutation.isError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  {(verifyMutation.error as any)?.response?.data?.error || 'Pickup not found or not available today'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Pickup
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Verify Pickup Details */}
      {step === 'verify' && foundPickup && (
        <div className="card animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pickup Found!</h2>
            <p className="text-gray-600">Please verify the details and enter your truck information</p>
          </div>

          {/* Pickup Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            {foundPickup.imageUrl ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Product Image:</p>
                <img 
                  src={foundPickup.imageUrl} 
                  alt="Goods" 
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-300 bg-white"
                  onError={(e) => {
                    console.error('Image failed to load:', foundPickup.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-sm text-yellow-800">No product image available</p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Reference</p>
                <p className="font-bold text-gray-800">{foundPickup.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Scheduled Date</p>
                <p className="font-semibold text-gray-800">{formatDate(foundPickup.scheduledDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold text-gray-800">{foundPickup.company}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Goods Description</p>
                <p className="font-semibold text-gray-800">{foundPickup.goodsDescription}</p>
              </div>
            </div>
            {foundPickup.quantity && (
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Expected Quantity</p>
                  <p className="font-semibold text-gray-800">{foundPickup.quantity} units</p>
                </div>
              </div>
            )}
            {foundPickup.pickupLocation && (
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">📍 Pickup Location</p>
                  <p className="font-semibold text-blue-600">{foundPickup.pickupLocation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Driver & Truck Info Form */}
          <form onSubmit={handleReserve} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 font-semibold">Please provide your information to start loading:</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Driver Name *
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Your full name"
                className="input-field"
                required
                disabled={reserveMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={driverCompany}
                onChange={(e) => setDriverCompany(e.target.value)}
                placeholder="Your company"
                className="input-field"
                required
                disabled={reserveMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Truck Plate Number *
              </label>
              <input
                type="text"
                value={truckPlate}
                onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                placeholder="ABC-123"
                className="input-field uppercase"
                required
                disabled={reserveMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trailer Number (Optional)
              </label>
              <input
                type="text"
                value={trailerNumber}
                onChange={(e) => setTrailerNumber(e.target.value.toUpperCase())}
                placeholder="TRL-456"
                className="input-field uppercase"
                disabled={reserveMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination *
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you delivering?"
                className="input-field"
                required
                disabled={reserveMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional notes..."
                className="input-field"
                rows={3}
                disabled={reserveMutation.isPending}
              />
            </div>

            {reserveMutation.isError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  {(reserveMutation.error as any)?.response?.data?.error || 'Failed to reserve pickup'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary flex-1"
                disabled={reserveMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reserveMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {reserveMutation.isPending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Arrive & Start Loading
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Success / Loading Status */}
      {step === 'success' && reservedPickup && (
        <div className="card animate-fade-in text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            reservedPickup.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {reservedPickup.status === 'COMPLETED' ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <Truck className="w-12 h-12 text-blue-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {reservedPickup.status === 'COMPLETED' ? 'Completed!' : 
             reservedPickup.status === 'LOADED' ? 'Loading Completed!' :
             'Loading Started!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {reservedPickup.status === 'COMPLETED' ? 'Your pickup is complete and documents are ready' :
             reservedPickup.status === 'LOADED' ? 'Admin has confirmed your loading' :
             'You are checked in and loading is in progress'}
          </p>

          {/* Show image if available */}
          {reservedPickup.imageUrl && (
            <div className="mb-4">
              <img 
                src={reservedPickup.imageUrl} 
                alt="Goods" 
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}

          <div className={`border rounded-lg p-6 mb-6 text-left ${
            reservedPickup.status === 'COMPLETED' ? 'bg-green-50 border-green-200' :
            reservedPickup.status === 'LOADED' ? 'bg-green-50 border-green-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              {reservedPickup.status === 'COMPLETED' || reservedPickup.status === 'LOADED' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
              Status: {reservedPickup.status}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-semibold">{reservedPickup.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Driver:</span>
                <span className="font-semibold">{reservedPickup.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-semibold">{reservedPickup.driverCompany}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Truck:</span>
                <span className="font-semibold">{reservedPickup.truckPlate}</span>
              </div>
              {reservedPickup.trailerNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trailer:</span>
                  <span className="font-semibold">{reservedPickup.trailerNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-semibold">{reservedPickup.destination}</span>
              </div>
              {reservedPickup.pickupLocation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">📍 Location:</span>
                  <span className="font-semibold text-blue-600">{reservedPickup.pickupLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons based on status */}
          {reservedPickup.status === 'RESERVED' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-blue-800 font-semibold mb-4">
                📍 Ready to start loading?
              </p>
              <p className="text-sm text-blue-700 mb-4">
                Proceed to: <strong>{reservedPickup.pickupLocation || 'See admin for location'}</strong>
              </p>
              <button
                onClick={() => startLoadingMutation.mutate()}
                disabled={startLoadingMutation.isPending}
                className="btn-primary w-full"
              >
                {startLoadingMutation.isPending ? 'Starting...' : '🚛 Arrive & Start Loading'}
              </button>
            </div>
          )}

          {reservedPickup.status === 'LOADING' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-yellow-800 font-semibold mb-4">
                🔄 Loading in progress...
              </p>
              <p className="text-sm text-yellow-700 mb-4">
                When you finish loading all goods, click below to generate your documents:
              </p>
              <button
                onClick={() => confirmLoadedMutation.mutate()}
                disabled={confirmLoadedMutation.isPending}
                className="btn-primary w-full"
              >
                {confirmLoadedMutation.isPending ? 'Generating...' : '✅ Confirm Loaded - Generate Rahtikirja'}
              </button>
            </div>
          )}

          {(reservedPickup.status === 'LOADED' || reservedPickup.status === 'COMPLETED') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-lg text-green-800 font-semibold mb-4 text-center">
                ✓ Loading Complete!
              </p>
              {reservedPickup.qrCode && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-green-700 text-center">
                    Show this QR code to security:
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img src={reservedPickup.qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  {reservedPickup.pdfPath && (
                    <a 
                      href={`http://localhost:3000${reservedPickup.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full max-w-xs"
                    >
                      📄 View/Download Rahtikirja PDF
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            className="btn-secondary w-full"
          >
            Done - Check Another Pickup
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
