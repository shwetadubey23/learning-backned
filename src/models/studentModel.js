const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacherId: {
        type: ObjectId,
        required: true,
        ref: 'Teacher'
    },
    subject : {
        type: String,
        required: true,
        enum: ["Math", "English", "Hindi", "Science"]
    },
    marks:{
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema)
