# std::thread

线程库的实现包含在很多部分：

- glibc++
- pthread
- glibc
- linux syscall

## 创建线程

创建一个thread需要传入一个入口函数，一般而言，
为了确保线程间数据安全，入口函数涉及的数据常常采用复制，而非引用。
除非可以明确得知，所需数据可以安全地在线程间共享。

```cxx
int add(int a, int b){
    return a + b;
}

int main() {
    thread t1{add,1,2};
    t1.join();
    return 0;
}
```
## 线程行为
### join

每一个线程只能join一次，多次调用join会触发abort
如果发生异常，join不一定会被执行

### detach

join之后无法再调用detach