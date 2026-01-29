const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    recommendationRules: {
        skillGapWeight: { type: Number, default: 0.4 },
        interestWeight: { type: Number, default: 0.3 },
        timeAvailabilityWeight: { type: Number, default: 0.2 },
        learningSpeedWeight: { type: Number, default: 0.1 }
    },
    systemStatus: {
        aiEnabled: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);
