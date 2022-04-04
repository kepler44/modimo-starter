import axios from "axios";
/**
 * Axios
 */
const axiosRequest = axios.create({
	baseURL: process.env.REACT_APP_CLIENT_ID,
	validateStatus: function (status) {
		return status === 200 || status === 304 || (status >= 400 && status < 500);
	},
});

axiosRequest.interceptors.request.use(function (config) {
	// change the url scheme from http to https
	config.url = config.url.replace("http://", "https://");
	return config;
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
