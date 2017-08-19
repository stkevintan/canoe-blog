+++
title = "FFT求快速卷积的思考"
categories = ["11"]
date = "2014-11-07T04:15:54+08:00"
tags = []

+++


离散型卷积的定义是：$$y(n)=\sum_{m=0}^{n} x(m)h(n-m)$$

注意，h函数是反转的。

在Chipher Messages一题中，b串需要反转再与a串匹配。

比如说：

a串： 110110110，则：

b\`串：1011&lt;