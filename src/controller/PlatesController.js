const knex = require('../database/knex');
const AppError = require('../utils/AppError');


class PlatesController {

  async create(req, res) {
    const { title, price, description, ingredients, category } = req.body;

    const checkPlateExists = await knex('plates').where('title', title).first();

    if (checkPlateExists) {
      throw new AppError('Este prato já está cadastrado.');
    }

    const [plates_id] = await knex('plates').insert({
      title,
      description,
      price,
      category,
    });


    if (ingredients) {
      const ingredientsInsert = ingredients.map(ingredient => {
        return {
          name: ingredient,
          plates_id
        }
      });

      await knex("ingredients").insert(ingredientsInsert);
    }

    return res.json({ plates_id })

  }

  async update(req, res) {
    const { id } = req.params;
    const { title, description, category, price } = req.body;
    const imageFile = req.file; // Obter o objeto de arquivo
  
    const plate = await knex('plates').where('id', id).first();
  
    if (!plate) {
      throw new AppError('Esse prato não existe', 400);
    }
  
    // Atualizar os campos do prato
    plate.title = title ?? plate.title;
    plate.description = description ?? plate.description;
    plate.category = category ?? plate.category;
    plate.price = price ?? plate.price;
  
    if (imageFile) {
      const imageFilename = imageFile.filename;
  
      // Salvar a nova foto
      const newFilename = await diskStorage.saveFile(imageFilename);
  
      // Atualizar apenas a imagem do prato
      plate.image = newFilename;
    }
  
    // Atualizar o prato no banco de dados
    await knex('plates').where('id', id).update({
      title: plate.title,
      description: plate.description,
      category: plate.category,
      price: plate.price,
      image: plate.image
    });
  
    return res.json(plate);
  }
  

  async show(req, res) {
    const { id } = req.params;

    const plate = await knex('plates').where({ id }).first();
    const ingredients = await knex('ingredients').where({ plates_id: id }).orderBy('name');

    return res.json({
      ...plate,
      ingredients
    })
  }

  async delete(req, res) {
    const { id } = req.params;

    await knex('plates').where({ id }).delete();

    return res.json();
  }


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