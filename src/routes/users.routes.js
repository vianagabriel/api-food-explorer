const { Router } = require('express');
const UserController = require('../controller/UserController');
const userController = new UserController();

const userRoutes = Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

userRoutes.post('/', userController.create);
userRoutes.put('/', ensureAuthenticated, userController.update);



module.exports = userRoutes;