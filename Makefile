build-docker:
	docker-compose pull
	docker-compose build --pull

import-fixtures:
	docker-compose exec api php bin/console doctrine:fixtures:load

build-types:
	cd api && yarn build-types
	./symfony-console  api:graphql:export > api/assets/api-definitions/schema.graphql
	cd api && ./node_modules/.bin/apollo client:codegen --target typescript  '--includes=assets/js/**/*.tsx' --localSchemaFile=assets/api-definitions/schema.graphql --tagName=gql --addTypename --globalTypesFile=assets/js/Types/graphql-global-types.ts

