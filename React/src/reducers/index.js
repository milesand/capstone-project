import auth from './auth'; // added

export default combineReducers({
  form: formReducer,
  todos,
  auth // added
});