# Development Approach

This RFC describes how the development process looks like.

## Base assumptions

- The full source code of the project should reside (or be referenced in) this Git Repo. This means that
  a certain Git Commit Hash is fully descriptive for *all* artifacts which are built.
- We want the dev build to be as reproducible as possible, i.e. we do **not** want to run interactive stuff in the UI
  for configuration.

## Main Rules

- **Dockerfiles** must start with common, official, Docker Hub Images, like the `php` base images.
- The PHP Symfony Application (Degree 4.0 Application) is located in Docker image.
- The JavaScript Build (api/assets/) is done **on the host machine**; NOT inside the docker image.+
  - This is because we were not able to have a reliable and performant build/watch/run loop otherwise.