
docker:
	docker build -t ryscheng/kingdom:latest .

shell:
	docker run --device /dev/snd -i -t ryscheng/kingdom /bin/bash

cleanup:
	echo "Deleting dangling images"
	docker rmi $(docker images -q -f dangling=true)
	#echo "Killing running containers"
	#docker kill $(docker ps -q)
	#echo "Deleting containers"
	#docker rm $(docker ps -a -q)

run:
	docker run --device /dev/snd -i -t ryscheng/kingdom node src/index.js

all: docker run
