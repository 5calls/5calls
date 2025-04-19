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
    if (file !== "_index.md") {
      fsExtra.removeSync(`${contentDirectory}${file}`);
    }
  });

  // ADD NEW CONGRESS SESSIONS HERE
  const congressSessions = [{
    congress: 116,
    sessionName: '116th'
  }, {
    congress: 117,
    sessionName: '117th'
  }, {
    congress: 118,
    sessionName: '118th'
  }]

  congressSessions.forEach(async ({congress, sessionName}) => {
    fsExtra.mkdir(`${contentDirectory}${sessionName}`)
    const response = await fetch(`https://api.5calls.org/v1/issues/archive?congress=${congress}`)
    const data = await response.json()
    const issues = data as Issue[]
    issues.forEach((issue) => {
      fs.writeFileSync(`${contentDirectory}${sessionName}/${issue.slug}.md`, archiveContentFromIssue(issue, sessionName));
    });
  })

    
};

const archiveContentFromIssue = (issue: Issue, session: string): string => {
  return `---
title: "${escapeQuotes(issue.name)}"
date: ${issue.createdAt}
session: ${session}
---
${issue.reason}
`;
};

const escapeQuotes = (text: string): string => {
  return text.replace(/"/g, '\\"');
};

buildArchives();
