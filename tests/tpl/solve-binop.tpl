
function algorithm() {
    let left_operand;
    let right_operand;
    let operator;
    left_operand = state.left;
    right_operand = state.right;
    operator = state.op;
    state.result = eval(left_operand + operator + right_operand);
}

