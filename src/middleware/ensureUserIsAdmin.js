const knex = require('../database/knex');
const AppError = require('../utils/AppError');

async function ensureUserIsAdmin(req, res, next){
  const user_id = req.user.id;

  const user = await knex('users').where({ id: user_id}).first();

  if(!user.isAdmin){
    throw new AppError('Acesso negado: Apenas administradores tem acesso', 401)
  }

  next()
};


module.exports = ensureUserIsAdmin;