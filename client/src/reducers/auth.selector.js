import { useSelector } from "react-redux";
import { createSelector } from "reselect";

const selectStore = (stores) => stores.auth;

export const selectUser = createSelector([selectStore], (state) => state.user);
export const selectSuper = createSelector([selectStore], (state) => state.super);
