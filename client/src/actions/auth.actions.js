import auth from "../api/auth";
import { types } from "./auth.types";

/**
 * Profile
 */
export const verify = () => (dispatch) => {
	auth.sendVerifyEmail();
};

/**
 * User Auth
 */
export const login = (data) => (dispatch, callback) => {
	auth.login(data).then(
		(data) => {
			if (data.errors) {
				callback({ errors: data.errors });
				dispatch({
					type: types.LOGIN_FAIL,
				});
			} else {
				callback({ success: true });
				dispatch({
					type: types.LOGIN_SUCCESS,
					payload: { user: data },
				});
			}
			return Promise.resolve();
		},
		(error) => {
			const message =
				(error.response && error.response.data && error.response.data.message) || error.message || error.toString();
			callback({ errors: { message: message } });
			dispatch({
				type: types.LOGIN_FAIL,
			});
			dispatch({
				type: types.SET_MESSAGE,
				payload: message,
			});
			return Promise.resolve();
			//return Promise.reject();
		}
	);
};

export const register = (_data) => (dispatch, callback) => {
	return auth.register(_data).then(
		(data) => {
			if (data.errors) {
				callback({ errors: data.errors });
				dispatch({
					type: types.REGISTER_FAIL,
				});
			} else {
				dispatch({
					type: types.REGISTER_SUCCESS,
					//payload: { user: data },
				});
				verify()(dispatch);
				login({ ..._data, remember: false })(dispatch, callback);
				//callback({ success: true });
			}
			return Promise.resolve();
		},
		(error) => {
			const message =
				(error.response && error.response.data && error.response.data.message) || error.message || error.toString();

			callback({ errors: { message: message } });
			dispatch({
				type: types.REGISTER_FAIL,
			});
			dispatch({
				type: types.SET_MESSAGE,
				payload: message,
			});
			return Promise.resolve();
		}
	);
};

export const logout = () => (dispatch) => {
	auth.logout();
	dispatch({
		type: types.LOGOUT,
	});
};

/**
 * Admin Auth
 */
export const superin = (data) => (dispatch, callback) => {
	auth.superin(data).then(
		(data) => {
			if (data.errors) {
				callback({ errors: data.errors });
				dispatch({
					type: types.SUPERIN_FAIL,
				});
			} else {
				callback({ success: true });
				dispatch({
					type: types.SUPERIN_SUCCESS,
					payload: { user: data },
				});
			}
			return Promise.resolve();
		},
		(error) => {
			const message =
				(error.response && error.response.data && error.response.data.message) || error.message || error.toString();
			callback({ errors: { message: message } });
			dispatch({
				type: types.SUPERIN_FAIL,
			});
			dispatch({
				type: types.SET_MESSAGE,
				payload: message,
			});
			return Promise.resolve();
			//return Promise.reject();
		}
	);
};

export const superout = () => (dispatch) => {
	auth.superout();
	dispatch({
		type: types.SUPEROUT,
	});
};
