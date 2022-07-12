help:
	cat Makefile

build-docker:
	docker-compose pull
	docker-compose build --pull

test-integration:
	docker-compose exec \
		--env PLAYWRIGHT_API_URL="http://host.docker.internal:3000" \
		--env SYSTEM_UNDER_TEST_URL_FOR_PLAYWRIGHT="http://localhost:9090" \
		--env APP_ENV=test \
		api ./vendor/bin/behat --tags integration

test-e2e:
	docker-compose exec \
		--env PLAYWRIGHT_API_URL="http://host.docker.internal:3000" \
		--env SYSTEM_UNDER_TEST_URL_FOR_PLAYWRIGHT="http://localhost:9090" \
		--env APP_ENV=test \
		api ./vendor/bin/behat --tags playwright

test:
	docker-compose exec \
		--env PLAYWRIGHT_API_URL="http://host.docker.internal:3000" \
		--env SYSTEM_UNDER_TEST_URL_FOR_PLAYWRIGHT="http://localhost:9090" \
		--env APP_ENV=test \
		api ./vendor/bin/behat

import-fixtures:
	docker-compose exec api php bin/console doctrine:fixtures:load
