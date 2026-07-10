# :shopping_cart: GitHub Action: Normalize Major Version Tag

![CI](https://github.com/stairwaytowonderland/normalize-majorver/actions/workflows/ci.yaml/badge.svg)
![Linter](https://github.com/stairwaytowonderland/normalize-majorver/actions/workflows/linter.yaml/badge.svg)
![CodeQL](https://github.com/stairwaytowonderland/normalize-majorver/actions/workflows/codeql-analysis.yml/badge.svg)
![Coverage](./badges/coverage.svg)

[![GitHub latest release](https://img.shields.io/github/v/release/stairwaytowonderland/normalize-majorver?include_prereleases&logo=rocket)](https://github.com/stairwaytowonderland/stairwaytowonderland/normalize-majorver/releases)
[![GitHub last commit](https://img.shields.io/github/last-commit/stairwaytowonderland/normalize-majorver?logo=git)](https://github.com/stairwaytowonderland/stairwaytowonderland/normalize-majorver/commits/main)
[![GitHub license](https://img.shields.io/github/license/stairwaytowonderland/normalize-majorver?logo=opensourceinitiative&labelCol&color=yellow&logoColor=white)](https://github.com/stairwaytowonderland/stairwaytowonderland/normalize-majorver/tree/main/LICENSE)
[![semantic-release: conventionalcommits](https://img.shields.io/badge/semantic--release-cc-FE5196?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![pre-commit](https://img.shields.io/badge/pre--commit-FAB040?logo=pre-commit&logoColor=black)](https://github.com/pre-commit/pre-commit)

## :pushpin: Overview

This GitHub Action creates and updates normalized major version tags (e.g. v1, v2) when a semantic versioning tag is
pushed. For example, if v1.2.3 tag is pushed, it updates the v1 tag. It works well with [GitHub Action versioning](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/about-actions#versioning-your-action).

## :cactus: Project structure

> [!TIP]
> See the `.github` folder's _"Readme"_ ([`index.md`](./.github/index.md)) for its file structure.

<details>
<summary><b>Project file structure</b> <i>(click to expand) ...</i></summary><br>

> :seedling: `tree -a -F -L 1 -I '.git|.vscode' --gitignore --dirsfirst .`

```none
./
├── __fixtures__/
├── __tests__/
├── .devcontainer/
├── .github/
├── .licenses/
├── badges/
├── dist/
├── src/
├── .checkov.yml
├── .editorconfig
├── .env.example
├── .gitattributes
├── .gitignore
├── .licensed.yml
├── .markdownlint.json
├── .node-version
├── .npmrc
├── .pre-commit-config.yaml
├── .prettierignore
├── .prettierrc
├── .releaserc
├── .yaml-lint.yml
├── action.yaml
├── actionlint.yml
├── CHANGELOG.md
├── eslint.config.mjs
├── jest.config.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── rollup.config.ts
└── tsconfig.json
```

</details>

---

## :rocket: Key Features

:white_check_mark: Easy to use!

## :gear: Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`fnm`](https://github.com/Schniz/fnm), this template has a `.node-version`
> file at the root of the repository that can be used to automatically switch to
> the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node`
> actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle # `npm run build` also works
   ```

1. :microscope: Run the tests

   ```bash
   $ npm test

   PASS  __tests__/main.test.ts
   Normalize Major Version
     ✓ Create a new major tag (2 ms)
     ✓ Update an existing major tag (1 ms)
     ✓ Fails (11 ms)
     ✓ Fails with not tag reference
     ✓ Fails with not semantic versioning tag
     ...
   ```

1. :broom: Format and lint

    ```bash
    # Use `npm run format:check` to check only
    $ npm run format:write

    > normalize-majorve@0.0.0 format:write
    > npx prettier --write .
    ...

    $ npm run lint

    > normalize-majorver@0.0.0 lint
    > npx eslint .
    ...
    ```

1. :surfer: Run them all _(recommended)_

    ```bash
    $ npm run all
    ...
    ```

## :video_game: Usage

After testing, you can commit your changes and create version tag(s) that developers can use to reference different
stable versions of your action. For more information, see
[Versioning](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md) in the GitHub Actions toolkit.

To include the action in a workflow in another repository, you can use the
`uses` syntax with the `@` symbol to reference a specific branch, tag, or commit
hash.

### :key: Permissions

In order to create or update a new tag, the `contents:write` permissions are required:

```yaml
permissions:
  contents: write
```

### :computer: Example

```yaml
name: Normalize Major Version Tag

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  normalize-majorver:
    name: Normalize Major Version Tag
    runs-on: ubuntu-latest
    steps:
      - uses: stairwaytowonderland/normalize-majorver@v1
```

---

## :sparkles: Contributing

### :speech_balloon: Commit Message Guidelines

- Write clear, concise commit messages that follow the
  [![conventional-commit](https://img.shields.io/badge/conventional--commit-FE5196?logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/)&nbsp;standard.
- The allowed _prefixes_ for this project are the following:

  ```json
  [
    "build",
    "chore",
    "ci",
    "docs",
    "feat",
    "fix",
    "perf",
    "refactor",
    "revert",
    "style",
    "test"
  ]
  ```

> [!NOTE]
>
> See
> [Contributing Guidelines](https://github.com/stairwaytowonderland/normalize-majorver?tab=contributing-ov-file#contributing-guidelines)
> for more information.
