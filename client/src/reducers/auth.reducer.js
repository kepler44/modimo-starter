/////////////
// REDUCER //

import { types } from "../actions/auth.types";

const initialState = {
	user: JSON.parse(localStorage.getItem("user")),
	super: JSON.parse(sessionStorage.getItem("super")),
};

export function reducer(state = initialState, { type, payload }) {
	switch (type) {
		case types.SUPERIN_FAIL:
			return { ...state, super: null };
		case types.SUPERIN_SUCCESS:
			return { ...state, super: payload.user };
		case types.SUPEROUT:
			return { ...state, super: undefined };
		case types.LOGIN_FAIL:
			return { ...state, user: null };
		case types.LOGIN_SUCCESS:
			return { ...state, user: payload.user };
		case types.LOGOUT:
			return { ...state, user: undefined };
		case types.REGISTER_FAIL:
			return { ...state };
		case types.REGISTER_SUCCESS:
			return { ...state };
		default:
			return state;
	}
}
