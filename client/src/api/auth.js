import axiosRequest from "./axiosRequest";
class AuthService {
	superin(data) {
		return axiosRequest.post("/admin/login", data).then((response) => {
			if (response.data.accessToken) {
				sessionStorage.setItem("super", JSON.stringify(response.data));
			}
			return response.data;
		});
	}
	superout() {
		sessionStorage.removeItem("super");
		return axiosRequest.post("/admin/logout", {}).then((response) => {
			return response.data;
		});
	}
	login(data) {
		return axiosRequest.post("/login", data).then((response) => {
			if (response.data.accessToken) {
				localStorage.setItem("user", JSON.stringify(response.data));
				//sessionStorage.setItem("user", JSON.stringify(response.data));
			}
			return response.data;
		});
	}
	logout() {
		localStorage.removeItem("user");
		return axiosRequest.post("/logout", {}).then((response) => {
			return response.data;
		});

		//sessionStorage.removeItem("user");
	}
	register({ username, email, password }) {
		return axiosRequest
			.post("/signup", {
				username,
				email,
				password,
			})
			.then((response) => {
				return response.data;
			});
	}
	sendVerifyEmail() {
		return axiosRequest.post("/profile/verify", {}).then((response) => {
			return response.data;
		});
	}
}
export default new AuthService();
