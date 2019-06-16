#!/bin/bash

amixer cset name="Stereo ADC MIXL ADC2 Switch" 0
amixer cset name="Stereo ADC MIXR ADC2 Switch" 0
amixer cset name="Int Mic Switch" 0
amixer cset name="ADC Capture Switch" 1
amixer cset name="RECMIXL BST1 Switch" 0
amixer cset name="RECMIXR BST1 Switch" 0
amixer cset name="RECMIXL BST2 Switch" 1
amixer cset name="RECMIXR BST2 Switch" 1
amixer cset name="Stereo ADC L1 Mux" "ADC"
amixer cset name="Stereo ADC R1 Mux" "ADC"
amixer cset name="Stereo ADC MIXL ADC1 Switch" 1
amixer cset name="Stereo ADC MIXR ADC1 Switch" 1
amixer cset name="Stereo ADC MIXL ADC2 Switch" 0
amixer cset name="Stereo ADC MIXR ADC2 Switch" 0
amixer cset name="IN1 Mode Control" "Single ended"
amixer cset name="IN2 Mode Control" "Single ended"
amixer cset name="Mic Jack Switch" 1
