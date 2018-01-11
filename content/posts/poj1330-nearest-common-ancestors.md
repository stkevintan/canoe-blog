---
title: POJ1330 Nearest Common Ancestors
tags:
  - LCA
  - 图论
  - tarjan
  - 倍增
categories:
  - ACM
id: 39
date: '2014-08-01T18:43:01+08:00'
---

Time Limit: 1000MS Memory Limit: 10000K  
Total Submissions: 17734 Accepted: 9405

##Description
A rooted tree is a well-known data structure in computer science and engineering. An example is shown below:

In the figure, each node is labeled with an integer from {1, 2,...,16}. Node 8 is the root of the tree. Node x is an ancestor of node y if node x is in the path between the root and node y. For example, node 4 is an ancestor of node 16\. Node 10 is also an ancestor of node 16\. As a matter of fact, nodes 8, 4, 10, and 16 are the ancestors of node 16\. Remember that a node is an ancestor of itself. Nodes 8, 4, 6, and 7 are the ancestors of node 7\. A node x is called a common ancestor of two different nodes y and z if node x is an ancestor of node y and an ancestor of node z. Thus, nodes 8 and 4 are the common ancestors of nodes 16 and 7\. A node x is called the nearest common ancestor of nodes y and z if x is a common ancestor of y and z and nearest to y and z among their common ancestors. Hence, the nearest common ancestor of nodes 16 and 7 is node 4\. Node 4 is nearer to nodes 16 and 7 than node 8 is.
<!--more-->
For other examples, the nearest common ancestor of nodes 2 and 3 is node 10, the nearest common ancestor of nodes 6 and 13 is node 8, and the nearest common ancestor of nodes 4 and 12 is node 4\. In the last example, if y is an ancestor of z, then the nearest common ancestor of y and z is y.

Write a program that finds the nearest common ancestor of two distinct nodes in a tree.

##Input
The input consists of T test cases. The number of test cases (T) is given in the first line of the input file. Each test case starts with a line containing an integer N , the number of nodes in a tree, 2&lt;=N&lt;=10,000\. The nodes are labeled with integers 1, 2,..., N. Each of the next N -1 lines contains a pair of integers that represent an edge --the first integer is the parent node of the second integer. Note that a tree with N nodes has exactly N - 1 edges. The last line of each test case contains two distinct integers whose nearest common ancestor is to be computed.

##Output
Print exactly one line for each test case. The line should contain the integer that is the nearest common ancestor.

##Sample Input

2
16
1 14
8 5
10 16
5 9
4 6
8 4
4 10
1 13
6 15
10 11
6 7
10 2
16 3
8 1
16 12
16 7
5
2 3
3 4
3 1
1 5
3 5

##Sample Output

4
3

##Source
Taejon 2002
<br/>

- - -


tarjan+并查集求LCA模板。将u的子儿子v递归合并到u，若y在x的子树上，则根据并查集的性质，公共祖先即为x（father[y]）。若y和x不再同一子树上。则根据dfs回溯的性质，则搜完y之后一定是回溯到x,y的最近公共祖先才能搜到x的，而此时由并查集的性质，回溯的节点刚好就是father[y]。
```C++
#include&lt;map&gt;
#include&lt;set&gt;
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
#define MP make_pair
#define VI(x) vector&lt;x&gt;::iterator
#define MI(x,y) map&lt;x,y&gt;::iterator
#define SI(x) set&lt;x&gt;::iterator
#define F first
#define S second
#define clrQ(x) while(!x.empty)x.pop();
#define clrA(x,y) memset(x,y,sizeof(x));
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
const int inf=~0u&gt;&gt;1;
const LL lnf=~0ull&gt;&gt;1;
#define N 10005
#define M 10005
int n, m;
//UnionSet
int p[N];
void initUset() {
    for (int i = 0; i &lt;= n; i++)
        p[i] = i;
}
int uFind(int x) {
    return x == p[x] ? p[x] : p[x] = uFind(p[x]);
}
void uMerge(int x, int y) { //y合并到x
    int fx = uFind(x);
    int fy = uFind(y);
    if (fx != fy)
        p[fy]=fx;
}
//Edge Graph
int head[N], pos;
struct Edge {
    int v, nxt;
} e[M];
void initEdge() {
    memset(head, -1, sizeof(head));
    pos = 0;
}
void add(int u, int v) {
    e[pos].v = v;
    e[pos].nxt = head[u];
    head[u] = pos++;
}
int findRoot(){//有向图选择入度为0的点，无向图不同节点做根，LCA结果将不同。
    for (int i = 1; i &lt; n; i++)
        if (indeg[i] == 0) return i;
    return assert(false),-1;
}
//LCA
int size, root;
int vis[N];
int ans[5];
int indeg[N];
vector&lt;pr&lt;int, int&gt; &gt; que[N];
int dfs(int u) {
    int solved=0;
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        solved+=dfs(v);
        if(solved==size)return solved;
        uMerge(u, v);
    }
    vis[u] = 1;
    for (int i = 0; i &lt; (int) que[u].size(); i++) {
        int v = que[u][i].F;
        if (vis[v]) {
            ans[que[u][i].S] = uFind(v);
            solved++;
        }
    }
    return solved;
}
void tarjan() {
    clrA(vis,0);
    dfs(findRoot());
}
int main() {
    int T;
    scanf("%d", &amp;T);
    while (T--) {
        scanf("%d", &amp;n);
        initEdge();
        int u, v;
        clrA(indeg,0);
        for (int i = 1; i &lt; n; i++) {
            scanf("%d%d", &amp;u, &amp;v);
            add(u, v);
            indeg[v]++;
        }
        initUset();
        size = 1;//查询的次数
        for(int i=1;i&lt;=n;i++)que[i].clear();
        for (int i = 1; i &lt;= size; i++) {
            scanf("%d%d", &amp;u, &amp;v);
            que[u].push_back(MP(v, i));
            que[v].push_back(MP(u, i));
        }
        tarjan();
        for (int i = 1; i &lt;= size; i++) {
            printf("%d\n", ans[i]);
        }
    }
}
```
LCA还可以用倍增来求：（思想很普通，只是以2进制的步长向上走：dp[i][j]表示节点i向上走2^j步到达的节点。）
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
#define MP make_pair
#define SI(x) set&lt;x&gt;::iterator
#define VI(x) vector&lt;x&gt;::iterator
#define MI(x,y) map&lt;x,y&gt;::iterator
#define SRI(x) set&lt;x&gt;::reverse_iterator
#define VRI(x) vector&lt;x&gt;::reverse_iterator
#define MRI(x,y) map&lt;x,y&gt;::reverse_iterator
#define F first
#define S second
#define qlr(x) while(!x.empty)x.pop();
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
#define N 10005
#define M N-1
int n;
int head[N], pos;
struct edge {
    int v, nxt;
} e[M];
void add(int u, int v) {
    e[pos].v = v;
    e[pos].nxt = head[u];
    head[u] = pos++;
}
void initEdge() {
    clr(head, -1);
    pos = 0;
}
int deep[N];
vector&lt;int&gt; dp[N];
int size;
int findRoot() {
    for (int i = 1; i &lt;= n; i++) {
        if (dp[i].empty()) return i;
    }
    return -1;
}
void getDeep(int u = findRoot()) {
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        deep[v] = deep[u] + 1;
        getDeep(v);
    }
    size = max(size, deep[u] + 1);//记录最大深度
}
void initLCA() {
    clr(deep, 0);
    size = 0;
    getDeep();
    for (int len = 1,t=2;t&lt;=size; len++,t&lt;&lt;=1) {//跳出条件：(t=2^len)&lt;=size
        for (int i = 1; i &lt;= n; i++) {
            if ((int)dp[i].size() &gt;= len &amp;&amp; (int)dp[dp[i][len-1]].size() &gt;= len) {
                dp[i].push_back(dp[dp[i][len-1]][len-1]);
            }
        }
    }
}
int getLCA(int u, int v) {
    if (deep[u] &lt; deep[v]) swap(u, v);
    int d = deep[u] - deep[v];
    for (int i = 0; d; i++, d &gt;&gt;= 1) {
        u = d &amp; 1 ? dp[u][i] : u;
    }//以差值二进制形式将u往上走差值
    if (u == v) return u;
    for (int i = min(dp[u].size(),dp[v].size())-1; i &gt;= 0; i--) {
        if (dp[u][i] != dp[v][i]) {
            u = dp[u][i];
            v = dp[v][i];
            i=(int)min(dp[u].size(),dp[v].size());//注意每次都要更新i！！
        }
    }
    u = dp[u][0];
    return u;
}
int main() {
    int T;
    cin &gt;&gt; T;
    while (T--) {
        scanf("%d", &amp;n);
        int u, v;
        initEdge();
        for (int i = 1; i &lt;= n; i++)
            dp[i].clear();
        for (int i = 1; i &lt; n; i++) {
            scanf("%d%d", &amp;u, &amp;v);
            add(u, v);
            dp[v].push_back(u);
        }
        initLCA();
        scanf("%d%d", &amp;u, &amp;v);
        printf("%d\n", getLCA(u, v));
    }
}
```
LCA还可以转化为RMQ问题（个人更喜欢此方法，在线，且效率高）
```C++
//============================================================================
// Name        : test3.cpp
// Author      : 
// Version     :
// Copyright   : Your copyright notice
// Description : Hello World in C++, Ansi-style
//============================================================================
#include&lt;map&gt;
#include&lt;set&gt;
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
#define MP make_pair
#define SI(x) set&lt;x&gt;::iterator
#define VI(x) vector&lt;x&gt;::iterator
#define MI(x,y) map&lt;x,y&gt;::iterator
#define SRI(x) set&lt;x&gt;::reverse_iterator
#define VRI(x) vector&lt;x&gt;::reverse_iterator
#define MRI(x,y) map&lt;x,y&gt;::reverse_iterator
#define F first
#define S second
#define clrQ(x) while(!x.empty)x.pop();
#define clrA(x,y) memset(x,y,sizeof(x));
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
int n, m;
#define N 10005
#define M 10005
int head[N], pos;
struct Edge {
    int v, nxt;
} e[M];
void initEdge() {
    memset(head, -1, sizeof(head));
    pos = 0;
}
void add(int u, int v) {
    e[pos].v = v;
    e[pos].nxt = head[u];
    head[u] = pos++;
}
//RMQ
int dpM[20][N &lt;&lt; 1 | 1];
int lg2[N &lt;&lt; 1 | 1];
#define getLeft(R,L) (R-(L)+1)
void initRMQ(int n) { //dp[0][i]表示区间i的值。预先处理出来。
    lg2[0] = -1;
    int limit;
    for (int i = 1; i &lt;= n; i++) {
        lg2[i] = i &amp; (i - 1) ? lg2[i - 1] : lg2[i - 1] + 1;
    }
    for (int i = 1; i &lt;= lg2[n]; i++) {
        limit = getLeft(n, 1 &lt;&lt; i);
        for (int j = 1; j &lt;= limit; j++) {
            dpM[i][j] = min(dpM[i - 1][j], dpM[i - 1][j + (1 &lt;&lt; (i - 1))]);
        }
    }
}
int getRMQ(int x, int y) {
    if (x &gt; y) swap(x, y);
    int t = lg2[y - x + 1];
    return min(dpM[t][x], dpM[t][getLeft(y, 1 &lt;&lt; t)]);
}
//LCA
int depth, cnt;
int inde[N], H[N], E[N];
//dp[0][N&lt;&lt;1|1]深度序列（dfs编号），E[N]每个dfs编号对应的节点，H[N]节点第一次出现在dfs编号序列中的位置
int findRoot() {
    for (int i = 1; i &lt;= n; i++)
        if (!inde[i]) return i;
    return -1;
}
void getEuler(int u = findRoot()) {
    int dfn = dpM[0][H[u] = ++cnt] = ++depth;
    E[dfn] = u;
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        getEuler(v);
        dpM[0][++cnt] = dfn;
    }
}
void initLCA() {
    depth = cnt = 0;
    getEuler();
    initRMQ(cnt);
}
int getLCA(int u, int v) {
    if (H[u] &gt; H[v]) swap(u, v);
    return E[getRMQ(H[u], H[v])];
}
int main() {
    int T;
    scanf("%d", &amp;T);
    while (T--) {
        scanf("%d", &amp;n);m=n-1;
        int u, v;
        initEdge();
        memset(inde, 0, sizeof(inde));
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d", &amp;u, &amp;v);
            add(u, v);
            inde[v]++;
        }
        initLCA();
        scanf("%d%d", &amp;u, &amp;v);
        printf("%d\n", getLCA(u, v));
    }
}
```
&nbsp;
