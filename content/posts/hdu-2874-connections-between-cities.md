---
title: HDU 2874 Connections between cities
categories:
  - ACM
date: '2014-08-14T06:00:34+08:00'
tags:
  - 图论
---

# Connections between cities

**<span style="font-family: Arial; font-size: 12px; font-weight: bold; color: green;">Time Limit: 10000/5000 MS (Java/Others)    Memory Limit: 32768/32768 K (Java/Others)
Total Submission(s): 4759    Accepted Submission(s): 1341
</span>**
<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">After World War X, a lot of cities have been seriously damaged, and we need to rebuild those cities. However, some materials needed can only be produced in certain places. So we need to transport these materials from city to city. For most of roads had been totally destroyed during the war, there might be no path between two cities, no circle exists as well.
Now, your task comes. After giving you the condition of the roads, we want to know if there exists a path between any two cities. If the answer is yes, output the shortest path between them.</div>
<!--more-->
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Input</div>
<div class="panel_content">Input consists of multiple problem instances.For each instance, first line contains three integers n, m and c, 2&lt;=n&lt;=10000, 0&lt;=m&lt;10000, 1&lt;=c&lt;=1000000\. n represents the number of cities numbered from 1 to n. Following m lines, each line has three integers i, j and k, represent a road between city i and city j, with length k. Last c lines, two integers i, j each line, indicates a query of city i and city j.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Output</div>
<div class="panel_content">For each problem instance, one line for each query. If no path between two cities, output “Not connected”, otherwise output the length of the shortest path between them.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">5 3 2 1 3 2 2 4 3 5 2 3 1 4 4 5</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">Not connected 6
<div style="font-family: Times New Roman; font-size: 14px; background-color: f4fbff; border: #B7CBFF 1px dashed; padding: 6px;">
<div style="font-family: Arial; font-weight: bold; color: #7ca9ed; border-bottom: #B7CBFF 1px dashed;">_Hint_</div>
Hint Huge input, scanf recommended.</div>
_ _</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Source</div>
<div class="panel_content">[ 2009 Multi-University Training Contest 8 - Host by BJNU ](http://acm.hdu.edu.cn/search.php?field=problem&amp;key=2009%20Multi-University%20Training%20Contest%208%20-%20Host%20by%20BJNU&amp;source=1&amp;searchmode=source)</div>
```C++
#include&lt;map&gt;
#include&lt;set&gt;
#include&lt;cmath&gt;
#include&lt;stack&gt;
#include&lt;queue&gt;
#include&lt;string&gt;
#include&lt;cstdio&gt;
#include&lt;vector&gt;
#include&lt;cctype&gt;
#include&lt;cassert&gt;
#include&lt;utility&gt;
#include&lt;numeric&gt;
#include&lt;cstring&gt;
#include&lt;iostream&gt;
#include&lt;algorithm&gt;
using namespace std;
#define pr pair
#define PR pair&lt;int,int&gt;
#define MP make_pair
#define SI(x) set&lt;x&gt;::iterator
#define VI(x) vector&lt;x&gt;::iterator
#define MI(x,y) map&lt;x,y&gt;::iterator
#define SRI(x) set&lt;x&gt;::reverse_iterator
#define VRI(x) vector&lt;x&gt;::reverse_iterator
#define MRI(x,y) map&lt;x,y&gt;::reverse_iterator
#define F first
#define S second
#define Sz(x) (int)x.size()
#define clrQ(x) while(!x.empty)x.pop();
#define clr(x,y) memset(x,y,sizeof(x));
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
const int inf = ~0u &gt;&gt; 1;
const LL lnf = ~0ull &gt;&gt; 1;
/*start*/
#define N 10004
#define M 10005
int n, m, c;
struct Edge {
    int v, w, nxt;
} e[M &lt;&lt; 1];
int head[N], ecnt;
void initEdge() {
    memset(head, -1, sizeof(head));
    ecnt = 0;
}
void add(int u, int v, int w) {
    e[ecnt].v = v;
    e[ecnt].w = w;
    e[ecnt].nxt = head[u];
    head[u] = ecnt++;
}
//RMQ
int dpM[20][N &lt;&lt; 1];
int lg2[N &lt;&lt; 1];
#define getL(R,L) (R-(L)+1)
void initRMQ(int n) {
    lg2[0] = -1;
    int m;
    for (int i = 1; i &lt;= n; i++)
        lg2[i] = i &amp; (i - 1) ? lg2[i - 1] : lg2[i - 1] + 1;
    for (int i = 1; i &lt;= lg2[n]; i++) {
        m = getL(n, 1 &lt;&lt; i);
        for (int j = 1; j &lt;= m; j++) {
            dpM[i][j] = min(dpM[i - 1][j], dpM[i - 1][j + (1 &lt;&lt; (i - 1))]);
        }
    }
}
int getRMQ(int a, int b) {
    if (a &gt; b) swap(a, b);
    int s = lg2[b - a + 1];
    return min(dpM[s][a], dpM[s][getL(b, 1 &lt;&lt; s)]);
}
//LCA
int E[N];
int T[N];
int H[N];
int depth, cnt;
int belong[N], bcnt;
int findRoot() {
    for (int i = 1; i &lt;= n; i++) {
        if (belong[i] == 0) return i;
    }
    return -1;
}
void getEuler(int u, int fa = -1) {
    int tmp = dpM[0][H[u] = ++cnt] = ++depth;
    E[tmp] = u;
    belong[u] = bcnt;
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        if (v == fa) continue;
        T[v] = T[u] + e[i].w;
        getEuler(v, u);
        dpM[0][++cnt] = tmp;
    }
}
void initLCA() {

    memset(T, 0, sizeof(T));
    memset(belong, 0, sizeof(belong));
    bcnt = cnt = depth = 0;
    int root;
    while ((root = findRoot()) != -1) {
        ++bcnt;
        getEuler(root);
    }
    initRMQ(cnt);
}
int getLCA(int u, int v) {
    if (belong[u] != belong[v]) return -1;
    if (H[u] &gt; H[v]) swap(u, v);
    return E[getRMQ(H[u], H[v])];
}
int main(int argc, char **argv) {
    while (~scanf("%d%d%d", &amp;n, &amp;m, &amp;c)) {
        initEdge();
        int u, v, w;
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d%d", &amp;u, &amp;v, &amp;w);
            add(u, v, w);
            add(v, u, w);
        }
        initLCA();
        while (c--) {
            scanf("%d%d", &amp;u, &amp;v);
            int r = getLCA(u, v);
            if (r == -1) puts("Not connected");
            else {
                printf("%d\n", T[u] + T[v] - 2 * T[r]);
            }
        }
    }
}
```

</pre>
