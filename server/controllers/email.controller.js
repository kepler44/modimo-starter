const { promisify } = require("util");
const crypto = require("crypto");
const validator = require("validator");
const db = require("../models/common.model");
const Users = db.users;

const nodemailer = require("nodemailer");
const randomBytesAsync = promisify(crypto.randomBytes);

const sendMail = async (settings) => {
	let transportConfig;

	transportConfig = {
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	};
	let transporter = nodemailer.createTransport(transportConfig);

	return transporter
		.sendMail(settings.mailOptions)
		.then(() => {
			settings.req[settings.successfulType] = settings.successfulMsg;
			//settings.req.flash(settings.successfulType, { msg: settings.successfulMsg });
			//return res.send({ success: settings.successfulMsg });
		})
		.catch((err) => {
			if (err.message === "self signed certificate in certificate chain") {
				console.log(
					"WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production."
				);
				transportConfig.tls = transportConfig.tls || {};
				transportConfig.tls.rejectUnauthorized = false;
				transporter = nodemailer.createTransport(transportConfig);
				return transporter.sendMail(settings.mailOptions).then(() => {
					settings.req[settings.successfulType] = settings.successfulMsg;
					//settings.req.flash(settings.successfulType, { msg: settings.successfulMsg });
				});
			}
			console.log(settings.loggingError, err);
			settings.req[settings.errorType] = settings.errorMsg;
			//settings.req.flash(settings.errorType, { msg: settings.errorMsg });
			return err;
			//return res.send({ errors: { email: settings.errorMsg } });
		});
};

exports.getVerifyEmailToken = async (req, res, next) => {
	if (req.user.emailVerified) return res.send({ message: "The email address has been verified!" });

	if (req.params.token && !validator.isHexadecimal(req.params.token))
		return res.send({ errors: { email: "Invalid Token. Please retry." } });

	if (req.params.token === req.user.emailVerificationToken) {
		Users.findByEmail(req, req.user.email)
			.then(async (user) => {
				if (!user) return res.send({ errors: { email: "There was an error in loading your profile." } });
				await req.sessionStore.pool.query(`update users set emailVerificationToken='' emailVerified=true where id=$1`, [
					user.id,
				]);
				return res.send({ message: "Thank you for verifying your email address." });
			})
			.catch((error) => {
				console.log("Error saving the user profile to the database after email verification", error);
				return res.send({
					errors: { email: "There was an error when updating your profile.  Please try again later." },
				});
			});
	} else {
		return res.send({
			errors: { email: "The verification link was invalid, or is for a different account." },
		});
	}
};

exports.getVerifyEmail = async (req, res, next) => {
	if (req.user.emailVerified) return res.send({ message: "The email address has been verified!" });
	const createRandomToken = randomBytesAsync(16).then((buf) => buf.toString("hex"));

	const setRandomToken = async (token) => {
		await req.sessionStore.pool.query(
			`
            UPDATE users SET emailVerificationToken=$1 WHERE id=$2
        `,
			[token, req.user.id]
		);
		return token;
	};

	const sendVerifyEmail = (token) => {
		const mailOptions = {
			to: req.user.email,
			from: "Modimo Starter",
			subject: "Please verify your email address on Modimo Starter",
			text: `Thank you for registering with modimo-starter.\n\n
          This verify your email address please click on the following link, or paste this into your browser:\n\n
          http://${req.headers.host}/profile/verify/${token}\n\n
          \n\n
          Thank you!`,
		};
		const mailSettings = {
			successfulType: "info",
			successfulMsg: `An e-mail has been sent to ${req.user.email} with further instructions.`,
			loggingError: "ERROR: Could not send verifyEmail email after security downgrade.\n",
			errorType: "errors",
			errorMsg: "Error sending the email verification message. Please try again shortly.",
			mailOptions,
			req,
		};
		return sendMail(mailSettings);
	};

	createRandomToken
		.then(setRandomToken)
		.then(sendVerifyEmail)
		.then(() => {
			if (req.errors) {
				res.send({ errors: req.errors });
			} else {
				res.send({ message: req.info });
			}
		})
		.catch(next);
};
