import { useParams, Link, useNavigate } from "react-router-dom";
import { Row, Col, Button, Form, Card } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useSelector } from "react-redux";
import {
  useGetFormByIdQuery,
  useUpdateFormMutation,
} from "../redux/slices/formsApiSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const FormScreen = () => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const { id: formId } = useParams();
  const [errorMessages, setErrorMessages] = useState({});
  const [answerMap, setAnswerMap] = useState({});

  const { userInfo } = useSelector((state) => state.auth);
  const { data: form, refetch, isLoading, error } = useGetFormByIdQuery(formId);

  const [updateForm, { isLoading: updatingForm }] = useUpdateFormMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo && form) {
      if (userInfo.id !== form.user_id && userInfo.isAdmin === false) {
        navigate("/");
        toast.error(t("unauthorized"));
      }

      if (form?.answerList) {
        const initialAnswers = form.answerList.reduce((acc, answer) => {
          acc[answer.question_id] = answer.value;
          return acc;
        }, {});
        setAnswerMap(initialAnswers);
      }
    }
  }, [setAnswerMap, form, userInfo, navigate, t]);

  useEffect(() => {
    const newErrorMessages = {};
    Object.keys(answerMap).forEach((questionId) => {
      const value = answerMap[questionId];
      if (typeof value === "number" && value < 0) {
        newErrorMessages[questionId] = t("positiveIntegerOnly");
      }
    });
    setErrorMessages(newErrorMessages);
  }, [t, answerMap]);

  const handleInputChange = (questionId, value, type) => {
    let newValue;
    switch (type) {
      case "INTEGER":
        newValue = value === "" ? "" : Number(value);
        setAnswerMap((prevMap) => ({
          ...prevMap,
          [questionId]: newValue,
        }));
        if (newValue !== "" && newValue < 0) {
          setErrorMessages((prev) => ({
            ...prev,
            [questionId]: t("positiveIntegerOnly"),
          }));
        } else {
          setErrorMessages((prev) => {
            const updated = { ...prev };
            delete updated[questionId];
            return updated;
          });
        }
        break;
      case "CHECKBOX":
        newValue = !answerMap[questionId];
        setAnswerMap((prevMap) => ({
          ...prevMap,
          [questionId]: newValue,
        }));
        break;
      default:
        newValue = value;
        setAnswerMap((prevMap) => ({
          ...prevMap,
          [questionId]: newValue,
        }));
    }
  };

  const handleResubmittingForm = async (e) => {
    e.preventDefault();

    if (Object.keys(errorMessages).length > 0) {
      toast.error(t("negativeError"));
      return;
    }

    const answerArray = Object.entries(answerMap).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );
    try {
      console.log(answerArray);
      await updateForm({
        answerMap: answerArray,
        formId,
      }).unwrap();
      refetch();
      setAnswerMap({});
      navigate("/profile");
      toast.success(t("update"));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const ShowTitle = ({ question }) => <Card.Title>{question.title}</Card.Title>;

  const ShowDescription = ({ question }) => (
    <Card.Text className="text-muted">{question.description}</Card.Text>
  );

  const ShowFieldSingle = ({ question }) => (
    <Form.Control
      type="text"
      value={answerMap[question.id] ?? ""}
      disabled={!(userInfo.id === form.user_id || userInfo.isAdmin === true)}
      onChange={(e) =>
        handleInputChange(question.id, e.target.value, "SINGLE_LINE")
      }
      placeholder={t("enterYourAnswer")}
    />
  );

  const ShowFieldMulti = ({ question }) => (
    <Form.Control
      as="textarea"
      rows={3}
      value={answerMap[question.id] ?? ""}
      disabled={!(userInfo.id === form.user_id || userInfo.isAdmin === true)}
      onChange={(e) =>
        handleInputChange(question.id, e.target.value, "MULTI_LINE")
      }
      placeholder={t("enterYourAnswer")}
    />
  );

  const ShowFieldInt = ({ question }) => (
    <>
      <Form.Control
        type="number"
        value={answerMap[question.id] ?? ""}
        onChange={(e) =>
          handleInputChange(question.id, e.target.value, "INTEGER")
        }
        placeholder={t("enterYourAnswer")}
      />
      {errorMessages[question.id] && (
        <div className="mt-2">
          <Message variant="danger">{errorMessages[question.id]}</Message>
        </div>
      )}
    </>
  );

  const ShowFieldCheck = ({ question }) => (
    <Form.Check
      type="checkbox"
      id={question.id}
      label={t("checkboxLabel")}
      disabled={!(userInfo.id === form.user_id || userInfo.isAdmin === true)}
      onChange={() => handleInputChange(question.id, null, "CHECKBOX")}
      checked={answerMap[question.id] ?? false}
    />
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div>
          <Link to={`/profile`}>
            <div className="my-3">
              <Button variant="secondary">{t("goBack")}</Button>
            </div>
          </Link>
          <Row className="mt-4">
            <Col md={12}>
              <Form
                onSubmit={handleResubmittingForm}
                data-bs-theme={isDark ? "dark" : "light"}
              >
                {form.questionList.map((question) => (
                  <Card key={question.id} className="mb-3">
                    <Card.Body>
                      <ShowTitle question={question} />
                      {question.description && (
                        <ShowDescription question={question} />
                      )}
                      {question.type === "SINGLE_LINE" && (
                        <ShowFieldSingle question={question} />
                      )}
                      {question.type === "MULTI_LINE" && (
                        <ShowFieldMulti question={question} />
                      )}
                      {question.type === "INTEGER" && (
                        <ShowFieldInt question={question} />
                      )}
                      {question.type === "CHECKBOX" && (
                        <ShowFieldCheck question={question} />
                      )}
                    </Card.Body>
                  </Card>
                ))}

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={
                      !(
                        userInfo.id === form.user_id ||
                        userInfo.isAdmin === true
                      )
                    }
                  >
                    {t("submitForm")}
                  </Button>
                </div>
                {isLoading || (updatingForm && <Loader />)}
              </Form>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default FormScreen;
