import { Router, Response } from 'express';
import { db } from '../data/store';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { OrderStatus, PaymentStatus } from '../../src/types/index';

const router = Router();

// Protect ALL routes in this file with requireAdmin
router.use(requireAdmin);

// GET /api/admin/metrics
router.get('/metrics', (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const users = db.getUsers().filter((u) => u.role === 'customer');

  const totalOrders = orders.length;

  // Total sales: STRICTLY from orders with payment.status === 'Verified' (not pending or cancelled!)
  const verifiedOrders = orders.filter((o) => o.payment.status === 'Verified' && o.status !== 'Cancelled');
  const totalSalesVerified = verifiedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Pending orders
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;

  // Pending payment verifications (orders awaiting manual payment check)
  const pendingPaymentVerifications = orders.filter(
    (o) => o.payment.status === 'Verification Pending'
  ).length;

  // Low stock products (stock <= 5)
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  res.json({
    metrics: {
      totalOrders,
      totalSalesVerified,
      pendingOrders,
      pendingPaymentVerifications,
      totalCustomers: users.length,
      lowStockCount: lowStockProducts.length,
    },
    lowStockProducts,
  });
});

// --- Product Management ---
// POST /api/admin/products
router.post('/products', (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      sku,
      description,
      price,
      discountPrice,
      categoryId,
      images,
      stock,
      featured,
      isNewArrival,
      isBestSeller,
      isDemo,
      specifications,
    } = req.body;

    if (!name || !sku || !price || !categoryId) {
      return res.status(400).json({ error: 'Name, SKU, price, and category are required.' });
    }

    const numPrice = Number(price);
    const numStock = parseInt(stock, 10) || 0;
    const numDiscount = discountPrice ? Number(discountPrice) : undefined;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct = db.addProduct({
      name: name.trim(),
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: sku.trim().toUpperCase(),
      description: description?.trim() || '',
      price: numPrice,
      discountPrice: numDiscount,
      categoryId,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      stock: Math.max(0, numStock),
      rating: 5.0,
      reviewCount: 0,
      isDemo: Boolean(isDemo),
      featured: Boolean(featured),
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      specifications: specifications || {},
    });

    res.status(201).json({ product: newProduct, message: 'Product created successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock, 10);
    if (updates.discountPrice !== undefined) {
      updates.discountPrice = updates.discountPrice ? Number(updates.discountPrice) : undefined;
    }

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ product: updated, message: 'Product updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json({ message: 'Product deleted successfully.' });
});

// --- Category Management ---
// POST /api/admin/categories
router.post('/categories', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const cat = db.addCategory({
      name: name.trim(),
      slug,
      description: description?.trim(),
      imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    });

    res.status(201).json({ category: cat, message: 'Category added!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category.' });
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', (req: AuthenticatedRequest, res: Response) => {
  const cat = db.updateCategory(req.params.id, req.body);
  if (!cat) return res.status(404).json({ error: 'Category not found.' });
  res.json({ category: cat, message: 'Category updated!' });
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found.' });
  res.json({ message: 'Category removed.' });
});

// --- Order Management ---
// GET /api/admin/orders
router.get('/orders', (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  res.json({ orders });
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  const validStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // If newly cancelled, restore stock
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    for (const item of order.items) {
      const prod = db.getProductById(item.productId);
      if (prod) {
        db.updateProduct(prod.id, { stock: prod.stock + item.quantity });
      }
    }
  }

  const updated = db.updateOrder(order.id, { status });
  res.json({ order: updated, message: `Order status updated to ${status}.` });
});

// PUT /api/admin/orders/:id/verify-payment
router.put('/orders/:id/verify-payment', (req: AuthenticatedRequest, res: Response) => {
  const { status, rejectionReason } = req.body as {
    status: PaymentStatus;
    rejectionReason?: string;
  };

  const validPaymentStatuses: PaymentStatus[] = ['Verified', 'Rejected', 'Unpaid', 'Verification Pending'];
  if (!validPaymentStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid payment verification status.' });
  }

  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const updatedPayment = {
    ...order.payment,
    status,
    verifiedAt: status === 'Verified' ? new Date().toISOString() : undefined,
    verifiedBy: status === 'Verified' ? req.user!.fullName : undefined,
    rejectionReason: status === 'Rejected' ? rejectionReason || 'Transaction ID not verified with bank/telecom records.' : undefined,
  };

  // If payment is verified, we can also advance order to Confirmed if still Pending
  const newOrderStatus =
    status === 'Verified' && order.status === 'Pending' ? 'Confirmed' : order.status;

  const updated = db.updateOrder(order.id, {
    payment: updatedPayment,
    status: newOrderStatus,
  });

  res.json({
    order: updated,
    message: status === 'Verified' ? 'Payment verified successfully!' : 'Payment marked as rejected.',
  });
});

// GET /api/admin/orders/export-csv
router.get('/export-csv', (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();

  const headers = [
    'Order Number',
    'Date',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'City',
    'Items Count',
    'Subtotal (PKR)',
    'Shipping Fee (PKR)',
    'Discount (PKR)',
    'Total Amount (PKR)',
    'Order Status',
    'Payment Method',
    'Payment Status',
    'Transaction ID',
  ];

  const rows = orders.map((o) => [
    `"${o.orderNumber}"`,
    `"${new Date(o.createdAt).toLocaleString()}"`,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.customerEmail.replace(/"/g, '""')}"`,
    `"${o.customerPhone}"`,
    `"${o.shippingAddress.city.replace(/"/g, '""')}"`,
    o.items.reduce((sum, it) => sum + it.quantity, 0),
    o.subtotal,
    o.shippingFee,
    o.discountAmount,
    o.totalAmount,
    `"${o.status}"`,
    `"${o.payment.method}"`,
    `"${o.payment.status}"`,
    `"${(o.payment.transactionId || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="ahti_store_orders_${Date.now()}.csv"`
  );
  res.send(csvContent);
});

// --- Customer Accounts Management ---
// GET /api/admin/customers
router.get('/customers', (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map((u) => {
    const userOrders = db.getOrdersByUserId(u.id);
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      country: u.country,
      role: u.role,
      createdAt: u.createdAt,
      ordersCount: userOrders.length,
      totalSpent: userOrders
        .filter((o) => o.payment.status === 'Verified')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
  });

  res.json({ customers: users });
});

// --- Coupons Management ---
// GET /api/admin/coupons
router.get('/coupons', (req: AuthenticatedRequest, res: Response) => {
  res.json({ coupons: db.getCoupons() });
});

// POST /api/admin/coupons
router.post('/coupons', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, isActive, expiresAt } = req.body;
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discount type, and value are required.' });
    }

    const coupon = db.addCoupon({
      code: code.trim().toUpperCase(),
      discountType: discountType === 'percentage' ? 'percentage' : 'fixed',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      isActive: isActive !== false,
      expiresAt: expiresAt || undefined,
    });

    res.status(201).json({ coupon, message: 'Coupon created!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon.' });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCoupon(req.params.id);
  if (!success) return res.status(404).json({ error: 'Coupon not found.' });
  res.json({ message: 'Coupon deleted.' });
});

// --- Store & Payment Settings ---
// GET /api/admin/settings
router.get('/settings', (req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: db.getSettings() });
});

// PUT /api/admin/settings
router.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ settings: updated, message: 'Store settings updated successfully!' });
});

export default router;
