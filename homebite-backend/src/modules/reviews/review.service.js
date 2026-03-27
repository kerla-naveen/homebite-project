const prisma = require('../../config/database');

const createReview = async (customerId, { foodItemId, rating, comment }) => {
  // Verify customer has a delivered order with this item
  const delivered = await prisma.orderItem.findFirst({
    where: {
      foodItemId,
      order: { customerId, status: 'DELIVERED' },
    },
  });

  if (!delivered) {
    const err = new Error('You can only review items from delivered orders');
    err.statusCode = 403;
    throw err;
  }

  const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
  if (!foodItem) {
    const err = new Error('Food item not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.review.create({
    data: { customerId, vendorId: foodItem.vendorId, foodItemId, rating, comment },
    include: { customer: { select: { name: true, avatarUrl: true } } },
  });
};

const getReviewsByFoodItem = async (foodItemId) => {
  return prisma.review.findMany({
    where: { foodItemId, isDeleted: false },
    include: { customer: { select: { name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getReviewsByVendor = async (vendorId) => {
  return prisma.review.findMany({
    where: { vendorId, isDeleted: false },
    include: {
      customer: { select: { name: true, avatarUrl: true } },
      foodItem: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const deleteReview = async (userId, role, reviewId) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  if (role !== 'ADMIN' && review.customerId !== userId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  await prisma.review.update({ where: { id: reviewId }, data: { isDeleted: true } });
};

module.exports = { createReview, getReviewsByFoodItem, getReviewsByVendor, deleteReview };
