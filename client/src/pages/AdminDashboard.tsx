import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, syncApi } from '../api';
import { 
  Package, 
  Calendar, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  Truck,
  AlertCircle,
  Loader,
  Download,
  Plus,
  X,
  Search
} from 'lucide-react';
import type { Pickup } from '../types';

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [searchReference, setSearchReference] = useState<string>('');
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [viewingPickup, setViewingPickup] = useState<Pickup | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPickup, setNewPickup] = useState({
    referenceNumber: '',
    company: '',
    scheduledDate: '',
    goodsDescription: '',
    quantity: '',
    pickupLocation: '',
    imageUrl: '',
    notes: '',
  });

  // Fetch pickups based on date selection
  const { data: pickups = [], isLoading, refetch } = useQuery<Pickup[]>({
    queryKey: ['pickups', selectedDate, customDate],
    queryFn: () => {
      if (selectedDate === 'today') {
        return adminApi.getTodayPickups();
      } else if (selectedDate === 'custom' && customDate) {
        return adminApi.getAllPickups({ date: customDate });
      } else {
        return adminApi.getAllPickups();
      }
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: () => syncApi.syncOutlook(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPickups'] });
    },
  });

  // Create pickup mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof newPickup) => adminApi.createPickup({
      ...data,
      quantity: data.quantity ? parseInt(data.quantity) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPickups'] });
      setShowCreateModal(false);
      setNewPickup({
        referenceNumber: '',
        company: '',
        scheduledDate: '',
        goodsDescription: '',
        quantity: '',
        pickupLocation: '',
        imageUrl: '',
        notes: '',
      });
    },
  });

  // Confirm loading mutation
  const confirmMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; notes?: string } }) =>
      adminApi.confirmLoading(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPickups'] });
      setSelectedPickup(null);
      setQuantity('');
      setNotes('');
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPickup.referenceNumber && newPickup.company && newPickup.scheduledDate && newPickup.goodsDescription) {
      createMutation.mutate(newPickup);
    }
  };

  const handleConfirmLoading = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPickup && quantity) {
      confirmMutation.mutate({
        id: selectedPickup.id,
        data: {
          quantity: parseInt(quantity),
          notes: notes || undefined,
        },
      });
    }
  };

  // Filter pickups by status and search reference
  const filteredPickups = pickups
    .filter((p: Pickup) => filterStatus === 'all' || p.status === filterStatus)
    .filter((p: Pickup) => {
      if (!searchReference.trim()) return true;
      return p.referenceNumber.toLowerCase().includes(searchReference.toLowerCase().trim());
    });

  // Calculate statistics
  const stats = {
    total: pickups.length,
    pending: pickups.filter((p: Pickup) => p.status === 'PENDING').length,
    loading: pickups.filter((p: Pickup) => p.status === 'LOADING').length,
    loaded: pickups.filter((p: Pickup) => p.status === 'LOADED').length,
    completed: pickups.filter((p: Pickup) => p.status === 'COMPLETED').length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      LOADING: 'bg-blue-100 text-blue-800',
      LOADED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Actions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {selectedDate === 'today' ? "Today's Pickups" : 
               selectedDate === 'custom' && customDate ? `Pickups for ${new Date(customDate).toLocaleDateString()}` :
               'All Pickups'}
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <Plus className="w-5 h-5" />
              Create Pickup
            </button>
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="btn-secondary flex items-center gap-2 flex-1 sm:flex-initial"
            >
              {syncMutation.isPending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Sync Outlook
                </>
              )}
            </button>
            <button
              onClick={() => refetch()}
              className="btn-secondary flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {syncMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Synced {syncMutation.data.syncedCount} pickups from Outlook
          </div>
        )}

        {syncMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ✗ Sync failed: {(syncMutation.error as any)?.response?.data?.error || 'Unknown error'}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-white" style={{ background: 'linear-gradient(to bottom right, rgb(59 130 246), rgb(37 99 235))' }}>
          <p className="text-sm opacity-90">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="card text-white" style={{ background: 'linear-gradient(to bottom right, rgb(234 179 8), rgb(202 138 4))' }}>
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="card text-white relative" style={{ background: 'linear-gradient(to bottom right, rgb(99 102 241), rgb(79 70 229))' }}>
          <p className="text-sm opacity-90">Loading</p>
          <p className="text-3xl font-bold">{stats.loading}</p>
          {stats.loading > 0 && (
            <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )}
        </div>
        <div className="card text-white" style={{ background: 'linear-gradient(to bottom right, rgb(34 197 94), rgb(22 163 74))' }}>
          <p className="text-sm opacity-90">Loaded</p>
          <p className="text-3xl font-bold">{stats.loaded}</p>
        </div>
        <div className="card text-white col-span-2 md:col-span-1" style={{ background: 'linear-gradient(to bottom right, rgb(107 114 128), rgb(75 85 99))' }}>
          <p className="text-sm opacity-90">Completed</p>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Date & Search Filters */}
      <div className="card space-y-4">
        {/* Date Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Date:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedDate('today'); setCustomDate(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDate === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDate === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Dates
            </button>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setSelectedDate('custom');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Search by Reference */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Search:</span>
          </div>
          <input
            type="text"
            value={searchReference}
            onChange={(e) => setSearchReference(e.target.value)}
            placeholder="Search by reference number..."
            className="input-field max-w-md"
          />
        </div>

        {/* Status Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'LOADING', 'LOADED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {searchReference && (
          <div className="text-sm text-gray-600 pt-2 border-t">
            Found <span className="font-semibold">{filteredPickups.length}</span> pickup(s) matching "{searchReference}"
          </div>
        )}
      </div>

      {/* Pickups List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Pickups {filterStatus !== 'all' && `(${filterStatus})`}
          </h2>
          <span className="text-sm text-gray-600">
            Showing {filteredPickups.length} of {pickups.length} pickup(s)
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredPickups.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No pickups found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPickups.map((pickup) => (
              <div
                key={pickup.id}
                onClick={() => setViewingPickup(pickup)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg text-gray-800">
                        {pickup.referenceNumber}
                      </span>
                      <span className={`status-badge ${getStatusBadge(pickup.status)}`}>
                        {pickup.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{pickup.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(pickup.scheduledDate)}</span>
                      </div>
                      {pickup.truckPlate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Truck className="w-4 h-4" />
                          <span>{pickup.truckPlate}</span>
                          {pickup.trailerNumber && <span>+ {pickup.trailerNumber}</span>}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <strong>Goods:</strong> {pickup.goodsDescription}
                    </div>
                  </div>

                  {pickup.status === 'LOADING' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPickup(pickup);
                      }}
                      className="btn-primary whitespace-nowrap flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Complete Loading
                    </button>
                  )}

                  {pickup.status === 'COMPLETED' && pickup.pdfPath && (
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="btn-secondary whitespace-nowrap flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Pickup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card max-w-md w-full my-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Create New Pickup</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reference Number *
                </label>
                <input
                  type="text"
                  value={newPickup.referenceNumber}
                  onChange={(e) => setNewPickup({ ...newPickup, referenceNumber: e.target.value.toUpperCase() })}
                  placeholder="REF-12345"
                  className="input-field uppercase"
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={newPickup.company}
                  onChange={(e) => setNewPickup({ ...newPickup, company: e.target.value })}
                  placeholder="Company name"
                  className="input-field"
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Date *
                </label>
                <input
                  type="datetime-local"
                  value={newPickup.scheduledDate}
                  onChange={(e) => setNewPickup({ ...newPickup, scheduledDate: e.target.value })}
                  className="input-field"
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Goods Description *
                </label>
                <input
                  type="text"
                  value={newPickup.goodsDescription}
                  onChange={(e) => setNewPickup({ ...newPickup, goodsDescription: e.target.value })}
                  placeholder="Description of goods"
                  className="input-field"
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Quantity (Optional)
                </label>
                <input
                  type="number"
                  value={newPickup.quantity}
                  onChange={(e) => setNewPickup({ ...newPickup, quantity: e.target.value })}
                  placeholder="0"
                  className="input-field"
                  min="0"
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  value={newPickup.pickupLocation}
                  onChange={(e) => setNewPickup({ ...newPickup, pickupLocation: e.target.value })}
                  placeholder="e.g., Warehouse A, Gate 3"
                  className="input-field"
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewPickup({ ...newPickup, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="input-field"
                  disabled={createMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-1">Upload JPG, PNG, or other image file</p>
                {newPickup.imageUrl && (
                  <img src={newPickup.imageUrl} alt="Preview" className="mt-2 h-32 w-auto rounded border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newPickup.notes}
                  onChange={(e) => setNewPickup({ ...newPickup, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="input-field"
                  rows={3}
                  disabled={createMutation.isPending}
                />
              </div>

              {createMutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{(createMutation.error as any)?.response?.data?.error || 'Failed to create pickup'}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Loading Modal */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Complete Loading & Generate Documents</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-semibold">{selectedPickup.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-semibold">{selectedPickup.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Truck:</span>
                <span className="font-semibold">{selectedPickup.truckPlate}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmLoading} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Final Quantity *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="input-field"
                  required
                  min="1"
                  disabled={confirmMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  className="input-field"
                  rows={3}
                  disabled={confirmMutation.isPending}
                />
              </div>

              {confirmMutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{(confirmMutation.error as any)?.response?.data?.error || 'Failed to confirm loading'}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPickup(null);
                    setQuantity('');
                    setNotes('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={confirmMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmMutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {confirmMutation.isPending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Pickup Details Modal */}
      {viewingPickup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card max-w-2xl w-full my-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Pickup Details</h3>
              <button
                onClick={() => setViewingPickup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`status-badge ${
                  viewingPickup.status === 'PENDING' ? 'status-pending' :
                  viewingPickup.status === 'LOADING' ? 'status-reserved' :
                  viewingPickup.status === 'LOADED' ? 'status-loaded' :
                  'status-completed'
                }`}>
                  {viewingPickup.status}
                </span>
                <span className="text-gray-600">
                  {new Date(viewingPickup.scheduledDate).toLocaleString()}
                </span>
              </div>

              {/* Reference and Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Reference Number</label>
                  <p className="text-lg font-mono">{viewingPickup.referenceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Company</label>
                  <p className="text-lg">{viewingPickup.company}</p>
                </div>
              </div>

              {/* Goods Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Goods Description</label>
                <p className="text-gray-800">{viewingPickup.goodsDescription}</p>
              </div>

              {/* Quantity */}
              {viewingPickup.quantity && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <p className="text-gray-800">{viewingPickup.quantity} units</p>
                </div>
              )}

              {/* Pickup Location */}
              {viewingPickup.pickupLocation && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Pickup Location</label>
                  <p className="text-gray-800">{viewingPickup.pickupLocation}</p>
                </div>
              )}

              {/* Image */}
              {viewingPickup.imageUrl && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Image</label>
                  <img 
                    src={viewingPickup.imageUrl} 
                    alt="Pickup goods" 
                    className="max-w-full h-auto rounded-lg border shadow-sm"
                  />
                </div>
              )}

              {/* Driver Information */}
              {viewingPickup.driverName && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Driver Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Driver Name</label>
                      <p className="text-gray-800">{viewingPickup.driverName}</p>
                    </div>
                    {viewingPickup.driverCompany && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Driver Company</label>
                        <p className="text-gray-800">{viewingPickup.driverCompany}</p>
                      </div>
                    )}
                  </div>
                  {viewingPickup.truckPlate && (
                    <div className="mt-3">
                      <label className="text-sm font-semibold text-gray-700">Truck Plate</label>
                      <p className="text-gray-800">
                        {viewingPickup.truckPlate}
                        {viewingPickup.trailerNumber && ` + Trailer ${viewingPickup.trailerNumber}`}
                      </p>
                    </div>
                  )}
                  {viewingPickup.destination && (
                    <div className="mt-3">
                      <label className="text-sm font-semibold text-gray-700">Destination</label>
                      <p className="text-gray-800">{viewingPickup.destination}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamps */}
              {(viewingPickup.loadingStartTime || viewingPickup.loadingEndTime) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Loading Times</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingPickup.loadingStartTime && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Started</label>
                        <p className="text-gray-800">{new Date(viewingPickup.loadingStartTime).toLocaleString()}</p>
                      </div>
                    )}
                    {viewingPickup.loadingEndTime && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Completed</label>
                        <p className="text-gray-800">{new Date(viewingPickup.loadingEndTime).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingPickup.notes && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Notes</label>
                  <p className="text-gray-800 whitespace-pre-wrap">{viewingPickup.notes}</p>
                </div>
              )}

              {/* PDF Download */}
              {viewingPickup.pdfPath && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Documents Available
                  </h4>
                  <a 
                    href={`http://localhost:3000${viewingPickup.pdfPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    📄 View/Download Rahtikirja PDF
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {viewingPickup.status === 'LOADING' && (
                  <button
                    onClick={() => {
                      setSelectedPickup(viewingPickup);
                      setViewingPickup(null);
                    }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete Loading
                  </button>
                )}
                <button
                  onClick={() => setViewingPickup(null)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
