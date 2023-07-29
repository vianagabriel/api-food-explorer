const { Router } = require('express');
const ordersRoutes = Router();
const OrdersController = require('../controller/OrdersController');
const ordersController = new OrdersController();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const ensureUserIsAdmin = require('../middleware/ensureUserIsAdmin');

ordersRoutes.use(ensureAuthenticated);

ordersRoutes.post('/', ordersController.create);
ordersRoutes.put('/', ensureUserIsAdmin,  ordersController.update);



module.exports = ordersRoutes;