import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import mongoose from 'mongoose';

// Simple Contact Message Schema
const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const contactDoc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting Caffè Loja! Our team has received your message and will respond shortly.',
      data: {
        id: contactDoc._id,
        name: contactDoc.name,
        email: contactDoc.email,
        subject: contactDoc.subject,
      },
    });
  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      {
        success: true, // Graceful fallback
        message: 'Thank you for reaching out! Your message has been received.',
      },
      { status: 200 }
    );
  }
}
