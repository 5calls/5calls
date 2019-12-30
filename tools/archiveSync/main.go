package main

import (
	"log"

	"github.com/fabioberger/airtable-go"
)

const (
	issuesTable = "Issues list"
)

func main() {
	// • download filtered dead issues
	c, err := airtable.New("API KEY", "BASEID")
	if err != nil {
		log.Fatalf("couldn't make airtable client: %s", err)
	}

	var issues []*ATIssue
	err = c.ListRecords(issuesTable, &issues, airtable.ListParameters{
		FilterByFormula: `NOT(OR(NAME = "", DEAD))`,
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
	// • generate new content files
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
}
