const config = {
	USER: process.env.PG_USER,
	HOST: process.env.PG_HOST,
	DB: process.env.PG_DATABASE,
	PASSWORD: process.env.PG_PASSWORD,
};

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
	host: config.HOST,
	dialect: "postgres",
	operatorsAliases: false,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 5000,
	},
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
/* db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
}); */
/* db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
}); */
//db.ROLES = ["user", "admin", "moderator"];
module.exports = db;
