const db = require("../models/common.model");
const Users = db.users;
const Supers = db.supers;
const bcrypt = require("bcrypt");

/* exports.cryptPassword = function (password, callback) {
	bcrypt.genSalt(10, function (err, salt) {
		if (err) return callback(err);

		bcrypt.hash(password, salt, function (err, hash) {
			return callback(err, hash);
		});
	});
}; */

const cryptPasswordAsync = async function (password) {
	const salt = await cryptSaltAsync();
	return await hashAsync(password, salt);
};

function cryptSaltAsync() {
	return new Promise(function (resolve, reject) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) reject(err);
			else resolve(salt);
		});
	});
}
function hashAsync(plainPass, salt) {
	return new Promise(function (resolve, reject) {
		bcrypt.hash(plainPass, salt, function (err, hash) {
			if (err) reject(err);
			else resolve(hash);
		});
	});
}

/* exports.comparePassword = function (plainPass, hashword, callback) {
	bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
		return err == null ? callback(null, isPasswordMatch) : callback(err);
	});
}; */

exports.signup = async (req, res) => {
	// Save User to Database
	const pwd = await cryptPasswordAsync(req.body.password);
	Users.create(req, {
		username: req.body.username,
		email: req.body.email,
		password: pwd,
		//	password: bcrypt.hashSync(req.body.password, 8),
	})
		.then((user) => {
			res.send({ message: "User was registered successfully!" });
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};
/* exports.signin = async (req, res) => {
	Users.findByEmail(req, req.body.email, {
		where: {
			email: req.body.email,
		},
	})
		.then(async (user) => {
			if (!user) {
				return res.status(200).send({ errors: { email: "User Not found." } });
			}
			var passwordIsValid = await compareAsync(req.body.password, user.password);
		
			if (!passwordIsValid) {
				return res.status(200).send({
					accessToken: null,
					errors: { password: "Invalid Password!" },
				});
			}

			const queryString = `UPDATE users SET sessionExpired = false WHERE id = $1`;
			const queryValues = [user.id];
			await req.sessionStore.pool.query(queryString, queryValues);

			var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
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

exports.signout = async (req, res) => {
	let token = req.headers["x-access-token"];
	if (!token) {
		return res.status(200).send({ success: false });
	}
	jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
		if (err) return res.status(200).send({ success: false });

		const queryString = `UPDATE users SET sessionExpired = true WHERE id = $1`;
		const queryValues = [decoded.id];
		await req.sessionStore.pool.query(queryString, queryValues);

		return res.status(200).send({ success: true });
	});
}; */
exports.signresponse = async (req, res) => {
	res.status(200).send({ success: "ok" });
};
exports.signin = async (req, res) => {
	return Users.signin(req, res);
};
exports.signout = async (req, res) => {
	return Users.signout(req, res);
};
exports.superin = async (req, res) => {
	return Supers.signin(req, res);
};
exports.superout = async (req, res) => {
	return Supers.signout(req, res);
};
exports.superup = async (req, body) => {
	const pwd = await cryptPasswordAsync(body.password);
	await Supers.create(req, {
		email: body.email,
		password: pwd,
	});
};

/* 	User.findOne({
		where: {
			email: req.body.email,
		},
	})
		.then(async (user) => {
			if (!user) return;
			const queryString = `UPDATE users SET sessionExpired = true WHERE id = $1`;
			const queryValues = [user.id];
			await pool.query(queryString, queryValues);
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		}); */
