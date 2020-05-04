# Ilias Development Approach

This RFC describes how we extend Ilias and how the development process looks like.

## Base assumptions

- The full source code of the project should reside (or be referenced in) this Git Repo. This means that
  a certain Git Commit Hash is fully descriptive for *all* artifacts which are built. 
- We start with a plain Ilias 6 instance (and we try very hard to not patch it).
- We do all Ilias modifications by creating custom Plugins (or installing existing ones).
- We want the dev build to be as reproducible as possible, i.e. we do **not** want to run interactive stuff in the Ilias UI
  for configuration.

## Main Rules

- **Ilias source code** is included via a Git Submodule, to have it around for easy access. We assume that we do not
  need to modify it.
- **Ilias Plugins** are included via [Git Subtree](https://www.atlassian.com/git/tutorials/git-subtree)
    - This means we include the source code of plugins in this repo.
    - We can easily pull upstream changes.  
    - We can patch the plugin directly in this repo if needed.
- We write whatever makes sense as **Ilias Plugin**.
- For controlling Ilias "remotely" via CLI, we use a **Degree4.0 Symfony Application** which *converges* Ilias to 
  a known state. 
- **Dockerfiles** must start with common, official, Docker Hub Images, like the `php` base images.

## Export and Import of Courses

- We want the course export and import to be as deterministic as possible, so that we can use Git Diff etc. for getting
  a hint what has changed in between.
