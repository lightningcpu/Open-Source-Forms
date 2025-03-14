import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const QuestionCard = ({
  question,
  index,
  onDelete,
  onUpdate,
  dragHandleProps,
  isEditing,
  onSave,
  onCancelEdit,
}) => {
  const { t } = useTranslation();
  const isDark = useTheme();
  const [editedQuestion, setEditedQuestion] = useState({});

  useEffect(() => {
    setEditedQuestion({ ...question });
  }, [question]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedQuestion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(editedQuestion);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <Card
        className="mb-3 shadow-sm"
        data-bs-theme={isDark ? "dark" : "light"}
      >
        <Card.Body>
          <div>
            <Row className="g-3 align-items-center">
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder={t("questionTitle")}
                  value={editedQuestion.title}
                  onChange={handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  name="type"
                  value={editedQuestion.type}
                  onChange={handleChange}
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
                  name="show_in_results"
                  label={t("display")}
                  checked={editedQuestion.show_in_results}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="my-3">
              <Col md={12}>
                <Form.Control
                  as="textarea"
                  name="description"
                  placeholder={t("optionalDescription")}
                  value={editedQuestion.description}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleSave}>
                {t("save")}
              </Button>
              <Button variant="secondary" onClick={onCancelEdit}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3 shadow-sm" data-bs-theme={isDark ? "dark" : "light"}>
      <Card.Body>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <button
                type="button"
                {...dragHandleProps}
                className="me-2 cursor-move"
              >
                ≡
              </button>
              <span className="me-2">{index + 1}.</span>
              <h5 className="ml-1">{question.title}</h5>
              <span className="badge bg-secondary ms-2">
                {t(question.type)}
              </span>
            </div>
            <p className="text-muted">{question.description}</p>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onUpdate(editedQuestion)}
            >
              {t("update")}
            </Button>
            <Button variant="outline-danger" size="sm" onClick={onDelete}>
              {t("delete")}
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QuestionCard;
