import React, { useState, useEffect, useMemo } from 'react';
import { Users, CheckCircle, XCircle, Edit, Trash2, Shield, UserCheck, UserX, Eye, X } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { userAPI } from '../services/api';
import { formatPrice } from '../utils/currencyFormatter';
import { printCombinedBill } from '../utils/printUtils';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, customer, employee, unverified
  const [editingUser, setEditingUser] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [userOrdersData, setUserOrdersData] = useState(null);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);
  const [userOrdersError, setUserOrdersError] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  useEffect(() => {
    // Add a small delay to prevent rapid API calls
    const timer = setTimeout(() => {
      fetchUsers();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllWithTotals();
      setUsers(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      setUpdateLoading(true);
      await userAPI.update(userId, updates);
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, ...updates } : user
      ));
      
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.delete(userId);
      
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUser = async (user) => {
    setViewingUser(user);
    setUserOrdersData(null);
    setUserOrdersError('');
    setSelectedOrderIds([]);
    setUserOrdersLoading(true);

    try {
      const response = await userAPI.getOrders(user._id);
      setUserOrdersData(response.data.data);
    } catch (err) {
      setUserOrdersError(err.response?.data?.message || 'Failed to load user orders');
    } finally {
      setUserOrdersLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewingUser(null);
    setUserOrdersData(null);
    setUserOrdersError('');
    setSelectedOrderIds([]);
    setUserOrdersLoading(false);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) => (
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    ));
  };

  const toggleSelectAllOrders = () => {
    if (!userOrdersData?.orders?.length) {
      setSelectedOrderIds([]);
      return;
    }

    if (selectedOrderIds.length === userOrdersData.orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(userOrdersData.orders.map((order) => order._id));
    }
  };

  const handlePrintCombinedBill = () => {
    if (!userOrdersData || selectedOrderIds.length === 0) return;
    const orders = userOrdersData.orders.filter((order) => selectedOrderIds.includes(order._id));

    printCombinedBill({
      customer: userOrdersData.user || viewingUser,
      orders,
      accountSummary: userOrdersData.summary || {}
    });
  };

  const selectedOrders = useMemo(() => {
    if (!userOrdersData?.orders) return [];
    if (selectedOrderIds.length === 0) return [];
    return userOrdersData.orders.filter((order) => selectedOrderIds.includes(order._id));
  }, [userOrdersData, selectedOrderIds]);

  const selectedTotal = useMemo(() => {
    if (selectedOrders.length === 0) return 0;
    return selectedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [selectedOrders]);

  const aggregatedSelectedItems = useMemo(() => {
    if (!selectedOrders.length) return [];
    const itemMap = new Map();
    selectedOrders.forEach((order) => {
      (order.items || []).forEach((item, index) => {
        const key = `${item?.name || `Item-${index}`}|${item?.price || 0}`;
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: item?.name || `Item ${itemMap.size + 1}`,
            qty: 0,
            total: 0
          });
        }
        const entry = itemMap.get(key);
        const qty = item?.qty ?? item?.quantity ?? 0;
        const total = item?.total ?? (item?.price || 0) * qty;
        entry.qty += qty || 0;
        entry.total += total || 0;
      });
    });
    return Array.from(itemMap.values());
  }, [selectedOrders]);

  const filteredUsers = users.filter(user => {
    switch (filter) {
      case 'customer':
        return user.role === 'customer';
      case 'employee':
        return user.role === 'employee';
      case 'unverified':
        return !user.isVerified;
      default:
        return true;
    }
  });

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    employees: users.filter(u => u.role === 'employee').length,
    unverified: users.filter(u => !u.isVerified).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage customers and employees, verify accounts, and control access
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.customers}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.employees}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <UserX className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Unverified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unverified}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2 p-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Users ({stats.total})
            </button>
            <button
              onClick={() => setFilter('customer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'customer'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Customers ({stats.customers})
            </button>
            <button
              onClick={() => setFilter('employee')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'employee'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Employees ({stats.employees})
            </button>
            <button
              onClick={() => setFilter('unverified')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unverified'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Unverified ({stats.unverified})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </div>
                        {user.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'employee'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role === 'employee' ? 'Employee' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.isVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          user.isVerified 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(user.totalSpent || 0)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.orderCount || 0} orders
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="View orders & billing"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit User: {editingUser.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  >
                    <option value="customer">Customer</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={editingUser.isVerified}
                    onChange={(e) => setEditingUser({...editingUser, isVerified: e.target.checked})}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 dark:border-gray-600"
                  />
                  <label htmlFor="isVerified" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Verified Account
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({...editingUser, isActive: e.target.checked})}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 dark:border-gray-600"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Account
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(editingUser._id, {
                    role: editingUser.role,
                    isVerified: editingUser.isVerified,
                    isActive: editingUser.isActive
                  })}
                  disabled={updateLoading}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {viewingUser.name} ({viewingUser.role === 'employee' ? 'Employee' : 'Customer'})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {viewingUser.phone}{viewingUser.email ? ` • ${viewingUser.email}` : ''}
                  </p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-90px)] px-6 py-4">
                {userOrdersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="loading-spinner w-8 h-8" />
                  </div>
                ) : userOrdersError ? (
                  <div className="message error">
                    <p>{userOrdersError}</p>
                  </div>
                ) : userOrdersData ? (
                  (() => {
                    const summary = userOrdersData.summary || {};
                    const orders = userOrdersData.orders || [];
                    const ledgers = userOrdersData.ledgers || [];

                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="card p-4 bg-gradient-to-r from-orange-100 via-orange-50 to-transparent dark:from-orange-500/10 dark:via-orange-500/5 dark:to-transparent border border-orange-200 dark:border-orange-500/20 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">
                              Total Orders Value
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                              {formatPrice(summary.totalOrdersAmount || 0)}
                            </p>
                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-white/70 dark:bg-gray-800/60 rounded-full text-xs font-medium text-orange-700 dark:text-orange-200 shadow-sm">
                              {summary.orderCount ?? orders.length} orders
                            </div>
                          </div>
                          <div className="card p-4 bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent dark:from-emerald-500/10 dark:via-emerald-500/5 dark:to-transparent border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                              Total Paid
                            </p>
                            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300 mt-2">
                              {formatPrice(summary.totalPaymentsAmount || 0)}
                            </p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-200 mt-2">
                              Includes all recorded settlements
                            </p>
                          </div>
                          <div className="card p-4 bg-gradient-to-r from-red-100 via-red-50 to-transparent dark:from-red-500/10 dark:via-red-500/5 dark:to-transparent border border-red-200 dark:border-red-500/20 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
                              Outstanding Balance
                            </p>
                            <p className="text-2xl font-semibold text-red-600 dark:text-red-300 mt-2">
                              {formatPrice(summary.outstandingBalance || 0)}
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-200 mt-2">
                              Total due after recorded payments
                            </p>
                          </div>
                        </div>

                        <div className="card">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                              Ledger Summary
                            </h4>
                          </div>
                          {ledgers.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                              No ledger history available for this user.
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {ledgers.map((ledger) => (
                                <div key={ledger._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {ledger.accountType === 'employee'
                                        ? `Cycle: ${ledger.periodMonth}/${ledger.periodYear}`
                                        : 'Customer Ledger'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Status: {ledger.status} • Updated {new Date(ledger.updatedAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-6">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total</p>
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatPrice(ledger.totalOrdersAmount || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Paid</p>
                                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        {formatPrice(ledger.totalPaymentsAmount || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Balance</p>
                                      <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                        {formatPrice(ledger.balance || 0)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="card">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                                Orders ({orders.length})
                              </h4>
                              <div className="flex items-center flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                                  Selected {selectedOrderIds.length}
                                </span>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                  {formatPrice(selectedTotal)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  onChange={toggleSelectAllOrders}
                                  checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                                />
                                Select All
                              </label>
                              <button
                                type="button"
                                onClick={handlePrintCombinedBill}
                                disabled={selectedOrderIds.length === 0}
                                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Print Combined Bill
                              </button>
                            </div>
                          </div>
                          {orders.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                              No orders found for this user.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Select
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Order
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Type
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Total
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Created
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                  {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <td className="px-4 py-3">
                                        <input
                                          type="checkbox"
                                          checked={selectedOrderIds.includes(order._id)}
                                          onChange={() => toggleOrderSelection(order._id)}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-gray-900 dark:text-white font-medium">
                                          {order.orderNumber || order._id.slice(-6)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">
                                        {order.pricingTier || 'standard'}
                                      </td>
                                      <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">
                                        {formatPrice(order.total || 0)}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                          {order.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {new Date(order.createdAt).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {selectedOrders.length > 0 && (
                          <div className="card">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                                Selected Items Overview
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Automatically aggregated across the chosen orders to preview the combined bill.
                              </p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Item
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Quantity
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                  {aggregatedSelectedItems.map((item, index) => (
                                    <tr key={`${item.name}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                        {item.name}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {item.qty}
                                      </td>
                                      <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">
                                        {formatPrice(item.total)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    Unable to load user billing details.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
