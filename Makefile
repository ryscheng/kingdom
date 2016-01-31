
deps:
	go get github.com/ryscheng/go-pocketsphinx
	go get github.com/mesilliac/pulse-simple

docker:
	docker build -t ryscheng/ipa:latest .

run:
	docker run -i -t ryscheng/ipa /bin/bash

