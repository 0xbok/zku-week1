pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matSub.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    component matmul = matMul(n,n,1);
    for (var i=0; i < n; i++) {
        for (var j=0; j < n; j++) {
            matmul.a[i][j] <== A[i][j];
        }
        matmul.b[i][0] <== x[i];
    }

    component matsub = matSub(n,1);
    for (var i=0; i < n; i++) {
        matsub.a[i][0] <== b[i];
        matsub.b[i][0] <== matmul.out[i][0];
    }

    component zero[n+1];
    signal sum[n];

    zero[0] = IsZero();
    zero[0].in <== matsub.out[0][0];
    sum[0] <== zero[0].out;
    for (var i=1; i < n; i++) {
        zero[i] = IsZero();
        zero[i].in <== matsub.out[i][0];
        sum[i] <== sum[i-1]+zero[i].out;
    }

    zero[n] = IsZero();
    zero[n].in <== sum[n-1] - n;

    out <== zero[n].out;
}

component main {public [A, b]} = SystemOfEquations(3);