///////////
// TYPES //

export const types = {
	CHECK_PAYMENT_FORM: "payment/CHECK_PAYMENT_FORM",
	CHECK_PAYMENT_FORM_COMPLETED: "payment/CHECK_PAYMENT_FORM_COMPLETED",
	SEND_ORDER: "payment/SEND_ORDER",
	SEND_ORDER_COMPLETED: "payment/SEND_ORDER_COMPLETED",
	CLEAR_RESPONSE: "payment/CLEAR_RESPONSE",
};

/////////////
// REDUCER //

const initialState = {
	sendBody: {},
	sendOrderLoading: false,
	sendErrors: "",
	sendResponse: [],
};

export function reducer(state = initialState, { type, payload }) {
	switch (type) {
		case types.CLEAR_RESPONSE:
			state.sendResponse = [];
			return { ...state };
		case types.CHECK_PAYMENT_FORM:
			state.sendBody = payload;
			return { ...state };
		case types.CHECK_PAYMENT_FORM_COMPLETED:
			state.sendErrors = payload;
			return { ...state };
		case types.SEND_ORDER:
			state.sendOrderLoading = true;
			state.sendBody = payload;
			return { ...state };
		case types.SEND_ORDER_COMPLETED:
			state.sendOrderLoading = false;
			if (payload.errors) state.sendErrors = payload.errors;
			else if (payload.sendResponse) state.sendResponse = payload.sendResponse;
			return { ...state };
		default:
			return state;
	}
}

/////////////////////
// ACTIONS CREATOR //

export const actionsCreator = {
	checkPaymentForm: (payload) => ({
		type: types.CHECK_PAYMENT_FORM,
		payload: payload,
	}),
	sendOrder: (payload) => ({
		type: types.SEND_ORDER,
		payload: payload,
	}),
	clearResponse: () => ({
		type: types.CLEAR_RESPONSE,
	}),
};
