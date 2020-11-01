import fetch from "node-fetch";
import fs from "fs";

// yarn run ts-node -O '{"module": "commonjs"}' scripts/build-content.ts

interface Issue {
  name: string;
  slug: string;
  active: boolean;
}

const buildContent = async () => {
  fetch(`https://api.5calls.org/v1/issues`)
    .then((res) => res.json())
    .then((data) => {
      const issues = data as Issue[];
      // console.log("resoponse is", issues);
      issues.forEach((issue) => {
        fs.writeFileSync(
          `${__dirname}/../../content/issue/${issue.slug}.md`,
          postContentFromIssue(issue)
        );
      });
    });
};

const postContentFromIssue = (issue: Issue): string => {
  return `---
title: "${escapeForYAML(issue.name)}"
description: some other text for a debug issue
script: some script for debug issue text
active: ${issue.active ? "true" : "false"}
---
hello
`;
};

const escapeForYAML = (text: string): string => {
  return text.replace(/"/g, '\\"');
};

buildContent();
