---
title: 斐波那契堆之Go实现
tags:
  - algorithm
  - golang
categories:
  - ACM
date: '2017-03-01T00:00:00+08:00'
grammar_cjkRuby: true
---

一个比二叉堆更高效的数据结构，但是实现起来非常复杂。本科的时候看《算法导论》的时候曾经研究过，不是很明白。今天终于对它有了一个比较清晰的了解。
![enter description here][1]
<!--more-->
```go
package fibonacciHeap

const MinInt = -int(^uint(0)>>1) - 1

type Vertex struct {
	value  int
	parent *Vertex
	child  *Vertex
	left   *Vertex
	right  *Vertex
	mark   bool
	degree int
}

type FibonacciHeap struct {
	min  *Vertex
	size int
}

// Insert inserts a node into heap with value v
func (F *FibonacciHeap) Insert(value int) *Vertex {
	v := &Vertex{value: value}
	if F.min == nil {
		F.min = v
	} else {
		F.insertToList(F.min, v)
		if F.min.value > v.value {
			F.min = v
		}
	}
	F.size++
	return v
}

func (F *FibonacciHeap) Empty() bool {
	return F.min == nil
}

func (F *FibonacciHeap) Minmum() *Vertex {
	return F.min
}

func (F *FibonacciHeap) ExtractMin() *Vertex {
	z := F.min
	if z == nil {
		return nil
	}
	for z.child != nil {
		v := F.extractVertex(z.child)
		F.insertToList(F.min, v)
	}
	if z == z.right { //the heap only contains one node
		F.min = nil
	} else {
		F.min = z.right
		z = F.extractVertex(z)
		F.consolidate()
	}
	F.size--
	return z
}
func (F *FibonacciHeap) Merge(Other *FibonacciHeap) {
	if F.min == nil { // if current heap is empty
		F.min = Other.min
	} else if Other.min != nil {
		// cut two circle and rearrange them
		F.min.right.left = Other.min.left
		Other.min.left.right = F.min.right //reverse
		F.min.right = Other.min
		Other.min.left = F.min //reverse
		if F.min.value > Other.min.value {
			F.min = Other.min
		}
	}
	Other.min = nil
}
func (F *FibonacciHeap) DecreaseKey(v *Vertex, value int) bool {
	if v.value < value {
		return false // do not increase
	}
	if v.value == value {
		return true
	}
	v.value = value
	parent := v.parent
	if parent != nil && v.value < parent.value {
		v = F.extractVertex(v)
		F.insertToList(F.min, v)
		F.cascadingCut(parent)
	}
	if v.value < F.min.value {
		F.min = v
	}
	return true
}

func (F *FibonacciHeap) IncreaseKey(v *Vertex, value int) bool {
	if v.value > value {
		return false
	}
	if v.value == value {
		return true
	}
	for v.child != nil {
		F.insertToList(F.min, F.extractVertex(v.child))
	}

	v.value = value
	parent := v.parent
	if parent != nil {
		F.insertToList(F.min, F.extractVertex(v))
		F.cascadingCut(parent)
	} else if F.min == v {
		for cur := v.right; cur != v; cur = cur.right {
			if v.value > cur.value {
				F.min = cur
			}
		}
	}
	return true
}

func (F *FibonacciHeap) Modify(v *Vertex, value int) {
	switch {
	case v.value < value:
		F.IncreaseKey(v, value)
	case v.value > value:
		F.DecreaseKey(v, value)
	}
}

func (F *FibonacciHeap) DeleteVertex(v *Vertex) {
	F.DecreaseKey(v, MinInt)
	F.extractVertex(v)
}

// insertToList inserts v after pos
func (F *FibonacciHeap) insertToList(pos *Vertex, v *Vertex) {
	if pos == nil {
		return
	}
	pos.right.left = v
	v.right = pos.right
	pos.right = v
	v.left = pos
	v.parent = pos.parent
	if pos.parent != nil {
		pos.parent.degree++
	}
}

func (F *FibonacciHeap) extractVertex(v *Vertex) *Vertex {
	if v == nil {
		return nil
	}
	if v.parent != nil {
		if v.right != v {
			v.parent.child = v.right
		} else {
			v.parent.child = nil
		}
		v.parent.degree--
		v.parent = nil
	}
	if v.left != v {
		v.left.right = v.right
		v.right.left = v.left
		v.left = v
		v.right = v
	}
	v.mark = false
	return v
}

func (F *FibonacciHeap) cascadingCut(v *Vertex) {
	parent := v.parent
	if parent == nil {
		return
	}
	if v.mark == false {
		v.mark = true
	} else {
		// when the parent have lost a child
		F.extractVertex(v)
		F.insertToList(F.min, v)
		F.cascadingCut(parent)
	}
}

func (F *FibonacciHeap) consolidate() {
	if F.min == nil {
		return
	}
	v := F.min
	degree := v.degree
	// a record table to help merging vertices with the same degree
	table := make([]*Vertex, degree+1)
	for {
		if len(table) <= degree {
			// extend table size
			table = append(table, make([]*Vertex, degree-len(table)+1)...)
		}
		if table[degree] == v {
			break
		}
		if table[degree] == nil {
			//currently ,there is no vertices having the same degree of v
			table[degree] = v
			v = v.right
		} else {
			// make sure v is the minimal vertex
			if table[degree].value < v.value {
				table[degree], v = v, table[degree]
			}
			// merge table[degree] to v as his child
			// make v become root
			table[degree] = F.extractVertex(table[degree])
			if v.child == nil {
				v.child = table[degree]
				table[degree].parent = v
				v.degree++
			} else {
				//v.degree has been increased in this function
				F.insertToList(v.child, table[degree])
			}
			table[degree] = nil
		}
		degree = v.degree
	}
	// find the min
	F.min = nil
	for _, v := range table {
		if v == nil {
			continue
		}
		if F.min == nil {
			F.min = v
		} else if v.value < F.min.value {
			F.min = v
		}
	}
}
```

参考
- https://www.roading.org/algorithm/introductiontoalgorithm/斐波那契堆fibonacci-heaps.html
- http://www.cnblogs.com/skywang12345/p/3659060.html


  [1]: https://ol1kreips.qnssl.com/image.png "image.png"
