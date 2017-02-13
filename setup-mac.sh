#!/bin/bash

### HELPERS ###
function brewInstall {
	if which $1 >/dev/null; then echo $2 " already installed"
	else brew install $2
	fi
}

brewInstall pkg-config pkgconfig
brewInstall opencv_version homebrew/science/opencv
