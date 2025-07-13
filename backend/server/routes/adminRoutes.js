const routes = require('express').Router();

// Import upload configuration and middleware
const { imageUpload } = require('../config/multer.js');
const handleUploadErrors = require('../middleware/uploadErrorHandler.js');

// Import controllers
const courseController = require('../api/course/courseController.js');
const studentController = require("../api/student/studentController.js");
const userController = require("../api/user/userController.js");
const subjectController = require("../api/subject/subjectController.js");
const materialTypeController = require("../api/materialType/materialTypeController.js");
const dashBoardController = require("../api/dashboard/dashboardController.js");
const tokenChecker = require('../middleware/tokenChecker.js');
const authChecker = require('../middleware/authMiddleWare.js');

// Public routes
routes.post('/user/login', userController.login);

// Protected routes
routes.use(tokenChecker);
routes.use(authChecker);

// Dashboard
routes.get('/dashboard', dashBoardController.dashboard);

// Courses routes
routes.post('/course/add',
    imageUpload.single('logo'),
    handleUploadErrors,
    courseController.add
);

routes.post('/course/all', courseController.getAll);
routes.get('/course/:id', courseController.getSingle);
routes.put('/course/update/:id',
    imageUpload.single('logo'),
    handleUploadErrors,
    courseController.update
);
routes.delete('/course/delete/:id', courseController.deleteOne);
routes.put('/course/change-status/:id', courseController.changeStatus);
routes.post('/course/pagination', courseController.pagination);

// Students routes
routes.post('/student/all', studentController.getAll);
routes.get('/student/single/:id', studentController.getSingle);
routes.delete('/student/delete/:id', studentController.deleteOne);
routes.put('/student/change-status/:id', studentController.changeStatus);
routes.post('/student/pagination', studentController.pagination);

// Subject routes
routes.post('/subject/add',
    imageUpload.single('logo'),
    handleUploadErrors,
    subjectController.add
);
routes.post('/subject/all', subjectController.getAll);
routes.get('/subject/single/:id', subjectController.getSingle);
routes.put('/subject/update/:id',
    imageUpload.single('logo'),
    handleUploadErrors,
    subjectController.update
);
routes.delete('/subject/delete/:id', subjectController.deleteOne);
routes.put('/subject/change-status/:id', subjectController.changeStatus);
routes.post('/subject/pagination', subjectController.pagination);

// Material Type routes
routes.post('/material-type/add', materialTypeController.add);
routes.post('/material-type/all', materialTypeController.getAll);
routes.get('/material-type/single/:id', materialTypeController.getSingle);
routes.put('/material-type/update/:id', materialTypeController.update);
routes.delete('/material-type/delete/:id', materialTypeController.deleteOne);
routes.put('/material-type/change-status/:id', materialTypeController.changeStatus);
routes.post('/material-type/pagination', materialTypeController.pagination);

// User routes
routes.post('/user/changepass', userController.changePassword);

module.exports = routes;