# The `.github` Directory

## :cactus: File Structure

> :seedling: `tree -a -F -L 3 -I --gitignore --dirsfirst .github`

```none
.github/
├── codeql/
│   └── codeql-config.yml
├── workflows/
│   ├── ci-package-update.yaml
│   ├── ci.yaml
│   ├── codeql-analysis.yml
│   ├── conventional-commit.yaml
│   ├── create-labels.yaml
│   ├── dependabot-tests.yaml
│   ├── import-csv-issues.yaml
│   ├── licensed.yaml
│   ├── linter.yaml
│   ├── pre-commit.yaml
│   ├── repository-created.yaml
│   ├── stargazers.yml
│   └── test.yaml
├── CODEOWNERS
├── dependabot.yml
└── index.md
```

> [!TIP]
>
> If a repository contains more than one _README_ file, then the file shown is chosen from locations in the following
> order: the **`.github`** directory, then the repository's **`root`** directory, and finally the **`docs`** directory.
>
> See the [**official docs**](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
> for more details.
