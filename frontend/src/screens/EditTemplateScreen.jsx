import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Card,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import QuestionCard from "../components/QuestionCard";
import { toast } from "react-toastify";
import SortableItem from "../components/SortableItem";
import {
  useUpdateTemplateMutation,
  useGetTemplateByIdQuery,
  useGetTemplatesQuery,
} from "../redux/slices/templatesApiSlice";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} from "../redux/slices/questionsApiSlice";
import { useGetTagsQuery } from "../redux/slices/tagsApiSlice";
import { useGetTemplateFormsQuery } from "../redux/slices/formsApiSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import ReactMarkdown from "react-markdown";
import moment from "moment";
import Message from "../components/Message";
import Tags from "../components/Tags";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useGetAccessUsersQuery } from "../redux/slices/usersApiSlice";
import useTheme from "../hooks/useTheme";

const EditTemplateScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const { id: templateId } = useParams();

  const {
    data: template,
    isLoading: isLoadingTemplate,
    error,
    refetch: refetchTemplate,
  } = useGetTemplateByIdQuery(templateId);

  const { data: options, isLoading: isLoadingOptions } =
    useGetAccessUsersQuery();

  const {
    data: forms,
    isLoading: loadingForms,
    error: errorForm,
  } = useGetTemplateFormsQuery(templateId);

  const [createQuestion, { isLoading: isCreatingQuestion }] =
    useCreateQuestionMutation();

  const [updateQuestion] = useUpdateQuestionMutation();

  const [deleteQuestion, { isLoading: isDeleting }] =
    useDeleteQuestionMutation();

  const [updateTemplate, { isLoading }] = useUpdateTemplateMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAcess] = useState("public");
  const [topic, setTopic] = useState("Other");
  const [topicList] = useState(["Other", "Education", "Poll", "Quiz", "Job"]);
  const [selected, setSelected] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [sortOrderForms, setSortOrderForms] = useState("desc");
  const [newQuestion, setNewQuestion] = useState({
    type: "SINGLE_LINE",
    title: "",
    description: "",
    displayOnTable: true,
  });

  const navigate = useNavigate();

  const { refetch } = useGetTemplatesQuery();
  const { refetch: refetchTags } = useGetTagsQuery();
  const { refetch: refetchTagCloud } = useGetTagsQuery();

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setQuestionList(template.Questions);
      setAcess(template.access);
      setTopic(template.topic);
      setSelected(template.Tags);
      setSelectedUsers(template.AllowedUsers);
    }
  }, [template]);

  const customStyles = (isDark) => ({
    control: (base) => ({
      ...base,
      backgroundColor: isDark ? "#212529" : "#fff",
      color: isDark ? "#fff" : "#000",
      borderColor: isDark ? "#555" : "#ccc",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#222" : "#fff",
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? isDark
          ? "#444"
          : "#ddd"
        : isFocused
        ? isDark
          ? "#333"
          : "#eee"
        : "transparent",
      color: isSelected ? (isDark ? "#fff" : "#000") : isDark ? "#fff" : "#000",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#fff" : "#000",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#333" : "#EAEEF2",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#fff" : "#000",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#fff" : "#000",
      ":hover": {
        backgroundColor: isDark ? "#555" : "#ccc",
        color: isDark ? "#fff" : "#000",
      },
    }),
  });

  const customFilterOption = (option, inputValue) => {
    const searchTerm = inputValue.trim().toLowerCase();
    const label = option.data.label.toLowerCase();
    const email = option.data.email?.toLowerCase() || "";
    return label.includes(searchTerm) || email.includes(searchTerm);
  };

  const formatOptionLabel = ({ label, email }) => (
    <div>
      <div>{label}</div>
      {email && (
        <div className="text-sm text-gray-700 dark:text-gray-400">{email}</div>
      )}
    </div>
  );

  const addQuestion = async () => {
    const countOfType = questionList.filter(
      (q) => q.type === newQuestion.type
    ).length;

    if (newQuestion.title.trim() === "") {
      toast.error(t("questionTitleRequired"));
    } else if (newQuestion.description.trim().length > 1500) {
      toast.error(t("descriptionTooLarge"));
    } else if (countOfType >= 4) {
      alert(t("maxQuestionsOfType", { type: newQuestion.type }));
    } else {
      try {
        await createQuestion({
          ...newQuestion,
          index: questionList.length,
          template_id: templateId,
        }).unwrap();
        setNewQuestion({
          type: "SINGLE_LINE",
          title: "",
          description: "",
          displayOnTable: true,
        });
        refetchTemplate();
        toast.success(t("questionCreatedSuccess"));
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleDragEnd = async (event) => {
    if (editingQuestionId !== null) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questionList.findIndex((q) => q.id === active.id);
    const newIndex = questionList.findIndex((q) => q.id === over.id);

    const newQuestions = arrayMove(questionList, oldIndex, newIndex).map(
      (q, idx) => ({
        ...q,
        index: idx,
      })
    );

    setQuestionList(newQuestions);

    try {
      for (const question of newQuestions) {
        await updateQuestion({
          id: question.id,
          index: question.index,
        }).unwrap();
      }

      await refetchTemplate();
    } catch (err) {
      toast.error(err?.data?.message || t("reorderFail"));
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteQuestion(questionId).unwrap();

      const updatedQuestions = questionList.filter((q) => q.id !== questionId);

      const reIndexedQuestions = updatedQuestions.map((q, index) => ({
        ...q,
        index,
      }));

      setQuestionList(reIndexedQuestions);

      for (const question of reIndexedQuestions) {
        await updateQuestion({
          id: question.id,
          index: question.index,
        }).unwrap();
      }

      refetchTemplate();
      toast.success(t("questionDeletedSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleUpdate = async (editedQuestion) => {
    try {
      await updateQuestion({
        ...editedQuestion,
      }).unwrap();
      refetchTemplate();
      toast.success(t("questionUpdatedSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === "") {
      alert(t("templateTitleRequired"));
      return;
    }
    if (questionList.length === 0) {
      alert(t("addAtLeastOneQuestion"));
      return;
    }

    try {
      await updateTemplate({
        title,
        description,
        access,
        topic,
        templateId,
        tagList: selected,
        userAccess: selectedUsers,
      }).unwrap();
      refetch();
      refetchTemplate();
      refetchTags();
      refetchTagCloud();
      navigate("/");
      toast.success(t("templateUpdatedSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className="py-4 max-w-[800px]">
      <Link to="/profile">
        <div className="my-3">
          <Button variant="secondary">{t("goBack")}</Button>
        </div>
      </Link>
      <h1 className="text-center mb-4 text-5xl dark:text-gray-300">
        {t("editTemplate")}
      </h1>

      <Tabs
        defaultActiveKey="general"
        id="uncontrolled-tab-example"
        className="mb-3"
        data-bs-theme={isDark ? "dark" : "light"}
      >
        <Tab eventKey="general" title={t("generalSettings")}>
          {isLoading || isLoadingOptions ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          ) : (
            <Form
              onSubmit={handleSubmit}
              data-bs-theme={isDark ? "dark" : "light"}
            >
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label className="fs-4 dark:text-gray-400">
                  {t("templateTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("enterTitle")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formDescription">
                <Form.Label className="fs-5 dark:text-gray-400">
                  {t("templateDescription")}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  placeholder={t("enterDescriptionOptional")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Card className="my-2">
                <Card.Header>{t("markdownPreview")}</Card.Header>
                <Card.Body>
                  <div className={`markdown-body ${isDark ? "dark-mode" : ""}`}>
                    <ReactMarkdown>{description}</ReactMarkdown>
                  </div>
                </Card.Body>
              </Card>

              <Form.Group className="my-3">
                <Tags selected={selected} setSelected={setSelected} />
              </Form.Group>

              <Form.Group className="flex flex-row justify-between">
                <Form.Select
                  name="access"
                  value={access}
                  onChange={(e) => setAcess(e.target.value)}
                  className="w-1/3"
                >
                  <option value="public">{t("public")}</option>
                  <option value="restricted">{t("restricted")}</option>
                </Form.Select>

                <Form.Select
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-1/3"
                >
                  {topicList.map((topic, index) => (
                    <option key={index} value={topic}>
                      {t(topic.toLowerCase())}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="my-3" hidden={access !== "restricted"}>
                <Select
                  isMulti
                  options={options}
                  maxMenuHeight={130}
                  value={selectedUsers}
                  onChange={(selectedOptions) =>
                    setSelectedUsers(selectedOptions)
                  }
                  filterOption={customFilterOption}
                  formatOptionLabel={formatOptionLabel}
                  styles={customStyles(isDark)}
                  placeholder="Select a user..."
                  isClearable
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPlacement="auto"
                />
              </Form.Group>

              <div className="text-center mt-2">
                <Button variant="primary" type="submit" size="lg">
                  {t("saveForm")}
                </Button>
              </div>
            </Form>
          )}
        </Tab>

        <Tab eventKey="questions" title={t("questions")}>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <h4 className="mb-3 dark:text-gray-400">{t("questions")}:</h4>
            <SortableContext
              items={questionList.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {questionList.map((question) => (
                <SortableItem
                  key={question.id}
                  id={question.id}
                  index={question.index}
                >
                  <QuestionCard
                    question={question}
                    index={question.index}
                    onDelete={() => handleDelete(question.id)}
                    onUpdate={() => setEditingQuestionId(question.id)}
                    isEditing={question.id === editingQuestionId}
                    onSave={handleUpdate}
                    onCancelEdit={() => setEditingQuestionId(null)}
                    dragHandleProps={undefined}
                  />
                </SortableItem>
              ))}
            </SortableContext>

            <Card
              className="mt-4 mb-4 shadow-sm"
              data-bs-theme={isDark ? "dark" : "light"}
            >
              <Card.Header>{t("addNewQuestion")}</Card.Header>
              <Card.Body>
                <Row className="g-3 align-items-center">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder={t("enterTheQuestion")}
                      value={newQuestion.title}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          title: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={newQuestion.type}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, type: e.target.value })
                      }
                    >
                      <option value="SINGLE_LINE">{t("SINGLE_LINE")}</option>
                      <option value="MULTI_LINE">{t("MULTI_LINE")}</option>
                      <option value="INTEGER">{t("INTEGER")}</option>
                      <option value="CHECKBOX">{t("CHECKBOX")}</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type="checkbox"
                      label={t("display")}
                      checked={newQuestion.displayOnTable}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          displayOnTable: e.target.checked,
                        })
                      }
                    />
                  </Col>
                  <Col md={1}>
                    <Button variant="primary" onClick={addQuestion}>
                      +
                    </Button>
                  </Col>
                </Row>
                <Row className="my-3">
                  <Col md={12}>
                    <Form.Control
                      as={"textarea"}
                      placeholder={t("optionalDescription")}
                      value={newQuestion.description}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          description: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
                <Form.Text className="text-muted">
                  {t("maxQuestionsNote")}
                </Form.Text>
              </Card.Body>
            </Card>
            {(isLoading ||
              isDeleting ||
              isLoadingTemplate ||
              isCreatingQuestion) && <Loader />}
          </DndContext>
        </Tab>

        <Tab eventKey="results" title="Results">
          {loadingForms ? (
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
                data-bs-theme={isDark ? "dark" : "light"}
              >
                <thead>
                  <tr>
                    <th className="text-nowrap">{t("userId")}</th>
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
                        <td>{form.user_id}</td>
                        <td>
                          <Link
                            to={`/form/${form.id}`}
                            className="text-blue-500 underline"
                          >
                            {form.id}
                          </Link>
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
            </>
          )}
        </Tab>
        <Tab
          eventKey="aggregation"
          title="Aggregation"
          className="dark:text-gray-400"
        >
          {t("aggregationContent")}...
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EditTemplateScreen;
