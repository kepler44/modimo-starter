import React, { Component, useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../../actions/auth.actions";
import "./signup.scss";

const INITIAL_STATE = {
	email: "",
	username: "",
	password: "",
	passwordConf: "",
};

const SignUp = () => {
	const dispatch = useDispatch();

	const [signState, setSignState] = useState({ ...INITIAL_STATE });
	const [isLoading, setIsLoading] = useState(false);
	const [formErrors, setFormErrors] = useState({});

	const emptyValidator = () => {
		return (
			signState.email === "" || signState.username === "" || signState.password === "" || signState.passwordConf === ""
		);
	};

	const onChange = (e) => {
		setSignState({ ...signState, [e.target.name]: e.target.value });
	};

	const onSubmit = (e) => {
		e.preventDefault();

		if (signState.passwordConf !== signState.password) {
			setFormErrors({ passwordConf: "Passwords don't match" });
			return;
		} else {
			setFormErrors({});
		}

		setIsLoading(true);

		register(signState)(dispatch, (data) => {
			setIsLoading(false);
			//if (data.success) setSignState({ ...INITIAL_STATE });
			setFormErrors(data.errors ?? {});
		});
	};

	return (
		<main className="form-signin needs-validation">
			<form onSubmit={onSubmit}>
				<h1 className="h3 mb-3 fw-normal">Create a new account</h1>

				<div className="form-floating">
					<input
						value={signState.email}
						onChange={onChange}
						name="email"
						className={`form-control ${formErrors.email && "is-invalid"}`}
						type="email"
						placeholder="name@example.com"
						required
					/>
					<label>Email address *</label>
					<div className="invalid-feedback">{formErrors.email}</div>
				</div>
				<div className="form-floating mt-3">
					<input
						value={signState.username}
						onChange={onChange}
						name="username"
						className={`form-control ${formErrors.username && "is-invalid"}`}
						type="text"
						placeholder="name@example.com"
						required
					/>
					<label>User Name *</label>
					<div className="invalid-feedback">{formErrors.username}</div>
				</div>
				<div className="form-floating mt-3">
					<input
						value={signState.password}
						onChange={onChange}
						name="password"
						className={`form-control ${formErrors.password && "is-invalid"}`}
						type="password"
						placeholder="Password"
						required
					/>
					<label>Password *</label>
					<div className="invalid-feedback">{formErrors.password}</div>
				</div>
				<div className="form-floating mt-3">
					<input
						value={signState.passwordConf}
						onChange={onChange}
						name="passwordConf"
						className={`form-control ${formErrors.passwordConf && "is-invalid"}`}
						type="password"
						placeholder="Password"
						required
					/>
					<label>Confirm Password *</label>
					<div className="invalid-feedback">{formErrors.passwordConf}</div>
				</div>

				<div className="mt-3">
					<div className={`${formErrors.message && "is-invalid"}`}></div>
					<div className="invalid-feedback">{formErrors.message}</div>
					<button
						className={`w-100 btn btn-lg btn-primary ${formErrors.message && "is-invalid"}`}
						type="submit"
						disabled={emptyValidator()}
					>
						Create account
						{isLoading && (
							<span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
						)}
					</button>
				</div>
			</form>
		</main>
	);
};

export default SignUp;
