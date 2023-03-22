const mongoose=require('mongoose')


const AnswerSchema=new mongoose.Schema({
    question_id:{
        type:String
    },
    answer:{
        type:String,
    },
    ans_phone_no:{
        type:String,
    },
    timestamp:{
        type:Date,
        required:true,
        default:Date.now()
    }
})

module.exports=mongoose.model('Answers',AnswerSchema)