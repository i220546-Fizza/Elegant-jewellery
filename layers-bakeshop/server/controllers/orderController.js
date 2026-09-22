import Order from '../models/Order.js';
import Product from '../models/Product.js';

function generateOrderNumber() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `LB-${stamp}-${random}`;
}

export async function createOrder(req, res, next) {
  try {
    const { items, shippingInfo, paymentMethod, subtotal, deliveryFee, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Your order must contain at least one item' });
    }
    if (!shippingInfo?.fullName || !shippingInfo?.phone || !shippingInfo?.email || !shippingInfo?.address || !shippingInfo?.city) {
      return res.status(400).json({ message: 'Complete delivery details are required' });
    }

    // Re-price and re-validate stock server-side rather than trusting client totals.
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const item of items) {
      const product = productMap.get(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.name} is no longer available` });
      }
      if (!product.isAvailable || product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} does not have enough stock` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: item.size ? item.price : product.price,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const computedSubtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const computedDeliveryFee = computedSubtotal >= 5000 ? 0 : 250;
    const computedTotal = computedSubtotal + computedDeliveryFee;

    let orderNumber = generateOrderNumber();
    // Extremely unlikely, but guard against the rare collision.
    while (await Order.findOne({ orderNumber })) {
      orderNumber = generateOrderNumber();
    }

    const order = await Order.create({
      orderNumber,
      user: req.user?._id,
      items: orderItems,
      shippingInfo,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      subtotal: computedSubtotal,
      deliveryFee: computedDeliveryFee,
      total: computedTotal,
    });

    await Promise.all(
      orderItems.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })),
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
