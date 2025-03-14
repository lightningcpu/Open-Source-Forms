import { useEffect, useMemo, useState } from "react";
import { Row, Col } from "react-bootstrap";
import Template from "../components/Template";
import { useGetTemplatesQuery } from "../redux/slices/templatesApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { TagCloud } from "react-tagcloud";
import { useGetTagCloudQuery } from "../redux/slices/tagsApiSlice";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const HomeScreen = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);

  const { userInfo } = useSelector((state) => state.auth);

  const { data: templates, isLoading, error } = useGetTemplatesQuery();
  const { data } = useGetTagCloudQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (data) {
      setTags(data);
    }
  }, [data]);

  const options = {
    luminosity: "bright",
    hue: "purple",
  };

  const filteredTemplates = useMemo(() => {
    if (!Array.isArray(templates)) return [];

    if (userInfo?.isAdmin) return templates;

    return templates.filter((template) => {
      if (!userInfo) return template.access === "public";

      if (
        template.access === "restricted" &&
        Array.isArray(template.AllowedUsers)
      ) {
        return template.AllowedUsers.some(
          (user) => user.email === userInfo.email
        );
      } else if (
        template.access === "restricted" &&
        !Array.isArray(template.AllowedUsers)
      ) {
        return false;
      }

      return true;
    });
  }, [templates, userInfo]);

  const top5 = useMemo(() => {
    if (!Array.isArray(filteredTemplates) || filteredTemplates.length === 0)
      return [];
    return [...filteredTemplates]
      .filter((template) => template?.likes != null)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  }, [filteredTemplates]);

  const top5Ids = useMemo(() => top5.map((template) => template.id), [top5]);

  const restTemplates = useMemo(() => {
    if (!Array.isArray(filteredTemplates)) return [];
    return filteredTemplates.filter(
      (template) => !top5Ids.includes(template.id)
    );
  }, [filteredTemplates, top5Ids]);

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <h1 className="text-center text-6xl py-5 dark:text-gray-400">
            {t("topTemplates")}
          </h1>
          {filteredTemplates.length > 0 ? (
            <Row>
              {top5.map((template) => (
                <Col key={template.id} sm={12} md={6} lg={4} xl={4}>
                  <Template template={template} />
                </Col>
              ))}
            </Row>
          ) : (
            <h1 className="flex justify-center text-3xl text-gray-500">
              {t("nothingToSee")}
            </h1>
          )}

          <h1 className="text-center text-6xl py-5 dark:text-gray-400">
            {t("allTemplates")}
          </h1>

          {filteredTemplates.length > 5 ? (
            <Row>
              {restTemplates.map((template) => (
                <Col key={template.id} sm={12} md={6} lg={4} xl={3}>
                  <Template template={template} />
                </Col>
              ))}
            </Row>
          ) : (
            <h1 className="flex justify-center text-3xl text-gray-600">
              {t("nothingToSee")}
            </h1>
          )}
          <Row className="flex justify-center">
            <Col md={6}>
              <TagCloud
                minSize={12}
                maxSize={35}
                colorOptions={options}
                tags={tags}
                className="cursor-pointer my-2"
                onClick={(tag) => alert(t("tagAlert", { value: tag.value }))}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
