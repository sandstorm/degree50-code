
echo "Will build image with tag $1"

docker build --target api_platform_php -t api api/

docker build -t $1 docker/prod
