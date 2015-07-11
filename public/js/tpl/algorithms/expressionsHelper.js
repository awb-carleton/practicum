
/// Functions that are invoked by the expressions thought process alogrithm.
function ExpressionsHelper() {
    "use strict";

    this.isThereAtLeastOneMultiplicationDivisionOrModOperator = function (state) {
        var numProblemLines = state.problemLines.length;
        var currentExpression = state.problemLines[numProblemLines - 1];
        var foundMDMoperator = false;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "MDMoperator") {
                foundMDMoperator = true;
            }
        }

        return foundMDMoperator;
    };

    this.isThereAtLeastOneAdditionOrSubtractionOperator = function (state) {
        var numProblemLines = state.problemLines.length;
        var currentExpression = state.problemLines[numProblemLines - 1];
        var foundASoperator = false;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "ASoperator") {
                foundASoperator = true;
            }
        }

        return foundASoperator;
    };

    this.getFirstMultiplicationDivisionOrModOperatorFromLeft = function (state) {
        var numProblemLines = state.problemLines.length;
        var currentExpression = state.problemLines[numProblemLines - 1];
        var MDMoperator = {};
        MDMoperator.type = "lineCell";
        MDMoperator.line = numProblemLines - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "MDMoperator") {
                MDMoperator.cell = i;
                break;
            }
        }

        return MDMoperator;
    };

    this.getFirstAdditionOrSubtractionOperatorFromLeft = function (state) {
        var numProblemLines = state.problemLines.length;
        var currentExpression = state.problemLines[numProblemLines - 1];
        var ASoperator = {};
        ASoperator.type = "lineCell";
        ASoperator.line = numProblemLines - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "ASoperator") {
                ASoperator.cell = i;
                break;
            }
        }

        return ASoperator;
    };

    this.getLeftOperand = function (state, operatorIndex) {
        var leftOperand = {};
        leftOperand.type = "lineCell";
        leftOperand.line = state.problemLines.length - 1;
        leftOperand.cell = operatorIndex.cell - 1;
        leftOperand.value = state.problemLines[leftOperand.line][leftOperand.cell].value;
        leftOperand.valType = state.problemLines[leftOperand.line][leftOperand.cell].type;
        leftOperand.asString = function () {
            if (this.valType === "double" && this.value % 1 === 0) { // double without non-zero decimals
                return this.value.toFixed(1);
            }
            return this.value.toString();
        };
        return leftOperand;
    };

    this.getRightOperand = function (state, operatorIndex) {
        var rightOperand = {};
        rightOperand.type = "lineCell";
        rightOperand.line = state.problemLines.length - 1;
        rightOperand.cell = operatorIndex.cell + 1;
        rightOperand.value = state.problemLines[rightOperand.line][rightOperand.cell].value;
        rightOperand.valType = state.problemLines[rightOperand.line][rightOperand.cell].type;
        rightOperand.asString = function () {
            if (this.valType === "double" && this.value % 1 === 0) { // double without non-zero decimals
                return this.value.toFixed(1);
            }
            return this.value.toString();
        };
        return rightOperand;
    };

    this.createNewLineWithEmptyCell = function (state, operatorObject) {
        var operatorIndex = operatorObject.cell;
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var newProblemLine = JSON.parse(JSON.stringify(currentExpression));

        var part1 = newProblemLine.slice(0, operatorIndex - 1);
        var part2 = newProblemLine.slice(operatorIndex, operatorIndex + 1);
        var part3 = newProblemLine.slice(operatorIndex + 2);
        newProblemLine = part1.concat(part2).concat(part3);
        newProblemLine[operatorIndex - 1].type = "empty";
        newProblemLine[operatorIndex - 1].value = "";

        state.problemLines.push(newProblemLine);

        var emptyCell = {};
        emptyCell.type = "lineCell";
        emptyCell.line = state.problemLines.length - 1;
        emptyCell.cell = operatorIndex - 1;
        return emptyCell;
    };

    function getOperator(state, index) {
        var nextToLastProblemLine = state.problemLines.length - 2;
        var calculationExpression = state.problemLines[nextToLastProblemLine];

        return calculationExpression[index];
    }

    this.isCurrentOperatorMod = function (state, operatorObject) {
        return getOperator(state, operatorObject.cell).value === "%";
    };

    this.isCurrentOperationIntDiv = function (state, operatorObject) {
        var operatorIndex = operatorObject.cell;
        var nextToLastProblemLine = state.problemLines.length - 2;
        var calculationExpression = state.problemLines[nextToLastProblemLine];

        var operator = calculationExpression[operatorIndex];
        var leftOperand = calculationExpression[operatorIndex - 1];
        var rightOperand = calculationExpression[operatorIndex + 1];

        return operator.value === "/" && leftOperand.type === "int" && rightOperand.type === "int";
    };

    this.isCurrentOperationDiv = function (state, operatorObject) {
        return getOperator(state, operatorObject.cell).value === "/";
    };

    this.isCurrentOperationMult = function (state, operatorObject) {
        return getOperator(state, operatorObject.cell).value === "*";
    };

    this.isCurrentOperationConcat = function (state, operatorObject) {
        var operatorIndex = operatorObject.cell;
        var nextToLastProblemLine = state.problemLines.length - 2;
        var calculationExpression = state.problemLines[nextToLastProblemLine];

        var operator = calculationExpression[operatorIndex];
        var leftOperand = calculationExpression[operatorIndex - 1];
        var rightOperand = calculationExpression[operatorIndex + 1];

        return operator.value === "+" && (leftOperand.type === "string" || rightOperand.type === "string");
    };

    this.isCurrentOperationAdd = function (state, operatorObject) {
        return getOperator(state, operatorObject.cell).value === "+";
    };

    this.isCurrentOperationSub = function (state, operatorObject) {
        return getOperator(state, operatorObject.cell).value === "-";
    };

    function correctPrecision(result, left, right) {
        if ((left.valType !== "string" && right.valType !== "string") &&
            (left.valType === "double" || right.valType === "double") && result % 1 === 0) {
            return result.toFixed(1);
        }
        return result;
    }

    function doStateUpdate(state, operator, result) {
        var operatorIndex = operator.cell;
        var nextToLastProblemLine = state.problemLines.length - 2;
        var problemLine = state.problemLines.length - 1;
        var calculationExpression = state.problemLines[nextToLastProblemLine];

        var leftOperand = calculationExpression[operatorIndex - 1];
        var rightOperand = calculationExpression[operatorIndex + 1];

        state.problemLines[problemLine][operatorIndex - 1].value = result;

        // If either operand was a string, the result is a string
        if (leftOperand.type === "string" || rightOperand.type === "string") {
            state.problemLines[problemLine][operatorIndex - 1].type = "string";

        // Javascript doesn't put any type info into the the numbers, so we have to keep track
        // If either operand was a double, then the result is a double.
        } else if ((leftOperand.type === "double" || rightOperand.type === "double")) {
            state.problemLines[problemLine][operatorIndex - 1].type = "double";
        }
        // Otherwise, it's gonna be an int.
        else if (typeof result === "number") {
            state.problemLines[problemLine][operatorIndex - 1].type = "int";
        }
        else {
            console.error("Expressions thoughtProcess -- Encountered a type we weren't expecting: " + (typeof result));
            state.problemLines[problemLine][operatorIndex - 1].type = typeof result;

        }
    }

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisModulus = function(left, right, state, operator) {
        var result = left.value % right.value;
        doStateUpdate(state, operator, result);
        return correctPrecision(result, left, right);
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisDivision = function (left, right, state, operator) {
        var result = left.value / right.value;
        // check for integer division
        if (left.valType === "int" && right.valType === "int") {
            result = Math.floor(result);
        }
        doStateUpdate(state, operator, result);
        return correctPrecision(result, left, right);
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisMultiplication = function (left, right, state, operator) {
        var result = left.value * right.value;
        doStateUpdate(state, operator, result);
        return correctPrecision(result, left, right);
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisAddition = function (left, right, state, operator) {
        var result = left.value + right.value;
        // check for string concatenation
        if (left.valType === "string" || right.valType === "string") {
            result = left.asString() + right.asString();
        }
        doStateUpdate(state, operator, result);
        return correctPrecision(result, left, right);
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisSubtraction = function (left, right, state, operator) {
        var result = left.value - right.value;
        doStateUpdate(state, operator, result);
        return correctPrecision(result, left, right);
    };
}

/// Creates an initial state for expressions given a problem configuration.
function expressions_make_initial_state(problemConfig) {
    "use strict";

    function operator_type(op) {
        switch (op) {
            case '+': case '-': return 'ASoperator';
            default: return 'MDMoperator';
        }
    }

    function flatten(node) {
        switch (node.tag) {
            case 'binop':
                var left = flatten(node.args[0]);
                var right = flatten(node.args[1]);
                return left.concat({type:operator_type(node.operator), value:node.operator}, right);
            case 'literal':
                return [{type:node.type, value:node.value}];
        }
    }

    var ast = java_parsing.parse_expression(problemConfig.content);

    return {
        problemLines: [flatten(ast)]
    };
}

