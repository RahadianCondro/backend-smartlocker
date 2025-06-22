import { NextResponse } from 'next/server';
import { createLogger, format, transports } from 'winston';
import { getFirestore } from 'firebase-admin/firestore';

// Inisialisasi Logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

export async function POST(request) {
  try {
    const { orderId, transactionId, invoiceUrl, uid } = await request.json();
    if (!orderId || !transactionId || !invoiceUrl || !uid) {
      return NextResponse.json({ error: 'Parameter orderId, transactionId, invoiceUrl, dan uid diperlukan' }, { status: 400 });
    }

    logger.info('Menerima permintaan konfirmasi pesanan', { orderId, transactionId, uid });

    const db = getFirestore();
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists || orderDoc.data().uid !== uid) {
      return NextResponse.json({ error: 'Pesanan tidak valid atau tidak ditemukan' }, { status: 401 });
    }

    await orderRef.update({
      paymentStatus: 'success',
      transactionId,
      invoiceUrl,
      updatedAt: new Date().toISOString()
    });

    const cartItems = orderDoc.data().cartItems || [];
    for (const item of cartItems) {
      const lockerRef = db.collection('lockers').doc(item.lockerId);
      await lockerRef.update({
        bookingStatus: 'booked',
        lockStatus: item.lockStatus || 'booked',
        lastUpdated: new Date().toISOString()
      });
    }

    logger.info('Berhasil mengkonfirmasi pesanan', { orderId });

    return NextResponse.json({ message: 'Pesanan berhasil dikonfirmasi' }, { status: 200 });
  } catch (error) {
    logger.error('Gagal mengkonfirmasi pesanan', {
      status: error.status || 500,
      message: error.message,
      orderId: request.json()?.orderId || 'unknown'
    });
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}