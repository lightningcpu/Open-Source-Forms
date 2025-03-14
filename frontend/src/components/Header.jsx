import { useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../redux/slices/usersApiSlice";
import { logout } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../redux/slices/languageSlice";
import useTheme from "../hooks/useTheme";

const Header = () => {
  const { t, i18n } = useTranslation();

  const isDark = useTheme();

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const adminHandler = () => {
    navigate("/admin");
  };

  const profileHandler = () => {
    navigate("/profile");
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const changeLanguage = (lang) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <header>
      <Navbar
        bg="dark"
        variant="dark"
        expand="md"
        collapseOnSelect
        data-bs-theme={isDark ? "dark" : "light"}
      >
        <LinkContainer to="/">
          <Navbar.Brand className="px-3 dark:opacity-60">
            {t("brand")}
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto px-2 gap-2">
            <NavDropdown title={t("language")} id="language-picker" align="end">
              <NavDropdown.Item onClick={() => changeLanguage("en")}>
                English
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage("ru")}>
                Русский
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage("be")}>
                Беларуская
              </NavDropdown.Item>
            </NavDropdown>
            {userInfo ? (
              <NavDropdown title={userInfo.name} id="username" align="end">
                <NavDropdown.Item
                  onClick={adminHandler}
                  hidden={!userInfo.isAdmin}
                >
                  {t("adminPanel")}
                </NavDropdown.Item>
                <NavDropdown.Item onClick={profileHandler}>
                  {t("profile")}
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logoutHandler}>
                  {t("logout")}
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link className="d-flex align-items-center gap-2">
                  <FaUser /> {t("login")}
                </Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
