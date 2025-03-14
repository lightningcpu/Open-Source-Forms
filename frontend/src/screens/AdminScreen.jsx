import { Table, Button, Row, Col } from "react-bootstrap";
import {
  FaTimes,
  FaTrash,
  FaCheck,
  FaLock,
  FaLockOpen,
  FaSort,
} from "react-icons/fa";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useAdminUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} from "../redux/slices/usersApiSlice";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { useLogoutMutation } from "../redux/slices/usersApiSlice";
import { logout } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const AdminScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: users = [], refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();
  const [adminUser, { isLoading: loadingAdmin }] = useAdminUserMutation();
  const [blockUser, { isLoading: loadingBlock }] = useBlockUserMutation();
  const [unblockUser, { isLoading: loadingUnblock }] = useUnblockUserMutation();

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = useCallback(async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  }, [logoutApiCall, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      if (error.data?.message === "Account blocked.") {
        logoutHandler();
      }
      toast.error(error.data?.message || t("anErrorOccurred"));
    }
  }, [error, logoutHandler, t]);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error(t("pleaseSelectUsers"));
      return;
    }

    if (window.confirm(t("confirmAction", { action }))) {
      let actionCount = 0;

      try {
        const reorderedUsers = [
          ...selectedUsers.filter((id) => id !== userInfo.id),
          ...selectedUsers.filter((id) => id === userInfo.id),
        ];

        for (const userId of reorderedUsers) {
          const user = users.find((user) => user.id === userId);

          switch (action) {
            case "delete":
              await deleteUser(userId).unwrap();
              actionCount++;
              break;
            case "admin":
              await adminUser(userId).unwrap();
              actionCount++;
              break;
            case "block":
              if (user.isBlocked === true) continue;
              await blockUser(userId).unwrap();
              actionCount++;
              break;
            case "unblock":
              if (user.isBlocked === false) continue;
              await unblockUser(userId).unwrap();
              actionCount++;
              break;
            default:
              toast.error(t("unknownAction"));
          }
        }

        if (actionCount > 0) {
          toast.success(t("actionSuccess", { count: actionCount, action }));
        }

        setSelectedUsers([]);
        refetch();
      } catch (err) {
        toast.error(t("actionFailed"));
      }
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const dateA = moment(a.lastLogin);
    const dateB = moment(b.lastLogin);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const handleSort = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };

  return (
    <>
      <Row>
        <Col sm={12}>
          <h1 className="text-center fs-1 dark:text-gray-300 py-5">
            {t("adminPanel")}
          </h1>
        </Col>
      </Row>
      {loadingDelete ||
        loadingAdmin ||
        loadingBlock ||
        (loadingUnblock && <Loader />)}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error.message || t("notAdmin")}</Message>
      ) : (
        <>
          <div className="py-3 pl-1">
            <Row className="align-items-center justify-content-between">
              <Col
                xs={12}
                sm="auto"
                className="d-flex flex-wrap gap-3 mb-2 mb-sm-0"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                  className="scale-125"
                />
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="primary"
                  onClick={() => handleAction("delete")}
                >
                  <FaTrash /> {t("delete")}
                </Button>
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="primary"
                  onClick={() => handleAction("admin")}
                >
                  <FaLock /> {t("admin")}
                </Button>
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="primary"
                  onClick={() => handleAction("block")}
                >
                  <FaLock /> {t("block")}
                </Button>
                <Button
                  className="d-flex align-items-center gap-2"
                  variant="primary"
                  onClick={() => handleAction("unblock")}
                >
                  <FaLockOpen /> {t("unblock")}
                </Button>
              </Col>

              <Col xs={12} sm="auto" className="text-sm-end">
                <Button
                  className="d-flex align-items-center"
                  onClick={handleSort}
                >
                  <FaSort /> {t("sortByLastLogin")}
                </Button>
              </Col>
            </Row>
          </div>
          <Table
            striped
            hover
            responsive
            className="table-sm"
            variant={isDark ? "dark" : "light"}
          >
            <thead>
              <tr>
                <th>{t("select")}</th>
                <th>{t("name")}</th>
                <th>{t("email")}</th>
                <th>{t("admin")}</th>
                <th>{t("blocked")}</th>
                <th>{t("lastLogin")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>
                    <a
                      href={`mailto:${user.email}`}
                      className="underline text-blue-500"
                    >
                      {user.email}
                    </a>
                  </td>
                  <td>{user.isAdmin ? <FaCheck /> : <FaTimes />}</td>
                  <td>{user.isBlocked ? <FaCheck /> : <FaTimes />}</td>
                  <td
                    className="font-thin overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ maxWidth: "200px" }}
                  >
                    {moment(user.lastLogin).format("MMMM Do YYYY, h:mm:ss a")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default AdminScreen;
