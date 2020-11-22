import React from "react";

const preventDefault = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

export { preventDefault };
