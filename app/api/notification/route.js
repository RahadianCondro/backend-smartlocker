import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Notifikasi Midtrans diterima:', body);

    const { order_id, transaction_status, transaction_id } = body;
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      console.log(`Transaksi ${order_id} berhasil: ${transaction_status}`);
      // Tambahkan logika untuk memperbarui Firestore
    } else if (transaction_status === 'pending') {
      console.log(`Transaksi ${order_id} masih tertunda`);
    } else {
      console.log(`Transaksi ${order_id} gagal: ${transaction_status}`);
    }

    return NextResponse.json({ status: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Gagal memproses notifikasi:', error);
    return NextResponse.json({ error: 'Gagal memproses notifikasi' }, { status: 500 });
  }
}