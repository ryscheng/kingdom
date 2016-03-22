FROM ubuntu:15.10
MAINTAINER ryscheng

#EXPOSE 53/udp

### Dependencies
RUN apt-get update
RUN apt-get install -y software-properties-common git curl wget

# For newest golang and node.js
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN add-apt-repository -y ppa:ethereum/ethereum-dev
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install -y golang nodejs

# mic (npm)
RUN apt-get install -y alsa-base alsa-utils

# speaker (npm)
RUN apt-get install -y libasound2-dev

# lame (npm)
RUN apt-get install -y libmp3lame-dev libmpg123-dev

# espeak (npm)
RUN apt-get install -y espeak

# say (npm)
RUN apt-get install -y festival festvox-kallpc16k

# audio players
#RUN apt-get install -y mplayer mpg321 ffmpeg

# pulse
#RUN apt-get install -y pulseaudio libpulse-dev

# pocketsphinx dependencies
RUN apt-get install -y cmake gcc g++ automake autoconf libtool pkg-config
RUN apt-get install -y bison python python-all-dev libpcre3-dev
#RUN apt-get install -y swig3.0
RUN npm install -g cmake-js
#RUN ln -s /usr/bin/swig3.0 /usr/bin/swig

# swig (Node's pocketsphinx requires swig >=3.0.7)
WORKDIR /kingdom/third_party
RUN wget https://downloads.sourceforge.net/project/swig/swig/swig-3.0.8/swig-3.0.8.tar.gz
RUN tar xzf swig-3.0.8.tar.gz
WORKDIR /kingdom/third_party/swig-3.0.8
RUN ./configure
RUN make
RUN make install

# pocketsphinx
RUN mkdir -p /kingdom/third_party
WORKDIR /kingdom/third_party
RUN git clone https://github.com/cmusphinx/sphinxbase.git
RUN git clone https://github.com/cmusphinx/pocketsphinx.git
WORKDIR /kingdom/third_party/sphinxbase
RUN sh autogen.sh
RUN ./configure
RUN make
RUN make install
WORKDIR /kingdom/third_party/pocketsphinx
RUN sh autogen.sh
RUN ./configure
RUN make
RUN make install

# to locate libpocketsphinx.so
RUN ldconfig

# pocketsphinx models
#RUN mkdir -p /kingdom/models
#WORKDIR /kingdom/models
#RUN wget http://downloads.sourceforge.net/project/cmusphinx/Acoustic%20and%20Language%20Models/US%20English%20Generic%20Acoustic%20Model/cmusphinx-en-us-5.2.tar.gz
#RUN wget http://downloads.sourceforge.net/project/cmusphinx/Acoustic%20and%20Language%20Models/US%20English%20Generic%20Language%20Model/cmusphinx-5.0-en-us.lm.gz

# npm global tools
RUN npm install -g gulp

# Project dependencies
ADD package.json /kingdom/package.json
WORKDIR /kingdom
RUN npm install

# Add rest of files
ADD . /kingdom

#CMD ["sh", "/opt/iodine/start.sh"]
