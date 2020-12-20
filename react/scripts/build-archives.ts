import fetch from "node-fetch";
import fs from "fs";
import fsExtra from "fs-extra";

// yarn run ts-node -O '{"module": "commonjs"}' scripts/build-archives.ts

interface Issue {
  id: number;
  name: string;
  reason: string;
  script: string;
  slug: string;
  createdAt: string;
  contactAreas: string[];
  outcomeModels: Outcome[];
  active: boolean;
}

interface Outcome {
  label: string;
  status: string;
}

const buildArchives = async () => {
  const contentDirectory = `${__dirname}/../../content/archives/`;
  const files = fs.readdirSync(contentDirectory);
  files.forEach((file) => {
    // _index.md makes the list page show up
    if (file != "_index.md") {
      fsExtra.removeSync(`${contentDirectory}${file}`);
    }
  });

  fetch(`https://api.5calls.org/v1/issues/archive?congress=116`)
    .then((res) => res.json())
    .then((data) => {
      const issues = data as Issue[];
      // console.log("resoponse is", issues);
      issues.forEach((issue) => {
        fs.writeFileSync(`${contentDirectory}${issue.slug}.md`, archiveContentFromIssue(issue));
      });
    });
};

const archiveContentFromIssue = (issue: Issue): string => {
  return `---
title: "${escapeQuotes(issue.name)}"
date: ${issue.createdAt}
---
${issue.reason}
`;
};

const escapeQuotes = (text: string): string => {
  return text.replace(/"/g, '\\"');
};

buildArchives();
