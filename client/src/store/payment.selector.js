import { modalUnstyledClasses } from "@mui/material";
import { createSelector } from "reselect";

const selectStore = (state) => {
	return state.payment;
};

export const selectSendOrderLoading = createSelector(
	[selectStore],
	(store) => store.sendOrderLoading
);

export const selectSendResponse = createSelector(
	[selectStore],
	(store) => store.sendResponse
);

export const selectSendError = createSelector(
	[selectStore],
	(store) => store.sendErrors
);
