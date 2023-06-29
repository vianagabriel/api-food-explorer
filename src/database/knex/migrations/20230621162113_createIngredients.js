exports.up = knex => knex.schema.createTable("ingredients", table => {
    table.increments("id"); // id do ingredient
    table.text("name").notNullable(); // Titulo do ingredient

    table.integer("plates_id").references("id").inTable("plates").onDelete("CASCADE"); // Faz a ligação com os pratos. 1 ingrediente pode estar em mais de um prato
});

exports.down = knex => knex.schema.dropTable("ingredients");