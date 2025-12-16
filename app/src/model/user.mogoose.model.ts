import mongoose from "mongoose";
import { v4 as uuid } from 'uuid'

const userSchema = new mongoose.Schema(
    {
        username : {
            type : String ,
            required : true ,
            unique : true ,
            lowercase : true
        },
        password : {
            type : String ,
            required : true ,
            unique : true ,
            match : /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
        },
        uid : {
            type : String ,
            unique : true ,
            default : uuid() ,
            immutable : true 
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema)