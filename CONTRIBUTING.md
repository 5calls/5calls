# 5 Calls Contributor Guidelines

Contributions to the 5 Calls frontend repository (5calls/5calls) are always welcome.

## Bug reports
Before you report a bug, search through the existing issues to see if it's
already been reported.

To report a bug, create a new issue and describe the bug to us. In addition to a
description of the bug, it is helpful if you can explain how to reproduce the
bug and what environment (OS and browser) you experienced the issue on.

## Improvements and Suggestions
Got a great idea to improve 5 Calls? We'd love to hear it! Before suggesting a
new feature, please search our existing issues to see if your idea has already
been discussed. If you can't find it, we encourage you to join our slack and
discuss your idea with us. If you're not able to join slack or don't wish to,
you can open a new issue and describe your idea.

## Contributing fixes and changes
To ensure new features are properly discussed and prioritized, and that there is
no duplication of work, we have established a
[Product Development Process](https://github.com/5calls/5calls/wiki/Product-Development-Process),
which we follow for defining and specifying new features and major changes
before they are implemented. Please read that document before starting on your
own idea. For small bug fixes and simple updates, it is alright to bypass the
above process, but please note that in the PR submission comment.

If you're looking for a place to start contributing code, check out
this [list of issues](https://github.com/5calls/5calls/issues?q=is%3Aissue+is%3Aopen+label%3A"starter+issue")
that are ready for someone to pick up and start on. Just comment on the issue
that you're going to be working on it and start coding!

Once a feature has been reviewed and approved for implementation, please follow
the following guidelines for submitting your Pull Request (PR):

1. Be sure your PR branch is rebased if it becomes out-of-date with the 5 Calls
   repo's master branch.
3. A unit or end-to-end test (or tests) should be included with the Pull Request
   covering the changes you've made. If tests are not possible, an explanation
   should be included with the PR.
4. Our continuous integration system will run ESLint, and all unit and
   end-to-end tests when a PR is submitted. Fixing any failing tests or ESLint
   rule violations is the responsibility of the person submitting the PR.
5. A 5 Calls team member needs to review and approve the PR before it can be
   merged into the master branch. The reviewer should clone the PR branch
   locally and make sure that the code can build and has no eslint or unit/e2e
   test failures before approving the PR. It is the responsibility of the PR
   submitter to make changes suggested by the reviewer or to explain why the
   proposed changes are not necessary or should be modified.
6. Merging of the PR into the master branch after approval can be done by the PR
   reviewer or any other 5 Calls team member including the submitter if he/she
   is a team member.
