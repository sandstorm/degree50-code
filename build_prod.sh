
echo "Will build image with tag $1"

docker build -t $1 deployment/docker
