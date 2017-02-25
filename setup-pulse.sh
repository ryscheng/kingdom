#!/bin/bash

sudo apt-get install pulseaudio pulseaudio-utils alsa-utils avahi-daemon pavucontrol

temp=`cat /etc/modules | grep snd-bcm2835`
if [ -z $temp ]; then
	echo "adding snd-bcm2835 to /etc/modules"
	sudo echo "snd-bcm2835" | sudo tee -a /etc/modules
	echo "now reboot the system"
	exit 1
fi

temp=`lsmod| grep snd_bcm2835`
if [ -z $temp ]; then
	echo "snd-bcm2835 kernel module not loaded. Please fix before continuing"
	exit 1
fi

# 0=auto, 1=headphones, 2=hdmi
sudo amixer -c 0 cset numid=3 0

echo "Starting PulseAudio"
pulseaudio -D --high-priority --disallow-exit --disallow-module-loading=1

# `pavucontrol` for pulseaudio GUI
