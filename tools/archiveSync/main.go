package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"

	"github.com/fabioberger/airtable-go"
)

const (
	issuesTable     = "Issues list"
	issuesDirectory = "../../archives/content/issues"
)

func main() {
	base := os.Getenv("AIRTABLE_BASE")
	key := os.Getenv("AIRTABLE_KEY")
	if base == "" || key == "" {
		log.Fatal("could not get airtable env")
	}

	// • download filtered dead issues
	c, err := airtable.New(key, base)
	if err != nil {
		log.Fatalf("couldn't make airtable client: %s", err)
	}

	var issues []*ATIssue
	err = c.ListRecords(issuesTable, &issues, airtable.ListParameters{
		FilterByFormula: `Dead`,
		Sort: []airtable.SortParameter{
			airtable.SortParameter{
				Field:          "Sort",
				ShouldSortDesc: false,
			},
		},
	})
	if err != nil {
		log.Fatalf("couldn't fetch airtable issues")
	}

	// • delete old content folder contents
	info, err := ioutil.ReadDir(issuesDirectory)
	if err != nil {
		log.Fatalf("couldn't read content directory")
	}

	for _, file := range info {
		if file.Name() != "_index.md" {
			os.Remove(fmt.Sprintf("%s/%s", issuesDirectory, file.Name()))
		}
	}

	// log.Printf("got %d issues", len(issues))

	// • generate new content files
	for _, issue := range issues {
		// log.Printf("issue is %+v", issue)
		if issue.slugWithNoSpaces() != "" {
			ioutil.WriteFile(fmt.Sprintf("%s/%s.md", issuesDirectory, issue.slugWithNoSpaces()), []byte(issue.toHugo()), 0644)
		}
	}
}

// ATIssueInfo is the model in airtable
type ATIssueInfo struct {
	Name         string   `json:"Name"`
	Action       string   `json:"Action requested"`
	Script       string   `json:"Script"`
	Link         string   `json:"Link"`
	LinkTitle    string   `json:"Link Title"`
	ContactLinks []string `json:"Contact"`
	TypeLinks    []string `json:"Type"`
	Inactive     bool     `json:"Inactive"`
	Stance       bool     `json:"Stance Results"`
	URLSlug      string   `json:"URL Slug"`
	IDidIt       bool     `json:"I did it"`
	Sort         int      `json:"Sort"`
}

// ATIssue is the base airtable model
type ATIssue struct {
	ID          string `json:"id"`
	ATIssueInfo `json:"fields"`
	CreatedAt   string `json:"createdTime"`
}

func (i ATIssue) slugWithNoSpaces() string {
	return strings.Join(strings.Fields(i.ATIssueInfo.URLSlug), "")
}

func (i ATIssue) toHugo() string {
	issueMarkdown := fmt.Sprintf(`---
title: "%s"
date: %s
publishdate: 2017-03-24
categories: [116th]
---
%s`, i.ATIssueInfo.Name, "2017-03-24", i.ATIssueInfo.Action)

	return issueMarkdown
}
