const formatDateTime = (dateString) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const escapeHtml = (value) => {
  if (value == null) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildDocumentContent = (title, bodyContent) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        @page {
          margin: 12mm;
        }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 12px;
          color: #111;
          margin: 0;
        }
        .ticket-wrapper {
          padding: 12px 8px;
          max-width: 320px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
        }
        .header h1 {
          font-size: 16px;
          margin: 0 0 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header p {
          margin: 2px 0;
        }
        .meta {
          margin-bottom: 12px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        .items th {
          text-align: left;
          border-bottom: 1px dashed #111;
          padding: 4px 0;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .items td {
          padding: 4px 0;
          vertical-align: top;
        }
        .items td.qty {
          text-align: right;
          font-weight: 600;
          padding-left: 12px;
        }
        .items td.price {
          text-align: right;
          padding-left: 12px;
        }
        .subtotal,
        .total {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
        }
        .total {
          font-weight: 700;
          border-top: 1px dashed #111;
          padding-top: 6px;
          margin-top: 6px;
        }
        .footer {
          text-align: center;
          margin-top: 16px;
          font-size: 11px;
        }
        .section-title {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          margin: 12px 0 4px;
        }
        .instructions {
          background: #f6f6f6;
          border-radius: 4px;
          padding: 8px;
          white-space: pre-wrap;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="ticket-wrapper">
        ${bodyContent}
      </div>
    </body>
  </html>
`;

const printWithIframe = (documentContent) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const handlePrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Print failed:', err);
    } finally {
      setTimeout(cleanup, 500);
    }
  };

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    cleanup();
    return false;
  }

  doc.open();
  doc.write(documentContent);
  doc.close();

  iframe.onload = handlePrint;
  if (doc.readyState === 'complete') {
    setTimeout(handlePrint, 0);
  }

  iframe.contentWindow?.addEventListener('afterprint', cleanup);
  return true;
};

const openPrintWindow = (title, bodyContent) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Print is not available in this environment.');
    return false;
  }

  const documentContent = buildDocumentContent(title, bodyContent);
  const printWindow = window.open('', '_blank', 'width=480,height=640');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(documentContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      try {
        printWindow.print();
      } catch (err) {
        console.warn('Print dialog failed to open:', err);
      } finally {
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 400);
      }
    }, 100);

    return true;
  }

  return printWithIframe(documentContent);
};

const renderItemsRows = (items, includePrice = false) => {
  if (!Array.isArray(items)) {
    return '';
  }

  return items.map((item, index) => {
    const name = escapeHtml(item?.name || `Item ${index + 1}`);
    const quantity = item?.qty ?? item?.quantity ?? 0;
    const qty = Number.isFinite(quantity) ? quantity : 0;
    const price = item?.price ?? 0;
    const total = item?.total ?? price * qty;

    return `
      <tr>
        <td>${name}</td>
        <td class="qty">${qty}</td>
        ${includePrice ? `<td class="price">₹${Number(total || 0).toLocaleString('en-IN')}</td>` : ''}
      </tr>
    `;
  }).join('');
};

export const printKot = (order) => {
  if (!order) {
    return;
  }

  const content = `
    <div class="header">
      <h1>Kitchen Order Ticket</h1>
      <p>Cafe Tamarind</p>
    </div>
    <div class="meta">
      <div class="meta-row">
        <span>Order #:</span>
        <span>${escapeHtml(order.orderNumber || order._id || '')}</span>
      </div>
      <div class="meta-row">
        <span>Placed:</span>
        <span>${escapeHtml(formatDateTime(order.createdAt))}</span>
      </div>
      <div class="meta-row">
        <span>Customer:</span>
        <span>${escapeHtml(order.customerName || 'Guest')}</span>
      </div>
      <div class="meta-row">
        <span>Phone:</span>
        <span>${escapeHtml(order.customerPhone || '-')}</span>
      </div>
      ${order.mealTime ? `
        <div class="meta-row">
          <span>Meal:</span>
          <span>${escapeHtml(order.mealTime)}</span>
        </div>
      ` : ''}
    </div>
    <table class="items">
      <thead>
        <tr>
          <th>Item</th>
          <th class="qty">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${renderItemsRows(order.items)}
      </tbody>
    </table>
    ${order.specialInstructions ? `
      <div>
        <p class="section-title">Special Instructions</p>
        <div class="instructions">${escapeHtml(order.specialInstructions)}</div>
      </div>
    ` : ''}
    <div class="footer">
      <p>Prepared by Cafe Tamarind</p>
      <p>${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
    </div>
  `;

  openPrintWindow('Kitchen Order Ticket', content);
};

export const printBill = (order) => {
  if (!order) {
    return;
  }

  const subtotal = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + (item.total ?? (item.price || 0) * (item.qty || 0)), 0)
    : 0;

  const content = `
    <div class="header">
      <h1>Cafe Tamarind</h1>
      <p>Customer Bill</p>
    </div>
    <div class="meta">
      <div class="meta-row">
        <span>Bill #:</span>
        <span>${escapeHtml(order.orderNumber || order._id || '')}</span>
      </div>
      <div class="meta-row">
        <span>Date:</span>
        <span>${escapeHtml(formatDateTime(order.updatedAt || order.createdAt))}</span>
      </div>
      <div class="meta-row">
        <span>Customer:</span>
        <span>${escapeHtml(order.customerName || 'Guest')}</span>
      </div>
      <div class="meta-row">
        <span>Phone:</span>
        <span>${escapeHtml(order.customerPhone || '-')}</span>
      </div>
    </div>
    <table class="items">
      <thead>
        <tr>
          <th>Item</th>
          <th class="qty">Qty</th>
          <th class="price">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${renderItemsRows(order.items, true)}
      </tbody>
    </table>
    <div class="total">
      <span>Total</span>
      <span>₹${Number(subtotal || order.total || 0).toLocaleString('en-IN')}</span>
    </div>
    ${order.specialInstructions ? `
      <div>
        <p class="section-title">Notes</p>
        <div class="instructions">${escapeHtml(order.specialInstructions)}</div>
      </div>
    ` : ''}
    <div class="footer">
      <p>Thank you for dining with us!</p>
      <p>Please visit again</p>
    </div>
  `;

  openPrintWindow('Cafe Tamarind Bill', content);
};

export const printCombinedBill = ({ customer, orders = [], accountSummary = {} }) => {
  if (!customer || !Array.isArray(orders) || orders.length === 0) {
    return;
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstDate = sortedOrders[0]?.createdAt;
  const lastDate = sortedOrders[sortedOrders.length - 1]?.createdAt;

  const aggregatedItemsMap = new Map();
  let selectedTotal = 0;

  sortedOrders.forEach((order) => {
    selectedTotal += order.total || 0;
    (order.items || []).forEach((item, index) => {
      const key = `${item?.name || `Item-${index}`}|${item?.price || 0}`;
      if (!aggregatedItemsMap.has(key)) {
        aggregatedItemsMap.set(key, {
          name: item?.name || `Item ${aggregatedItemsMap.size + 1}`,
          qty: 0,
          total: 0
        });
      }
      const entry = aggregatedItemsMap.get(key);
      const qty = item?.qty ?? item?.quantity ?? 0;
      const total = item?.total ?? (item?.price || 0) * qty;
      entry.qty += qty || 0;
      entry.total += total || 0;
    });
  });

  const aggregatedRows = Array.from(aggregatedItemsMap.values()).map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="qty">${Number(item.qty || 0).toLocaleString('en-IN')}</td>
      <td class="price">₹${Number(item.total || 0).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const ordersRows = sortedOrders.map((order) => `
    <tr>
      <td>${escapeHtml(order.orderNumber || order._id || '')}</td>
      <td>${escapeHtml(order.pricingTier || 'standard')}</td>
      <td class="price">₹${Number(order.total || 0).toLocaleString('en-IN')}</td>
      <td>${escapeHtml(order.status || '')}</td>
      <td>${escapeHtml(formatDateTime(order.createdAt))}</td>
    </tr>
  `).join('');

  const totalOrdersAmount = accountSummary.totalOrdersAmount ?? selectedTotal;
  const totalPaymentsAmount = accountSummary.totalPaymentsAmount ?? 0;
  const outstandingBalance = accountSummary.outstandingBalance ?? Math.max(totalOrdersAmount - totalPaymentsAmount, 0);

  const content = `
    <div class="header">
      <h1>Cafe Tamarind</h1>
      <p>Combined Bill</p>
    </div>
    <div class="meta">
      <div class="meta-row">
        <span>Customer:</span>
        <span>${escapeHtml(customer.name || 'Guest')}</span>
      </div>
      <div class="meta-row">
        <span>Phone:</span>
        <span>${escapeHtml(customer.phone || '-')}</span>
      </div>
      <div class="meta-row">
        <span>Orders:</span>
        <span>${orders.length} selected</span>
      </div>
      <div class="meta-row">
        <span>Range:</span>
        <span>${escapeHtml(formatDateTime(firstDate))} - ${escapeHtml(formatDateTime(lastDate))}</span>
      </div>
    </div>

    <p class="section-title">Selected Orders Summary</p>
    <div class="total">
      <span>Selected Total</span>
      <span>₹${Number(selectedTotal || 0).toLocaleString('en-IN')}</span>
    </div>

    <p class="section-title">Account Balance</p>
    <div class="subtotal">
      <span>Total Orders</span>
      <span>₹${Number(totalOrdersAmount || 0).toLocaleString('en-IN')}</span>
    </div>
    <div class="subtotal">
      <span>Total Paid</span>
      <span>₹${Number(totalPaymentsAmount || 0).toLocaleString('en-IN')}</span>
    </div>
    <div class="total">
      <span>Outstanding</span>
      <span>₹${Number(outstandingBalance || 0).toLocaleString('en-IN')}</span>
    </div>

    <p class="section-title">Combined Items</p>
    <table class="items">
      <thead>
        <tr>
          <th>Item</th>
          <th class="qty">Qty</th>
          <th class="price">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${aggregatedRows}
      </tbody>
    </table>

    <p class="section-title">Orders</p>
    <table class="items">
      <thead>
        <tr>
          <th>Order</th>
          <th>Type</th>
          <th class="price">Total</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        ${ordersRows}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated on ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
      <p>Thank you for dining with us!</p>
      <p>Please visit again</p>
    </div>
  `;

  openPrintWindow('Cafe Tamarind Combined Bill', content);
};

