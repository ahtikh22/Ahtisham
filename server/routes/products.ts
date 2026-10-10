import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/categories
router.get('/categories', (req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// GET /api/products
router.get('/', (req: Request, res: Response) => {
  try {
    let products = db.getProducts();

    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      featured,
      newArrival,
      bestSeller,
      page = '1',
      limit = '20',
    } = req.query;

    // Search query filter (matches name, description, SKU, categoryName)
    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    // Category filter (by id or slug)
    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(
        (p) =>
          p.categoryId === category ||
          p.categoryId.toLowerCase().includes(category.toLowerCase()) ||
          (p.categoryName && p.categoryName.toLowerCase() === category.toLowerCase())
      );
    }

    // Price filters (effective price considering discountPrice if set)
    if (minPrice && !isNaN(Number(minPrice))) {
      const min = Number(minPrice);
      products = products.filter((p) => (p.discountPrice || p.price) >= min);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      const max = Number(maxPrice);
      products = products.filter((p) => (p.discountPrice || p.price) <= max);
    }

    // Tag filters
    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }
    if (newArrival === 'true') {
      products = products.filter((p) => p.isNewArrival);
    }
    if (bestSeller === 'true') {
      products = products.filter((p) => p.isBestSeller);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price_desc':
        products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
      default:
        // By review count and featured
        products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    res.json({
      products: paginatedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const product =
    db.getProductById(idOrSlug) ||
    db.getProducts().find((p) => p.slug === idOrSlug);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  // Find related products in the same category
  const relatedProducts = db
    .getProducts()
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  // Find product reviews
  const reviews = db.getReviewsByProductId(product.id);

  res.json({ product, relatedProducts, reviews });
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req: Request, res: Response) => {
  const reviews = db.getReviewsByProductId(req.params.id);
  res.json({ reviews });
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const product = db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const { rating, comment } = req.body;
    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return res.status(400).json({ error: 'Please write a review comment.' });
    }

    const review = db.addReview({
      productId,
      userId: req.user!.id,
      userName: req.user!.fullName,
      rating: Math.round(numRating),
      comment: comment.trim(),
    });

    res.status(201).json({ review, message: 'Review submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

export default router;
