#!/bin/bash

### HELPERS ###
function aptInstall {
  sudo apt-get install -y "$@"
  #if which $1 >/dev/null; then echo $2 " already installed"
  #else sudo apt install -y $2
  #fi
}

function npmInstall {
  if which $1 >/dev/null; then echo $2 " already installed"
  else npm install -g gulp
  fi
}

### 
echo "Installing system dependencies ..."

# Node.js (>=6.0LTS)
if which node >/dev/null; then echo "Node.js already installed"
else 
  curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo chown -R $USER /usr/local
  npm config set prefix /usr/local
fi

# mic (npm)
aptInstall alsa-base alsa-utils

# speaker (npm)
aptInstall libasound2-dev

# lame (npm) - comes bundled now
aptInstall libmp3lame-dev libmpg123-dev

# espeak (npm)
aptInstall espeak

# say (npm)
aptInstall festival festvox-kallpc16k

# opencv (npm)
aptInstall libopencv-dev

# audio players
#aptInstall mplayer mpg321 ffmpeg

# clap-detector (npm)
aptInstall sox

# pocketsphinx dependencies
aptInstall cmake gcc g++ automake autoconf libtool pkg-config bison python python-all-dev libpcre3-dev
npmInstall cmake-js cmake-js

# swig (Node's pocketsphinx requires swig >=3.0.7)
aptInstall swig
#sudo apt-get install -y swig3.0
#sudo ln -s /usr/bin/swig3.0 /usr/bin/swig
#WORKDIR /kingdom/third_party
#sudo wget https://downloads.sourceforge.net/project/swig/swig/swig-3.0.10/swig-3.0.10.tar.gz
#sudo tar xzf swig-3.0.10.tar.gz
#WORKDIR /kingdom/third_party/swig-3.0.10
#sudo ./configure
#sudo make
#sudo make install

# pocketsphinx (>=5prealpha)
aptInstall pocketsphinx
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
npmInstall gulp gulp

