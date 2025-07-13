const routes=require('express').Router();
const express = require('express');

const multer = require('multer');
const storage = multer.memoryStorage();
const fileUpload = multer({ storage });

const { imageUpload } = require('../config/multer.js');
const handleUploadErrors = require('../middleware/uploadErrorHandler.js');

const courseController=require('../api/course/courseController.js');
const studentController=require("../api/student/studentController.js");
const subjectController=require("../api/subject/subjectController.js");
const flashCardController=require("../api/flashcards/flahcardController.js")
const userController = require("../api/user/userController.js")
const flahcardItemController = require("../api/flashCardItem/flashCardItemController.js")
const materialController = require("../api/material/materialController.js")
const playlistController = require("../api/playlist/playlistController.js")
const ratingController = require("../api/rating/ratingController.js")
const requestController = require("../api/request/requestController.js")
const paymentController = require("../api/payment/paymentController.js")
const tokenChecker=require('../middleware/tokenChecker.js')
const authChecker=require('../middleware/authMiddleWare.js')

routes.post('/user/login',userController.login);
routes.post('/student/register',imageUpload.single('profileImage'),handleUploadErrors,studentController.add);

routes.use(tokenChecker); 
routes.use(authChecker);

//courses
routes.get('/course/all', courseController.getAll); 
routes.get('/course/:id', courseController.getSingle);
routes.post('/course/pagination', courseController.pagination);

//students
routes.put('/student/update/:id',imageUpload.single('profileImage'),handleUploadErrors,studentController.update);

//subjects
routes.get('/subject/all',subjectController.getAll);
routes.get('/subject/single/:id',subjectController.getSingle);
routes.post('/subject/pagination', subjectController.pagination);

//flashCards
routes.post('/flashcard/add',flashCardController.add)
routes.post('/flashcard/all',flashCardController.getAll)
routes.get('/flashcard/single/:id',flashCardController.getSingle)
routes.put('/flashcard/update/:id',flashCardController.update);
routes.delete('/flashcard/delete/:id',flashCardController.deleteOne);
routes.post('/flashcard/pagination',flashCardController.pagination);
routes.put('/flashcard/change-status/:id',flashCardController.changeStatus);
routes.put('/flashcard/change-public-status/:id',flashCardController.changePublicStatus);

//flashcarditems
routes.post('/flashcarditem/add', flahcardItemController.add);
routes.post('/flashcarditem/all', flahcardItemController.getAll);
routes.get('/flashcarditem/single/:id', flahcardItemController.getSingle); // Note: Changed to POST since your controller expects body
routes.put('/flashcarditem/update/:id', flahcardItemController.update); // Note: Changed to POST since your controller expects body
routes.delete('/flashcarditem/delete/:id', flahcardItemController.deleteOne); 
routes.post('/flashcarditem/pagination', flahcardItemController.pagination);
routes.put('/flashcarditem/change-status/:id', flahcardItemController.changeStatus); 

//materials
routes.post('/material/add', fileUpload.array('attachements',5), materialController.add);
routes.post('/material/all', materialController.getAll);
routes.get('/material/single/:id', materialController.getSingle);
routes.put('/material/update/:id', fileUpload.array('attachements',5), materialController.update);
routes.delete('/material/delete/:id', materialController.deleteOne);
routes.post('/material/pagination', materialController.pagination);
routes.put('/material/change-status/:id', materialController.changeStatus);

//playlists
routes.post('/playlist/add', playlistController.add);
routes.post('/playlist/all', playlistController.getAll);
routes.get('/playlist/single/:id', playlistController.getSingle);
routes.put('/playlist/update/:id', playlistController.update);
routes.delete('/playlist/delete/:id', playlistController.deleteOne);
routes.post('/playlist/pagination', playlistController.pagination);
routes.put('/playlist/change-status/:id', playlistController.changeStatus);
routes.put('/playlist/change-public-status/:id', playlistController.changePublicStatus);

//rating
routes.post('/rating/add', ratingController.add);
routes.get('/rating/all', ratingController.getAll);
routes.get('/rating/single/:id', ratingController.getSingle);
routes.put('/rating/update/:id', ratingController.update);
routes.delete('/rating/delete/:id', ratingController.deleteOne);
routes.post('/rating/pagination', ratingController.pagination);
routes.put('/rating/change-status/:id', ratingController.changeStatus);

//request
routes.post('/request/add', requestController.add);
routes.post('/request/all', requestController.getAll);

// Payment
routes.post('/payment/create', paymentController.createPayment);
routes.post('/payment/mark-delivered', paymentController.markAsDelivered);
routes.post('/payment/confirm-delivery', paymentController.confirmDelivery);
routes.post('/payment/webhook',express.raw({ type: 'application/json' }), paymentController.handleWebhook);


//user
routes.post('/user/changepassword',userController.changePassword)


module.exports = routes;