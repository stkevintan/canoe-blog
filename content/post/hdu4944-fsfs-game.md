+++
title = "HDU4944 FSF’s game"
categories = ["ACM"]
date = "2014-08-13T04:59:32+08:00"
tags = []

+++


**<span style="font-family: Arial; font-size: 12px; font-weight: bold; color: green;">Time Limit: 9000/4500 MS (Java/Others)    Memory Limit: 131072/131072 K (Java/Others)
Total Submission(s): 166    Accepted Submission(s): 76
</span>**
<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">FSF has programmed a game.
In this game, players need to divide a rectangle into several same squares.
The length and width of rectangles are integer, and of course the side length of squares are integer.

After division, players can get some coins.
If players successfully divide a AxB rectangle(length: A, width: B) into KxK squares(side length: K), they can get A*B/ gcd(A/K,B/K) gold coins.
In a level, you can’t get coins twice with same method.
(For example, You can get 6 coins from 2x2(A=2,B=2) rectangle. When K=1, A*B/gcd(A/K,B/K)=2; When K=2, A*B/gcd(A/K,B/K)=4; 2+4=6; )
<!--more-->
There are N*(N+1)/2 levels in this game, and every level is an unique rectangle. (1x1 , 2x1, 2x2, 3x1, ..., Nx(N-1), NxN)

FSF has played this game for a long time, and he finally gets all the coins in the game.
Unfortunately ,he uses an UNSIGNED 32-BIT INTEGER variable to count the number of coins.
This variable may overflow.
We want to know what the variable will be.
(In other words, the number of coins mod 2^32)</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Input</div>
<div class="panel_content">There are multiply test cases.

The first line contains an integer T(T&lt;=500000), the number of test cases

Each of the next T lines contain an integer N(N&lt;=500000).</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Output</div>
<div class="panel_content">Output a single line for each test case.

For each test case, you should output "Case #C: ". first, where C indicates the case number and counts from 1.

Then output the answer, the value of that UNSIGNED 32-BIT INTEGER variable.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">3 1 3 100</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">Case #1: 1 
Case #2: 30 
Case #3: 15662489
<div style="font-family: Times New Roman; font-size: 14px; background-color: f4fbff; border: #B7CBFF 1px dashed; padding: 6px;">
<div style="font-family: Arial; font-weight: bold; color: #7ca9ed; border-bottom: #B7CBFF 1px dashed;">_Hint_</div>
In the second test case, there are six levels(1x1,1x2,1x3,2x2,2x3,3x3) Here is the details for this game: 1x1: 1(K=1); 1x2: 2(K=1); 1x3: 3(K=1); 2x2: 2(K=1), 4(K=2); 2x3: 6(K=1); 3x3: 3(K=1), 9(K=3); 1+2+3+2+4+6+3+9=30</div>
_ _</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Author</div>
<div class="panel_content">UESTC</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Source</div>
<div class="panel_content">[ 2014 Multi-University Training Contest 7 ](http://acm.hdu.edu.cn/search.php?field=problem&amp;key=2014%20Multi-University%20Training%20Contest%207&amp;source=1&amp;searchmode=source)</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Recommend</div>
<div class="panel_content">We have carefully selected several similar problems for you:  [4943](http://acm.hdu.edu.cn/showproblem.php?pid=4943) [4942](http://acm.hdu.edu.cn/showproblem.php?pid=4942) [4941](http://acm.hdu.edu.cn/showproblem.php?pid=4941) [4940](http://acm.hdu.edu.cn/showproblem.php?pid=4940) [4939](http://acm.hdu.edu.cn/showproblem.php?pid=4939)</div>
<div class="panel_content">N(LogN)的复杂度。</div>
```C++
#include&lt;cstdio&gt;
#include&lt;cstring&gt;
using namespace std;
#define N 500001
unsigned int f[N];
unsigned int g[N];
int n;
int main() {
    int T;
    for (int i = 1; i &lt; N; i++) {
        for (int j = 1; i * j &lt; N; j++) {
            g[i * j] += (1LL + j) * j / 2;
        }
    }
    f[1] = 1;
    for (int i = 2; i &lt; N; i++) {
        f[i] = f[i - 1] + i * g[i];
    }
    scanf("%d", &amp;T);
    for (int c = 1; c &lt;= T; c++) {
        scanf("%d", &amp;n);
        printf("Case #%d: %u\n", c, f[n]);
    }
}
```
