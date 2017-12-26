---
title: 内网2073 城主GeassCode
tags:
  - LCA
  - 图论
  - tarjan
categories:
  - ACM
date: '2014-08-02T04:18:37+08:00'
---
##Description

GeassCode凭借自己在topcoder上的超凡表现，赢得了国王的喜爱，国王赏赐他一座城池。这座城池里有n个 村子，m条路连接这些村子。坐上城主的GeassCode决定要修路，他打算用最少的代价把所以的村子连在一起。据探子回报，有些村子之间虽然原来没有路 径，但是可以强行的去建一条路。GeassCode想知道，如果强行在某两个村子之间建一条路，最后的总花费是多少？

<!--more-->

##Input

输入一行三个整数n，m，表示有n个村子，m条可建路径。

2..m+1行，每行3个整数a,b,c（a≠b），表示可以在a和b村庄建一条花费为c的路径。

第m+2行一个整数q，表示有多少个询问。

接下来q个询问，每行3个整数a,b,c（a≠b），表示如果可以另外在a和b村庄建一条花费为c的路径，最终需要多少花费？

##Output

对于每个询问输出，输出最少的花费。


##Sample Input
4 5 1 2 4 2 3 3 1 4 6 2 4 3 1 3 2 3 3 4 3 1 3 1 1 4 2

##Sample Output
8 7 7

##Hint
n的范围[2,50000],m的范围[2,100000],q的范围[1,50000]。

输入的m条边保证可以把所有村庄连在一起。输入的边权范围[1,10<sup>6</sup>]

##Source

张超
<br/>

- - -


解法是如果可以在(u,v)上再加条边，则将最小生成树上的(u,v)节点最短路径中的最大边权与要加上这条边的替换。如果新的花费比旧的花费少，则取新的花费。否则什么也不换，取旧的花费。

如何求树上两点之间的最短路径中的最大边权呢？

可以按照这篇文章所述建一个类似于哈夫曼树，将点作为叶子，边的权值作为祖先构造一个N+N的树：[click here](http://blog.sina.com.cn/s/blog_51cea4040100ss3n.html)

这样写的很容易错，尤其要区分两颗树的规模，我在这上面错了很久。

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
#define N 50005
#define M 100005
int n, m ;
struct Graph {
    int u, v, w;
    bool mark;
    bool operator&lt;(Graph othr) const {
        return w &lt; othr.w;
    }
} g[M];
//UnionSet
int p[N + N];
void initUset(int n) {
    for (int i = 0; i &lt;= n; i++)
        p[i] = i;
}
int uFind(int x) {
    return x == p[x] ? p[x] : p[x] = uFind(p[x]);
}
void uMerge(int x, int y) { //y合并到x
    int fx = uFind(x);
    int fy = uFind(y);
    if (fx != fy) p[fy] = fx;
}
//Edge Graph
int head[N + N], pos;
struct Edge {
    int v, nxt;
} e[N + N];
void initEdge() {
    memset(head, -1, sizeof(head));
    pos = 0;
}
void add(int u, int v) {
    e[pos].v = v;
    e[pos].nxt = head[u];
    head[u] = pos++;
}
int size;
vector&lt;pr&lt;int, int&gt; &gt; query[N];
int qw[N];
bool vis[N];
int lca[N];
int val[N + N];
int dfs(int u) {
    int solved = 0;
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        solved += dfs(v);
        if (size == solved) return solved;
        uMerge(u, v);
    }
    if(~val[u])return solved;
    vis[u] = 1;
    for (int i = 0; i &lt; (int) query[u].size(); i++) {
        int v = query[u][i].F;
        if (vis[v]) {
            solved++;
            lca[query[u][i].S] = uFind(v);
        }
    }
    return solved;
}
void tarjan() {
    initUset(n);
    clrA(vis, 0);
    dfs(n);
}
void rebuild() {
    clrA(val, -1);
    initUset(n + n);
    initEdge();
    for (int i = 1; i &lt;= m; i++) {
        if (g[i].mark == false) continue;
        val[++n] = g[i].w;
        int fu = uFind(g[i].u);
        int fv = uFind(g[i].v);
        p[fu] = n;
        p[fv] = n;
        add(n, fu);
        add(n, fv);
    }
}
int main() {
    while (~scanf("%d%d", &amp;n, &amp;m)) {
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d%d", &amp;g[i].u, &amp;g[i].v, &amp;g[i].w);
            g[i].mark = false;
        }
        sort(g + 1, g + 1 + m);
        initUset(n);
        LL sum = 0;
        for (int i = 1; i &lt;= m; i++) {
            int fx = uFind(g[i].u);
            int fy = uFind(g[i].v);
            if (fx != fy) {
                sum += g[i].w;
                g[i].mark = true;
                p[fy] = fx;
            }
        }
        for (int i = 1; i &lt;= n; i++)
            query[i].clear();
        scanf("%d", &amp;size);
        int u, v, w;
        for (int i = 1; i &lt;= size; i++) {
            scanf("%d%d%d", &amp;u, &amp;v, &amp;w);
            qw[i] = w;
            query[u].push_back(MP(v, i));
            query[v].push_back(MP(u, i));
        }
        rebuild();
        tarjan();
        for (int i = 1; i &lt;= size; i++) {
            LL ans = sum - val[lca[i]] + qw[i];
            printf(LLS"\n", min(ans, sum));
        }
    }
}
```
其实，可以直接在dfs的回溯过程中将子节点的max求出来。这样简单多了。感叹一句：并查集真神奇！
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
#define pr pair&lt;int,int&gt;
#define MP make_pair
#define SI(x) set&lt;x &gt;::iterator
#define VI(x) vector&lt;x &gt;::iterator
#define MI(x,y) map&lt;x,y &gt;::iterator
#define SRI(x) set&lt;x &gt;::reverse_iterator
#define VRI(x) vector&lt;x &gt;::reverse_iterator
#define MRI(x,y) map&lt;x,y &gt;::reverse_iterator
#define F first
#define S second
#define clrQ(x) while(!x.empty())x.pop();
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
#define N 50005
#define M 100005
int n, m;
struct Graph {
    int u, v, w;
    bool operator&lt;(Graph othr) const {
        return w &lt; othr.w;
    }
} g[M];
struct Pair {
    int x, y;
    Pair(int x, int y) :
            x(x), y(y) {
    }
    ;
};
//Edge Graph
int head[N], pos;
struct Edge {
    int v, w, nxt;
} e[N &lt;&lt; 1];
void initEdge() {
    memset(head, -1, sizeof(head));
    pos = 0;
}
void add(int u, int v, int w) {
    e[pos].v = v;
    e[pos].w = w;
    e[pos].nxt = head[u];
    head[u] = pos++;
}
//UnionSet
int p[N];
int pmax[N];
void initUset() {
    for (int i = 0; i &lt;= n; i++)
        p[i] = i;
}
int uFind(int x) {
    if (x != p[x]) {
        int t = p[x];
        p[x] = uFind(p[x]);
        pmax[x] = max(pmax[x], pmax[t]);
        return p[x];
    }
    return x;
}
void uMerge(int x, int y) { //y合并到x
    int fx = uFind(x);
    int fy = uFind(y);
    if (fx != fy) {
        p[fy] = fx;
        pmax[fy] = max(pmax[fy], pmax[fx]);
    }
}
int size;
vector&lt;Pair&gt; query[N];
vector&lt;Pair&gt; mark[N];
int qw[N];
bool vis[N];
int lca[N];
void dfs(int u, int fa) {
    if (size == 0) return;
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        if (v == fa) continue;
        dfs(v, u);
        pmax[v] = max(pmax[v], e[i].w);
        uMerge(u, v);
    }
    vis[u] = 1;
    for (int i = 0; i &lt; (int) query[u].size(); i++) {
        int v = query[u][i].x;
        if (vis[v]) {
            mark[uFind(v)].push_back(Pair(u, i));
        }
    }
    if (!mark[u].empty()) {
        for (VI(Pair)it=mark[u].begin();it!=mark[u].end();++it) {
            int uu = it-&gt;x;
            int vv = query[it-&gt;x][it-&gt;y].x;
            int ss = query[it-&gt;x][it-&gt;y].y;
            uFind(uu);
            uFind(vv);
            lca[ss] = max(pmax[uu], pmax[vv]);
            size--;
        }
        mark[u].clear();
    }
}
int findRoot() {
    for (int i = 1; i &lt;= n; i++) {
        if (!vis[i]) return i;
    }
    return assert(false), -1;
}
void tarjan() {
    initUset();
    clrA(vis, 0);
    clrA(pmax, 0);
    size = m;
    dfs(findRoot(), -1);
}
int main() {
    while (~scanf("%d%d", &amp;n, &amp;m)) {
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d%d", &amp;g[i].u, &amp;g[i].v, &amp;g[i].w);
        }
        sort(g + 1, g + 1 + m);
        initUset();
        initEdge();
        LL sum = 0;
        for (int i = 1; i &lt;= m; i++) {
            int fx = uFind(g[i].u);
            int fy = uFind(g[i].v);
            if (fx != fy) {
                sum += g[i].w;
                add(g[i].u, g[i].v, g[i].w);
                add(g[i].v, g[i].u, g[i].w);
                p[fy] = fx;
            }
        }
        for (int i = 1; i &lt;= n; i++) {
            query[i].clear();
            mark[i].clear();
        }
        scanf("%d", &amp;m);
        int u, v, w;
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d%d", &amp;u, &amp;v, &amp;w);
            qw[i] = w;
            query[u].push_back(Pair(v, i));
            query[v].push_back(Pair(u, i));
        }
        tarjan();
        for (int i = 1; i &lt;= m; i++) {
            LL tmp = sum - lca[i] + qw[i];
            printf(LLS"\n", min(tmp, sum));
        }
    }
}
```
