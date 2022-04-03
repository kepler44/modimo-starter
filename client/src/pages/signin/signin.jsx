import React, { Component, useState } from "react";
import { useDispatch } from "react-redux";
//import { login } from "../../actions/auth.actions";
import "./signin.scss";
import { Link, useNavigate } from "react-router-dom";

const INITIAL_STATE = { email: "", password: "", remember: false };

const SignIn = ({ login, createUserDisallow }) => {
	const dispatch = useDispatch();

	const [signState, setSignState] = useState({ ...INITIAL_STATE });
	const [isLoading, setIsLoading] = useState(false);
	const [formErrors, setFormErrors] = useState({});

	const emptyValidator = () => {
		return signState.email === "" || signState.password === "";
	};

	const onChange = (e) => {
		setSignState({ ...signState, [e.target.name]: e.target.value });
	};

	const onSubmit = (e) => {
		e.preventDefault();
		setIsLoading(true);

		login(signState)(dispatch, (data) => {
			setIsLoading(false);
			if (data.success) setSignState({ ...INITIAL_STATE });
			setFormErrors(data.errors ?? {});
		});
	};

	return (
		<main className="form-signin">
			<form onSubmit={onSubmit}>
				<img className="mb-4" src="./assets/logo.svg" alt="" width="72" height="57" />
				<h1 className="h3 mb-3 fw-normal">Please sign in</h1>

				<div className="form-floating mt-3">
					<input
						value={signState.email}
						onChange={onChange}
						name="email"
						className={`form-control ${formErrors.email && "is-invalid"}`}
						type="email"
						placeholder="name@example.com"
						required
					/>
					<label>Email address</label>
					<div className="invalid-feedback">{formErrors.email}</div>
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
					<label>Password</label>
					<div className="invalid-feedback">{formErrors.password}</div>
				</div>

				<div className="checkbox mt-3 ">
					<input
						value={signState.remember}
						onChange={onChange}
						name="remember"
						className={`form-check-input ${formErrors.remember && "is-invalid"}`}
						type="checkbox"
					/>
					<label className="ms-2">Remember me</label>
					<div className="invalid-feedback">{formErrors.remember}</div>
				</div>
				<div className="mt-3">
					<div className={`${formErrors.message && "is-invalid"}`}></div>
					<div className="invalid-feedback">{formErrors.message}</div>
					<button
						className={`w-100 btn btn-lg btn-primary ${formErrors.message && "is-invalid"}`}
						type="submit"
						disabled={emptyValidator()}
					>
						Sign in
						{isLoading && (
							<span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
						)}
					</button>
				</div>
				{!createUserDisallow && (
					<div>
						<Link className="btn btn-outline-success mt-3" type="button" to="/signup" style={{ width: "100%" }}>
							Register a new account
						</Link>
					</div>
				)}
			</form>
		</main>
	);
};

export default SignIn;
