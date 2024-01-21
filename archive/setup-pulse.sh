#!/bin/bash

sudo apt-get install pulseaudio pulseaudio-utils alsa-utils avahi-daemon pavucontrol

if cat /etc/modules | grep "snd-bcm2835" | grep -v "#" >/dev/null; then echo "### sound driver configured for boot"
else
	echo "### adding snd-bcm2835 to /etc/modules"
	sudo echo "snd-bcm2835" | sudo tee -a /etc/modules
	echo "NOW REBOOT SYSTEM"
	exit 1
fi

if lsmod | grep "snd_bcm2835" >/dev/null; then echo "### sound driver loaded"
else
	echo "### snd-bcm2835 kernel module not loaded. Please fix before continuing"
	exit 1
fi

if cat /etc/pulse/default.pa | grep "echo-cancel" | grep -v "#" >/dev/null; then echo "### echo cancellation installed"
else
	echo "### adding module-echo-cancel to /etc/pulse/default.pa "
	sudo echo "load-module module-echo-cancel" | sudo tee -a /etc/pulse/default.pa
fi

# 0=auto, 1=headphones, 2=hdmi
sudo amixer -c 0 cset numid=3 0

echo "Starting PulseAudio"
pulseaudio -D --high-priority #--disallow-exit --disallow-module-loading=1

if pactl list | grep "echo-cancel" >/dev/null; then echo "### echo cancellation running"
else echo "### echo cancellation not running for some reason"
fi

# `pavucontrol` for pulseaudio GUI
