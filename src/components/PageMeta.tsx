import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
  image?: string;
}

const PageMeta = ({ title, description, image }: PageMetaProps) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute("content", image);
      }
    }
  }, [title, description, image]);

  return null;
};

export default PageMeta;
