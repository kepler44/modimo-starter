import * as React from "react";
import { useSelector } from "react-redux";
import { useRoutes, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import Admin from "./admin/admin";
import Footer from "./components/footer.comp";
import NavBar from "./components/navbar.comp";
import Home from "./pages/home";
import Profile from "./pages/profile";
import SignIn from "./pages/signin/signin";
import SignUp from "./pages/signup/signup";
import { selectUser } from "./reducers/auth.selector";
import { login } from "./actions/auth.actions";

function App() {
	const location = useLocation();
	const pathname = location.pathname.toLowerCase();

	console.log(process.env.REACT_APP_CLIENT_ID);
	if (pathname.startsWith("/admin")) {
		return (
			<React.Fragment>
				<div>
					<Admin />
				</div>
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<div>
				<NavBar />
				<div className="container flex-shrink-0">
					<RenderRoutes />
				</div>
				<Footer />
			</div>
		</React.Fragment>
	);
}

function RenderRoutes() {
	const user = useSelector(selectUser);
	//useSelector(selectUser);
	const location = useLocation();
	const pathname = location.pathname.toLowerCase();
	const from = React.useRef("/");
	const isSignPath = pathname.indexOf("signin") !== -1 || pathname.indexOf("signup") !== -1;
	if (!isSignPath) from.current = pathname;

	//const from = (location.state?.from || { from: { pathname: "/" } }).pathname ?? "/";
	const routes = useRoutes([
		{
			index: "true",
			path: "/",
			element: <Home />,
		},
		{
			path: "/home",
			element: <Navigate to="/" replace="true" />,
		},
		{
			path: "/profile",
			element: !user ? <Navigate to="/signin" replace="true" /> : <Profile />,
		},
		{
			path: "/signin",
			element: user ? <Navigate to={from.current} replace="true" /> : <SignIn login={login} />,
		},
		{
			path: "/signup",
			element: user ? <Navigate to="/profile" replace="true" /> : <SignUp />,
		},
		{
			path: "*",
			//element: <Navigate to="/404" replace="true" />,
			element: <div>page not found</div>,
		},
	]);
	return <div>{routes}</div>;
}

export default App;
