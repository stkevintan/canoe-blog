---
categories:
- ACM
date: 2017-08-27T00:03:05+08:00
tags:
- 招聘
- 网易
- LCS
- 暴力
title: 网易互娱2018年校招笔试解题报告
---

今天做了一下网易互娱测开的校招笔试，感觉题目挺简单的，比隔壁不招人的阿里笔试正常不少，可惜我多年不写代码正确率和手速明显跟不上了, ToT....<!--more-->

## 勇士屠龙

第一题，真简单，直接`lower_bound`暴力吧。

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<vector>
#include<algorithm>
using namespace std;
int n, m;
vector<int>a, b;
int main() {
	int x;
	while (cin >> n >> m) {
		a.clear();
		b.clear();
		for (int i = 0; i < n; i++) {
			cin >> x;
			a.push_back(x);
		}
		for (int i = 0; i < m; i++) {
			cin >> x;
			b.push_back(x);
		}
		int sum = 0;
		sort(b.begin(),b.end());

		for (int i = 0; i < n; i++) {
			int pos = lower_bound(b.begin(), b.end(), a[i]) - b.begin();
			if (pos == m) {
				sum = -1;
				break;
			}
			sum += b[pos];
		}
		cout << sum << endl;
	}
}
/*
3
3
10 11 20
20 12 30
*/
```

## 端点相遇

这一题主要是时间可能出现小数，而小数是没法精确判断的。所以尽量把除法转化为乘法。

> 首先排除掉va，vb为0的情况，不然会爆掉。
>
> 然后，如果是在A端点相遇，那么b走到A端点所要走的路程是1s 、3s、5s...一直到他能走的最大路程`t*vb`， a则是2s、4s、6s...一直到`t*va`
>
> 然后，他俩所有走所有路程所花费的时间全部算出来，相等的有多少个就有多少次相遇。如果怕浮点数相等有误差的话，可以将所有的时间乘以`va*vb`这样算出来都是整数了。用一个`map`判一下重即可。

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<map>
using namespace std;
int s, va, vb, t;
int calc(int va,int vb) {
	int sum = 0;
	map<int, bool> tmp;
	for (int i = 1;; i++) {
		int len = 2 * i * s;
		if ( len > t * vb) break;
		tmp[ len * va] = true;
	}
	for (int i = 0;; i++) {
		int len = (2 * i + 1) * s;
		if (len> t * va)break;
		if (tmp.find( len * vb)!=tmp.end()) sum++;
	}
	return sum;
}

int main() {
	while (cin >> s >> va >> vb >> t) {
		int sum = 0;
		if (va == 0) {
			cout << (vb * t / s + 1) / 2<< endl;
			return 0;
		}
		if (vb == 0) { 
			cout << (va* t / s + 1) / 2 << endl;
			return 0;
		}
		cout << calc(vb, va) + calc(va, vb) << endl;
	}
}
```

## 最长公共子串

这是我见过最耿直的模版题。直接告诉你这是个`LCS`算法了。

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<vector>
#include<string>
#include<algorithm>
using namespace std;
int n, m;
string str1, str2;
int main() {
	while (cin >> n >> m >> str1 >> str2) {

		vector<vector<int>> f = vector<vector<int>>(n + 1, vector<int>(m + 1));
		for (int i = 0; i <= n; i++) {
			for (int j = 0; j <= m; j++) {
				if (i == 0 || j == 0) f[i][j] = 0;
				else if (str1[i - 1] == str2[j - 1]) f[i][j] = f[i - 1][j - 1] + 1;
				else  f[i][j] = max(f[i][j - 1],f[i-1][j]);
			}
		}
		cout << f[n][m] << endl;

	}
}
```



## 字符串解压

这一题看似比较麻烦，但是几个递归下来，还是挺简单的。注意要考虑大括号不匹配的情况。

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<string>
#include<cctype>
using namespace std;
string str;
string out(string str) {
	int len = str.length();
	int start = 0;
	while (start < len && str[start] != '{') start++;
	if (start == len) return str;
	string ret = str.substr(0, start);
	int num = 1, end = start + 1;
	while (end < len) {
		if (str[end] == '}') num--;
		if (str[end] == '{') num++;
		if (num == 0) break;
		end++;
	}
	if (end == len) {
		ret += str[start] + out(str.substr(start + 1));
		return ret;
	}
	string mid = out(str.substr(start + 1, end - start - 1));
	//get trailing number
	int x = 0, count=0, mul = 1;
	for (int i = start - 1; i >= 0; i--) {
		if (!isdigit(str[i]))break;
		x = x + mul * (str[i] - '0');
		mul *= 10;
		count++;
	}
	//strip the trailing digit
	ret = ret.substr(0, ret.length() - count);
	// add the compress content
	while (x--) ret += mid;

	ret += out(str.substr(end + 1));
	return ret;
}

int main() {
	while (cin >> str) {
		cout << out(str) << endl;
	}
}
/*
2{efg}3{cd}ef
*/
```

