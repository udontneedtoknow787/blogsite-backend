import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    blogs: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Blog"
        }],
        default: []
    }
}, {timestamps: true})

userSchema.pre('save', function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
})

userSchema.methods.comparePassword = function(plainPassword) {
    return bcrypt.compareSync(plainPassword, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', userSchema);