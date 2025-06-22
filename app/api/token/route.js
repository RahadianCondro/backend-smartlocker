import { NextResponse } from 'next/server';
import axios from 'axios';
require('dotenv').config();

const serverKey = process.env.MIDTRANS_SERVER_KEY;

export async function POST(request) {
  try {
    const { orderId, amount, email } = await request.json();
    if (!orderId || !amount || !email) {
      return NextResponse.json({ error: 'Parameter orderId, amount, dan email diperlukan' }, { status: 400 });
    }
    console.log(`Menerima permintaan token Snap untuk orderId: ${orderId}, jumlah: ${amount}, email: ${email}`);

    const requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
      'User-Agent': 'SmartLocker-Backend/1.0',
    };
    const requestBody = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: { email },
      enabled_payments: ['credit_card'],
      credit_card: {
        secure: true, // Aktifkan 3D Secure
        channel: 'migs', // Prosesor kartu
        authentication: '3ds', // Paksa 3D Secure
      },
      callbacks: {
        finish: 'https://21a1-103-65-212-2.ngrok-free.app/finish', // Ganti dengan URL ngrok
        error: 'https://21a1-103-65-212-2.ngrok-free.app/error',
        unfinish: 'https://21a1-103-65-212-2.ngrok-free.app/unfinish',
      },
      custom_expiry: {
        expiry_duration: 60,
        unit: 'minute',
      },
    };

    console.log('Permintaan ke Midtrans:', {
      url: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
      headers: { ...requestHeaders, Authorization: 'Basic [REDACTED]' },
      body: requestBody,
    });

    const response = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      requestBody,
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
    console.error('Gagal mendapatkan token Snap:', {
      status,
      headers: error.response?.headers || null,
      data: errorData,
      message: errorMessage,
      request: {
        url: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
        headers: { ...error.response?.config?.headers, Authorization: 'Basic [REDACTED]' },
      },
    });
    return NextResponse.json({ error: errorMessage, details: errorData }, { status });
  }
}