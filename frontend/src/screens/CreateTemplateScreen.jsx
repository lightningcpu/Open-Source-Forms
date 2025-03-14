import React, { useState } from "react";
import { Form, Button, Row, Col, Container, Card } from "react-bootstrap";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import QuestionCard from "../components/QuestionCard";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addToQuestionList,
  setQuestionList,
} from "../redux/slices/questionSlice";
import SortableItem from "../components/SortableItem";
import { v4 as uuid } from "uuid";
import {
  useCreateTemplateMutation,
  useGetTemplatesQuery,
} from "../redux/slices/templatesApiSlice";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ReactMarkdown from "react-markdown";
import Tags from "../components/Tags";
import "github-markdown-css/github-markdown-light.css";
import { setTagList } from "../redux/slices/tagSlice";
import {
  useGetTagCloudQuery,
  useGetTagsQuery,
} from "../redux/slices/tagsApiSlice";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const CreateTemplateScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const [title, setTitle] = useState(t("untitledTemplate"));
  const [description, setDescription] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    type: "SINGLE_LINE",
    title: "",
    description: "",
    show_in_results: true,
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const { tagList } = useSelector((state) => state.tag);
  const { questionList } = useSelector((state) => state.question);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [createTemplate, { isLoading }] = useCreateTemplateMutation();
  const { refetch } = useGetTemplatesQuery();
  const { refetch: refetchTags } = useGetTagsQuery();
  const { refetch: refetchTagCloud } = useGetTagCloudQuery();

  const addQuestion = () => {
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
      const questionWithId = {
        ...newQuestion,
        id: uuid(),
        options: newQuestion.type === "checkbox" ? [] : undefined,
      };
      dispatch(addToQuestionList(questionWithId));
      setNewQuestion({
        type: "SINGLE_LINE",
        title: "",
        description: "",
        show_in_results: true,
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questionList.findIndex((q) => q.id === active.id);
      const newIndex = questionList.findIndex((q) => q.id === over.id);
      const newQuestionList = arrayMove(questionList, oldIndex, newIndex);
      dispatch(setQuestionList(newQuestionList));
    }
  };

  const deleteQuestion = (id) => {
    dispatch(setQuestionList(questionList.filter((q) => q.id !== id)));
  };

  const updateQuestion = (updatedQuestion) => {
    dispatch(
      setQuestionList(
        questionList.map((q) =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        )
      )
    );
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
      await createTemplate({
        title,
        description,
        topic: "Other",
        questionList,
        tagList,
        authorId: userInfo.id,
      }).unwrap();
      localStorage.removeItem("questionList");
      dispatch(setQuestionList([]));
      dispatch(setTagList([]));
      refetch();
      refetchTags();
      refetchTagCloud();
      navigate("/");
      toast.success(t("templateCreatedSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container
      className="py-4"
      style={{ maxWidth: "800px" }}
      data-bs-theme={isDark ? "dark" : "light"}
    >
      <Link to="/profile">
        <div className="my-3">
          <Button variant="secondary">{t("goBack")}</Button>
        </div>
      </Link>
      <h1 className="text-center mb-4 text-5xl dark:text-gray-300">
        {t("createNewTemplate")}
      </h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formTitle">
            <Form.Label className="fs-4 dark:text-gray-400">
              {t("templateTitle")}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={t("enterFormTitle")}
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
              rows={3}
              placeholder={t("enterDescriptionOptional")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Card className="mb-4">
            <Card.Header>{t("markdownPreview")}</Card.Header>
            <Card.Body>
              <div className={`markdown-body ${isDark ? "dark-mode" : ""}`}>
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            </Card.Body>
          </Card>

          <Form.Group className="my-3">
            <Tags
              selected={tagList}
              setSelected={(newTags) => dispatch(setTagList(newTags))}
            />
          </Form.Group>

          <h4 className="mb-3 dark:text-gray-400">{t("questions")}</h4>
          <SortableContext
            items={questionList.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questionList.map((question, index) => (
              <SortableItem key={question.id} id={question.id} index={index}>
                <QuestionCard
                  question={question}
                  index={question.index}
                  onDelete={() => deleteQuestion(question.id)}
                  onUpdate={() => setEditingQuestionId(question.id)}
                  isEditing={question.id === editingQuestionId}
                  onSave={updateQuestion}
                  onCancelEdit={() => setEditingQuestionId(null)}
                  dragHandleProps={undefined}
                />
              </SortableItem>
            ))}
          </SortableContext>

          <Card className="mt-4 mb-4 shadow-sm">
            <Card.Header>{t("addNewQuestion")}</Card.Header>
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder={t("enterTheQuestion")}
                    value={newQuestion.title}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, title: e.target.value })
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
                    checked={newQuestion.show_in_results}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        show_in_results: e.target.checked,
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

          <div className="text-center">
            <Button variant="primary" type="submit" size="lg">
              {t("create")}
            </Button>
          </div>
          {isLoading && <Loader />}
        </Form>
      </DndContext>
    </Container>
  );
};

export default CreateTemplateScreen;
