import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export function RecentOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.recentOrders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleViewAll = () => {
    router.push('/admin/orders')
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
        }}>
          Recent Orders
        </h3>
        <button 
          onClick={handleViewAll}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}>
          View All
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
          No orders yet
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid #e5e7eb',
              }}>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280',
                }}>
                  Customer
                </th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280',
                }}>
                  Amount
                </th>
                <th style={{
                  padding: '0.75rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280',
                }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
                return (
                  <tr key={order.id} style={{
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}>
                      <div>{order.users?.name || 'Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      fontWeight: '500',
                    }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td style={{
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                    }}>
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
