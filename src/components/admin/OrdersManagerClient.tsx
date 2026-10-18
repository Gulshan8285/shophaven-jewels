'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Printer, 
  ArrowUpDown,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface AdminOrderType {
  id: string;
  orderNumber: string;
  createdAt: string | Date;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
  cancelReason?: string | null;
  shippingAddressSnapshot: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  items: {
    id: string;
    title: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    image?: string | null;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
  shipments: {
    id: string;
    courierName?: string | null;
    trackingNumber?: string | null;
    status: string;
  }[];
}

export default function OrdersManagerClient({ initialOrders }: { initialOrders: AdminOrderType[] }) {
  const [orders, setOrders] = useState<AdminOrderType[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderType | null>(null);

  // Status transition modals
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('Delhivery Surface');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation before dispatch');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch =
      search === '' ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.user.name.toLowerCase().includes(search.toLowerCase()) ||
      order.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (order.user.phone && order.user.phone.includes(search));
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (newStatus: string, extraData: Record<string, string> = {}) => {
    if (!selectedOrder) return;
    setStatusUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      });

      if (res.ok) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === selectedOrder.id) {
              return {
                ...o,
                status: newStatus,
                cancelReason: extraData.cancelReason || o.cancelReason,
                shipments: extraData.trackingNumber
                  ? [
                      {
                        id: o.shipments[0]?.id || 'new',
                        courierName: extraData.courierName || o.shipments[0]?.courierName,
                        trackingNumber: extraData.trackingNumber || o.shipments[0]?.trackingNumber,
                        status: newStatus === 'SHIPPED' ? 'IN_TRANSIT' : 'MANIFESTED',
                      },
                    ]
                  : o.shipments,
              };
            }
            return o;
          })
        );

        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus, ...extraData } : null
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(false);
      setDispatchModalOpen(false);
      setCancelModalOpen(false);
    }
  };

  const parseAddress = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filters and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search by Order #, Customer, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-semibold">
          {['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-red-800 text-white font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total (INR)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Shipment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No orders match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const shipment = ord.shipments[0];

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{ord.user.name}</p>
                        <p className="text-[11px] text-stone-500">{ord.user.email}</p>
                        {ord.user.phone && <p className="text-[10px] text-stone-400 font-mono">{ord.user.phone}</p>}
                      </td>
                      <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-stone-900">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-stone-100 text-stone-700">
                          {ord.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : ord.status === 'SHIPPED'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-stone-500">
                        {shipment?.trackingNumber ? (
                          <div>
                            <span className="font-semibold text-stone-800">{shipment.courierName}</span>
                            <span className="block font-mono text-[10px] text-stone-400">{shipment.trackingNumber}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] shadow-2xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over / Modal for Order Management */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Order Details</span>
                <h3 className="text-lg font-extrabold text-stone-900 font-mono">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Workflow Action Bar */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Update Order Lifecycle:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Confirm Order
                  </Button>
                )}

                {selectedOrder.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus('PACKED')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    Mark as Packed
                  </Button>
                )}

                {(selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PACKED') && (
                  <Button
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => {
                      setTrackingNumber(`DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                      setDispatchModalOpen(true);
                    }}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1.5" /> Dispatch / Ship Order
                  </Button>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <Button
                    size="sm"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark Delivered
                  </Button>
                )}

                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={statusUpdating}
                    onClick={() => setCancelModalOpen(true)}
                    className="font-bold ml-auto"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Customer & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
                <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px]">Customer Contact</span>
                <p className="font-bold text-stone-900 text-sm">{selectedOrder.user.name}</p>
                <p className="text-stone-600">{selectedOrder.user.email}</p>
                <p className="font-mono text-stone-700">{selectedOrder.user.phone || 'No phone recorded'}</p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1">
                <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px]">Delivery Address</span>
                {(() => {
                  const addr = parseAddress(selectedOrder.shippingAddressSnapshot);
                  if (!addr) return <p className="text-stone-400">Snapshot unavailable</p>;
                  return (
                    <div className="text-stone-700">
                      <p className="font-semibold text-stone-900">{addr.fullName}</p>
                      <p>{addr.streetAddress}</p>
                      <p>{addr.city}, {addr.state} - <strong>{addr.postalCode}</strong></p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                Products Ordered ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-10 h-12 object-cover rounded bg-stone-100" />
                      )}
                      <div>
                        <p className="font-bold text-stone-900">{item.title}</p>
                        <p className="text-[11px] text-stone-500">
                          SKU: {item.sku} {item.size ? `• Size: ${item.size}` : ''}
                        </p>
                        <a
                          href={`https://www.meesho.com/all-jewellery/pl/40m1?q=${encodeURIComponent(item.title.split(' ').slice(0, 4).join(' '))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-2 py-0.5 rounded shadow-2xs transition-colors"
                        >
                          <ExternalLink className="w-2.5 h-2.5 text-pink-600" />
                          <span>Order / Source on Meesho ↗</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900">{formatPrice(item.total)}</span>
                      <span className="block text-[10px] text-stone-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount Applied:</span>
                  <span>- {formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatPrice(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount:</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Invoice
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Dispatch / Courier Details Modal */}
      {dispatchModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-stone-900">
              Dispatch Order #{selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-stone-500">
              Enter courier partner and consignment AWB number to notify the customer.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Courier Partner</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-stone-300 px-3 text-xs font-medium focus:outline-none focus:border-red-800"
                >
                  <option value="Delhivery Surface">Delhivery Surface</option>
                  <option value="BlueDart Express">BlueDart Express</option>
                  <option value="Ekart Logistics">Ekart Logistics</option>
                  <option value="Shadowfax">Shadowfax</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">AWB / Consignment Tracking Number</label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DEL-9876543210"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDispatchModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={statusUpdating || !trackingNumber.trim()}
                onClick={() => handleUpdateStatus('SHIPPED', { courierName, trackingNumber })}
                className="bg-red-800 hover:bg-red-900 text-white font-bold"
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Cancel Order & Restore Stock</span>
            </div>
            <p className="text-xs text-stone-600">
              Cancelling will automatically restore product inventory levels in the database.
            </p>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Cancellation Reason *</label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation"
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
                Keep Order
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={statusUpdating || !cancelReason.trim()}
                onClick={() => handleUpdateStatus('CANCELLED', { cancelReason })}
                className="font-bold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
