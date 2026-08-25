# C 函数与函数指针

C 函数由返回类型、名称、参数列表和函数体组成。函数声明告诉编译器调用接口，函数定义则提供实现。

## 声明与定义

```c
int add(int left, int right);  /* 声明 */

int add(int left, int right) { /* 定义 */
    return left + right;
}
```

声明应放在头文件，定义放在源文件。C 允许在块作用域内声明函数，但不能在标准 C 中嵌套定义函数；为了可读性，通常仍把声明放在文件作用域。

## 数组参数

函数形参中的数组会调整为指针，因此长度必须单独传递：

```c
#include <stddef.h>

int sum(const int values[], size_t count) {
    int result = 0;
    for (size_t i = 0; i < count; ++i) result += values[i];
    return result;
}
```

这里的 `const` 表示函数不会通过该指针修改数组元素，但并不意味着调用方的数组本身是常量。

## 函数类型与函数指针

```c
typedef int BinaryOperation(int, int);       /* 函数类型 */
typedef int (*BinaryOperationPtr)(int, int); /* 函数指针 */

int apply(BinaryOperationPtr operation, int a, int b) {
    return operation(a, b);
}
```

函数名在大多数表达式中会转换为函数指针。函数类型不能用于定义普通对象，但可以用于声明函数；函数指针则可以赋值、存入结构体并作为回调参数。

```c
int multiply(int a, int b) { return a * b; }

int main(void) {
    BinaryOperationPtr operation = multiply;
    return apply(operation, 6, 7) == 42 ? 0 : 1;
}
```

## 返回值与生命周期

不要返回局部变量的地址，因为函数结束后其生命周期已经终止。可以返回值、让调用者传入输出缓冲区，或动态分配对象并清楚约定释放责任。

::: tip
回调接口最好同时接收一个 `void *context`，使调用方能够携带状态，而不必依赖全局变量。
:::
