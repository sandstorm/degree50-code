# API contracts between backend and frontend

## OPEN QUESTION: Should we embrace GraphQL?

(Schema First) -> Impl Backend -> Impl Frontend (TODO Backend Impl Type Safety??) 

## OPEN QUESTION: API Contracts:

https://github.com/quicktype/quicktype

-> Backend must either provide JSON schema or GraphQL; we generate TypeScript types from it.

Alternative:
    - https://github.com/apollographql/apollo-tooling
    - !! https://github.com/dotansimha/graphql-code-generator
    - !! https://github.com/acro5piano/typed-graphqlify
    - !! https://github.com/apollographql/eslint-plugin-graphql


# Symfony Components

- Gaufrette vs Flysystem:
    https://github.com/dustin10/VichUploaderBundle/blob/master/docs/storage/gaufrette.md
    
    > N.B.: although Gaufrette is a well-known library, please note that it hasn't been updated in a while and that there are still lots of unresolved issues. One of them being a broken metadata implementation, causing us troubles.

    - -> we use Flysystem.
    
- Image Handling: https://github.com/liip/LiipImagineBundle

- File Uploads: "vich/uploader-bundle"
    (a.k.a. Flow Persistent Resources) 

- Health Checks: https://github.com/liip/LiipMonitorBundle
