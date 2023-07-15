const mongoose = require('mongoose');



// create Request schema
const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    adminResponse: { type: String },
    createdAt: { type: Date, default: Date.now },
});



//mapping
module.exports = mongoose.model('userRequets', schema);
