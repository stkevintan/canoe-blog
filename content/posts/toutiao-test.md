---
categories:
- ACM
date: 2017-10-18T09:26:50+08:00
tags:
- 招聘
- 网易
- LCS
- 暴力
title: 今日头条笔试解题报告(10.17)
---


之前随便投了一下今日头条竟然过了,虽然不是很想去,但是已经给了我笔试邀约好歹也就做一下,锻炼锻炼脑子,说句实话还是挺喜欢头条的题目的,做起来很有以前ACM刷题的感觉,不像其他公司总感觉"工程化"比较多。

## 推箱子

第一题比较简单,表面上无从下手但是仔细想想应该能想出来的,本质上跟走迷宫问题本质上是一致的，只不过在这题中状态既要保存人的位置也要保存箱子的位置。暴力搜索能够,AC代码:


<!--more-->

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
#include<queue>
using namespace std;
char mp[55][55];
bool used[55][55][55][55];
int n, m;
struct Point {
	int x, y;
}you, st, ed;

struct State {
	int x, y, xx, yy, step;
	State() { step = 0; };
	State(int x, int y, int xx, int yy,int step)  {
		this->x = x;
		this->y = y;
		this->xx = xx;
		this->yy = yy;
		this->step = step;
	}
	State(Point a, Point b) {
		x = a.x;
		y = a.y;
		xx = b.x;
		yy = b.y;
		step = 0;
	}
};

int dir[4][2] = { {1,0},{-1,0},{0,1},{0,-1} };
bool valid(int x, int y) {
	if (x<1 || x>n ) return false;
	if (y<1 || y>m ) return false;
	if (mp[x][y] == '#') return false;
	return true;
}

int bfs() {
	queue<State>Q;
	memset(used, 0, sizeof(used));
	State start(you,st);
	Q.push(start);
	used[start.x][start.y][start.xx][start.yy] = 1;
	while (!Q.empty()) {
		State cur = Q.front();
		if (cur.xx == ed.x && cur.yy == ed.y) return cur.step;
		for (int i = 0; i < 4; i++) {
			int x = cur.x + dir[i][0];
			int y = cur.y + dir[i][1];
			int xx = cur.xx;
			int yy = cur.yy;
			if (!valid(x, y))continue;
			if (x == cur.xx && y == cur.yy) {
				xx = cur.xx + dir[i][0];
				yy = cur.yy + dir[i][1];
			}
			if (!valid(xx, yy)) continue;

			if (xx == ed.x && yy == ed.y) {
				return cur.step + 1;
			}
			if (!used[x][y][xx][yy]) {
				used[x][y][xx][yy] = 1;
				Q.push(State(x, y, xx, yy,cur.step + 1));
			}
		}
		Q.pop();
	}
	return -1;
}
int main() {
	while (cin>>n>>m) {
		for (int i = 1; i <= n; i++) {
			for (int j = 1; j <= m; j++) {
				cin >> mp[i][j];
				if (mp[i][j] == 'S') {
					you.x = i;
					you.y = j;
				}
				if (mp[i][j] == '0') {
					st.x = i;
					st.y = j;
				}
				if (mp[i][j] == 'E') {
					ed.x = i;
					ed.y = j;
				}
			}
		}
		cout << bfs() << endl;
	}
}
/*
3 6
.S#..E
.#.0..
......
*/
```

## 房间重排

设有 n 个房间，将第 i 个房间的人取出来，依次重新安排到 i+1,i+2,...1,2,3 的房间，不断循环。给你最终各房间人数和最后安排的房间，求最开始的各个房间中人数。

这题有多解，special judge。基本思路就是找到一个包含人数最少的房间，从这个房间开始逆推还原。

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<vector>
using namespace std;
int n, m;
long long a[111111], b[111111];
vector<int>vt;

bool check(int mIndex) {
	for (int i = 0; i < n; i++) {
		if (i == mIndex) b[i] = n * a[i];
		else b[i] = a[i] - a[mIndex];
	}
	for (int i = mIndex; i != m; i = (i + 1) % n) {
		b[i]--;
		b[mIndex]++;
		if (b[i] < 0) return false;
	}
	return true;
}
int main() {
	while (~scanf("%d%d", &n, &m)) {
		long long mVal = -1;
		vt.clear();
		m--;
		for (int i = 0; i < n; i++) {
			cin >> a[i];
			if (mVal == -1 || mVal >= a[i]) {
				if (mVal > a[i])vt.clear();
				mVal = a[i];
				vt.push_back(i);
			}
		}
		for (int i = 0; i < (int)vt.size(); i++) {
			int mIndex = vt[i];
			if (check(mIndex))break;
		}
		for (int i = 0; i < n; i++) {
			printf("%lld%c", b[i], i == n - 1 ? '\n' : ' ');
		}
	}
}
/*
3 1
6 5 1
*/
```
