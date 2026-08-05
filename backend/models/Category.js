const mongoose = require('mongoose');

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

categorySchema.pre('validate', function generateSlug(next) {
  if (this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.statics.slugify = slugify;

module.exports = mongoose.model('Category', categorySchema);
