import React, { useEffect, useRef } from "react";
import textToCamelcase from "../../scripts/textToCamelcase";

export interface DynamicStyleProps {
  parent: string;
  fileNames: string[];
}

const clearStyles = ({ parent, fileNames }: DynamicStyleProps) => {
  const existingStl = document.head.querySelectorAll(`[${parent}="⚡"]`);
  const existingArgs = Array.from(existingStl).map((el) => el.id);

  existingArgs.forEach((arg) => {
    const styleElement = document.getElementById(arg);
    if (fileNames) {
      if (!fileNames.includes(arg)) {
        if (styleElement) {
          styleElement.parentNode?.removeChild(styleElement);
        }
      }
      console.log("removed");
    } else {
      if (styleElement) {
        styleElement.parentNode?.removeChild(styleElement);
      }
    }
  });
};

const loadStyles = async ({ parent, fileNames }: DynamicStyleProps) => {
  for (const fileName of fileNames) {
    const id = textToCamelcase(fileName);
    const styleElement =
      document.getElementById(id) || document.createElement("style");

    if (!document.getElementById(id)) {
      styleElement.id = id;
      styleElement.setAttribute(`${parent}`, "⚡");
      document.head.appendChild(styleElement);
    }

    try {
      const { default: text } = await import(`../../style/css/${fileName}.css`);
      styleElement.textContent = text;
    } catch (error) {
      console.error(error);
      styleElement.textContent = "🚫";
    }
  }
};

const useDynamicStyle = ({ parent, fileNames }: DynamicStyleProps) => {
  const prevParamRef = useRef<DynamicStyleProps>({ parent, fileNames });

  useEffect(() => {
    const prevParams = prevParamRef.current;

    loadStyles({ parent, fileNames });
    if (prevParams.fileNames.length > fileNames.length) {
      clearStyles({ parent, fileNames });
    }

    prevParamRef.current = { parent, fileNames };

    return () => {
      clearStyles({
        parent: prevParamRef.current.parent,
        fileNames: null,
      });
    };
  }, [parent, fileNames]);
};

export default useDynamicStyle;