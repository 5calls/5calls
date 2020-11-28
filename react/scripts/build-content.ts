import fetch from "node-fetch";
import fs from "fs";
import fsExtra from "fs-extra";

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
  const contentDirectory = `${__dirname}/../../content/issue/`;
  fsExtra.emptyDirSync(contentDirectory);

  fetch(`https://api.5calls.org/v1/issues`)
    .then((res) => res.json())
    .then((data) => {
      const issues = data as Issue[];
      // console.log("resoponse is", issues);
      issues.forEach((issue) => {
        fs.writeFileSync(`${contentDirectory}${issue.slug}.md`, postContentFromIssue(issue));
      });
    });
};

const postContentFromIssue = (issue: Issue): string => {
  return `---
title: "${escapeQuotes(issue.name)}"
date: ${issue.createdAt}
script: |
${multilineScript(issue.script)}
${contactAreaYAML(issue)}
active: ${issue.active ? "true" : "false"}
---
${issue.reason}
`;
};

const escapeQuotes = (text: string): string => {
  return text.replace(/"/g, '\\"');
};

const multilineScript = (text: string): string => {
  // multiline strings
  return text.replace(/^/gm, "  ");
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
