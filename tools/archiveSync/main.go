package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

const (
	issuesTable     = "Issues list"
	issuesDirectory = "../../archives/content/archives"
)

func main() {
	rdsURL := os.Getenv("FIVECALLS_RDS_URL")
	readPassword := os.Getenv("FIVECALLS_RDS_READ_PASS")
	if rdsURL == "" || readPassword == "" {
		log.Fatal("could not get rds env")
	}

	db, err := gorm.Open("mysql", fmt.Sprintf("readissues:%s@tcp(%s)/results?charset=utf8&parseTime=True&loc=Local", readPassword, rdsURL))
	if err != nil {
		log.Fatalf("couldn't connect to db: %s", err)
	}
	defer db.Close()

	gormIssues := []Issue{}
	db.Raw("SELECT * FROM newissues WHERE groupID = 99 and deleted_at and created_at >= '2019-01-01 00:00:00'").Scan(&gormIssues)

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
	for _, issue := range gormIssues {
		// log.Printf("issue is %+v", issue)
		if issue.slugWithNoSpaces() != "" {
			ioutil.WriteFile(fmt.Sprintf("%s/%s.md", issuesDirectory, issue.slugWithNoSpaces()), []byte(issue.toHugo()), 0644)
		}
	}
}

func (i Issue) toHugo() string {
	date := i.frontmatterDate()

	issueMarkdown := fmt.Sprintf(`---
title: %s
date: %s
publishdate: %s
categories: [116th]
issue_id: %d
aliases:
 - /issues/%s/
---
%s`, strings.Replace(i.Name, ":", `\:`, 0), date, date, i.ID, i.slugWithNoSpaces(), i.Description)

	return issueMarkdown
}

type Model struct {
	ID        uint       `json:"id" gorm:"primary_key"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `json:"-"`
}

type Issue struct {
	Model
	GroupID      uint     `json:"-" gorm:"column:groupID"`
	Name         string   `json:"name"`
	Description  string   `json:"reason"`
	Script       string   `json:"script"`
	ContactType  string   `json:"contactType" gorm:"column:contactType"`
	ContactAreas []string `json:"contactAreas" gorm:"-"`
	Slug         string   `json:"slug"`
	Active       bool     `json:"active"`
	Meta         string   `json:"-"`
	Sort         int      `json:"-"`
}

func (Issue) TableName() string {
	return "newissues"
}

func (i Issue) slugWithNoSpaces() string {
	return strings.Join(strings.Fields(i.Slug), "")
}

func (i Issue) frontmatterDate() string {
	return i.Model.UpdatedAt.Format("2006-01-02")
}
