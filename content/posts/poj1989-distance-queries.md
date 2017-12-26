---
title: POJ1989 Distance Queries
tags:
  - LCA
  - RMQ
  - 图论
  - tarjan
categories:
  - ACM
id: 42
date: '2014-08-01T22:30:11+08:00'
---
##Description

Farmer John's cows refused to run in his marathon since he chose a path much too long for their leisurely lifestyle. He therefore wants to find a path of a more reasonable length. The input to this problem consists of the same input as in "Navigation Nightmare",followed by a line containing a single integer K, followed by K "distance queries". Each distance query is a line of input containing two integers, giving the numbers of two farms between which FJ is interested in computing distance (measured in the length of the roads along the path between the two farms). Please answer FJ's distance queries as quickly as possible!
<!--more-->
##Input


-  Lines 1..1+M: Same format as "Navigation Nightmare"
-  Line 2+M: A single integer, K. 1 &lt;= K &lt;= 10,000
-  Lines 3+M..2+M+K: Each line corresponds to a distance query and contains the indices of two farms.

##Output

- Lines 1..K: For each distance query, output on a single line an integer giving the appropriate distance.

##Sample Input

7 6
1 6 13 E
6 3 9 E
3 5 7 S
4 1 3 N
2 4 20 W
4 7 2 S
3
1 6
1 4
2 6


##Sample Output
13
3
36

##Hint
Farms 2 and 6 are 20+3+13=36 apart.

##Source
[USACO 2004 February](http://poj.org/searchproblem?field=source&amp;key=USACO+2004+February)
<br/>

- - -

- 无向树求节点距离：`dist(u,v)=dist(root,u)+dist(root,v)-2*dist(root,lca(u,v))`
- tarjan+并查集求LCA。注意可能树不连通。

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
const int inf = ~0u &gt;&gt; 1;
const LL lnf = ~0ull &gt;&gt; 1;
#define N 40005
#define M 40005
int n, m;
//Edge Graph
int head[N], pos;
struct Edge {
    int v, w, nxt;
} e[M &lt;&lt; 1];
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
    if (fx != fy) p[fy] = fx;
}
//tarjan-LCA
int size,bcnt;
int lca[10005];
int vis[N];
int dis[N];
int ans[10005];
vector&lt;pr&lt;int, int&gt; &gt; query[N];
int findRoot() {
    for (int i = 1; i &lt;= n; i++) {
        if (!vis[i]) return i;
    }
    return assert(false),-1;
}
int dfs(int u, int fa) {
    int solved = 0;
    for (int i = head[u]; ~i; i = e[i].nxt) {
        int v = e[i].v;
        if (v == fa) continue;
        dis[v] = dis[u] + e[i].w;
        solved += dfs(v, u);
        if (solved == size) return solved;
        uMerge(u, v);
    }
    vis[u] = bcnt;
    for (int i = 0; i &lt; (int) query[u].size(); i++) {
        int v = query[u][i].F;
        if (vis[v]==bcnt) {
            solved++;
            lca[query[u][i].S] = uFind(v);
            ans[query[u][i].S] = dis[u] + dis[v] - 2 * dis[lca[query[u][i].S]];
        }
    }
    return solved;
}
void tarjan() {
    clrA(vis, 0);
    clrA(dis, 0);
    int tot = 0;
    bcnt=0;
    do {
        bcnt++;//从1开始
        tot += dfs(findRoot(), -1);
    } while (tot &lt; size);//图可能不连通
}

int main() {
    while (~scanf("%d%d", &amp;n, &amp;m)) {
        int u, v, w;
        char c;
        initEdge();
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d%d %c", &amp;u, &amp;v, &amp;w, &amp;c);
            add(u, v, w);
            add(v, u, w);
        }
        initUset();
        scanf("%d", &amp;size);
        for (int i = 1; i &lt;= n; i++)
            query[i].clear();
        for (int i = 1; i &lt;= size; i++) {
            scanf("%d%d", &amp;u, &amp;v);
            query[u].push_back(MP(v, i));
            query[v].push_back(MP(u, i));
        }
        tarjan();
        for (int i = 1; i &lt;= size; i++) {
            printf("%d\n", ans[i]);
        }
    }
}
```

另外，还可以转化为RMQ问题求解：
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
#define N 40005
#define M 40005
int n, m;
//Edge Graph
int head[N], pos;
struct Edge {
    int v, w, nxt;
} e[M &lt;&lt; 1];
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
//RMQ
int dpM[20][N&lt;&lt;1|1];//dpM[i][j]  从j开始的，连续2^i个数字的最值,j从1开始
int lg2[N&lt;&lt;1|1];//等价于 (int)lg2(1.0*m)/lg2(2.0) 若空间不足可以这样写
#define getLeft(R,L) (R-(L)+1) //输入右端点和长度，返回左端点
void initRMQ(int n) {
    lg2[0]=-1;int limit;
    for(int i=1;i&lt;=n;i++) {
        lg2[i]=(i&amp;(i-1))?lg2[i-1]:lg2[i-1]+1;
    }
    for(int i=1;i&lt;=lg2[n];i++){
        limit=getLeft(n,1&lt;&lt;i);
        for(int j=1;j&lt;=limit;j++){
            dpM[i][j]=min(dpM[i-1][j],dpM[i-1][j+(1&lt;&lt;i&gt;&gt;1)]);
        }
    }
}
int getRMQ(int a,int b) {
    int t=lg2[b-a+1];
    int s1=a;
    int s2=getLeft(b,1&lt;&lt;t);
    //return max(Max[t][s1],Max[t][s2]);
    return min(dpM[t][s1],dpM[t][s2]);
}
#undef getLeft
//LCA
int dist[N];
int H[N];//节点第一次出现的位置
int E[N&lt;&lt;1|1];//欧拉序列2n+1个
int cnt,depth;
int findRoot(){
    for(int i=1;i&lt;=n;i++)return i;
    return -1;
}
void getEuler(int u=findRoot(),int fa=-1){
    int tmp=dpM[0][H[u]=++cnt]=++depth;
    E[tmp]=u;
    for(int i=head[u];~i;i=e[i].nxt){
        int v=e[i].v;
        if(v==fa)continue;
        dist[v]=dist[u]+e[i].w;
        getEuler(v,u);
        dpM[0][++cnt]=tmp;
    }
}
void initLCA(){
    memset(dist,0,sizeof(dist));
    cnt=depth=0;
    getEuler();
    initRMQ(cnt);
}
int getLCA(int u,int v){
    if(H[u]&gt;H[v])swap(u,v);
    return E[getRMQ(H[u],H[v])];
}
int main() {
    while (~scanf("%d%d", &amp;n, &amp;m)) {
        int u, v, w;
        char c;
        initEdge();
        for (int i = 1; i &lt;= m; i++) {
            scanf("%d%d%d %c", &amp;u, &amp;v, &amp;w, &amp;c);
            add(u, v, w);
            add(v, u, w);
        }
        initLCA();
        scanf("%d",&amp;m);
        while(m--){
            scanf("%d%d",&amp;u,&amp;v);
            printf("%d\n",dist[u]+dist[v]-2*dist[getLCA(u,v)]);
        }
    }
}
```
