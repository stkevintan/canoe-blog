---
title: Timus 1996 Cipher Message 3 KMP+FFT求卷积
categories:
  - ACM
id: 130
date: '2014-11-06T06:13:15+08:00'
tags:
  - 数论
---

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
|--------|--------|
|  3 2<br/> 11110001 11110001 11110000<br/>11110000 11110000     |   Yes<br/>1 2|

| input | output |
|--------|--------|
|3 1<br/>11110000 11110001 11110000<br/>11110000      |   Yes<br/>0 1|


**Problem Author: **Denis Dublennykh (prepared by Oleg Dolgorukov)

题目老长难懂，其实就是给你一个n byte的01A串，m byte的01B串.其中A串中每一byte的最后一个bit是可以修改的，问至少修改多少次A串能使B使A的子串。输出修改次数与最小的起始匹配位置。

首先将A串每byte取前7位（代码中的a数组）与B串每byte取前7位（代码中的b数组）用KMP匹配，因为前7位不能改，所以如果没有一处匹配就直接输出No了。

然后将A串每byte取后1位（代码中的ax数组）与B串每byte取后一位（代码中的bx数组）求hamming距离。

如何求ax与bx的hamming距离呢？

可以巧妙的ax作为卷积中的f函数，bx的逆向数组bx\`作为卷积中的g函数。两者求卷积。这样就成了：
$$c[i + m - 1] = ax[i + 0] * bx\`[m - 0 - 1] + ax[i + 1] * bx\`[m - 1 - 1] + …… ax[i + j] * bx\`[m - j - 1] + …… ax[i + m - 1] * bx\`[m - (m - 1) - 1]$$

可以看出，如果ax , bx中同为1,乘积为1,否则为0,这样就能统计出了有多少位同为1了。

如果将ax,bx数组中的01取反，再进行上述操作，那么救能统计出有多少位同为0了。两者相加就是全部相同的有多少，用总字符数m减去它，就能求出hamming距离了！

卷积复杂度为O(nlg(n))而暴力算法的复杂度为O(n×m)，真是太神奇了！
```C++
using namespace std;
const int N = 250005;
int n, m;
const double pi = acos(-1.0);
// Complex  z = a + b * i
struct Complex {
	double x, y;
	Complex(double x = 0.0, double y = 0.0) :
			x(x), y(y) {
	}
	Complex operator +(const Complex &amp;c) const {
		return Complex(x + c.x, y + c.y);
	}
	Complex operator -(const Complex &amp;c) const {
		return Complex(x - c.x, y - c.y);
	}
	Complex operator *(const Complex &amp;c) const {
		return Complex(x * c.x - y * c.y, x * c.y + y * c.x);
	}
};
int a[N], b[N], ax[N], bx[N];
char buf[8];
/*
 * kmpNext[]的意思:next'[i]=next[next[...[next[i]]]] (直到next'[i]&lt;0或者
 x[next'[i]]!=x[i])
 * 这样的预处理可以快一些
 */
void preKMP(int x[], int m, int kmpNext[]) {
	int i, j;
	j = kmpNext[0] = -1;
	i = 0;
	while (i &lt; m) {
		while (-1 != j &amp;&amp; x[i] != x[j])
			j = kmpNext[j];
		if (x[++i] == x[++j]) kmpNext[i] = kmpNext[j];
		else kmpNext[i] = j;
	}
}
/*
 * 返回x在y中出现的次数,可以重叠
 */
int next[N];
vector pos;
void KMP_Count(int x[], int m, int y[], int n) { //x是模式串,y是主串
	int i, j;
	pos.clear();
	preKMP(x, m, next);
	i = j = 0;
	while (i &lt; n) {
		while (-1 != j &amp;&amp; y[i] != x[j])
			j = next[j];
		i++;
		j++;
		if (j &gt;= m) {
			pos.push_back(i - m);
			j = next[j];
		}
	}
}
//len = 2 ^ k
inline void change(Complex y[], int len) {
	for (int i = 1, j = len / 2; i &lt; len - 1; i++) {
		if (i &lt; j) swap(y[i], y[j]);
		int k = len / 2;
		while (j &gt;= k) {
			j -= k;
			k /= 2;
		}
		if (j &lt; k) j += k;
	}
}
// FFT
// len = 2 ^ k
// on = 1  DFT    on = -1 IDFT
inline void FFT(Complex y[], int len, int on) {
	change(y, len);
	for (int h = 2; h &lt;= len; h &lt;&lt;= 1) {
		Complex wn(cos(-on * 2 * pi / h), sin(-on * 2 * pi / h));
		for (int j = 0; j &lt; len; j += h) {
			Complex w(1, 0);
			for (int k = j; k &lt; j + h / 2; k++) {
				Complex u = y[k];
				Complex t = w * y[k + h / 2];
				y[k] = u + t;
				y[k + h / 2] = u - t;
				w = w * wn;
			}
		}
	}
	if (on == -1) {
		for (int i = 0; i &lt; len; i++) {
			y[i].x /= len;
		}
	}
}
//FFT求卷积,a数组长度n，b数组长度m
int res[N];
Complex x1[N &lt;&lt; 2], x2[N &lt;&lt; 2]; //FFT开4倍
void Convolution(int a[], int b[]) {
	int len = max(n, m);
	int l = 1;
	while (l &lt; len * 2)
		l &lt;&lt;= 1;
	for (int i = 0; i &lt; l; i++)
		x1[i] = Complex(i &lt; n ? a[i] : 0, 0);
	for (int i = 0; i &lt; l; i++)
		x2[i] = Complex(i &lt; m ? b[i] : 0, 0);
	//DFT
	FFT(x1, l, 1);
	FFT(x2, l, 1);
	for (int i = 0; i &lt; l; i++)
		x1[i] = x1[i] * x2[i];
	//IDFT
	FFT(x1, l, -1);
	//based on m
	int base = m ;
	for (int i = 0; i &lt;= n - base; i++) {
		res[i] += (int) (x1[i + base - 1].x + 0.5);
	}
}
int main() {
	while (~scanf("%d%d", &amp;n, &amp;m)) {
		for (int i = 0; i &lt; n; i++) {
			a[i] = 0;
			scanf("%s", buf);
			for (int j = 0; j &lt; 7; j++) {
				a[i] = a[i] &lt;&lt; 1 | (buf[j] - '0');
			}
			ax[i] = buf[7] - '0';
		}
		for (int i = 0; i &lt; m; i++) {
			b[i] = 0;
			scanf("%s", buf);
			for (int j = 0; j &lt; 7; j++) {
				b[i] = b[i] &lt;&lt; 1 | (buf[j] - '0');
			}
			bx[i] = buf[7] - '0';
		}
		KMP_Count(b, m, a, n);
		if (pos.size() == 0) puts("No");
		else {
			reverse(bx, bx + m);
			memset(res, 0, sizeof(res));
			puts("Yes");
			Convolution(ax, bx);
			for (int i = 0; i &lt; n; i++)
				ax[i] ^= 1;
			for (int i = 0; i &lt; m; i++)
				bx[i] ^= 1;
			Convolution(ax, bx);
			int ans = m, idx = 0;
			for (int i = 0; i &lt; (int) pos.size(); i++) {
				if (m - res[pos[i]] &lt; ans) {
					ans = m - res[pos[i]];
					idx = pos[i] + 1;
				}
			}
			printf("%d %d\n", ans, idx);
		}
	}
}
```
