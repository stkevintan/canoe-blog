---
title: HDU4005 The war
tags:
  - tarjan
  - 树形DP
  - 图论
categories:
  - ACM
date: '2014-07-31T03:50:40+08:00'
---

**<span style="font-family: Arial; font-size: 12px; font-weight: bold; color: green;">Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 65768/65768 K (Java/Others)
Total Submission(s): 1992    Accepted Submission(s): 440
</span>**
<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">In the war, the intelligence about the enemy is very important. Now, our troop has mastered the situation of the enemy's war zones, and known that these war zones can communicate to each other directly or indirectly through the network. We also know the enemy is going to build a new communication line to strengthen their communication network. Our task is to destroy their communication network, so that some of their war zones can't communicate. Each line has its "cost of destroy". If we want to destroy a line, we must spend the "cost of destroy" of this line. We want to finish this task using the least cost, but our enemy is very clever. Now, we know the network they have already built, but we know nothing about the new line which our enemy is going to build. In this condition, your task is to find the minimum cost that no matter where our enemy builds the new line, you can destroy it using the fixed money. Please give the minimum cost. For efficiency, we can only destroy one communication line.</div>
<!--more-->
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Input</div>
<div class="panel_content">The input contains several cases. For each cases, the first line contains two positive integers n, m (1&lt;=n&lt;=10000, 0&lt;=m&lt;=100000) standing for the number of the enemy's war zones (numbered from 1 to n), and the number of lines that our enemy has already build. Then m lines follow. For each line there are three positive integer a, b, c (1&lt;=a, b&lt;=n, 1&lt;=c&lt;=100000), meaning between war zone A and war zone B there is a communication line with the "cost of destroy " c.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Output</div>
<div class="panel_content">For each case, if the task can be finished output the minimum cost, or output ‐1.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">3 2 1 2 1 2 3 2 4 3 1 2 1 1 3 2 1 4 3</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">-1 3
<div style="font-family: Times New Roman; font-size: 14px; background-color: f4fbff; border: #B7CBFF 1px dashed; padding: 6px;">
<div style="font-family: Arial; font-weight: bold; color: #7ca9ed; border-bottom: #B7CBFF 1px dashed;">_Hint_</div>
For the second sample input: our enemy may build line 2 to 3, 2 to 4, 3 to 4\. If they build line 2 to 3, we will destroy line 1 to 4, cost 3\. If they build line 2 to 4, we will destroy line 1 to 3, cost 2\. If they build line 3 to 4, we will destroy line 1 to 2, cost 1\. So, if we want to make sure that we can destroy successfully, the minimum cost is 3.

</div>
&nbsp;

</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Source</div>
<div class="panel_content">[ The 36th ACM/ICPC Asia Regional Dalian Site —— Online Contest ](http://acm.hdu.edu.cn/search.php?field=problem&amp;key=The%2036th%20ACM/ICPC%20Asia%20Regional%20Dalian%20Site%20%E2%80%94%E2%80%94%20Online%20Contest&amp;source=1&amp;searchmode=source)</div>
<div class="panel_content"></div>
<div class="panel_content"></div>
<div class="panel_content">求无向图边双连通分量缩点，然后DP求第二长边。</div>
<div class="panel_content">
<pre class="EnlighterJSRAW" data-enlighter-language="null">//#pragma comment(linker, "/STACK:1024000000,1024000000")//C++加栈
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
#define N 10005
#define M 100005
int n, m;
const int inf = ~0u &gt;&gt; 1;
const LL lnf = ~0ull &gt;&gt; 1;
struct edge {
	int v, w, nxt;
	bool mark;
} e[M &lt;&lt; 1];
struct bridge {
	int u, v, w;
	bridge(int u, int v, int w) {
		this-&gt;u = u;
		this-&gt;w = w;
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
void add(int u, int v, int w) {
	e[pos].v = v;
	e[pos].w = w;
	e[pos].nxt = head[u];
	head[u] = pos++;
}
int dfs(int u,int fa) {
	int lowu = pre[u] = ++dfs_clock;
	stk[top++] = u;
	bool vis=true;
	for (int i = head[u]; ~i; i = e[i].nxt) {
		int v = e[i].v;
		if(v==fa &amp;&amp; vis){
			vis=false;//重边
			continue;
		}
		if (!pre[v]) {
			int lowv = dfs(v,u);
			lowu = min(lowu, lowv);
			if (lowv &gt; pre[u]) { //u-v为桥
				brg.push_back(bridge(u, v, e[i].w));
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
		if (!pre[i])dfs(i,-1);
	}
}
void rebuild() { //根据桥来缩点重构图
	InitEdge();
	for (int i = 0; i &lt; (int) brg.size(); i++) {
		int u = belong[brg[i].u];
		int v = belong[brg[i].v];
		int w = brg[i].w;
		add(u, v, w);
		add(v, u, w);
	}
}
int res;
int DP(int u, int fa) {
	int Min = inf;
	for (int i = head[u]; ~i; i = e[i].nxt) {
		int v = e[i].v;
		if (v == fa)continue;
		int w = DP(v, u);
		w = min(w, e[i].w);
		if (Min &gt; w) {
			res = min(res, Min);
			Min = w;
		} else res = min(res, w);
	}
	return Min;
}
int main() {
	while (~scanf("%d%d", &amp;n, &amp;m)) {
		int u, v, w;
		InitEdge();
		for (int i = 0; i &lt; m; i++) {
			scanf("%d%d%d", &amp;u, &amp;v, &amp;w);
			add(u, v, w);
			add(v, u, w);
		}
		tarjan();
		rebuild();
		bridge minbrg(-1, -1, inf);
		for (int i = 0; i &lt; (int) brg.size(); i++) {
			if (brg[i].w &lt; minbrg.w) {
				minbrg = brg[i];
			}
		}
		res = inf;
		DP(belong[minbrg.u], belong[minbrg.v]);
		DP(belong[minbrg.v], belong[minbrg.u]);
		if(res==inf)res=-1;
		printf("%d\n", res);
	}
}
</pre>
</div>
