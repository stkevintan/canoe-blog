---
title: baylor 6622 Absurdistan Roads（ NWERC Contest）
categories:
  - ACM
id: 137
date: '2014-11-07T01:05:34+08:00'
tags:
  - 图论
---

原题pdf：[click here](https://icpcarchive.ecs.baylor.edu/external/66/6622.pdf)
##Description
The people of Absurdistan discovered how to build roads only last year. After the discovery, every city
decided to build their own road connecting their city with another city. Each newly built road can be
used in both directions.

Absurdistan is full of surprising coincidences. It took all N cities precisely one year to build their
roads. And even more surprisingly, in the end it was possible to travel from every city to every other
city using the newly built roads.

<!--more-->
You bought a tourist guide which does not have a map of the country with the new roads. It only
contains a huge table with the shortest distances between all pairs of cities using the newly built roads.

You would like to know between which pairs of cities there are roads and how long they are, because
you want to reconstruct the map of the N newly built roads from the table of shortest distances.

You get a table of shortest distances between all pairs of cities in Absurdistan using the N roads
built last year. From this table, you must reconstruct the road network of Absurdistan. There might
be multiple road networks with N roads with that same table of shortest distances, but you are happy
with any one of those networks.

##Input
For each test case:  

• A line containing an integer N (2 ≤ N ≤ 2000) — the number of cities and roads.  

• N lines with N numbers each. The j-th number of the i-th line is the shortest distance from city i to city j.

• All distances between two distinct cities will be positive and at most 1 000 000. The
distance from i to i will always be 0 and the distance from i to j will be the same as the distance
from j to i.

##Output
For each test case:

• Print N lines with three integers ‘a b c’ denoting that there is a road between cities 1 ≤ a ≤ N
and 1 ≤ b ≤ N of length 1 ≤ c ≤ 1000000, where a ̸= b. If there are multiple solutions, you can
print any one and you can print the roads in any order. At least one solution is guaranteed to
exist.

• Print a blank line between every two test cases.
##Sample Input
4  
0 1 2 1  
1 0 2 1  
2 2 0 1  
1 1 1 0  
4  
0 1 1 1  
1 0 2 2  
1 2 0 2  
1 2 2 0  
3  
0 4 1  
4 0 3  
1 3 0  
##Sample Output
2 1 1  
4 1 1  
4 2 1  
4 3 1  
2 1 1  
3 1 1  
4 1 1  
2 1 1  
3 1 1  
2 1 4  
3 2 3  
<br/>
- - -

NWERC 题目还挺简单的。  
题意就是一个N个顶点，N条边的无向图。告诉你两两点之间的最短路。让你重构这个图。(随意输出任意一张满足以上条件的图）  
这题的突破口就是N条边。要想想如果只有N-1条边，那么这个图就是一个树了。所以，我们可以先构造最小生成树，再来考虑最后一条边。  
可以先将构造好的树求一遍floyd，然后再跟题目的最短路相比较，如果两点u,v求出的最短路w\`与题目给的最短路w不一致（可以断言：w\`&gt;w），那么就将w作为最后一条边的边长加在u，v之间即可。这样的边可能会找到很多，事实上只需要加上任意一条就使所有的w\`都等于w了。
需要注意的是，可能整个树就已经满足题目了。这样的话，最后一条边只需要重复任意一条树边就好了。

```C++
#include<iostream>
#include<cstdio>
#include<cstring>
#include<vector>
#include<algorithm>
using namespace std;
const int N = 2010;
const int inf = 1 << 25;
int p[N];
int ufind(int x) {
	return x == p[x] ? x : p[x] = ufind(p[x]);
}
bool Union(int x, int y) {
	int fx = ufind(x);
	int fy = ufind(y);
	if (fx == fy)
		return false;
	p[fx] = fy;
	return true;
}
int n;
struct Edge {
	int u, v, w;
	Edge(int u = 0, int v = 0, int w = 0) :
			u(u), v(v), w(w) {
	}
	bool operator<(const Edge& othr) const {
		return w < othr.w;
	}
};
vector<Edge> vt;
vector<Edge> res;
int f[N][N];
int main() {
	bool first = true;
	while (~scanf("%d", &n)) {
		vt.clear();
		res.clear();
		if (!first) printf("\n");
		else first = false;
		for (int i = 1; i <= n; i++) {
			for (int x, j = 1; j <= n; j++) {
				scanf("%d", &x);
				if (j > i)
					vt.push_back(Edge(i, j, x));
			}
		}
		for (int i = 0; i <= n; i++) p[i] = i;
		sort(vt.begin(), vt.end());
		for(int i=1;i<=n;i++) fill(f[i]+1,f[i]+1+n,inf);
		for (int cnt = 0, i = 0; i < (int) vt.size(); i++) {
			if (Union(vt[i].u, vt[i].v)) {
				f[vt[i].u][vt[i].v] = vt[i].w;
				f[vt[i].v][vt[i].u] = vt[i].w;
				cnt++;
				res.push_back(Edge(vt[i].u, vt[i].v, vt[i].w));
				if (cnt >= n - 1) break;
			}
		}

		for (int k = 1; k <= n; k++) {
			for (int i = 1; i <= n; i++) {
				for (int j = 1; j <= n; j++) {
					if (f[i][k] == inf) break;
					if (f[i][j] > f[i][k] + f[k][j]) {
						f[i][j] = f[i][k] + f[k][j];
					}
				}
			}
		}
		int flag = true;
		for (int i = 0; i < (int) vt.size(); i++) {
			Edge now = vt[i];
			if (f[now.u][now.v] != now.w) {
				res.push_back(Edge(now.u, now.v, now.w));
				flag = false;
				break;
			}
		}
		if (flag) res.push_back(res.back());
		for (int i = 0; i < (int) res.size(); i++) {
			printf("%d %d %d\n", res[i].u, res[i].v, res[i].w);
		}
	}
}
```
