---
title: ZOJ month contest D.Determinant and Matrix
categories:
  - ACM
id: 153
date: '2014-11-08T02:32:21+08:00'
tags:
  - 数论
---

* * *

<center style="color: #000000;"><span style="color: green;">Time Limit: </span>2 Seconds      <span style="color: green;">Memory Limit: </span>65536 KB</center>

* * *
##Description
Recently, LBH is learning the curse linear algebra. Thus he is very interested in matrix and determinant now. In order to practice his ability of solving the problem of linear algebra, he just invent some problems by himself. Once the problems was create, he would solve it immediately. However, he meet a problem that was so hard that he couldn't work out even though racked his brains. The problem was described as follow:

To a integer martix M<sub>nn</sub>(a<sub>ij</sub>), we define two function add(M<sub>nn</sub>(a<sub>ij</sub>))=M<sub>nn</sub>(a<sub>ij</sub> + 1) and sub(M<sub>nn</sub>(a<sub>ij</sub>))=M<sub>nn</sub>(a<sub>ij</sub> - 1) which were exactly like this:
<!--more-->
<div style="color: #000000;">![DeterminantAndMatrixFig1](http://acm.zju.edu.cn/onlinejudge/showImage.do?name=DeterminantAndMatrixFig1.png)</div>
<div style="color: #000000;">![DeterminantAndMatrixFig2](http://acm.zju.edu.cn/onlinejudge/showImage.do?name=DeterminantAndMatrixFig2.png)</div>

According to the martix M<sub>nn</sub>(a<sub>ij</sub>), we can permutate it and get a full permutation set Perm(M<sub>nn</sub>(a<sub>ij</sub>)) = {M<sub>nn</sub>(a<sub>I<sub>i</sub>J<sub>j</sub></sub>)| I and J is a permutation of 1..n }, (Perm(M) is a set, each matrix in Perm(M) is unique). For example:

<div style="color: #000000;">![DeterminantAndMatrixFig3](http://acm.zju.edu.cn/onlinejudge/showImage.do?name=DeterminantAndMatrixFig3.png)</div>

The problem is to get the result of a fomula about an integer matrix M<sub>nn</sub>:

<div style="color: #000000;">![DeterminantAndMatrixFig4](http://acm.zju.edu.cn/onlinejudge/showImage.do?name=DeterminantAndMatrixFig4.png)</div>
<span style="color: #000000;">in which the det(M) meaned to cacluate the determinant of M.</span>

## Input

There are several test cases.

The first line contains an integer <var>T</var>(<var>T</var> ≤ 100) . Then <var>T</var> test cases follow.

In each test case, the first line contains one integer <var>n</var>(0&lt; <var>n</var>≤ 10). The number means the giving matrix's size is <var>n×n</var>

Then there are <var>n</var> lines followed, each line contains <var>n</var> integers <var>a<sub>ij</sub></var>(-10≤ <var>a<sub>ij</sub></var>≤ 10), in the position row <var>i</var>, colum <var>j</var>, it represents the number <var>a<sub>ij</sub>.</var>

## Output

For each test case, since the result may be very large, output one line with the result modulo 2<sup>30</sup>.

## Sample Input
```
1
2
1 1
1 2
```
#### Sample Output

```
2
```

<span style="color: #000000;">Author: </span>**LIN, Binghui**
<span style="color: #000000;">Source: </span>**ZOJ Monthly, August 2014**

<br/>

- - -


这道题全场现场只A了一个人。今天我们比赛的时候我A了，挺爽的。
```Java
import java.util.Scanner;
import java.math.*;
public class Main {
	static long fact[]=new long[15];
	static long kind;
	static int A[][]=new int[10][10];
	static final BigInteger MOD=BigInteger.valueOf(1&lt;&lt;30);
	static void getKind(int n){
		boolean mark[]=new boolean[10];
		for(int i,j,k,r=0;r&lt;2;r++){
			for (i = 0; i &lt; n; ++ i) mark[i] = false;
			for (i = 0; i &lt; n; ++ i) {
				if (mark[i]) continue;
				int cnt = 0;
				for (j = i; j &lt; n; ++ j) {
					for (k = 0; k &lt; n; ++ k) {
						if (r==1&amp;&amp;A[k][i] != A[k][j])break;
						if(r==0&amp;&amp;A[i][k] != A[j][k])break;
					}
					if (k == n) {
						++ cnt;
						mark[j] = true;
					}
				}
				kind /= fact[cnt];
			}
		}
	}
	public static void main(String[] args){
		Scanner cin=new Scanner(System.in);
		int n,T=cin.nextInt();
		fact[0]=1;
		for(int i=1;i&lt;=10;i++)fact[i]=fact[i-1]*i;
		while(T--&gt;0){
			n=cin.nextInt();
			for(int i=0;i&lt;n;i++){
				for(int j=0;j&lt;n;j++){
					A[i][j]=cin.nextInt();
				}
			}
			long res=0;
			Matrix matrix=new Matrix(n);
			kind=fact[n]*fact[n];
			getKind(n);
			if(kind%2==1){
				matrix.valueOf(A, 0);
				res=res ^(matrix.Det().mod(MOD).longValue());
			}
			matrix.valueOf(A, 1);
			res=res^(matrix.Det().mod(MOD).longValue());
			matrix.valueOf(A, -1);
			res=res^(matrix.Det().mod(MOD).longValue());
			System.out.println(res);
		}
		cin.close();
	}
}
class Matrix{
	BigInteger M[][]=new BigInteger[10][10];
	BigInteger ZERO,ONE;
	int n;
	Matrix(int n){
		this.n=n;
		ZERO=BigInteger.ZERO;
		ONE=BigInteger.ONE;
	}
	void valueOf(int A[][],int d){
		for(int i=0;i&lt;n;i++){
			for(int j=0;j&lt;n;j++){
				M[i][j]=BigInteger.valueOf(A[i][j]+d);
			}
		}
	}
	BigInteger Det(){
		BigInteger tmp, res = ONE, div = ONE;
		int i, j, k;
		for (i = 0; i &lt; n; ++ i) {
			for (j = i; j &lt; n; ++ j) {
				if (!M[j][i].equals(ZERO)) break;
			}
			if (j == n) return ZERO;
			if (j != i) {
				//res = res.negate();
				for (k = 0; k &lt; n; ++ k) {
				    tmp = M[j][k];
					M[j][k] = M[i][k];
					M[i][k] = tmp;
				}
			}
			res = res.multiply(M[i][i]);
			for (j = i + 1; j &lt; n; ++ j) {
				if (M[j][i].equals(ZERO)) continue;
				div = div.multiply(M[i][i]);
				for (k = i + 1; k &lt; n; ++ k) {
					M[j][k] = M[j][k].multiply(M[i][i]).subtract(M[i][k].multiply(M[j][i]));
				}
			}
		}
		res = res.divide(div);
		if (res.compareTo(ZERO) &lt; 0) res = res.negate();
		return res;
	}
}
```
</pre>
