const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const t = { timestamps: true };
const order = { type: Number, default: 0 };

// Single document holding site-wide settings (name, dates, venue, about text, ...)
const Setting = model(
  'Setting',
  new Schema(
    {
      key: { type: String, unique: true, default: 'site' },
      data: { type: Schema.Types.Mixed, default: {} },
    },
    t
  )
);

const Admin = model(
  'Admin',
  new Schema(
    {
      email: { type: String, unique: true, required: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
    },
    t
  )
);

const ImportantDate = model(
  'ImportantDate',
  new Schema(
    {
      label: { type: String, required: true, trim: true },
      date: { type: Date },
      note: String,
      order,
    },
    t
  )
);

const Track = model(
  'Track',
  new Schema(
    {
      title: { type: String, required: true, trim: true },
      shortTitle: { type: String, trim: true },
      description: String,
      topics: [String],
      order,
    },
    t
  )
);

const Member = model(
  'Member',
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      role: String,
      affiliation: String,
      email: { type: String, trim: true, lowercase: true },
      group: { type: String, default: 'Organizing Committee' },
      order,
    },
    t
  )
);

const Submission = model(
  'Submission',
  new Schema(
    {
      paperId: { type: String, unique: true },
      title: { type: String, required: true, trim: true },
      abstract: { type: String, default: '' },
      keywords: String,
      track: String,
      authors: [
        {
          _id: false,
          name: { type: String, required: true },
          email: String,
          affiliation: String,
        },
      ],
      correspondingEmail: { type: String, required: true, lowercase: true, trim: true },
      institution: String,
      message: String,
      file: String,
      originalName: String,
      status: {
        type: String,
        enum: ['submitted', 'under review', 'accepted', 'rejected', 'camera-ready'],
        default: 'submitted',
      },
    },
    t
  )
);

const Message = model(
  'Message',
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      subject: String,
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
    },
    t
  )
);

module.exports = {
  Setting,
  Admin,
  ImportantDate,
  Track,
  Member,
  Submission,
  Message,
};
