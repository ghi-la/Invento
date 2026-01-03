import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    isActive: { type: Boolean, default: true },
    parentWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Folder = mongoose.model('Folder', FolderSchema);

export default Folder;
