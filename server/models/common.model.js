const { validateToString, validateSignInForm, validateSignUpForm } = require("../middleware/formsValidator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
function convertToSetQuerySafe(o) {
	const mp =
		Object.keys(o)
			.map((k, i) => {
				const res = hotelsPropertiesCheckerHash[k];
				let output = res + "=$" + (i + 1);
				if (i != 0) output = ", " + output;
				return output;
			})

			.reduce((p, next) => p + " " + next, "") + " ";
	const vl = Object.values(o);

	return {
		query: mp,
		values: vl,
	};
}
function compareAsync(plainPass, hashword) {
	return new Promise(function (resolve, reject) {
		bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
			if (err) reject(err);
			else resolve(isPasswordMatch);
		});
	});
}
const d_names = {
	0: "users",
	1: "supers",
};
/* 
const model = (db_index) => {
	return {
		create: async (req, body) => {
			const result = await req.sessionStore.pool.query(
				`insert into ${d_names[db_index]}
            (email, username, password) 
            values ($1, $2, $3) returning *`,
				[body.email, body.username, body.password]
			);
			if (result.rowCount !== 1) throw new Error("User error 500");
			return result.rows;
		},
		findByEmail: (req, email) => {
			return new Promise(async function (resolve, reject) {
				const res = await req.sessionStore.pool.query(`select * from ${d_names[db_index]} where email=$1`, [email]);
				resolve(res.rows[0]);
			});
		},
		findById: (req, id) => {
			return new Promise(async function (resolve, reject) {
				const res = await req.sessionStore.pool.query(`select * from ${d_names[db_index]} where id=$1`, [id]);
				resolve(res.rows[0]);
			});
		},
	};
}; */

class model {
	constructor(db_index, jwt_secret, header_token_name) {
		this.db_index = db_index;
		this.db_name = d_names[db_index];
		this.jwt_secret = jwt_secret;
		this.header_token_name = header_token_name;
	}
	create = async (req, body) => {
		const result = await req.sessionStore.pool.query(
			`insert into ${this.db_name}
            (email, username, password) 
            values ($1, $2, $3) returning *`,
			[body.email, body.username, body.password]
		);
		if (result.rowCount !== 1) throw new Error("User error 500");
		return result.rows;
	};
	findByEmail = async (req, email) => {
		const dn = this.db_name;
		return new Promise(async function (resolve, reject) {
			const res = await req.sessionStore.pool.query(`select * from ${dn} where email=$1`, [email]);
			resolve(res.rows[0]);
		});
	};
	findById = async (req, id) => {
		const dn = this.db_name;
		return new Promise(async function (resolve, reject) {
			const res = await req.sessionStore.pool.query(`select * from ${dn} where id=$1`, [id]);
			resolve(res.rows[0]);
		});
	};

	signin = async (req, res) => {
		const dn = this.db_name;
		this.findByEmail(req, req.body.email, {
			where: {
				email: req.body.email,
			},
		})
			.then(async (user) => {
				if (!user) {
					return res.status(200).send({ errors: { email: "User Not found." } });
				}
				var passwordIsValid = await compareAsync(req.body.password, user.password);
				/*   = bcrypt.compareSync(
					req.body.password,
					user.password
				); */
				if (!passwordIsValid) {
					return res.status(200).send({
						accessToken: null,
						errors: { password: "Invalid Password!" },
					});
				}

				const queryString = `UPDATE ${dn} SET sessionExpired = false WHERE id = $1`;
				const queryValues = [user.id];
				await req.sessionStore.pool.query(queryString, queryValues);

				var token = jwt.sign({ id: user.id }, this.jwt_secret, {
					expiresIn: req.body.remember ? 86400 * 7 : 86400 / 24, // 7 days / 1 hours
				});
				res.status(200).send({
					id: user.id,
					username: user.username,
					email: user.email,
					accessToken: token,
				});
			})
			.catch((err) => {
				res.status(500).send({ message: err.message });
			});
	};

	signout = async (req, res) => {
		const dn = this.db_name;
		let token = req.headers[this.header_token_name];
		if (!token) {
			return res.status(200).send({ success: false });
		}
		jwt.verify(token, this.jwt_secret, async (err, decoded) => {
			if (err) return res.status(200).send({ success: false });

			const queryString = `UPDATE ${dn} SET sessionExpired = true WHERE id = $1`;
			const queryValues = [decoded.id];
			await req.sessionStore.pool.query(queryString, queryValues);

			return res.status(200).send({ success: true });
		});
	};

	verifyToken = (req, res, next) => {
		let token = req.headers[this.header_token_name];
		if (!token) {
			return res.status(403).send({
				message: "No token provided!",
			});
		}
		jwt.verify(token, this.jwt_secret, (err, decoded) => {
			if (err) {
				return res.status(200).send({
					message: "Unauthorized!",
				});
			}

			this.findById(req, decoded.id)
				.then(async (user) => {
					if (!user || user.sessionexpired) {
						return res.status(200).send({
							message: "Unauthorized!",
						});
					}
					req.user = user;
					req.userId = user.id;
					next();
				})
				.catch((err) => {
					if (!user) {
						return res.status(200).send({
							message: "Unauthorized!",
						});
					}
				});
		});
	};
}

const ex = {
	users: new model(0, process.env.JWT_SECRET, "x-access-token"),
	supers: new model(1, process.env.JWT_SUPER_SECRET, "s-access-token"),
};

module.exports = ex;
/* findOne: (body)=>{
	const setObjectSafe = convertToSetQuerySafe(body);
const queryString = `SELECT users where
SET ${setObjectSafe.query}
WHERE id=$${setObjectSafe.values.length + 1} 
returning *`;

const queryValues = [...setObjectSafe.values];
await pool.query(queryString, queryValues);
},
findOne: (body)=>{
	const setObjectSafe = convertToSetQuerySafe(body);
const queryString = `UPDATE users
SET ${setObjectSafe.query}
WHERE id=$${setObjectSafe.values.length + 1} 
returning *`;

const queryValues = [...setObjectSafe.values];
 */
/*  const queryString = `UPDATE users
        SET ${setObjectSafe.query}
        WHERE id=$${setObjectSafe.values.length + 1} 
        returning *`); */
/* module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define("users", {
		username: {
			field: "username",
			type: Sequelize.STRING,
		},
		email: {
			type: Sequelize.STRING,
		},
		password: {
			type: Sequelize.STRING,
		},
		createdAt: {
			field: "createdat",
			type: Sequelize.DATE,
		},
		updatedAt: {
			field: "updatedat",
			type: Sequelize.DATE,
		},
	});
	return User;
}; */

/*
create a new User: create(object)
find a User by id: findByPk(id)
find a User by email: findOne({ where: { email: ... } })
get all Users: findAll()
find all Users by username: findAll({ where: { username: ... } })
*/
