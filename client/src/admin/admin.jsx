import React, { Component, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { superin, superout } from "../actions/auth.actions";
import SignIn from "../pages/signin/signin";
import { selectSuper } from "../reducers/auth.selector";
import { verifyToken } from "../services/super.service";
import { getSuperPrivateContent } from "./../services/super.service";
import "./admin.scss";

const Content = () => {
	const [currentPage, setCurrentPage] = React.useState(0);
	const [_usersList, setUsersList] = React.useState([]);

	const [search, setSearch] = React.useState({
		email: "",
		username: "",
	});
	const onSearchChanged = (e) => {
		setSearch({ ...search, [e.target.name]: e.target.value });
	};

	React.useEffect(() => {
		getSuperPrivateContent((data) => {
			setUsersList(data);
		});
	}, []);

	let usersList;
	if (search.email !== "" || search.username !== "") {
		usersList = _usersList.filter(
			(u) =>
				(search.email === "" || u.email.indexOf(search.email)) !== -1 &&
				(search.username === "" || u.username.indexOf(search.username) !== -1)
		);
	} else {
		usersList = _usersList;
	}

	const PAGE_SIZE = 10;
	const pageCount = Math.floor(usersList.length / PAGE_SIZE);
	const pages = Array.apply(null, Array(pageCount + 1)).map((p, i) => i);

	return (
		<div style={{ maxWidth: "800px" }} className="container mt-5">
			<table className="table table-dark">
				<thead>
					<tr>
						<th scope="col"></th>
						<th scope="col">
							<div>
								<input
									value={search.username}
									onChange={onSearchChanged}
									name="username"
									className={`form-control `}
									type="text"
									placeholder="Username"
								/>
							</div>
						</th>
						<th scope="col">
							<div>
								<input
									value={search.email}
									onChange={onSearchChanged}
									name="email"
									className={`form-control `}
									type="text"
									placeholder="Email"
								/>
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{(() => {
						const start = currentPage * PAGE_SIZE;
						const end = Math.min(currentPage * PAGE_SIZE + PAGE_SIZE, usersList.length);
						const output = [];
						for (let i = start; i < end; i++) {
							output.push(usersList[i]);
						}
						return output.map((user) => {
							return (
								<tr key={user.id}>
									<th scope="row">{user.id}</th>
									<td>{user.username}</td>
									<td>{user.email}</td>
								</tr>
							);
							/* return (
						<div className="row" key={user.id}>
							<div className="col-3">{user.id}</div>
							<div className="col-3">{user.email}</div>
							<div className="col-3">{user.username}</div>
						</div>
					); */
						});
					})()}
				</tbody>
			</table>
			<nav aria-label="Page navigation example" className="">
				<ul className="pagination container mt-5">
					<li className="page-item" onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}>
						<div className="page-link">Prev</div>
					</li>
					{pages.map((p) => {
						const active = p === currentPage;
						return (
							<li key={p} className={`page-item ${active ? "active" : ""}`} onClick={() => setCurrentPage(p)}>
								<div className="page-link">{p + 1}</div>
							</li>
						);
					})}
					<li className="page-item" onClick={() => setCurrentPage(Math.min(currentPage + 1, pages.length - 1))}>
						<div className="page-link">Next</div>
					</li>
				</ul>
			</nav>
		</div>
	);
};

const Admin = () => {
	const dispatch = useDispatch();
	const [userVerified, setUserVerified] = React.useState(false);
	const user = useSelector(selectSuper);
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!user) {
			return;
		}
		verifyToken(dispatch, (res) => {
			setUserVerified(res);
		});
	}, [user]);

	const closeAdminSession = () => {
		superout()(dispatch);
		navigate("/");
	};

	const isFetching = user && !userVerified;

	return (
		<div className="container">
			Admin area ('a@a.com'/'admin' to login or use 'node server.js addsuper email= password=' in command line)
			<div className="ms-5 btn-danger" onClick={closeAdminSession} type="button">
				CLOSE ADMIN SESSION
			</div>
			{isFetching && <h1>Session is loading...</h1>}
			{!user && <SignIn login={superin} createUserDisallow={true} />}
			{user && userVerified && <Content />}
		</div>
	);
};

export default Admin;
