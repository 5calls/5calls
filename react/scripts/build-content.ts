import fetch from "node-fetch";
import fs from "fs";

// yarn run ts-node -O '{"module": "commonjs"}' scripts/build-content.ts

interface Issue {
  name: string;
  reason: string;
  script: string;
  slug: string;
  createdAt: string;
  contactAreas: string[];
  active: boolean;
}

const buildContent = async () => {
  fetch(`https://api.5calls.org/v1/issues`)
    .then((res) => res.json())
    .then((data) => {
      const issues = data as Issue[];
      // console.log("resoponse is", issues);
      issues.forEach((issue) => {
        fs.writeFileSync(`${__dirname}/../../content/issue/${issue.slug}.md`, postContentFromIssue(issue));
      });
    });
};

const postContentFromIssue = (issue: Issue): string => {
  return `---
title: "${escapeForYAML(issue.name)}"
date: ${issue.createdAt}
script: "${escapeForYAML(issue.script)}"
${contactAreaYAML(issue)}
active: ${issue.active ? "true" : "false"}
---
${issue.reason}
`;
};

const escapeForYAML = (text: string): string => {
  return text.replace(/"/g, '\\"');
};

const contactAreaYAML = (issue: Issue): string => {
  let contactAreasText = ``;

  if (issue.contactAreas.length > 0) {
    contactAreasText = `contactAreas:`;
    for (const contact of issue.contactAreas) {
      contactAreasText += `\r  - ${contact}`;
    }
  }

  return contactAreasText;
};

buildContent();
