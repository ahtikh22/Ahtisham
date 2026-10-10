import { Router, Response } from 'express';
import { db } from '../data/store';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../src/types/index';

const router = Router();

// Helper to generate unique order number
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `AHTI-${dateStr}-${randomPart}`;
}

// POST /api/orders (Place Order)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
      transactionId,
      proofNote,
    } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.city ||
      !shippingAddress.addressLine
    ) {
      return res.status(400).json({
        error: 'Please provide full shipping details (Name, Phone, City, Address).',
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    // Validate payment method
    const validPaymentMethods: PaymentMethod[] = [
      'Cash on Delivery',
      'JazzCash',
      'Easypaisa',
      'Bank Transfer',
    ];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method selected.' });
    }

    // SERVER-SIDE TOTAL RECALCULATION & STOCK VERIFICATION
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    const stockDeductions: { productId: string; newStock: number }[] = [];

    for (const rawItem of items) {
      const product = db.getProductById(rawItem.productId);
      if (!product) {
        return res.status(400).json({
          error: `Product with ID "${rawItem.productId}" is no longer available.`,
        });
      }

      const qty = parseInt(rawItem.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          error: `Invalid quantity for ${product.name}.`,
        });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          error: `Sorry, only ${product.stock} units of "${product.name}" are in stock.`,
        });
      }

      const unitPrice = product.discountPrice || product.price;
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '',
        sku: product.sku,
        price: unitPrice,
        quantity: qty,
        subtotal: itemSubtotal,
      });

      stockDeductions.push({
        productId: product.id,
        newStock: product.stock - qty,
      });
    }

    // Apply store settings for shipping
    const settings = db.getSettings();
    const shippingFee =
      subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;

    // Apply coupon if valid
    let discountAmount = 0;
    let appliedCoupon: string | undefined = undefined;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const coupon = db.findCouponByCode(couponCode.trim());
      if (coupon && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discountAmount = Math.min(subtotal, coupon.discountValue);
        }
        appliedCoupon = coupon.code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // Stock deduction
    for (const deduction of stockDeductions) {
      db.updateProduct(deduction.productId, { stock: deduction.newStock });
    }

    // Payment state
    // Important: NEVER mark as paid automatically.
    // If online transaction ID is provided, it goes to 'Verification Pending' for admin review.
    let initialPaymentStatus: PaymentStatus = 'Unpaid';
    if (
      (paymentMethod === 'JazzCash' ||
        paymentMethod === 'Easypaisa' ||
        paymentMethod === 'Bank Transfer') &&
      transactionId &&
      transactionId.trim()
    ) {
      initialPaymentStatus = 'Verification Pending';
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: generateOrderNumber(),
      userId: user.id,
      customerName: shippingAddress.fullName.trim(),
      customerEmail: shippingAddress.email?.trim() || user.email,
      customerPhone: shippingAddress.phone.trim(),
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        email: shippingAddress.email?.trim() || user.email,
        country: shippingAddress.country?.trim() || 'Pakistan',
        city: shippingAddress.city.trim(),
        addressLine: shippingAddress.addressLine.trim(),
        orderNotes: shippingAddress.orderNotes?.trim() || '',
      },
      items: orderItems,
      subtotal,
      shippingFee,
      discountAmount,
      couponCode: appliedCoupon,
      totalAmount,
      status: 'Pending',
      payment: {
        method: paymentMethod,
        status: initialPaymentStatus,
        transactionId: transactionId ? transactionId.trim() : undefined,
        proofNote: proofNote ? proofNote.trim() : undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createOrder(newOrder);

    // Clear user's saved cart in database
    db.saveUserCart(user.id, []);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// GET /api/orders (Customer's own orders)
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrdersByUserId(req.user!.id);
  res.json({ orders });
});

// GET /api/orders/:id (Customer's order detail)
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // Enforce access control: customer can only view their own order (unless admin)
  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized to view this order.' });
  }

  res.json({ order });
});

// POST /api/orders/:id/cancel (Customer cancels order if permitted)
router.post('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (order.status !== 'Pending' && order.status !== 'Confirmed') {
    return res.status(400).json({
      error: `Cannot cancel order in "${order.status}" status. Please contact support.`,
    });
  }

  // Restore stock
  for (const item of order.items) {
    const prod = db.getProductById(item.productId);
    if (prod) {
      db.updateProduct(prod.id, { stock: prod.stock + item.quantity });
    }
  }

  const updated = db.updateOrder(order.id, {
    status: 'Cancelled',
  });

  res.json({
    message: 'Order has been successfully cancelled.',
    order: updated,
  });
});

// POST /api/orders/:id/payment-proof (Customer submits transaction ID / payment reference)
router.post(
  '/:id/payment-proof',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const { transactionId, proofNote, proofImageUrl } = req.body;
    if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
      return res.status(400).json({ error: 'Please enter a valid Transaction ID.' });
    }

    // Keep payment status as Verification Pending (admin must review!)
    const updatedPayment = {
      ...order.payment,
      transactionId: transactionId.trim(),
      proofNote: proofNote?.trim() || order.payment.proofNote,
      proofImageUrl: proofImageUrl?.trim() || order.payment.proofImageUrl,
      status: 'Verification Pending' as PaymentStatus,
    };

    const updated = db.updateOrder(order.id, {
      payment: updatedPayment,
    });

    res.json({
      message: 'Payment details submitted! An administrator will verify your payment shortly.',
      order: updated,
    });
  }
);

export default router;
