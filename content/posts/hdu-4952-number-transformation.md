---
title: HDU 4952 Number Transformation
categories:
  - ACM
id: 93
date: '2014-08-16T01:22:13+08:00'
tags:
  - 数论
  - 暴力
---

**<span style="font-family: Arial; font-size: 12px; font-weight: bold; color: green;">Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 65536/65536 K (Java/Others)
Total Submission(s): 612    Accepted Submission(s): 310
</span>**
<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">Teacher Mai has an integer x.

He does the following operations k times. In the i-th operation, x becomes the least integer no less than x, which is the multiple of i.

He wants to know what is the number x now.</div>
<div class="panel_bottom"></div>
<!--more-->
&nbsp;

<div class="panel_title" align="left">Input</div>
<div class="panel_content">There are multiple test cases, terminated by a line "0 0".

For each test case, the only one line contains two integers x,k(1&lt;=x&lt;=10^10, 1&lt;=k&lt;=10^10).</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Output</div>
<div class="panel_content">For each test case, output one line "Case #k: x", where k is the case number counting from 1.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">2520 10 2520 20 0 0</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">Case #1: 2520 Case #2: 2600</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Source</div>
<div class="panel_content">[ 2014 Multi-University Training Contest 8 ](http://acm.hdu.edu.cn/search.php?field=problem&amp;key=2014%20Multi-University%20Training%20Contest%208&amp;source=1&amp;searchmode=source)</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Recommend</div>
<div class="panel_content">hujie   |   We have carefully selected several similar problems for you:  [4955](http://acm.hdu.edu.cn/showproblem.php?pid=4955) [4954](http://acm.hdu.edu.cn/showproblem.php?pid=4954) [4953](http://acm.hdu.edu.cn/showproblem.php?pid=4953) [4951](http://acm.hdu.edu.cn/showproblem.php?pid=4951) [4950](http://acm.hdu.edu.cn/showproblem.php?pid=4950)</div>
<br/>

- - -


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
int __;
#define type LL
inline type getint() {
    type ret=0;bool ok=0;
    for(;;) {
        int c=getchar();
        if(c&gt;='0'&amp;&amp;c&lt;='9')ret=(ret&lt;&lt;3)+ret+ret+c-'0',ok=1;
        else if(ok)return ret;
    }
}
#undef type
int main(int argc, char **argv) {
    LL x, k;
    while (1) {
        x=getint();
        k=getint();
        if (x == 0 &amp;&amp; k == 0) break;
        for(int i=1;i&lt;k;i++){
            if(x&lt;i+1)break;
            x-=x/(i+1);
        }
        printf("Case #%d: "LLS"\n",++__,x*k);
    }
}
```
