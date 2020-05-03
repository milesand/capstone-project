// frontend/src/actions/todos.js

import { tokenConfig } from './auth'; // added

// GET USERS
export const getTodos = () => async (dispatch, getState) => {
  const res = await axios.get('/api/', tokenConfig(getState));
  // ...
};
