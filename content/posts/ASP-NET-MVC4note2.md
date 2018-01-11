---
title: ASP.NET MVC 4笔记（二）
tags:
  - asp.net mvc4
categories:
  - ASP.NET
date: '2015-02-24T18:50:00+08:00'
---
1. 有Timestamp修饰的表在修改已有的记录是一定要将该字段复制，也就是说一定要在Edit网页里面添加一行：
		@Html.HiddenFor(model => model.RowVersion)
2. WebSecurity.CreateAccount必须在Userprofile里面先创建账户。
		System.Diagnostics.Debug.WriteLine("OnAction:" + controller + "/" + action);
3. 转换string数组到int数组
		int[] HostsList = Array.ConvertAll<string, int>(Request["HostsId"].Split(','), u => int.Parse(u));
