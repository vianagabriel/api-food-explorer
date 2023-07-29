const knex = require('../database/knex');


class OrdersController{
    async create(req, res) {
        const user_id = req.user.id;
        const { status, orders } = req.body;

      
        const [cart_id] = await knex('orders').insert({
          status,
          user_id
        });
      
        const orderItems = [];
      
        for (const order of orders) {
          const { title } = await knex('plates')
            .select('title')
            .where('id', order.plate_id)
            .first();

            const { quantity } = order;
      
          orderItems.push({
            title,
            quantity,
            cart_id,
            plate_id: order.plate_id
          });
        }
      
        await knex('cartItems').insert(orderItems);
      
        return res.status(201).json({ message: 'Pedido criado com sucesso' });
      }
      


    async update(req,res){
        const { id, status } = req.body;

        await knex('orders').update({ status }).where('id', id);
        
        return res.json();
    }

    async index(req, res){
        const { id } = req.params;

        
    }
      
}

module.exports = OrdersController;