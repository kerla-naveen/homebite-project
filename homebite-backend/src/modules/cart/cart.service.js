const prisma = require('../../config/database');

const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          foodItem: {
            include: { vendor: { select: { id: true, businessName: true } } },
          },
        },
      },
    },
  });

  if (!cart) return { items: [], subtotal: 0, vendorId: null };

  const subtotal = cart.items.reduce((sum, item) => {
    const price = Number(item.foodItem.discountedPrice || item.foodItem.price);
    return sum + price * item.quantity;
  }, 0);

  return { ...cart, subtotal };
};

const addItem = async (userId, { foodItemId, quantity }) => {
  const foodItem = await prisma.foodItem.findFirst({
    where: { id: foodItemId, isDeleted: false, isAvailable: true },
    include: { vendor: true },
  });

  if (!foodItem) {
    const err = new Error('Food item not found or unavailable');
    err.statusCode = 404;
    throw err;
  }

  if (foodItem.vendor.status !== 'APPROVED') {
    const err = new Error('This vendor is not available');
    err.statusCode = 400;
    throw err;
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId, vendorId: foodItem.vendorId } });
  } else if (cart.vendorId && cart.vendorId !== foodItem.vendorId) {
    const err = new Error('Your cart contains items from another vendor. Clear your cart to add items from this vendor.');
    err.statusCode = 409;
    throw err;
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_foodItemId: { cartId: cart.id, foodItemId } },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + (quantity || 1) },
      include: { foodItem: true },
    });
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { vendorId: foodItem.vendorId } });

  return prisma.cartItem.create({
    data: { cartId: cart.id, foodItemId, quantity: quantity || 1 },
    include: { foodItem: true },
  });
};

const updateItem = async (userId, foodItemId, quantity) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    const err = new Error('Cart not found');
    err.statusCode = 404;
    throw err;
  }

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, foodItemId } });
    await cleanCartIfEmpty(cart.id);
    return null;
  }

  return prisma.cartItem.update({
    where: { cartId_foodItemId: { cartId: cart.id, foodItemId } },
    data: { quantity },
    include: { foodItem: true },
  });
};

const removeItem = async (userId, foodItemId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, foodItemId } });
  await cleanCartIfEmpty(cart.id);
};

const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.update({ where: { id: cart.id }, data: { vendorId: null } });
};

const cleanCartIfEmpty = async (cartId) => {
  const count = await prisma.cartItem.count({ where: { cartId } });
  if (count === 0) {
    await prisma.cart.update({ where: { id: cartId }, data: { vendorId: null } });
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
