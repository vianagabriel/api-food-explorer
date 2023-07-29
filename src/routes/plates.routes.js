const { Router } = require('express');

const platesRoutes = Router();
const multer = require('multer');
const uploadConfig = require('../configs/upload');
const PlatesController = require('../controller/PlatesController');
const platesController = new PlatesController();
const PlatesImgController = require('../controller/PlatesImgController');
const platesImgController = new PlatesImgController;
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const ensureUserIsAdmin = require('../middleware/ensureUserIsAdmin');
const upload = multer(uploadConfig.MULTER);

platesRoutes.use(ensureAuthenticated);

platesRoutes.post('/', ensureUserIsAdmin,  platesController.create);
platesRoutes.put('/:id', ensureUserIsAdmin, upload.single('image'),  platesController.update);
platesRoutes.get('/:id',   platesController.show);
platesRoutes.get('/',  platesController.index);
platesRoutes.delete('/:id', ensureUserIsAdmin,  platesController.delete);
platesRoutes.patch('/image/:id', upload.single('image'), platesImgController.update)


module.exports = platesRoutes;