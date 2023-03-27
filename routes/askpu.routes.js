const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
var bodyParser = require('body-parser')
const Questions=require('../models/askpu.questionmodel')
const Answers=require('../models/askpu.answermodel')

router.use(express.json())
router.use( bodyParser.urlencoded({extended : true }));


////get all questions and answers
router.get('/',async(req,res) => {
    try{
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const question_list=await Questions.aggregate([
            {
                $lookup:{
                    from:'answers',
                    localField:'question_id',
                    foreignField:'question_id',
                    as:'answers'
                }
            },
            {
                $project:{
                    _id:0,
                    question_id:1,
                    question:1,
                    ques_phone_no:1,
                    timestamp:1,
                    is_faq:1,
                    answerCount:{ $size: '$answers' }
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $limit: limit
            }
        ]);

        const questionIds = question_list.map(q => q.question_id);
        const answer_list=await Answers.aggregate([
            {
                $sort: { timestamp: -1 }
            },
            {
                $match: {
                  question_id: { $in: questionIds } 
                }
            }
        ]);
        // const questions_list=await Questions.find().populate('answers');
        const data= {
            questions:question_list,
            answers:answer_list
        }
        res.status(200).json(data)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})



///search ques ans
router.get('/search',async(req,res) => {
    try{
        const searchRegex=new RegExp(req.query.search,'i')
        const question_list = await Questions.find({
            $or: [
              { question: searchRegex },
              { ques_phone_no: searchRegex }
            ]
          })
          const answer_list = await Answers.find()
          const data = question_list.map((question) => {
            const answers = answer_list.filter(
              (answer) => answer.question_id == question.question_id
            )
            return { question, answers }
          })
        res.status(200).json(data)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})



///get questions
router.get('/questions',async(req,res) => {
    try{
        const question_list=await Questions.aggregate([
            {
                $lookup:{
                    from:'answers',
                    localField:'question_id',
                    foreignField:'question_id',
                    as:'answers'
                }
            },
            {
                $project:{
                    _id:0,
                    question_id:1,
                    question:1,
                    ques_phone_no:1,
                    timestamp:1,
                    is_faq:1,
                    answerCount:{ $size: '$answers' }
                }
            }
        ]);
        
        res.status(200).json(question_list)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})



///get answers
router.get('/answers',async(req,res) => {
    try{
        const only_answers=await Answers.find()
        res.status(200).json(only_answers)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})



////get particular question's answer
router.get('/questions/:question_id',getQuesAns,async(req,res) => {
    res.json(res.data)
})

router.get('/answers/:question_id',getQuesAns,async(req,res) => {
    res.json(res.data)
})



////post questions
router.post('/questions',async(req,res) => {
    console.log(req.body)
    if (!req.body.question || !req.body.ques_phone_no) {
        return res.status(400).json({ message: 'Question and phone number are required' });
    }
    const question_upload = new Questions({
        question:req.body.question,
        ques_phone_no: req.body.ques_phone_no
    });
    try{
        const new_question = await question_upload.save();
        res.status(201).json(new_question)
    }
    catch(err){
        res.status(400).json({message:err.message})
    } 
})


///post answers
router.post('/answers',checkQuestionExists,async(req,res) => {
    if(!req.body.answer || !req.body.ans_phone_no){
        return res.status(400).json({ message: 'Answer and phone number are required' });
    }
    const answer_upload=new Answers({
        answer:req.body.answer,
        question_id:req.body.question_id,
        ans_phone_no:req.body.ans_phone_no
    })
    try{
        const new_answer=await answer_upload.save()
        res.status(201).json(new_answer)
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
})


////update is_faq
// router.post('/questions/faq',async(req,res) => {

// })


////update question
router.patch('/questions/:question_id',updateQues,async(req,res) => {
    if(req.body.question!=null){
        res.ques.question=req.body.question
    }
    if(req.body.question_id!=null){
        res.ques.question_id=req.body.question_id
    }
    if(req.body.ques_phone_no!=null){
        res.ques.ques_phone_no=req.body.ques_phone_no
    }
    if(req.body.is_faq!=null){
        res.ques.is_faq=req.body.is_faq
    }
    try{
        const updatedQues=await res.ques.save()
        res.status(200).json(updatedQues)
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
})



////update answer
router.patch('/answers/:question_id/:_id',updateAns,async(req,res) => {
    if(req.body.answer!=null){
        res.ans.answer=req.body.answer
    }
    if(req.body.question_id!=null){
        res.ans.question_id=req.body.question_id
    }
    if(req.body.ans_phone_no!=null){
        res.ans.ans_phone_no=req.body.ans_phone_no
    }
    try{
        const updatedQues=await res.ans.save()
        res.status(200).json(updatedQues)
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
})



///delete question and corresponding answers
router.delete('/questions/:question_id',getQuesAns,async(req,res) => {
    try{
        await Questions.deleteOne({question_id:req.params.question_id})
        await Answers.deleteMany({question_id:req.params.question_id})
        res.json({message:'Deleted question and answer'})
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})


////delete answer 
router.delete('/answers/:question_id/:_id',updateAns,async(req,res) => {
    try{
        await res.ans.deleteOne()
        res.status(200).json({message:'Answer Deleted'})
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})



async function getQuesAns(req,res,next){
    let ques
    let ans
    let data
    try{

        ques=await Questions.aggregate([
            {
                
                $lookup:{
                    from:'answers',
                    localField:'question_id',
                    foreignField:'question_id',
                    as:'answers'
                }
            },
            {
                $match:{
                    question_id:req.params.question_id,
                }
            },
            {
                $project:{
                    _id:0,
                    question_id:1,
                    question:1,
                    ques_phone_no:1,
                    timestamp:1,
                    is_faq:1,
                    answerCount:{ $size: '$answers' }
                }
            }
        ]); 

        // ques=await Questions.find({question_id:{$eq:req.params.question_id}})
        ans=await Answers.find({question_id:{$eq:req.params.question_id}})
        
        if(ques==null || ans==null){
            return res.status(404).json({message:'No such question ID found'})
        }
        
    }
    catch(err){ 
        if(ques==undefined || ans==undefined){
            return res.status(404).json({message:'No such question exixts'})
        }
        return res.status(500).json({message:err.message})
    }
    const answer_count=ans.length
    data={
        questions:ques,
        // answerCount:answer_count,
        answers:ans
    }
    res.data=data
    next()
}


async function updateQues(req,res,next){
    let ques
    try{
        ques=await Questions.findOne({question_id:{$eq:req.params.question_id}})
        if(!ques){
            return res.status(404).json({message:'No such question ID found'})
        }
    }
    catch(err){
        if(ques==undefined){
            return res.status(404).json({message:'No such question exixts'})
        }
        return res.status(500).json({message:err.message})
    }
    res.ques=ques
    next()
}



async function updateAns(req,res,next){
    let ans
    try{
        ans=await Answers.findOne({question_id:{$eq:req.params.question_id},_id:{$eq:req.params._id}})
        if(ans==null){
            return res.status(404).json({message:'No such answer ID found'})
        }
    }
    catch(err){
        if(ans==undefined){
            return res.status(404).json({message:'No such answer exixts'})
        }
        return res.status(500).json({message:err.message})
    }
    res.ans=ans
    next()
}


async function checkQuestionExists(req,res,next){
    try{
        const question=await Questions.findOne({question_id:req.body.question_id})
        if(!question){
            return res.status(404).json({message:'No such question ID found'})
        }
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
    next()
}



module.exports=router