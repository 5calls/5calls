# archives blog

For issues that are no longer callable, we have a static hugo-built blog that creates static pages and pushes them into the public folder. This is automated via github actions but can be run manually by using the `archiveSync` tool and then manually committing the changes.

Use `sass src/components/shared/scss/_style.scss > archives/static/css/main.css` to test css changes.