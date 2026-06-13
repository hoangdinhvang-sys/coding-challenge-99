//  Method 1
function sum_to_n_1(n: number): number {
    if (n === 0) {
        return 0
    }
    return n  + sum_to_n_1(n - 1)
}

// Method 2
function sum_to_n_2(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// Method 3
function sum_to_n_3(n: number): number {
    return n * (n + 1) >> 1
}

console.log(sum_to_n_1(5))
console.log(sum_to_n_2(5))
console.log(sum_to_n_3(5))