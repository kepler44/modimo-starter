import React, { Component } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, verify } from "../../actions/auth.actions";
import { selectUser } from "../../reducers/auth.selector";

const EmailVerifyButton = (props) => {
	const emailVerified = props.user.emailVerified;
	const dispatch = useDispatch();
	if (emailVerified) return null;
	const sendVerifyEmail = (e) => {
		verify()(dispatch);
	};
	return (
		<div className="mt-5">
			Your account is not verified!
			<button className={`w-100 btn btn-lg btn-primary `} type="button" onClick={sendVerifyEmail}>
				Send Verify Email
			</button>
		</div>
	);
};

const Profile = () => {
	const user = useSelector(selectUser);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const onLogout = (e) => {
		logout()(dispatch);
		navigate("/");
	};

	return (
		<div className="">
			<div className="card mb-3 container" style={{ maxWidth: "800px" }}>
				<div className="card-body">
					<div className="row">
						<div className="col-sm-12">Profile</div>
					</div>
					<hr />
					<div className="row">
						<div className="col-sm-3">
							<h6 className="mb-0">User Name</h6>
						</div>
						<div className="col-sm-9 text-secondary">{user.username}</div>
					</div>
					<hr />
					<div className="row">
						<div className="col-sm-3">
							<h6 className="mb-0">Email</h6>
						</div>
						<div className="col-sm-9 text-secondary">{user.email}</div>
					</div>
					<EmailVerifyButton user={user} />

					<button className={`w-100 btn btn-lg btn-secondary mt-5`} type="button" onClick={onLogout}>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
};

export default Profile;
