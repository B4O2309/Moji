import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },

    device: {
        type: String,
        default: 'Unknown Device'
    },
    browser: {
        type: String,
        default: 'Unknown Browser'
    },
    ip: {
        type: String,
        default: 'Unknown'
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

sessionSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);