# Kingdom

Kingdom is an intelligent personal assistant, written to run locally on Node.js. 
All plugins, including [speech recognition](https://github.com/cmusphinx/pocketsphinx), are run locally.
This way, you don't need to send your voice data to the cloud to get simple things done. 

Current plugins include:
- Weather
- Control your Hue lighting system
- Hype Machine music player

## Dependencies
Before running Kingdom, make sure to install all of the system dependencies.
```bash
  bash setup.sh
```
This script has only been tested on Ubuntu 16.04LTS and Raspbian OS.
If this doesn't work for you, install each system dependency in the file manually.
We also have a Dockerfile to create a container with all the correct dependencies on an x86 machine.

In particular, make sure you have the following:
- [Node](https://nodejs.org/en/) - >=6.0LTS
- [PocketSphinx](http://cmusphinx.sourceforge.net/wiki/tutorialpocketsphinx) - >=5alpha

Once all system dependencies have been installed, install the project dependencies
```bash
  npm install
```

## Running
First make sure you have a complete configuration file.

To start Kingdom:
```bash
  npm start
```

## Developing

To run all tests and lint scripts:
```nodejs
  gulp test
```

For test coverage:
```nodejs
  gulp coverage
```
