import { getServerSession } from 'next-auth';
import { authOptions } from '@src/pages/api/auth/[...nextauth].page';
import prisma from '@src/lib/prisma';
import { generateOrderId } from '@src/lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch user from database
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { items, customerDetails } = req.body;
    const { shippingAddress, shippingAddressId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    if (!customerDetails?.name || !customerDetails?.email || !customerDetails?.phone) {
      return res.status(400).json({ error: 'Customer details are required' });
    }

    // Validate and prepare shipping address snapshot
    let shippingSnapshot = null;
    if (shippingAddressId) {
      const addr = await prisma.addresses.findUnique({ where: { id: Number(shippingAddressId) } });
      if (!addr || addr.userId !== user.id) {
        return res.status(400).json({ error: 'Invalid shipping address' });
      }
      shippingSnapshot = {
        id: addr.id,
        label: addr.label,
        recipientName: addr.recipientName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        province: addr.province,
        district: addr.district,
        postalCode: addr.postalCode,
        latitude: addr.latitude,
        longitude: addr.longitude,
      };
    } else if (shippingAddress) {
      const sa = shippingAddress;
      if (!sa.recipientName || !sa.phone || !sa.addressLine1 || !sa.city || !sa.province || !sa.postalCode) {
        return res.status(400).json({ error: 'Incomplete shipping address' });
      }
      shippingSnapshot = {
        label: sa.label || null,
        recipientName: sa.recipientName,
        phone: sa.phone,
        addressLine1: sa.addressLine1,
        addressLine2: sa.addressLine2 || null,
        city: sa.city,
        province: sa.province,
        district: sa.district || null,
        postalCode: sa.postalCode,
        latitude: sa.latitude ? Number(sa.latitude) : null,
        longitude: sa.longitude ? Number(sa.longitude) : null,
      };
    } else {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Fetch all products at once
    const productIds = items.map(item => item.produkId);
    const products = await prisma.produk.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    // Validate stock availability before creating the order
    const invalidItems = [];
    for (const item of items) {
      const produk = productMap[item.produkId];
      if (!produk) continue; // will be caught later
      if ((produk.stok || 0) < item.quantity) {
        invalidItems.push({ produkId: item.produkId, requested: item.quantity, available: produk.stok || 0 });
      }
    }

    if (invalidItems.length > 0) {
      return res.status(400).json({ error: 'Beberapa item tidak tersedia dalam jumlah yang diminta', items: invalidItems });
    }

    // Validate product existence
    const missingProducts = productIds.filter((id) => !productMap[id]);
    if (missingProducts.length > 0) {
      // If some products are not found, respond with a clear 400 so frontend can inform the user and redirect to cart
      return res.status(400).json({ error: 'Beberapa produk tidak ditemukan atau sudah dihapus', missing: missingProducts });
    }

    // Calculate total amount from cart items
    let totalAmount = 0;
    const orderItems = [];

    items.forEach((item) => {
      const produk = productMap[item.produkId];
      // At this point produk must exist because we validated above
      const price = produk.diskon > 0 
        ? Math.round(produk.harga * (1 - produk.diskon / 100))
        : produk.harga;

      totalAmount += price * item.quantity;
      orderItems.push({
        produkId: item.produkId,
        quantity: item.quantity,
        price: price,
        ukuran: item.ukuran,
        warna: item.warna,
        produk: {
          nama: produk.nama,
          gambar: produk.gambar,
        },
      });
    });

    // Generate unique order number
    const orderNumber = generateOrderId();

    // Create order in database
    const order = await prisma.orders.create({
      data: {
        userId: user.id,
        orderNumber,
        status: 'pending',
        totalAmount,
        paymentStatus: 'pending',
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        // Save shipping snapshot and optional reference
        shippingAddress: shippingSnapshot,
        shippingAddressId: shippingSnapshot?.id || null,
        order_items: {
          create: orderItems.map((item) => ({
            produkId: item.produkId,
            quantity: item.quantity,
            price: item.price,
            ukuran: item.ukuran,
            warna: item.warna,
          })),
        },
      },
      include: {
        order_items: {
          include: {
            produk: true,
          },
        },
      },
    });

    // Remove items from cart after creating order
    const cartDeletePromises = items.map((item) => 
      prisma.carts.deleteMany({
        where: {
          userId: user.id,
          produkId: item.produkId,
          ukuran: item.ukuran,
          warna: item.warna,
        },
      })
    );
    await Promise.all(cartDeletePromises);

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items: order.order_items,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    const payload = { error: 'Failed to create transaction' };
    if (process.env.NODE_ENV === 'development') {
      // Include error message/stack in development to aid debugging
      payload.details = error.message || (error && error.toString());
    }
    return res.status(500).json(payload);
  }
}
