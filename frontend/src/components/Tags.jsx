import React, { useCallback } from "react";
import { ReactTags } from "react-tag-autocomplete";
import { v4 as uuidv4 } from "uuid";
import "../css/tagStyles.css";
import { useGetTagsQuery } from "../redux/slices/tagsApiSlice";
import { useTranslation } from "react-i18next";

const Tags = ({ selected, setSelected }) => {
  const { t } = useTranslation();

  const { data: suggestions } = useGetTagsQuery();

  const onAdd = useCallback(
    (newTag) => {
      const isDuplicate = selected.some((tag) => tag.label === newTag.label);
      if (isDuplicate) return;

      const tagToAdd = newTag.__isNew__
        ? { ...newTag, value: uuidv4() }
        : newTag;

      setSelected([...selected, tagToAdd]);
    },
    [selected, setSelected]
  );

  const onDelete = useCallback(
    (tagId) => {
      setSelected(selected.filter((_, i) => i !== tagId));
    },
    [selected, setSelected]
  );

  return (
    <ReactTags
      placeholderText={t("tagEnter")}
      labelText="Select tags"
      selected={selected}
      suggestions={suggestions}
      onAdd={onAdd}
      onDelete={onDelete}
      allowNew
      newOptionText={t("tagNew")}
    />
  );
};

export default Tags;
