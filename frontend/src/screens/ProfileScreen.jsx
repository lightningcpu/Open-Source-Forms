import React, { useEffect, useState } from "react";
import { Table, Form, Button, Row, Col, Tabs, Tab } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { toast } from "react-toastify";
import { useProfileMutation } from "../redux/slices/usersApiSlice";
import {
  useDeleteFormMutation,
  useGetUsersFormsQuery,
} from "../redux/slices/formsApiSlice";
import {
  useDeleteTemplateMutation,
  useGetUsersTemplatesQuery,
} from "../redux/slices/templatesApiSlice";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { setCredentials } from "../redux/slices/authSlice";
import { Link } from "react-router-dom";
import moment from "moment";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sortOrderForms, setSortOrderForms] = useState("desc");
  const [sortOrderTemplates, setSortOrderTemplates] = useState("desc");
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);

  const {
    data: forms,
    isLoading: loadingForms,
    error: errorForm,
    refetch: refetchForms,
  } = useGetUsersFormsQuery();

  const {
    data: templates,
    isLoading: loadingTemplates,
    error: errorTemplate,
    refetch: refetchTemplates,
  } = useGetUsersTemplatesQuery();

  const [deleteTemplate, { isLoading: loadingDeleteTemplate }] =
    useDeleteTemplateMutation();
  const [deleteForm, { isLoading: loadingDeleteForm }] =
    useDeleteFormMutation();
  const [updateProfile, { isLoading }] = useProfileMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }

    refetchForms();
    refetchTemplates();
  }, [userInfo, refetchForms, refetchTemplates]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("passwordMismatch"));
    } else {
      try {
        const res = await updateProfile({
          id: userInfo.id,
          name,
          email,
          password,
        }).unwrap();

        dispatch(setCredentials(res));
        toast.success(t("update"));
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates((prevSelected) =>
      prevSelected.includes(templateId)
        ? prevSelected.filter((id) => id !== templateId)
        : [...prevSelected, templateId]
    );
  };

  const handleSelectForm = (formId) => {
    setSelectedForms((prevSelected) =>
      prevSelected.includes(formId)
        ? prevSelected.filter((id) => id !== formId)
        : [...prevSelected, formId]
    );
  };

  const handleSelectAllTemplates = () => {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates.map((template) => template.id));
    }
  };

  const handleSelectAllForms = () => {
    if (selectedForms.length === forms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(forms.map((form) => form.id));
    }
  };

  const handleAction = async (action) => {
    let selectedItems;
    let mutation;
    let refetchFunction;
    let itemType;

    if (action === "deleteTemplate") {
      selectedItems = selectedTemplates;
      mutation = deleteTemplate;
      refetchFunction = refetchTemplates;
      itemType = t("templates");
    } else if (action === "deleteForm") {
      selectedItems = selectedForms;
      mutation = deleteForm;
      refetchFunction = refetchForms;
      itemType = t("forms");
    } else {
      toast.error(t("unknownAction"));
      return;
    }

    if (selectedItems.length === 0) {
      toast.error(t("pleaseSelectItems"));
      return;
    }

    if (window.confirm(t("areYouSureDelete", { itemType }))) {
      try {
        const results = await Promise.allSettled(
          selectedItems.map((itemId) => mutation(itemId).unwrap())
        );

        const successfulDeletions = results.filter(
          (result) => result.status === "fulfilled"
        ).length;

        if (successfulDeletions > 0) {
          toast.success(
            t("deletionSuccess", { count: successfulDeletions, itemType })
          );
        }

        if (action === "deleteTemplate") {
          setSelectedTemplates([]);
        } else {
          setSelectedForms([]);
        }
        refetchFunction();
      } catch (err) {
        toast.error(err?.data?.message || t("deletionFailed"));
      }
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2 className="text-5xl py-5 dark:text-gray-300">{t("userProfile")}</h2>
        <Form
          onSubmit={submitHandler}
          data-bs-theme={isDark ? "dark" : "light"}
        >
          <Form.Group controlId="name" className="my-3">
            <Form.Label className="dark:text-gray-300">{t("name")}</Form.Label>
            <Form.Control
              type="name"
              placeholder={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="email" className="my-3">
            <Form.Label className="dark:text-gray-300">{t("email")}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="password" className="my-3">
            <Form.Label className="dark:text-gray-300">
              {t("password")}
            </Form.Label>
            <Form.Control
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="confirmPassword" className="my-3">
            <Form.Label className="dark:text-gray-300">
              {t("confirmPassword")}
            </Form.Label>
            <Form.Control
              type="password"
              placeholder={t("confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Button type="submit" variant="primary" className="my-3">
            {t("updateButton")}
          </Button>
          {isLoading && <Loader />}
        </Form>
      </Col>
      <Col md={9}>
        <Tabs
          defaultActiveKey="forms"
          id="dashboard"
          className="pt-5"
          data-bs-theme={isDark ? "dark" : "light"}
        >
          <Tab eventKey="forms" title={t("forms")}>
            {loadingForms || loadingDeleteForm ? (
              <Loader />
            ) : errorForm ? (
              <Message>{errorForm?.data?.message || errorForm.error}</Message>
            ) : forms.length === 0 ? (
              <Message>{t("noFormsFound")}</Message>
            ) : (
              <>
                <Table
                  striped
                  hover
                  responsive
                  variant={isDark ? "dark" : "light"}
                >
                  <thead>
                    <tr>
                      <th></th>
                      <th className="text-nowrap">{t("title")}</th>
                      <th className="text-nowrap">{t("formId")}</th>
                      <th
                        className="min-w-[120px] cursor-pointer"
                        onClick={() =>
                          setSortOrderForms((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          )
                        }
                      >
                        <div className="d-flex align-items-center gap-1 text-nowrap">
                          {t("dateFilled")}
                          {sortOrderForms === "asc" ? (
                            <FaChevronUp className="text-muted" />
                          ) : (
                            <FaChevronDown className="text-muted" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms
                      .slice()
                      .sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return sortOrderForms === "asc"
                          ? dateA - dateB
                          : dateB - dateA;
                      })
                      .map((form) => (
                        <tr key={form.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedForms.includes(form.id)}
                              onChange={() => handleSelectForm(form.id)}
                            />
                          </td>
                          <td>{form.title}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <Link
                                to={`/form/edit/${form.id}`}
                                className="text-blue-500 underline"
                              >
                                {form.id}
                              </Link>
                              <MdOutlineEdit className="text-blue-500 flex-shrink-0" />
                            </div>
                          </td>
                          <td className="text-nowrap">
                            {moment(form.createdAt).format(
                              "MMMM Do YYYY, h:mm:ss a"
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
                <Row xs={12} sm="auto" className="d-flex flex-wrap">
                  <Col xs={12} sm="auto" className="d-flex flex-wrap gap-3">
                    <input
                      type="checkbox"
                      checked={selectedForms.length === forms?.length}
                      onChange={handleSelectAllForms}
                      className="scale-125"
                    />
                    <Button
                      className="d-flex align-items-center gap-2"
                      variant="primary"
                      onClick={() => handleAction("deleteForm")}
                    >
                      <FaTrash /> {t("delete")}
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </Tab>
          <Tab eventKey="templates" title={t("templates")}>
            {loadingTemplates || loadingDeleteTemplate ? (
              <Loader />
            ) : errorTemplate ? (
              <Message>
                {errorTemplate?.data?.message || errorTemplate.error}
              </Message>
            ) : templates.length === 0 ? (
              <>
                <Message>{t("noTemplatesFound")}</Message>
                <Col xs={12} sm="auto" className="ms-sm-auto">
                  <Link to={"/create"}>
                    <Button>{t("create")}</Button>
                  </Link>
                </Col>
              </>
            ) : (
              <>
                <Table
                  striped
                  hover
                  responsive
                  variant={isDark ? "dark" : "light"}
                >
                  <thead>
                    <tr>
                      <th></th>
                      <th>{t("title")}</th>
                      <th>{t("topic")}</th>
                      <th>{t("templateId")}</th>
                      <th
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setSortOrderTemplates((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          )
                        }
                      >
                        <div className="d-flex align-items-center gap-1">
                          {t("created")}
                          {sortOrderTemplates === "asc" ? (
                            <FaChevronUp className="text-muted" />
                          ) : (
                            <FaChevronDown className="text-muted" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates
                      .slice()
                      .sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return sortOrderTemplates === "asc"
                          ? dateA - dateB
                          : dateB - dateA;
                      })
                      .map((template) => (
                        <tr key={template.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedTemplates.includes(template.id)}
                              onChange={() => handleSelectTemplate(template.id)}
                            />
                          </td>
                          <td>{template.title}</td>
                          <td>{template.topic}</td>
                          <td className="d-flex align-items-center gap-1">
                            <Link
                              to={`/template/edit/${template.id}`}
                              className="text-blue-500 underline"
                            >
                              {template.id}
                            </Link>
                            <MdOutlineEdit className="text-blue-500" />
                          </td>
                          <td>{template.createdAt.substring(0, 10)}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
                <Row xs={12} sm="auto" className="d-flex flex-wrap gap-3">
                  <Col xs={12} sm="auto" className="d-flex flex-wrap gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === templates?.length}
                      onChange={handleSelectAllTemplates}
                      className="scale-125"
                    />
                    <Button
                      className="d-flex align-items-center gap-2"
                      variant="primary"
                      onClick={() => handleAction("deleteTemplate")}
                    >
                      <FaTrash /> {t("delete")}
                    </Button>
                  </Col>
                  <Col xs={12} sm="auto" className="ms-sm-auto">
                    <Link to={"/create"}>
                      <Button>{t("create")}</Button>
                    </Link>
                  </Col>
                </Row>
              </>
            )}
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
};

export default ProfileScreen;
