+++
title = "Timus 1996 Cipher Message 3 KMP+FFT求卷积"
categories = ["ACM"]
date = "2014-11-06T06:13:15+08:00"
tags = []

+++


题目链接：[click here](http://acm.timus.ru/problem.aspx?space=1&amp;num=1996)
##description
Emperor Palpatine has been ruling the Empire for 25 years and Darth Vader has been the head of the Empire Armed Forces. However, the Rebel movement is strong like it never used to be. One of the rebel leaders, Princess Leia from Alderaan, managed to get hold of secret blueprints of the Death Star, the imperial war station.

The Princess was going to deliver the station plan to the secret base for further analysis and searching for vulnerable spots. But her ship was attacked by the space destroyer "Devastator" headed by Darth Vader. At the last moment Princess Leia managed to send her findings to one of the closest planet called Tatooine with her droid R2-D2\. Quite conveniently, an old friend of her father Obi-Wan Kenobi lives on that planet.

R2-D2 realizes the importance of his mission. He is going to encrypt the information so that the wrong people won’t get it.
<!--more-->
The memory of R2-D2 has many files with images. First he wanted to use a well-known encrypting algorithm. The point of the method is to replace the least significant bits of the image with the encrypted message bits. The difference is practically unnoticeable on the picture, so one won’t suspect that it contains a hidden message.

But then R2-D2 decided that this method is quite well-known and the information won’t be protected enough. He decided to change the least significant bits of the image so that the secret information was a continuous sequence of the bytes of the image file. Help the droid determine if it is possible. And if it is, find the minimum number of bits to alter.

## Input

The first line of the input contains integers _n_ and _m_ (1 ≤ _n_, _m_ ≤ 250 000) — the sizes of the image file and of the file with the secret information in bytes. On the second line the content of the file with an image is given and the third line contains the secret information. The files are given as a sequence of space-separated bytes. Each byte is written as a sequence of eight bits in the order from the most to the least significant bit.

## Output

Print "No", if it is impossible to encrypt information in this image. Otherwise, print in the first line "Yes", and in the second line — the number of bits to alter and the number of the byte in the file with the image, starting from which the secret information will be recorded. If there are multiple possible variants, print the one where the secret information is written closer to the beginning of the image file.

## Samples
| input | output |
|