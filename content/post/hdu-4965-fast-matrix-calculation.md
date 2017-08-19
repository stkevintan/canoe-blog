+++
title = "HDU 4965 Fast Matrix Calculation"
tags = ["[矩阵,暴力]"]
categories = ["ACM"]
date = "2014-08-20T04:37:28+08:00"

+++

**<span style="font-family: Arial; font-size: 12px; font-weight: bold; color: green;">Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 131072/131072 K (Java/Others)
Total Submission(s): 206    Accepted Submission(s): 116
</span>**
<div class="panel_title" align="left">Problem Description</div>
<div class="panel_content">

One day, Alice and Bob felt bored again, Bob knows Alice is a girl who loves math and is just learning something about matrix, so he decided to make a crazy problem for her.

Bob has a six-faced dice which has numbers 0, 1, 2, 3, 4 and 5 on each face. At first, he will choose a number N (4 &lt;= N &lt;= 1000), and for N times, he keeps throwing his dice for K times (2 &lt;=K &lt;= 6) and writes down its number on the top face to make an N*K matrix A, in which each element is not less than 0 and not greater than 5\. Then he does similar thing again with a bit difference: he keeps throwing his dice for N times and each time repeat it for K times to write down a K*N matrix B, in which each element is not less than 0 and not greater than 5\. With the two matrix A and B formed, Alice’s task is to perform the following 4-step calculation.
<!--more-->
Step 1: Calculate a new N*N matrix C = A*B.
Step 2: Calculate M = C^(N*N).
Step 3: For each element x in M, calculate x % 6\. All the remainders form a new matrix M’.
Step 4: Calculate the sum of all the elements in M’.

Bob just made this problem for kidding but he sees Alice taking it serious, so he also wonders what the answer is. And then Bob turn to you for help because he is not good at math.

</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Input</div>
<div class="panel_content">

The input contains several test cases. Each test case starts with two integer N and K, indicating the numbers N and K described above. Then N lines follow, and each line has K integers between 0 and 5, representing matrix A. Then K lines follow, and each line has N integers between 0 and 5, representing matrix B.

The end of input is indicated by N = K = 0.

</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Output</div>
<div class="panel_content">For each case, output the sum of all the elements in M’ in a line.</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Input</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">4 2 5 5 4 4 5 4 0 0 4 2 5 5 1 3 1 5 6 3 1 2 3 0 3 0 2 3 4 4 3 2 2 5 5 0 5 0 3 4 5 1 1 0 5 3 2 3 3 2 3 1 5 4 5 2 0 0</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Sample Output</div>
<div class="panel_content">
<div style="font-family: Courier New,Courier,monospace;">14 56</div>
</div>
<div class="panel_bottom"></div>
&nbsp;
<div class="panel_title" align="left">Source</div>
<div class="panel_content">[ 2014 Multi-University Training Contest 9 ](http://acm.hdu.edu.cn/search.php?field=problem&amp;key=2014%20Multi-University%20Training%20Contest%209&amp;source=1&amp;searchmode=source)</div>
<br/>

- - -


<div class="panel_content">这题让我注意了矩阵模板的开销问题。1000X1000多次调用就会爆内存了。下面是用动态数组写的。效率非常慢，难以接受。</div>
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
#define MOD 6
int n, k;
struct Matrix {
    int n, m;
    int** M;
    Matrix(int n, int m) :n(n), m(m) {
        M = new int*[n];
        for (int i = 0; i &lt; n; i++)
            M[i] = new int[m];
    }

    Matrix(int n, int m, int k) :
            n(n), m(m) {
        M = new int*[n];
        for (int i = 0; i &lt; n; i++)
            M[i] = new int[m];
        Init(k);
    }

    ~Matrix() {
        if (M) {
            for (int i = 0; i &lt; n; i++) {
                if (M[i]) {
                    delete[] M[i];
                    M[i] = NULL;
                }
            }
            delete[] M;
            M = NULL;
        }
    }

    void Init(bool k) { //k=1 返回单位矩阵，k=0 返回零矩阵
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++)
                M[i][j] = k * (i == j);
    }

    void out() {
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++)
                printf("%d%c", M[i][j], j == m - 1 ? '\n' : ' ');
    }

    Matrix &amp; operator=(const Matrix&amp; othr) {
        this-&gt;~Matrix();
        n = othr.n;
        m = othr.m;
        M = new int*[n];
        for (int i = 0; i &lt; n; i++)
            M[i] = new int[m];
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; m; j++) {
                M[i][j] = othr.M[i][j];
            }
        }
        return *this;
    }

    Matrix(const Matrix &amp; othr) {
        n = othr.n;
        m = othr.m;
        M = new int*[n];
        for (int i = 0; i &lt; n; i++)
            M[i] = new int[m];
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; m; j++) {
                M[i][j] = othr.M[i][j];
            }
        }
    }

    bool operator==(const Matrix&amp; othr) const {
        if (n - othr.n || m - othr.m) return false;
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; m; j++) {
                if (M[i][j] != othr.M[i][j]) return false;
            }
        }
        return true;
    }
    Matrix operator *(const Matrix&amp; othr) const {
        if (m - othr.n) exit(1); //异常退出
        Matrix ans(n, othr.m, 0);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; othr.m; j++)
                for (int k = 0; k &lt; m; k++) {
                    ans.M[i][j] += M[i][k] * othr.M[k][j] % MOD;
                    if (ans.M[i][j] &gt;= MOD) ans.M[i][j] -= MOD;
                    if (ans.M[i][j] &lt; 0) ans.M[i][j] += MOD;
                }
        return ans;
    }
    Matrix operator *(const int&amp; x) const {
        Matrix ans(n, m);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++)
                ans.M[i][j] = M[i][j] * x % MOD;
        return ans;
    }
    Matrix operator +(const Matrix &amp; othr) const {
        if (n - othr.n || m - othr.m) exit(1);
        Matrix ans(n, m);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++) {
                ans.M[i][j] = M[i][j] + othr.M[i][j];
                if (ans.M[i][j] &gt;= MOD) ans.M[i][j] -= MOD;
                if (ans.M[i][j] &lt; 0) ans.M[i][j] += MOD;
            }
        return ans;
    }

    Matrix operator -(const Matrix&amp; othr) const {
        if (n - othr.n || m - othr.m) exit(1);
        Matrix ans(n, m);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++) {
                ans.M[i][j] = M[i][j] - othr.M[i][j];
                if (ans.M[i][j] &gt;= MOD) ans.M[i][j] -= MOD;
                if (ans.M[i][j] &lt; 0) ans.M[i][j] += MOD;
            }
        return ans;
    }

    Matrix operator ^(int x) const {
        if (n - m) exit(1);
        Matrix ans(n, m, 1), base = *this;
        while (x &gt; 0) {
            if (x &amp; 1) ans = ans * base;
            base = base * base;
            x &gt;&gt;= 1;
        }
        return ans;
    }
};

int main(int argc, char **argv) {
    while (~scanf("%d%d", &amp;n, &amp;k)) {
        if (n == 0 &amp;&amp; k == 0) break;
        Matrix A(n, k, 0), B(k, n, 0);
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; k; j++) {
                scanf("%d", &amp;A.M[i][j]);
            }
        }
        for (int i = 0; i &lt; k; i++) {
            for (int j = 0; j &lt; n; j++) {
                scanf("%d", &amp;B.M[i][j]);
            }
        }
        Matrix mat = B * A;
        int r = n * n - 1;
        Matrix res = A * (mat ^ r) * B;
        int ans = 0;
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; n; j++) {
                ans += res.M[i][j];
            }
        }
        printf("%d\n", ans);
    }
}
```

然后又试了试vector，虽然简单不少，但是仍然很慢：
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
#define MOD 6
int n, k;
struct Matrix {
    int n, m;
    vector&lt;vector&lt;int&gt; &gt;M;
    Matrix(int n, int m) :n(n), m(m) {
        alloc();
    }

    Matrix(int n, int m, int k) :
            n(n), m(m) {
        alloc();
        Init(k);
    }
    void alloc(){
        M.resize(n);
        for (int i = 0; i &lt; n; i++)
            M[i].resize(m);
    }

    void Init(bool k) { //k=1 返回单位矩阵，k=0 返回零矩阵
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++)
                M[i][j] = k * (i == j);
    }

    void out() {
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++)
                printf("%d%c", M[i][j], j == m - 1 ? '\n' : ' ');
    }

    bool operator==(const Matrix&amp; othr) const {
        if (n - othr.n || m - othr.m) return false;
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; m; j++) {
                if (M[i][j] != othr.M[i][j]) return false;
            }
        }
        return true;
    }
    Matrix operator *(const Matrix&amp; othr) const {
        if (m - othr.n) exit(1); //异常退出
        Matrix ans(n, othr.m, 0);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; othr.m; j++)
                for (int k = 0; k &lt; m; k++) {
                    ans.M[i][j] += M[i][k] * othr.M[k][j] % MOD;
                    if (ans.M[i][j] &gt;= MOD) ans.M[i][j] -= MOD;
                    if (ans.M[i][j] &lt; 0) ans.M[i][j] += MOD;
                }
        return ans;
    }
    Matrix operator *(const int&amp; x) const {
        Matrix ans(n, m);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++)
                ans.M[i][j] = M[i][j] * x % MOD;
        return ans;
    }
    Matrix operator +(const Matrix &amp; othr) const {
        if (n - othr.n || m - othr.m) exit(1);
        Matrix ans(n, m);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++) {
                ans.M[i][j] = M[i][j] + othr.M[i][j];
                if (ans.M[i][j] &gt;= MOD) ans.M[i][j] -= MOD;
                if (ans.M[i][j] &lt; 0) ans.M[i][j] += MOD;
            }
        return ans;
    }

    Matrix operator -(const Matrix&amp; othr) const {
        if (n - othr.n || m - othr.m) exit(1);
        Matrix ans(n, m);
        for (int i = 0; i &lt; n; i++)
            for (int j = 0; j &lt; m; j++) {
                ans.M[i][j] = M[i][j] - othr.M[i][j];
                if (ans.M[i][j] &gt;= MOD) ans.M[i][j] -= MOD;
                if (ans.M[i][j] &lt; 0) ans.M[i][j] += MOD;
            }
        return ans;
    }

    Matrix operator ^(int x) const {
        if (n - m) exit(1);
        Matrix ans(n, m, 1), base = *this;
        while (x &gt; 0) {
            if (x &amp; 1) ans = ans * base;
            base = base * base;
            x &gt;&gt;= 1;
        }
        return ans;
    }
};

int main(int argc, char **argv) {
    while (~scanf("%d%d", &amp;n, &amp;k)) {
        if (n == 0 &amp;&amp; k == 0) break;
        Matrix A(n, k, 0), B(k, n, 0);
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; k; j++) {
                scanf("%d", &amp;A.M[i][j]);
            }
        }
        for (int i = 0; i &lt; k; i++) {
            for (int j = 0; j &lt; n; j++) {
                scanf("%d", &amp;B.M[i][j]);
            }
        }
        Matrix mat = B * A;
        int r = n * n - 1;
        Matrix res = A * (mat ^ r) * B;
        int ans = 0;
        for (int i = 0; i &lt; n; i++) {
            for (int j = 0; j &lt; n; j++) {
                ans += res.M[i][j];
            }
        }
        printf("%d\n", ans);
    }
}
```
感觉其他方法还比较麻烦。算了就这样吧~

&nbsp;