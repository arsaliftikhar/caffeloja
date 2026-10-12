import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    experienceType: {
      type: String,
      enum: ['table-booking', 'cupping-masterclass', 'espresso-flight', 'private-event'],
      default: 'table-booking',
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 2,
    },
    date: {
      type: String,
      required: [true, 'Please select a date'],
    },
    time: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    specialRequests: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
