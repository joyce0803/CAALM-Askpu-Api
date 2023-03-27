const mongoose=require('mongoose')


const AnswerSchema=new mongoose.Schema({
    question_id:{
        type:String,
        ref:'Questions'
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
});

AnswerSchema.pre('save',async function(next){
    const answer=this;
    try{
        const question=await mongoose.model('Questions').findOneAndUpdate(answer.question_id, {$inc: { answerCount:1 }})
        next()
    }
    catch(err){
        next(err)
    }
})

module.exports=mongoose.model('Answers',AnswerSchema)