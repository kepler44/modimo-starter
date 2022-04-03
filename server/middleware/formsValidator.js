const validator = require("validator");

const errorMessages = {
	"0x00": "Card number field not a number",
	"0x01": "Card number should contain 16 digits",
	"0x02": "Expiration date field not a number",
	"0x03": "Expiration date should contain month and year in MM/YYYY format",
	"0x04": "Cvv field not a number",
	"0x05": "Cvv should contain 3 digits",
	"0x06": "Amount field not a number",
	"0x07": "Amount should be less than $100000",
	"0x08": "Email field required",
	"0x09": "Incorrect email",
	"0x0A": "This email already in use",
	"0x0B": "Password field required",
	"0x0C": "Passwords don't match",
	"0x0D": "User name field required",
};

function validateToString(codes) {
	if (!codes) return undefined;
	const res = {};
	for (const c in codes) {
		res[c] = errorMessages[codes[c]];
	}
	return { errors: res };
}

function defined(val) {
	return val && !validator.isEmpty(val, { ignore_whitespace: true });
}

function validateSignInForm(body) {
	let res = {};

	if (!defined(body.email)) res = { ...res, email: "0x08" };
	else if (!body.email || !validator.isEmail(body.email)) res = { ...res, email: "0x09" };

	if (!defined(body.password)) res = { ...res, password: "0x0B" };

	if (Object.keys(res).length === 0) return undefined;
	return res;
}

function validateSignUpForm(body) {
	let res = {};

	if (!defined(body.email)) res = { ...res, email: "0x08" };
	else if (!body.email || !validator.isEmail(body.email)) res = { ...res, email: "0x09" };
	else if (thisEmailInUse(body.email)) res = { ...res, email: "0x0A" };

	if (!defined(body.password)) res = { ...res, password: "0x0B" };
	//if (!defined(body.password)) res = { ...res, password: "0x0C" };

	if (!defined(body.username)) res = { ...res, username: "0x0D" };

	if (Object.keys(res).length === 0) return undefined;
	return res;
}

function thisEmailInUse(email) {
	return false;
}

const validateSignInFormMiddleware = (req, res, next) => {
	const validateResult = validateToString(validateSignInForm(req.body));
	if (validateResult) {
		res.status(200).send({
			errors: validateResult.errors,
		});
		return;
	}
	next();
};

const validateSignUpFormMiddleware = (req, res, next) => {
	const validateResult = validateToString(validateSignUpForm(req.body));
	if (validateResult) {
		res.status(200).send({
			errors: validateResult.errors,
		});
		return;
	}
	next();
};

module.exports = {
	validateToString,
	validateSignInForm,
	validateSignUpForm,
	validateSignInFormMiddleware,
	validateSignUpFormMiddleware,
};
