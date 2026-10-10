import { Router, Response } from 'express';
import { db } from '../data/store';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { CartItem } from '../../src/types/index';

const router = Router();

// GET /api/cart
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const rawItems = db.getUserCart(req.user!.id);
  const populatedItems: CartItem[] = [];

  for (const item of rawItems) {
    const product = db.getProductById(item.productId);
    if (product) {
      // Cap quantity to product stock
      const validQty = Math.min(item.quantity, Math.max(0, product.stock));
      if (validQty > 0) {
        populatedItems.push({
          productId: product.id,
          product,
          quantity: validQty,
        });
      }
    }
  }

  res.json({ items: populatedItems });
});

// POST /api/cart/sync
router.post('/sync', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array.' });
  }

  const cleanItems = items
    .filter((it: any) => it && it.productId && it.quantity > 0)
    .map((it: any) => ({
      productId: String(it.productId),
      quantity: Math.max(1, parseInt(it.quantity, 10)),
    }));

  db.saveUserCart(req.user!.id, cleanItems);
  res.json({ message: 'Cart synced successfully.' });
});

export default router;
