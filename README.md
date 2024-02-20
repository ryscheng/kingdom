# Kingdom

Kingdom is an intelligent personal assistant, written to run locally on Node.js.
All plugins, including speech recognition are run locally.
This way, you don't need to send your voice data to the cloud to get simple things done.

This repo was originally created back when there weren't very many alternatives to Alexa.
We were able to get the weather, control a Hue lighting system, and control a music player
using voice commands powered by Pocketsphinx.

You can find the original code under `./archive` and a partial TypeScript rewrite under `./ts`.

## Current plan

There are now many alternatives to Alexa that can be run entirely locally.

We are most excited about
[Rhasspy3](https://github.com/rhasspy/rhasspy3) (under active development),
and [Home Assistant](https://www.home-assistant.io/),
which can run local speech-to-text and text-to-speech models powered by the latest
machine learning, like OpenAI Whisper and Piper TTS.
This can be paired with Home Assistant 
[local assist pipelines](https://www.home-assistant.io/voice_control/voice_remote_local_assistant/)
to create an entirely local personal assistant.

