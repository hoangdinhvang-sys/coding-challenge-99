# Problem 4: Three ways to sum to n

## Task

Provide 3 unique implementations of the following function in TypeScript.

- Comment on the complexity or efficiency of each function.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

```go
func sum_to_n_a(n: number): number {
	// your code here
}

func sum_to_n_b(n: number): number {
	// your code here
}

func sum_to_n_c(n: number): number {
	// your code here
}
```

## Solution explain

### Method 1
Use recursion. This is the most simple way, but the time complexity is O(n) 
and the space complexity is also O(n). It's useful when de-recursiving the solution is too complex,
but it can through error stack over flow if the number of n is too big, and harder to debug too.

### Method 2
User loop. Simple and optimize than method 1, just declare a variable then loop through it
each time add value to our variable. this method time complexity is O(n) when space complexity
is O(1), more optimize;

### Method 3
User math, it's a well know formular "n * (n + 1) / 2". Simple, direct and return 
result in instance time and space complexity is O(1)