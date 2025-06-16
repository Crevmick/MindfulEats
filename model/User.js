import mongoose from 'mongoose';
const { Schema } = mongoose;
const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;      
            // Only required for non-Google users
        }
    },
    googleId: {
        type: String 
    },
    verified: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: null
    },
}, {
    timestamps: true
});


// Check if the model already exists to prevent overwriting
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;