# Hosting on GitHub Pages

The guide is a static Astro site. GitHub Pages can host it from a public repository on
GitHub Free. The intended project URL is:

https://rootulp.github.io/consensus-field-guide/

This URL is only live after repository settings and the deployment workflow are enabled.

## One-time repository settings

The current connected GitHub integration can push code and create pull requests, but its API
returns `403 Resource not accessible by integration` for repository visibility and Pages settings.
A repository administrator must complete these settings in GitHub:

1. Open [repository Settings](https://github.com/rootulp/consensus-field-guide/settings).
   Under **Danger Zone → Change repository visibility**, choose **Public** and complete GitHub’s confirmation.
2. Open [Settings → Pages](https://github.com/rootulp/consensus-field-guide/settings/pages).
   Under **Build and deployment → Source**, select **GitHub Actions**.
3. Merge the hosting pull request into `main`. The **Deploy GitHub Pages** workflow builds and
   publishes the site. If the workflow was merged before enabling Pages, run it manually from
   [Actions](https://github.com/rootulp/consensus-field-guide/actions) using **Run workflow**.

The repository owner has authorized making this repository public. Public visibility includes
repository source and Git history, while Pages publishes the built website.

## Automatic deployment

`.github/workflows/pages.yml` runs on pushes to `main` and manual dispatch. It installs Node 24,
checks types and unit tests, builds static output, uploads the Pages artifact, and deploys it
with GitHub’s official Pages actions. It uses the built-in `GITHUB_TOKEN` with narrowly scoped
Pages and OIDC permissions; no deployment token needs to be stored as a secret.

The existing CI workflow also runs browser tests for pull requests. Review CI before merging.
The glossary is included in the site. Its navigation and related-lesson links use the same
project-path handling as the rest of the guide.

## Project-path handling

GitHub hosts a project site under `/consensus-field-guide/`. The deployment workflow sets
`BASE_PATH=/consensus-field-guide/`. Astro prefixes generated assets, and `sitePath()` prefixes
internal links, including family-tree lesson links created in the browser.

Local development keeps `/` as the default base. To verify the actual Pages path locally:

```sh
BASE_PATH=/consensus-field-guide/ npm run build
BASE_PATH=/consensus-field-guide/ npm run preview
# Visit http://localhost:4321/consensus-field-guide/
```

The custom `404.html` includes links back into the project path. A custom domain would require
reviewing `site`, `BASE_PATH`, and the Pages domain settings together.

## Verify the live site

After a successful deployment:

- Open the project URL and check that styles and scripts load.
- Follow a family-tree card into its lesson.
- Visit `/consensus-field-guide/lessons/simplex/` directly and use Step and the quiz.
- Follow the lesson’s previous/next links and return to the tree.
- Open an unknown URL under the project and check the custom 404.

Reading progress is saved per browser origin, so development and hosted progress are separate.

References:

- [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages availability and project URLs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Publishing with a custom GitHub Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
