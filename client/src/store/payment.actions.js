import { fork, put, race, select, take, call } from "redux-saga/effects";
import { takeEvery } from "redux-saga/effects";
import { types } from "./payment.reducer";
import axiosRequest from "../api/axiosRequest";

export const actions = {
	sendPaymentData: function* () {
		yield takeEvery(types.SEND_ORDER, function* (action) {
			const data = action.payload;

			try {
				const validateRes = yield call(
					axiosRequest.post,
					"/payments/validate",
					data
				);

				if (validateRes.data.errors !== undefined) {
					yield put({
						type: types.SEND_ORDER_COMPLETED,
						payload: { errors: validateRes.data.errors },
					});
				} else {
					const orderRes = yield call(axiosRequest.post, "/payments", data);

					const sendResponse = [
						{ key: "RequestId", value: orderRes.data.RequestId },
						{ key: "Amount", value: orderRes.data.Amount },
					];

					yield put({
						type: types.SEND_ORDER_COMPLETED,
						payload: { success: "ok", sendResponse: sendResponse },
					});
				}
			} catch (err) {
				console.log(err);
			}
		});
	},
};
