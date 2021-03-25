## Creating a Good Pull Request

The [Parity contributing guidelines](https://github.com/paritytech/substrate/blob/master/docs/CONTRIBUTING.adoc) are great for telling you the mechanics of the process of submitting a pull request but they don't offer much guidance on how to actually craft a good one.  This document is an effort to try to give a little more guidance on what it means to create a good pull request.

### Philosophy

A good pull request demonstrably and obviously introduces working new functionality or improves existing functionality.

A good pull request is much more than writing code.   It shows empathy.  Empathy for the reviewer and empathy for your future-self trying to understand why things are the way they are long after you wrote the code.

A good pull request can be reviewed quickly and will be straightforward to merge.  We want to optimise for work not being blocked waiting for a review.

A good pull request demonstrates clarity of thought.  It shows rigour in considering the implications of your changes.  Crafting good pull requests is a great way to help you identify holes in your thinking or muddled thinking.  It also frees the reviewer up to focus on the essence of what code changes are being introduced without being distracted.

A good pull request and commit messages can often become the basis for developer documentation - although this should not be a primary goal.

### Concrete guidance

* **Make your pull request as small as possible** - a PR that takes 5 minutes to review is much more likely to be reviewed and merged quickly than one that needs to be scheduled for a review.  Small PRs are also much less likely to inadvertently introduce bugs.
* **Only try to solve one problem** - implement the smallest piece of functionality possible.  There does not need to be a 1-2-1 correlation between issues and pull requests.  If you feel like you cannot implement a pull request without fixing multiple issues concurrently there is a problem with how the tickets are defined. You should discuss that with your peers. If a pull request introduces 3 changes A, B and C and a reviewer has questions or feedback on B then A and C, while they could very well be merged, are stuck waiting for a resolution to change B.
* **Where possible do refactorings, whitespace changes, or linting fixes as separate commits** - these changes often introduce a lot of noise and make reviewing much harder.  Anything other than small refactorings probably ought to be a PR in it's own right.
* **No leftover debug logging** unless it uses a configurable logger that is turned off for end users (I.E. no `console.log`) - this looks messy when the end user uses your code.
* **No commented out code** - we can always resurrect code by looking through the git history.  If it is new code then why are you adding it if it's commented out?  This is confusing for a reviewer.
* **Code should follow style guidelines and pass the linter** - it is harder to spot bugs when the code style changes and it is harder for a reviewer to focus on the implication of the code changes when they are distracted by easily-remediable minor irritations.
* **Code should be accompanied by tests**  At a minimum the "happy path" (everything going to plan) should be covered but ideally also edge cases and error cases should be covered.
* **All the tests should be passing** (CI should automate checking this) and you should not comment out existing tests or assertions to make it pass.  If a test is failing there is always a reason. That reason might well be that it is testing the wrong thing after your changes but you should consider, in that case, how to make sure the correct behaviour is being tested and how you can improve the tests.
* **Strive to format your commit messages properly** and take the time to add more detail on **why the code is the way it is** when this will be helpful for people in the future.
* **Use draft pull requests** to get feedback early or help with specific problems.  While a pull request is in draft you do not necessarily need to follow all the guidance, but make sure you're clear when asking others for help that you know there are outstanding issues and what they are.
* **GPG sign all your git commits** - if you are a Parity employee, follow the [yubikey gpg setup guide](https://www.notion.so/paritytechnologies/Yubikey-Guide-787b2f4e340a40369bbf3159fa3643de)

### Tips for testing

* **Prefer writing unit tests to integration tests**.  They run much faster and tend to be more accurate at pinpointing a problem when it arises
* **Treat the test code like you would "production" code**.  Refactor it for reuse.  Refactor it for readability.  The very best tests read like a story.  They speak to you about what the code should be doing. It is obvious what is being tested (and what is **not**)
* **Try hard to keep your tests fast** - if the test run gets slow it's much more tempting to stop running the tests frequently or worse not-at-all.
* **Keep your tests isolated**.  Tests should not depend on one another or need to be run in a specific order.  This is an indication of coupling (and possibly poor design choices in the implementation).

### Tips for Pull Request Descriptions and Commit Messages

* **Consider adding more visible documentation** if the notes you are making are particularly important.  This can be a code comment with a link to the PR, inline code comments or docs in the `docs` folder depending on how large and how important the docs are.
* **Follow the git commit message conventions** outlined [here](https://chris.beams.io/posts/git-commit/). They play well with the `git` CLI tools, and the Github UI. Your code editor should enforce these for you but you may need a plugin.
* **Describe the problem being solved** - give the reviewer enough context to adequately review the pull request without having to ask for more details or for future readers to understand the context in which the PR was made.
* **Describe the approach** and any trade offs you made highlighting any known limitations.
* For refactorings, **point out the new use cases it enables or the duplication it removes**.
* **Re-read your descriptions** before you submit the PR for review.
