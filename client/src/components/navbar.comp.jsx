import React, { Component } from "react";
import "./navbar.comp.scss";
import { Link } from "react-router-dom";
import NavbarProfile from "./navbar.profile";

const NavBar = () => {
	return (
		<nav className="navbar navbar-expand-sm navbar-light bg-light mb-3">
			<div className="container" style={{ maxWidth: "800px" }}>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
					aria-controls="navbarNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarNav">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link className="nav-link active" aria-current="page" to="/">
								HOME
							</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/admin">
								ADMIN
							</Link>
						</li>
					</ul>
					<form className="d-flex">
						<NavbarProfile />
					</form>
				</div>
			</div>
		</nav>
	);
};

export default NavBar;
