import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import AdminScreen from "./screens/AdminScreen";
import HomeScreen from "./screens/HomeScreen";
import TemplateScreen from "./screens/TemplateScreen";
import EditTemplateScreen from "./screens/EditTemplateScreen";
import EditFormScreen from "./screens/EditFormScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CreateTemplateScreen from "./screens/CreateTemplateScreen";
import FormScreen from "./screens/FormScreen";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" index={true} element={<HomeScreen />} />
      <Route path="/template/:id" element={<TemplateScreen />} />
      <Route path="/form/:id" element={<FormScreen />} />
      <Route path="/template/edit/:id" element={<EditTemplateScreen />} />
      <Route path="/form/edit/:id" element={<EditFormScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/admin" element={<AdminScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/create" element={<CreateTemplateScreen />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);

reportWebVitals();
