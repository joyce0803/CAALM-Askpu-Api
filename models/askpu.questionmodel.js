const mongoose=require('mongoose')

const QuestionSchema=new mongoose.Schema({
    question:{
        type:String
    },
    question_id:{
        type:Number,
        unique:true
    },
    ques_phone_no:{
        type:String
    },
    timestamp:{
        type:Date,
        required:true,
        default:Date.now()
    }
})



module.exports=mongoose.model('Questions',QuestionSchema)
