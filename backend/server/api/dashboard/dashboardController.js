const studentModel=require("../student/studentModel")
const courseModel=require("../course/courseModel")
const subjectModel=require("../subject/subjectModel")
const ratingModel=require("../rating/ratingModel")
const flashcardModel=require("../flashcards/flashcardModel")


const dashboard = async (req, res) => {
    let totalStudent=await studentModel.countDocuments()
    let totalCourses=await courseModel.countDocuments()
    let totalSubjects=await subjectModel.countDocuments()
    let totalRatings=await ratingModel.countDocuments()
    let totalFlashcards=await flashcardModel.countDocuments()
    res.send({  
        success: true,
        status: 200,
        message: 'Welcome Admin',
        totalStudent: totalStudent,
        totalCourses: totalCourses,
        totalSubjects: totalSubjects,
        totalRatings: totalRatings,
        totalFlashcards: totalFlashcards
    })
}
module.exports = { dashboard }