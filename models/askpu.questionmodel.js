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
    }
})



module.exports=mongoose.model('Questions',QuestionSchema)
