#!/bin/bash

### HELPERS ###
function brewInstall {
	if which $1 >/dev/null; then echo $2 " already installed"
	else brew install $2
	fi
}

# opencv
brewInstall pkg-config pkgconfig
brewInstall opencv_version homebrew/science/opencv
# clap-detector
brewInstall sox sox
# espeak
brewInstall espeak espeak
