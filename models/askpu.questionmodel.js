const mongoose=require('mongoose')
const shortid = require('shortid');

const QuestionSchema=new mongoose.Schema({
    question_id: {
        type: String,
        default: shortid.generate,
        unique: true
    },
    question:{
        type:String
    },
    ques_phone_no:{
        type:String
    },
    timestamp:{
        type:Date,
        required:true,
        default:Date.now()
    },
    answerCount:{
        type:Number,
        default:0
    },
    is_faq:{
        type:Boolean,
        default:false
    }
})

QuestionSchema.virtual('answers',{
    ref:'Answers',
    localField:'question_id',
    foreignField:'question_id'
})



module.exports=mongoose.model('Questions',QuestionSchema)
