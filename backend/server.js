const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const twilio = require('twilio');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();

// --- PRISMA 7 ADAPTER SETUP ---
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); 

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL, // e.g. https://find-laundry-crm.onrender.com
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// Initialize external services
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// --- GET ALL CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { id: 'desc' }
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});
// --- CREATE NEW CUSTOMER ---
app.post('/api/customers', async (req, res) => {
  const { name, phone, doorNumber } = req.body; // <--- Add doorNumber here
  if (!name || !phone || !doorNumber) return res.status(400).json({ error: "Name, phone, and door number are required" });

  try {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
    }

    const newCustomer = await prisma.customer.create({
      data: { 
        name: name.trim(), 
        phone: formattedPhone,
        doorNumber: doorNumber.trim() // <--- Save it to the database
      }
    });

    res.status(201).json({ success: true, customer: newCustomer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer." });
  }
});
// --- GET ALL BILLING LOGS ---
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await prisma.payment.findMany({
      include: { customer: true },
      orderBy: { id: 'desc' }
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// --- THE CORE BILLING ENDPOINT (Upgraded for Cash/Checkboxes) ---
app.post('/api/billing/send', async (req, res) => {
  const { customerId, amount, notifyWhatsapp, notifySms, isCash } = req.body;

  try {
    const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    let paymentLinkId = "CASH_OR_DIRECT_" + Date.now();
    let finalStatus = isCash ? "PAID" : "PENDING";
    let messageBody = `Hello ${customer.name}, we have received your payment of ₹${amount} via Cash/Direct transfer. Thank you!`;

    // Only talk to Razorpay if it is NOT a cash payment
    if (!isCash) {
      const paymentLinkRequest = {
          amount: amount * 100,
          currency: "INR",
          description: "Shop CRM Bill Payment",
          customer: { name: customer.name, contact: customer.phone },
          notify: { sms: false, email: false }
      };
      const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);
      paymentLinkId = paymentLink.id;
      messageBody = `Hello ${customer.name}, the bill amount from our shop is ₹${amount}. Please pay using this secure link: ${paymentLink.short_url}`;
    }

    // Send notifications based on checkboxes
    if (notifyWhatsapp) {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${customer.phone}`
      });
    }
    if (notifySms) {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customer.phone
      });
    }

    // Determine the delivery method string for the logs
    let delMethod = (notifyWhatsapp && notifySms) ? 'both' : notifyWhatsapp ? 'whatsapp' : notifySms ? 'sms' : 'none';

    // Save to Database
    const paymentRecord = await prisma.payment.create({
      data: { 
        amount: parseFloat(amount), 
        status: finalStatus, 
        razorpayLinkId: paymentLinkId, 
        customerId: customer.id,
        deliveryMethod: delMethod,
        doorNumber: customer.doorNumber
      }
    });

    res.status(200).json({ 
      success: true, 
      message: isCash ? "Cash payment recorded successfully!" : "Secure bill link generated & sent!" 
    });

  } catch (error) {
    console.error("Billing Error:", error);
    res.status(500).json({ error: "Failed to process bill. Check Twilio limits or Razorpay setup." });
  }
});


// --- MANUALLY MARK PAYMENT AS PAID ---
app.put('/api/billing/manual-pay/:id', async (req, res) => {
  try {
    await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'PAID' }
    });
    res.status(200).json({ success: true, message: "Manually marked as PAID!" });
  } catch (error) {
    console.error("Manual Pay Error:", error);
    res.status(500).json({ error: "Failed to update payment status." });
  }
});

// --- SEND PAYMENT REMINDER ---
app.post('/api/billing/remind', async (req, res) => {
  const { paymentId, deliveryMethod } = req.body;

  try {
    const payment = await prisma.payment.findUnique({ 
      where: { id: parseInt(paymentId) },
      include: { customer: true }
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status === 'PAID') return res.status(400).json({ error: "This bill is already paid!" });

    const paymentLink = await razorpay.paymentLink.fetch(payment.razorpayLinkId);
    const messageBody = `Reminder: Hello ${payment.customer.name}, your bill of ₹${payment.amount} from our shop is still pending. Please pay using this secure link: ${paymentLink.short_url}`;

    if (deliveryMethod === 'whatsapp') {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${payment.customer.phone}`
      });
    } else if (deliveryMethod === 'sms') {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: payment.customer.phone
      });
    }

    res.status(200).json({ success: true, message: `Reminder sent via ${deliveryMethod.toUpperCase()}!` });
  } catch (error) {
    console.error("Reminder Error:", error);
    res.status(500).json({ error: "Failed to send reminder" });
  }
});


// --- VERIFY PAYMENT STATUS WITH RAZORPAY ---
app.get('/api/billing/verify/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // Ask Razorpay for the real-time status of this specific link
    const razorpayLink = await razorpay.paymentLink.fetch(payment.razorpayLinkId);

    // Razorpay uses lowercase 'paid' when a link is fully paid
    if (razorpayLink.status === 'paid' && payment.status !== 'PAID') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' }
      });
      return res.status(200).json({ success: true, status: 'PAID', message: "Payment verified! Database updated to PAID." });
    }

    res.status(200).json({ success: true, status: payment.status, message: "Customer has not paid yet." });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Failed to verify payment with Razorpay." });
  }
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Count total customers
    const totalCustomers = await prisma.customer.count();

    // 2. Count how many bills are PENDING
    const pendingBills = await prisma.payment.count({
      where: { status: 'PENDING' }
    });

    // 3. Calculate total revenue from PAID bills
    const revenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' }
    });
    
    // If there are no paid bills yet, Prisma returns null, so we default to 0
    const totalRevenue = revenueAgg._sum.amount || 0;

    res.status(200).json({
      totalCustomers,
      pendingBills,
      totalRevenue
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// --- HEALTH CHECK (required by Render) ---
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- SERVER START ---

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});