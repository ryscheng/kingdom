#!/bin/bash

### HELPERS ###
function aptInstall {
  if which $1 >/dev/null; then echo $2 " already installed"
  else sudo apt install -y $2
  fi
}

### 
echo "Installing dependencies on Raspbian OS..."

if which node >/dev/null; then echo "Node.js already installed"
else 
  curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# mic (npm)
sudo apt-get install -y alsa-base alsa-utils

# speaker (npm)
sudo apt-get install -y libasound2-dev

# lame (npm)
sudo apt-get install -y libmp3lame-dev libmpg123-dev

# espeak (npm)
sudo apt-get install -y espeak

# say (npm)
sudo apt-get install -y festival festvox-kallpc16k

# audio players
#sudo apt-get install -y mplayer mpg321 ffmpeg

# pulse
#sudo apt-get install -y pulseaudio libpulse-dev

# pocketsphinx dependencies
##sudo apt-get install -y cmake gcc g++ automake autoconf libtool pkg-config
##sudo apt-get install -y bison python python-all-dev libpcre3-dev
##sudo npm install -g cmake-js

# swig (Node's pocketsphinx requires swig >=3.0.7)
##sudo apt-get install -y swig
#sudo apt-get install -y swig3.0
#sudo ln -s /usr/bin/swig3.0 /usr/bin/swig
#WORKDIR /kingdom/third_party
#sudo wget https://downloads.sourceforge.net/project/swig/swig/swig-3.0.10/swig-3.0.10.tar.gz
#sudo tar xzf swig-3.0.10.tar.gz
#WORKDIR /kingdom/third_party/swig-3.0.10
#sudo ./configure
#sudo make
#sudo make install

# pocketsphinx
##sudo mkdir -p /kingdom/third_party
##WORKDIR /kingdom/third_party
##sudo git clone https://github.com/cmusphinx/sphinxbase.git
##sudo git clone https://github.com/cmusphinx/pocketsphinx.git
##WORKDIR /kingdom/third_party/sphinxbase
##sudo sh autogen.sh
##sudo ./configure
##sudo make
##sudo make install
##WORKDIR /kingdom/third_party/pocketsphinx
##sudo sh autogen.sh
##sudo ./configure
##sudo make
##sudo make install

# to locate libpocketsphinx.so
##sudo ldconfig

# pocketsphinx models
#sudo mkdir -p /kingdom/models
#WORKDIR /kingdom/models
#sudo wget http://downloads.sourceforge.net/project/cmusphinx/Acoustic%20and%20Language%20Models/US%20English%20Generic%20Acoustic%20Model/cmusphinx-en-us-5.2.tar.gz
#sudo wget http://downloads.sourceforge.net/project/cmusphinx/Acoustic%20and%20Language%20Models/US%20English%20Generic%20Language%20Model/cmusphinx-5.0-en-us.lm.gz

# npm global tools
##sudo npm install -g gulp

