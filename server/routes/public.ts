import { Router, Request, Response } from 'express';
import { db } from '../data/store';

const router = Router();

// GET /api/public/settings
router.get('/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

// POST /api/public/coupons/verify
router.post('/coupons/verify', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Please enter a coupon code.' });
  }

  const coupon = db.findCouponByCode(code);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code.' });
  }

  const cartSubtotal = Number(subtotal) || 0;
  if (cartSubtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `This coupon requires a minimum order of PKR ${coupon.minOrderAmount.toLocaleString()}.`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((cartSubtotal * coupon.discountValue) / 100);
  } else {
    discountAmount = Math.min(cartSubtotal, coupon.discountValue);
  }

  res.json({
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    },
    message: `Coupon "${coupon.code}" applied! You save PKR ${discountAmount.toLocaleString()}.`,
  });
});

// POST /api/public/newsletter
router.post('/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  // Store or log newsletter subscriber
  res.json({ message: 'Thank you for subscribing to Ahti Shopping Store newsletter!' });
});

// POST /api/public/contact
router.post('/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  res.json({
    message: 'Thank you for reaching out! Our team in Islamabad will get back to you within 24 hours.',
  });
});

export default router;
