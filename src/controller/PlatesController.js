const knex = require('../database/knex');
const AppError  = require('../utils/AppError');


class PlatesController{
  async create(req,res){

      const { title, description, category, price, ingredients } = req.body;

      const checkPlateExists = await knex('plates').where({ title }).first();

      if(checkPlateExists){
        throw new AppError('Este prato já existe em nossa base de dados')
      }

      const [plates_id] = await knex('plates').insert({
        title,
        description,
        category,
        price
      })
      

      const ingredientsInsert = ingredients.map(ingredient => {
        return{
            name: ingredient,
            plates_id
        }
      })

      await knex('ingredients').insert(ingredientsInsert)

      return res.status(201).json()
  };

 
  

  async update(req,res){
    const { title, description, category, price, ingredients } = req.body;
    const { id } = req.params;

    await knex('plates').where({ id }).update({
      title,
      description,
      category,
      price
    })

    if(ingredients){
      await knex('ingredients').where({ plates_id: id }).delete();

      const ingredientsInsert = ingredients.map(ingredient => {
        return{
          name: ingredient,
          plates_id: id

        }
      })

      await knex('ingredients').insert(ingredientsInsert)
    }
    return res.json();
  }

  async show(req,res){
    const { id } = req.params;
    
    const plate = await knex('plates').where({ id }).first();
    const ingredients = await knex('ingredients').where({ plates_id: id }).orderBy('name');

    return res.json({
      ...plate,
      ingredients
    })
  }

  async delete(req,res){
    const { id } = req.params;
    
    await knex('plates').where({ id }).delete();

    return res.json();
  }

  // async index(req, res) {
  //   const { title, ingredients } = req.query;
  
  //   let plates;
  
  //   if (ingredients) {
  //     const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim());
  
  //     plates = await knex("ingredients")
  //       .select([
  //         "plates.id",
  //         "plates.title",
  //         "plates.description",
  //         "plates.category",
  //         "plates.price",
  //         "plates.image"
  //       ])
  //       .where("plates.title", "like", `%${title}%`)
  //       .whereIn("name", filterIngredients)
  //       .innerJoin("plates", "plates.id", "ingredients.plates_id")
  //       .groupBy("plates.id")
  //       .orderBy("plates.title");
  //   } else {
  //     plates = await knex("plates")
  //       .where("title", "like", `%${title}%`)
  //       .orderBy("title");
  //   }
  
  //   const platesIds = plates.map(plate => plate.id);
  //   const platesIngredients = await knex("ingredients").whereIn("plates_id", platesIds);
  
  //   const platesWithIngredients = plates.map(plate => {
  //     const plateIngredient = platesIngredients.filter(ingredient => ingredient.plates_id === plate.id);
  
  //     return {
  //       ...plate,
  //       ingredients: plateIngredient
  //     };
  //   });
  
  //   return res.status(200).json(platesWithIngredients);
  // }
  
  async index(req, res) {
    const { title, ingredients } = req.query;
  
    let plates;
  
    if (ingredients) {
      const filterIngredients = ingredients.split(',').map((ingredient) => ingredient.trim());
  
      plates = await knex('plates')
        .select([
          'plates.id',
          'plates.title',
          'plates.description',
          'plates.category',
          'plates.price',
          'plates.image'
        ])
        .whereIn('plates.id', function () {
          this.select('ingredients.plates_id')
            .from('ingredients')
            .whereIn('name', filterIngredients)
            .groupBy('ingredients.plates_id')
            .havingRaw('COUNT(DISTINCT ingredients.name) = ?', filterIngredients.length);
        })
        .where('plates.title', 'like', `%${title}%`)
        .orderBy('plates.title');
    } else {
      plates = await knex('plates')
        .where('plates.title', 'like', `%${title}%`)
        .orderBy('plates.title');
    }
  
    const platesIds = plates.map((plate) => plate.id);
    const platesIngredients = await knex('ingredients').whereIn('plates_id', platesIds);
  
    const platesWithIngredients = plates.map((plate) => {
      const plateIngredients = platesIngredients.filter(
        (ingredient) => ingredient.plates_id === plate.id
      );
  
      return {
        ...plate,
        ingredients: plateIngredients
      };
    });
  
    return res.status(200).json(platesWithIngredients);
  }
  
  

}

module.exports = PlatesController;