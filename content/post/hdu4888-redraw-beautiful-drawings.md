+++
title = "HDU4888 Redraw Beautiful Drawings "
categories = ["ACM","07"]
date = "2014-07-30T05:43:58+08:00"
tags = []

+++


<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">Alice and Bob are playing together. Alice is crazy about art and she has visited many museums around the world. She has a good memory and she can remember all drawings she has seen.Today Alice designs a game using these drawings in her memory. First, she matches K+1 colors appears in the picture to K+1 different integers(from 0 to K). After that, she slices the drawing into grids and there are N rows and M columns. Each grid has an integer on it(from 0 to K) representing the color on the corresponding position in the original drawing. Alice wants to share the wonderful drawings with Bob and she tells Bob the size of the drawing, the number of different colors, and the sum of integers on each row and each column. Bob has to redraw the drawing with Alice's information. Unfortunately, somtimes, the information Alice offers is wrong because of Alice's poor math. And sometimes, Bob can work out multiple different drawings using the information Alice provides. Bob gets confused and he needs your help. You have to tell Bob if Alice's information is right and if her information is right you should also tell Bob whether he can get a unique drawing.</div>
<div class="panel_bottom"></div>
<!--more-->
&nbsp;
<div class="panel_title" align="left">Input</div>
<div class="panel_content">The input contains mutiple testcases.For each testcase, the first line contains three integers N(1 ≤ N ≤ 400) , M(1 ≤ M ≤ 400) and K(1 ≤ K ≤ 40).
N integers are given in the second line representing the sum of N rows.
M integers are given in the third line representing the sum of M columns.The input is terminated by EOF.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Output</div>
<div class="panel_content">For each testcase, if there is no solution for Bob, output "Impossible" in one line(without the quotation mark); if there is only one solution for Bob, output "Unique" in one line(without the quotation mark) and output an N * M matrix in the following N lines representing Bob's unique solution; if there are many ways for Bob to redraw the drawing, output "Not Unique" in one line(without the quotation mark).</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">2 2 4 4 2 4 2 4 2 2 2 2 5 0 5 4 1 4 3 9 1 2 3 3</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">Not Unique Impossible Unique 1 2 3 3</div>
</div>
&nbsp;

- - -


第一步，考虑如何求是否有解。使用网络流求解，每一行和每一列分别对应一个点，加上源点和汇点一共有N+M+2个点。有三类边：



1.  源点 -&gt; 每一行对应的点，流量限制为该行的和
2.  每一行对应的点 -&gt; 每一列对应的点，流量限制为 K
3.  每一列对应的点 -&gt; 汇点，流量限制为该列的和
&nbsp;

对上图做最大流，若源点出发的边和到达汇点的边全都满流，则有解，否则无解。若要求构造方案，则 (i,j) 对应的整数就是行 i–&gt; 列 j 的流量。

第二步，考虑解是否唯一。显然，解唯一的充分必要条件是完成最大流后的残余网络没有长度大于 2 的环。所以，判断解的唯一性可使用dfs，注意遍历的时候不可以在走完一条边后马上走其反向边，加此限制检查是否有环即可判断解是否唯一。

至此，全题已解决。
```C++
#include &lt;iostream&gt; 
#include &lt;cstring&gt; 
#include &lt;cstdio&gt; 
#include &lt;queue&gt; 
#include &lt;cstdlib&gt;
using namespace std;

const int maxn=500,maxm=maxn*maxn;
int next[maxm*2],num[maxm*2],r[maxm*2],a[maxn*2],row_sum[maxn],col_sum[maxn],n,m,K,tt,T,d[maxn*2],st[maxn*2],cod[maxn][maxn];
int h[maxn*2],vh[maxn*2];
bool don[maxm*2],in[maxn*2];

void insert(int x,int y,int rr)
{
	next[++tt]=a[x];num[tt]=y;r[tt]=rr;a[x]=tt;
	next[++tt]=a[y];num[tt]=x;r[tt]=0;a[y]=tt;
}

void construct()
{
	tt=1;T=n+m+1;
	for (int i=0;i&lt;=T;i++) a[i]=0;
	for (int i=1;i&lt;=n;i++) insert(0,i,row_sum[i]);
	for (int i=1;i&lt;=m;i++) insert(i+n,T,col_sum[i]);
	for (int i=1;i&lt;=n;i++)
	{
		for (int j=1;j&lt;=m;j++)
		{
			insert(i,j+n,K);
			cod[i][j]=tt;
		}
	}
}

int dfs(int x,int y)
{
	if (x==T) return y;
	int sig=st[x],minh=T+1;
	do
	{
		if (r[st[x]])
		{
			if (h[num[st[x]]]+1==h[x])
			{
				int k=dfs(num[st[x]],min(y,r[st[x]]));
				if (k)
				{
					r[st[x]]-=k;
					r[st[x]^1]+=k;
					return k;
				}
			}
			minh=min(minh,h[num[st[x]]]+1);
			if (h[0]&gt;T) return 0;
		}
		st[x]=next[st[x]];
		if (st[x]==0) st[x]=a[x];
	}while (sig!=st[x]);
	if (vh[h[x]]--==0) h[0]=T+1;
	vh[h[x]=minh]++;
	return 0;
}

int max_flow()
{
	for (int i=0;i&lt;=T;i++) h[i]=vh[i]=0;
	for (int i=0;i&lt;=T;i++) st[i]=a[i];
	vh[0]=T+1;
	int ret=0;
	while (h[0]&lt;=T) ret+=dfs(0,K+1);
	return ret;
}

/*bool find_circle()
{
	deque  q;
	for (int i=0;i&lt;=T;i++) d[i]=0;
	for (int i=0;i&lt;=T;i++)
	{
		for (int p=a[i];p;p=next[p])
		{
			if (r[p]) d[i]++;
		}
		if (d[i]==0) q.push_back(i);
	}
	int cnt=T+1;
	while (!q.empty())
	{
		int x=q.front();
		cnt--;
		q.pop_front();
		for (int p=a[x];p;p=next[p])
		{
			if (r[p^1]) 
			{
				d[num[p]]--;
				if (d[num[p]]==0) q.push_back(num[p]);
			}
		}
	}
	return cnt;
}*/

bool visit(int x,int ed)
{
	if (don[ed]) 
		return in[x];
	don[ed]=true;
	in[x]=true;
	for (int p=a[x];p;p=next[p])
	{
		if (r[p] &amp;&amp; (ed^p)!=1)
			if (visit(num[p],p)) return true;
	}
	in[x]=false;
	return false;
}

bool find_circle()
{
	for (int i=0;i&lt;=T;i++) in[i]=false;
	for (int i=1;i&lt;=tt;i++) don[i]=false;
	int col=0;
	for (int i=2;i&lt;=tt;i++)
	{
		if (r[i] &amp;&amp; !don[i])
		{
			in[num[i^1]]=true;
			if (visit(num[i],i)) return true; 
			in[num[i^1]]=false;
		}
	}
	return false;
}

void print_scheme()
{
	printf("Unique\n");
	for (int i=1;i&lt;=n;i++)
	{
		printf("%d",r[cod[i][1]]);
		for (int j=2;j&lt;=m;j++) printf(" %d",r[cod[i][j]]);
		printf("\n");
	}
}

int main()
{
	while (scanf("%d%d%d",&amp;n,&amp;m,&amp;K)!=EOF)
	{
		int tmp=0;
		for (int i=1;i&lt;=n;i++)
		{
			scanf("%d",&amp;row_sum[i]);
			tmp+=row_sum[i];
		}
		int sum=tmp;
		for (int i=1;i&lt;=m;i++)
		{
			scanf("%d",&amp;col_sum[i]);
			tmp-=col_sum[i];
		}
		if (tmp) 
		{
			printf("Impossible\n");
			continue;
		}
		construct();
		if (max_flow()&lt;sum)
		{
			printf("Impossible\n");
			continue;
		}
		if (find_circle())
		{
			printf("Not Unique\n");
		}else print_scheme();
	}

	return 0;
}
```