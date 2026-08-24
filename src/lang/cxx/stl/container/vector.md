# vector

`vector`
`stl_bvector.h`

##

## Usage

1. reserve()

Vector 的容量之所以重要，有两个原因:

    1. 一旦内存重新分配，vector 元素相关的所有 reference、pointer、iterator 都会失效
    2. 内存重新分配很耗时间。

你可以使用 reserve()保留适当容量，避免重新分配内存。
如此一来，只要保留的容量尚有富余，就不必担心 reference 失效。

```c++
std::vector<int>v;  //create an empty vector
v.reserve(80);      // reserve memory for 80 elements
```

::: warning

vector 迭代器持续有效，除非发生两种情况:

1. 使用者在一个较小索引位置上安插或移除元素
2. 由于容量变化而引起内存重新分配。

安插或移除元素，都会使作用点之后的各元素的 reference、pointer 和 iterator 失效。
如果安插动作甚至引发内存重新分配，并那么该容器身上的所有 reference、pointer 和 iterator 都失效。

在 for loop,中是否可以提前预留空间以保证支持 insert 操作？
:::

2. shrink_to_fit()

收缩 vector 容量，但不保证 `capacity() == size() + 1`

```c++
std::vector<int> v = { 10, 1, 2, 3};
v.shrink_to_fit();
```

还有一种方法，通过创建临时对象并交换元素实现容量的缩减。

`std::vector<int>(v).swap(v);`

3. data()

获取指向第一个元素的地址。

```c++
v.data()    // better
v.begin()   // maybe not portable
```

4. `vector<bool>`

对于 bool 进行位运算优化；如果大小固定，应当采用 bitset.

```c++
std::vector<bool> v = {};
std::_Bit_reference b = v[0];
b.flip();
```

使用 Proxy, 返回类型是\_Bit_reference，可以隐式转换为 bool

```c++
struct _Bit_reference
{
    _Bit_type * _M_p;
    _Bit_type _M_mask;

    operator bool() const noexcept
    {
        return !!(*_M_p & _M_mask);
    }
}
```
