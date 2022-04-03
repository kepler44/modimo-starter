import { createStore, applyMiddleware, combineReducers } from "redux";

import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { all, call } from "redux-saga/effects";

import storage from "redux-persist/lib/storage"; //sessionStorage
import { persistReducer } from "redux-persist";
import { persistStore } from "redux-persist";

import { reducer as authReducer } from "./reducers/auth.reducer";
import { actions as paymentActions } from "./store/payment.actions";

/**
 * Middle wares.
 */

const middleWares = [];
const sagaMiddleware = createSagaMiddleware();
middleWares.push(sagaMiddleware);
if (process.env.NODE_ENV === "development") {
	middleWares.push(logger);
}

/**
 * Reducers.
 */

export const combinedReducers = {
	auth: authReducer,
};

export const combinedReducer = combineReducers({
	...combinedReducers,
});
const persistConfig = {
	key: "root",
	storage,
	whitelist: ["-"],
};
const persisterReducer = persistReducer(persistConfig, combinedReducer);

/**
 * Store.
 */

export const store = createStore(persisterReducer, applyMiddleware(...middleWares));
export const persister = persistStore(store);

/**
 * Saga runner.
 */

function* combinedSaga() {
	const flatActionsArray = [...Object.values(paymentActions).map((a) => call(a))];
	yield all(flatActionsArray);
}
sagaMiddleware.run(combinedSaga);
