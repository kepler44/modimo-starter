import axios from "axios";
/**
 * Axios
 */
const axiosRequest = axios.create({
	baseURL: "http://localhost:8080",
	validateStatus: function (status) {
		return status === 200 || (status >= 400 && status < 500);
	},
});

/* export const authHeader = () => {
	const user = JSON.parse(localStorage.getItem("user"));
	if (user && user.accessToken) {
		// for Node.js Express back-end
		return { "x-access-token": user.accessToken };
	} else {
		return {};
	}
}; */

export default axiosRequest;
