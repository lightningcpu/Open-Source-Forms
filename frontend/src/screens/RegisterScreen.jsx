import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import { useRegisterMutation } from "../redux/slices/usersApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const RegisterScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    } else {
      try {
        const res = await register({ name, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <FormContainer>
      <div className="my-5">
        <h1 className="text-5xl font-sans text-gray-600 dark:text-gray-300">
          {t("register")}
        </h1>
      </div>

      <Form onSubmit={submitHandler} data-bs-theme={isDark ? "dark" : "light"}>
        <Form.Group controlId="name" className="my-3">
          <Form.Label className="dark:text-gray-400">{t("name")}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t("enterName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="email" className="my-3">
          <Form.Label className="dark:text-gray-400">
            {t("emailAddress")}
          </Form.Label>
          <Form.Control
            type="email"
            placeholder={t("enterEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="password" className="my-3">
          <Form.Label className="dark:text-gray-400">
            {t("password")}
          </Form.Label>
          <Form.Control
            type="password"
            placeholder={t("enterPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="confirmPassword" className="my-3">
          <Form.Label className="dark:text-gray-400">
            {t("confirmPassword")}
          </Form.Label>
          <Form.Control
            type="password"
            placeholder={t("enterPasswordAgain")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="mt-2"
            disabled={isLoading}
          >
            {t("signUp")}
          </Button>
        </div>
        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          <h1 className="font-serif dark:text-gray-400">
            {t("alreadyHaveAccount")}{" "}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="underline text-blue-900 dark:text-blue-500"
            >
              {t("signIn")}
            </Link>
          </h1>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;
