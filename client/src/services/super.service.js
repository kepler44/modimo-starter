import { types } from "../actions/auth.types";
import axiosRequest from "../api/axiosRequest";

export function authHeader() {
	const user = JSON.parse(sessionStorage.getItem("super"));
	if (user && user.accessToken) {
		// for Node.js Express back-end
		return { "s-access-token": user.accessToken };
	} else {
		return {};
	}
}

export const verifyToken = (dispatch, resolve) => {
	axiosRequest
		.put("/admin/login", {}, { headers: authHeader() })
		.then((res) => {
			if (res.data.success === "ok") resolve(true);
			else {
				resolve(false);
				dispatch({ type: types.SUPERIN_FAIL });
			}
		})
		.catch((err) => {
			resolve(false);
			dispatch({ type: types.SUPERIN_FAIL });
			console.log(err);
		});
};

export const getSuperPrivateContent = (resolve) => {
	axiosRequest
		.get("/admin/users", { headers: authHeader() })
		.then((res) => {
			resolve(res.data);
		})
		.catch((err) => {
			console.log(err);
		});
};
