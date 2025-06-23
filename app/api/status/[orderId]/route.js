import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import axios from 'axios';
import validator from 'validator';
import { createLogger, format, transports } from 'winston';

// Inisialisasi Logger
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

export async function GET(request, { params }) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: 'Parameter orderId diperlukan' }, { status: 400 });
    }
    if (!validator.isLength(orderId, { min: 1, max: 50 })) {
      return NextResponse.json({ error: 'orderId harus antara 1-50 karakter' }, { status: 400 });
    }

    logger.info('Menerima permintaan status transaksi', { orderId });

    const response = await axios.get(
      `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')
        }
      }
    );

    logger.info('Berhasil mendapatkan status transaksi', { orderId, status: response.data.transaction_status });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_messages?.join(', ') || error.message;
    logger.error('Gagal mendapatkan status transaksi', {
      status,
      message: errorMessage,
      orderId: params.orderId || 'unknown'
    });

    return NextResponse.json({ error: errorMessage }, { status });
  }
}