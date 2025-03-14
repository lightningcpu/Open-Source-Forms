import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BiLike } from "react-icons/bi";
import { RegExpMatcher, englishDataset } from "obscenity";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Form,
  ListGroupItem,
  Card,
} from "react-bootstrap";
import {
  useCreateTemplateReviewMutation,
  useGetTemplateByIdQuery,
  useGetTemplatesQuery,
} from "../redux/slices/templatesApiSlice";
import {
  clearTemplateAnswers,
  updateAnswer,
} from "../redux/slices/answerSlice";
import { useCreateFormMutation } from "../redux/slices/formsApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const TemplateScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const [isLiked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { id: templateId } = useParams();

  const {
    data: template,
    isLoading,
    refetch,
    error,
  } = useGetTemplateByIdQuery(templateId);

  const [createForm, { isLoading: creatingForm }] = useCreateFormMutation();
  const [createReview, { isLoading: loadingReview }] =
    useCreateTemplateReviewMutation();

  const { refetch: refetchTemplates } = useGetTemplatesQuery();

  const { answerMap } = useSelector((state) => state.answer);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const matcher = useMemo(() => new RegExpMatcher(englishDataset.build()), []);

  useEffect(() => {
    if (userInfo && template) {
      const isAllowedUser = template.AllowedUsers?.some(
        (user) => user.value === userInfo.id
      );

      if (template.access !== "public" && !userInfo.isAdmin && !isAllowedUser) {
        navigate("/");
        toast.error(t("unauthorized"));
      }
    }
  }, [userInfo, template, navigate, t]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (comment.length < 1) {
      toast.error(t("emptyCommentError"));
      return;
    }

    const matches = matcher.getAllMatches(comment);
    if (matches.length > 0) {
      toast.error(t("removeInappropriateLanguage"));
      return;
    }

    try {
      await createReview({
        templateId,
        user_id: userInfo.id,
        isLiked,
        comment,
      }).unwrap();
      refetch();
      refetchTemplates();
      setLiked(false);
      setComment("");
      toast.success(t("reviewSubmitted"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleInputChange = (templateId, questionId, value, type) => {
    let newValue;

    switch (type) {
      case "INTEGER":
        if (value < 0) {
          setErrorMessage("Integer values must be positive.");
          return;
        } else {
          setErrorMessage("");
          newValue = value === "" ? "" : Number(value);
        }
        break;
      case "CHECKBOX":
        newValue = !(
          (answerMap[templateId] && answerMap[templateId][questionId]) ||
          false
        );
        break;
      default:
        newValue = value;
    }

    dispatch(updateAnswer({ templateId, questionId, answer: newValue }));
  };

  const handleSubmittingForm = async (e) => {
    e.preventDefault();
    const currentFormAnswers = answerMap[templateId] || {};
    const answerArray = template.Questions.map((question) => {
      const currentValue = currentFormAnswers[question.id];
      if (currentValue === undefined) {
        switch (question.type) {
          case "CHECKBOX":
            return { questionId: question.id, value: false };
          default:
            return { questionId: question.id, value: "" };
        }
      }
      return { questionId: question.id, value: currentValue };
    });

    try {
      console.log(answerArray);
      await createForm({
        title: template.title,
        user_id: userInfo.id,
        template_id: templateId,
        answerMap: answerArray,
      }).unwrap();
      dispatch(clearTemplateAnswers(templateId));
      navigate("/");
      toast.success(t("formSubmitted"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/">
        <div className="my-3">
          <Button variant="secondary">{t("goBack")}</Button>
        </div>
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Image src={template.image} fluid alt={template.title} />
            </Col>
            <Col md={8}>
              <ListGroup
                variant="flush"
                data-bs-theme={isDark ? "dark" : "light"}
              >
                <ListGroup.Item>
                  <h3 className="text-3xl">{template.title}</h3>
                </ListGroup.Item>
                {template.description.length > 0 && (
                  <ListGroup.Item>
                    <div
                      className={`markdown-body ${isDark ? "dark-mode" : ""}`}
                    >
                      <ReactMarkdown>{template.description}</ReactMarkdown>
                    </div>
                  </ListGroup.Item>
                )}
                <ListGroup.Item className="d-flex align-items-center gap-1">
                  <p>{template.likes}</p>
                  <BiLike />
                </ListGroup.Item>
                <h2 className="text-3xl my-3 dark:text-gray-300">
                  {t("reviews")}
                </h2>
                {template.Reviews.length === 0 && (
                  <Message>{t("noReviews")}</Message>
                )}
                {template.Reviews.map((review) => (
                  <ListGroupItem key={review.id}>
                    <strong>{review.name}</strong>
                    {review.isLiked && (
                      <p className="text-muted font-light">{t("like")}</p>
                    )}
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p className="mt-4">{review.comment}</p>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={6}>
              <ListGroup variant="flush">
                <ListGroupItem className="bg-transparent">
                  <h2 className="text-3xl mb-3 dark:text-gray-300">
                    {t("leaveReview")}
                  </h2>

                  {loadingReview && <Loader />}

                  {userInfo ? (
                    <Form
                      onSubmit={submitHandler}
                      data-bs-theme={isDark ? "dark" : "light"}
                    >
                      <Form.Group controlId="like" className="my-2">
                        <Form.Check
                          className="dark:text-gray-400"
                          type="checkbox"
                          checked={isLiked}
                          label={t("like")}
                          onChange={(e) => setLiked(e.target.checked)}
                        />
                      </Form.Group>
                      <Form.Group controlId="comment" className="my-2">
                        <Form.Label className="dark:text-gray-400">
                          {t("comment")}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </Form.Group>
                      <Button
                        className="my-2"
                        disabled={loadingReview}
                        type="submit"
                        variant="primary"
                      >
                        {t("submit")}
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      <Link
                        className="text-blue-500 underline"
                        to={`/login?redirect=/template/${templateId}`}
                      >
                        {t("signInToReview")}
                      </Link>
                    </Message>
                  )}
                </ListGroupItem>
              </ListGroup>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col md={12}>
              <Form onSubmit={handleSubmittingForm}>
                {template.Questions.map((question) => {
                  const currentTemplateAnswers = answerMap[templateId] || {};
                  return (
                    <Card
                      key={question.id}
                      className="mb-3"
                      data-bs-theme={isDark ? "dark" : "light"}
                    >
                      <Card.Body>
                        <Card.Title>{question.title}</Card.Title>
                        {question.description && (
                          <Card.Text className="text-muted">
                            {question.description}
                          </Card.Text>
                        )}

                        {question.type === "SINGLE_LINE" && (
                          <Form.Control
                            type="text"
                            value={currentTemplateAnswers[question.id] ?? ""}
                            disabled={!userInfo}
                            onChange={(e) =>
                              handleInputChange(
                                templateId,
                                question.id,
                                e.target.value,
                                "SINGLE_LINE"
                              )
                            }
                            placeholder={t("enterYourAnswer")}
                          />
                        )}

                        {question.type === "MULTI_LINE" && (
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={currentTemplateAnswers[question.id] ?? ""}
                            disabled={!userInfo}
                            onChange={(e) =>
                              handleInputChange(
                                templateId,
                                question.id,
                                e.target.value,
                                "MULTI_LINE"
                              )
                            }
                            placeholder={t("enterYourAnswer")}
                          />
                        )}

                        {question.type === "INTEGER" && (
                          <>
                            <Form.Control
                              type="number"
                              value={currentTemplateAnswers[question.id] ?? ""}
                              disabled={!userInfo}
                              onChange={(e) =>
                                handleInputChange(
                                  templateId,
                                  question.id,
                                  e.target.value,
                                  "INTEGER"
                                )
                              }
                              placeholder={t("positiveIntegerOnly")}
                            />
                            {errorMessage && (
                              <Message variant="danger">
                                {t("positiveIntegerOnly")}
                              </Message>
                            )}
                          </>
                        )}

                        {question.type === "CHECKBOX" && (
                          <Form.Check
                            type="checkbox"
                            id={question.id}
                            label={t("checkboxLabel")}
                            disabled={!userInfo}
                            checked={
                              currentTemplateAnswers[question.id] ?? false
                            }
                            onChange={() =>
                              handleInputChange(
                                templateId,
                                question.id,
                                null,
                                "CHECKBOX"
                              )
                            }
                          />
                        )}
                      </Card.Body>
                    </Card>
                  );
                })}

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!userInfo}
                  >
                    {t("submitForm")}
                  </Button>
                </div>
                {(isLoading || creatingForm) && <Loader />}
              </Form>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default TemplateScreen;
