import React, { Component } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectUser } from "../reducers/auth.selector";
import { verifyToken } from "../services/user.service";

const NavbarProfile = () => {
	const user = useSelector(selectUser);
	const dispatch = useDispatch();
	const [userVerified, setUserVerified] = React.useState(false);
	React.useEffect(() => {
		verifyToken(dispatch, (res) => {
			setUserVerified(res);
		});
	}, [user]);
	if (user) {
		if (!userVerified)
			return (
				<div className="btn btn-outline-success ms-2" type="button">
					<span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
					{user.username} (Profile)
				</div>
			);
		return (
			<Link className="btn btn-outline-success ms-2" type="button" to="/profile">
				{user.username} (Profile)
			</Link>
		);
	} else {
		return (
			<Link className="btn btn-outline-success ms-2" type="button" to="/signin">
				SignIn
			</Link>
		);
	}
};

export default NavbarProfile;
