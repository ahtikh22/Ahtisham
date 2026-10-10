import { Router, Response } from 'express';
import { db } from '../data/store';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const productIds = db.getWishlist(req.user!.id);
  const products = productIds
    .map((id) => db.getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  res.json({ wishlist: products, ids: productIds });
});

router.post('/toggle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  const ids = db.toggleWishlist(req.user!.id, productId);
  res.json({ ids, message: 'Wishlist updated' });
});

export default router;
