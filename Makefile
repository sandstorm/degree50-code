build-docker:
	docker-compose pull
	docker-compose build --pull

import-fixtures:
	docker-compose exec api php bin/console doctrine:fixtures:load

build-types:
	docker-compose exec api yarn build-types

yarn:
	docker-compose exec api yarn

watch:
	docker-compose exec api yarn encore dev --watch
