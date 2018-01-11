---
title: HDU4612 Warm up
tags:
  - tarjan
  - 图论
  - 树的直径
categories:
  - ACM
id: 29
date: '2014-07-31T03:37:32+08:00'
---


**<span style="font-family: Arial; font-size: 12px; font-weight: bold; color: green;">Time Limit: 10000/5000 MS (Java/Others)    Memory Limit: 65535/65535 K (Java/Others)
Total Submission(s): 3532    Accepted Submission(s): 813</span>**
<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">　 　N planets are connected by M bidirectional channels that allow instant transportation. It's always possible to travel between any two planets through these channels.
If we can isolate some planets from others by breaking only one channel , the channel is called a bridge of the transportation system.
People don't like to be isolated. So they ask what's the minimal number of bridges they can have if they decide to build a new channel.
Note that there could be more than one channel between two planets.</div>
<!--more-->
<div class="panel_title" align="left">Input</div>
<div class="panel_content">　　The input contains multiple cases.
Each case starts with two positive integers N and M , indicating the number of planets and the number of channels.
(2&lt;=N&lt;=200000, 1&lt;=M&lt;=1000000)
Next M lines each contains two positive integers A and B, indicating a channel between planet A and B in the system. Planets are numbered by 1..N.
A line with two integers '0' terminates the input.</div>
<div class="panel_title" align="left">Output</div>
<div class="panel_content">　　For each case, output the minimal number of bridges after building a new channel in a line.</div>
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">4 4 1 2 1 3 1 4 2 3 0 0</div>
</div>
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">0</div>
</div>
<div class="panel_title" align="left">Source</div>
<div class="panel_content">[ 2013 Multi-University Training Contest 2 ](http://acm.hdu.edu.cn/search.php?field=problem&amp;key=2013%20Multi-University%20Training%20Contest%202&amp;source=1&amp;searchmode=source)</div>
<br/>

- - -


```C++
#pragma comment(linker, "/STACK:1024000000,1024000000")//C++加栈
#include
#include
#include
#include
#include
#include
#include
#include<map>
#include
#include
#include
using namespace std;
#if defined (_WIN32) || defined (__WIN32) || defined (WIN32) || defined (__WIN32__)
#define LL __int64
#define LLS "%" "I" "6" "4" "d"
#define LLU "%" "I" "6" "4" "u"
#define LL_MAX _I64_MAX

#else
#define LL long long
#define LLS "%" "l" "l" "d"
#define LLU "%" "l" "l" "u"
#define LL_MAX _I64_MAX
#endif
#define N 200005
#define M 1000005
int n, m;
const int inf = ~0u &gt;&gt; 1;
const LL lnf = ~0ull &gt;&gt; 1;
struct edge {
	int v, nxt;
} e[M &lt;&lt; 1];
struct bridge {
	int u, v;
	bridge(int u, int v) {
		this-&gt;u = u;
		this-&gt;v = v;
	}
};
int pos, head[N];
int top, stk[N];
int pre[N], dfs_clock, belong[N], bcnt;
vector brg;
void InitEdge() {
	memset(head, -1, sizeof(head));
	pos = 0;
}
void add(int u, int v) {
	e[pos].v = v;
	e[pos].nxt = head[u];
	head[u] = pos++;
}
int dfs(int u, int fa) {
	int lowu = pre[u] = ++dfs_clock;
	stk[top++] = u;
	bool vis = true;
	for (int i = head[u]; ~i; i = e[i].nxt) {
		int v = e[i].v;
		if (v == fa &amp;&amp; vis) {
			vis = false; //u-v的反向边一定是v-u邻接表里的第一条边。
			continue;
		}
		if (!pre[v]) {
			int lowv = dfs(v, u);
			lowu = min(lowu, lowv);
			if (lowv &gt; pre[u]) { //u-v为桥
				brg.push_back(bridge(u, v));
			}
		} else lowu = min(lowu, pre[v]);
	}
	if (pre[u] == lowu) {
		bcnt++;
		do {
			belong[stk[--top]] = bcnt;
		} while (stk[top] != u);
	}
	return lowu;
}
void tarjan() {
	top = bcnt = dfs_clock = 0;
	memset(pre, 0, sizeof(pre));
	memset(belong, 0, sizeof(belong));
	brg.clear();
	for (int i = 1; i &lt;= n; i++) {
		if (!pre[i]) dfs(i, -1);
	}
}
void rebuild() { //根据桥来缩点重构图
	InitEdge();
	for (int i = 0; i &lt; (int) brg.size(); i++) {
		int u = belong[brg[i].u];
		int v = belong[brg[i].v];
		add(u, v);
		add(v, u);
	}
}
int diameter = 0;
int findR(int u, int fa) {
	int h1 = 0, h2 = 0; // 以u为根，h1最高的儿子，h2次高儿子。放在dfs里面两者不会重合。
	for (int i = head[u]; ~i; i = e[i].nxt) {
		int v = e[i].v;
		if (v == fa) continue;
		int h = findR(v, u) + 1; //若路径有权重，则把1改为u-v的权重
		if (h &gt; h1) h2 = h1, h1 = h;
		else h2 = max(h, h2);
	}
	diameter = max(diameter, h1 + h2);
	return h1;
}
void tree_diameter() {
	diameter = 0;
	findR(1, -1);
}
int main() {
	while (scanf("%d%d", &amp;n, &amp;m), n || m) {
		int u, v;
		InitEdge();
		for (int i = 0; i &lt; m; i++) {
			scanf("%d%d", &amp;u, &amp;v);
			add(u, v);
			add(v, u);
		}
		tarjan();
		rebuild();
		tree_diameter();
		printf("%d\n", bcnt - diameter - 1);
	}
}
```
