const db = require("../models/common.model");
const Users = db.users;
checkDuplicateUsernameOrEmail = (req, res, next) => {
	// Username

	Users.findByEmail(req, req.body.email, {
		where: {
			email: req.body.email,
		},
	}).then((user) => {
		if (user) {
			res.status(200).send({
				errors: { email: "Email is already in use!" },
				// errors: { message: "Username is already in use!" },
			});
			return;
		}
		next();
		/*    // Email
		Users.findByEmail(req.body.email, {
			where: {
				email: req.body.email,
			},
		}).then((user) => {
			if (user) {
				res.status(200).send({
					errors: { message: "Email is already in use!" },
				});
				return;
			}
			next();
		}); */
	});
};

const verifySignUp = {
	checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
};
module.exports = verifySignUp;
