import { types } from "../actions/auth.types";
import axiosRequest from "../api/axiosRequest";

export function authHeader() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (user && user.accessToken) {
		// for Node.js Express back-end
		return { "x-access-token": user.accessToken };
	} else {
		return {};
	}
}

export const verifyToken = (dispatch, resolve) => {
	axiosRequest
		.put("/login", {}, { headers: authHeader() })
		.then((res) => {
			if (res.data.success === "ok") resolve(true);
			else {
				resolve(false);
				dispatch({ type: types.LOGIN_FAIL });
			}
		})
		.catch((err) => {
			resolve(false);
			dispatch({ type: types.LOGIN_FAIL });
			console.log(err);
		});
};
