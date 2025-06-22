import { NextResponse } from 'next/server';
import axios from 'axios';
require('dotenv').config();

const serverKey = process.env.MIDTRANS_SERVER_KEY;

export async function GET(request, { params }) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: 'Parameter orderId diperlukan' }, { status: 400 });
    }
    console.log(`Menerima permintaan status transaksi untuk orderId: ${orderId}`);

    const requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
      'User-Agent': 'SmartLocker-Backend/1.0',
    };
    console.log('Permintaan ke Midtrans:', {
      url: `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
      headers: { ...requestHeaders, Authorization: 'Basic [REDACTED]' },
    });

    const response = await axios.get(
      `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
      { headers: requestHeaders }
    );

    console.log('Respon Midtrans:', {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.error_messages?.join(', ') || error.message;
    const errorData = error.response?.data || null;
    console.error('Gagal mendapatkan status transaksi:', {
      status,
      headers: error.response?.headers || null,
      data: errorData,
      message: errorMessage,
      request: {
        url: `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
        headers: { ...error.response?.config?.headers, Authorization: 'Basic [REDACTED]' },
      },
    });
    return NextResponse.json({ error: errorMessage, details: errorData }, { status });
  }
}