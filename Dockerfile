FROM ubuntu:15.04
MAINTAINER ryscheng

#EXPOSE 53/udp

### Dependencies
RUN apt-get install -y software-properties-common
# For newest golang
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN add-apt-repository -y ppa:ethereum/ethereum-dev
RUN apt-get update
RUN apt-get install -y golang git
RUN apt-get install -y gcc automake autoconf libtool
RUN apt-get install -y bison swig python python-all-dev
RUN apt-get install -y pulseaudio libpulse-dev

# pocketsphinx
RUN mkdir -p /ipa/third_party
WORKDIR /ipa/third_party
RUN git clone https://github.com/cmusphinx/sphinxbase.git
RUN git clone https://github.com/cmusphinx/pocketsphinx.git
WORKDIR /ipa/third_party/sphinxbase
RUN sh autogen.sh
RUN ./configure
RUN make
RUN make install
WORKDIR /ipa/third_party/pocketsphinx
RUN sh autogen.sh
RUN ./configure
RUN make
RUN make install

ADD . /ipa
WORKDIR /ipa

#CMD ["sh", "/opt/iodine/start.sh"]
