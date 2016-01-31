
docker:
	docker build -t ryscheng/kingdom:latest .

run:
	docker run --device /dev/snd -i -t ryscheng/kingdom /bin/bash

