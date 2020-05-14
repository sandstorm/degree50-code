build-docker:
	docker-compose pull
	docker-compose build --pull

import-fixtures:
	docker-compose exec api php bin/console doctrine:fixtures:load

build-types:
	docker-compose exec assets yarn build-types
