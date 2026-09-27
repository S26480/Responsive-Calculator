

const display = document.getElementById("display");

const calculatorButtons =
    document.querySelectorAll(".calculator-button");

const clearButton =
    document.getElementById("clearButton");

const deleteButton =
    document.getElementById("deleteButton");

const equalsButton =
    document.getElementById("equalsButton");

// Mathematical Functions

function add(a, b){
    return a + b;
}

function subtract(a, b){
    return a - b;
}

function multiply(a, b){
    return a * b;
}

function divide(a, b){
    // Division by zero is not allowed.
    if (b===0){
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}
function modulus(a, b){
    // Modulus by zero is also not allowed.
    if (b === 0) {
        throw new Error("Cannot use modulus with zero");
    }
    return a % b;
}

// Operator Function

function calculateOperation(a, operator, b){
    switch(operator){
        case "+":
            return add(a, b);

        case "-":
            return subtract(a, b);

        case "*":
            return multiply(a, b);

        case "/":
            return divide(a, b);

        case "%":
            return modulus(a, b);

        default:
            throw new Error("Invalid operator");
    }
}
// Checking whether the expression is valid

function isValidExpression(expression){

    // Only numbers, decimal points and operators are allowed in the calculator expression
    const validPattern = /^[0-9+\-*/%. ]+$/;
    return validPattern.test(expression);
}

// Convert expression into tokens
// Example:
// "12+5*3"
// becomes
// ["12", "+", "5", "*", "3"]

function tokenize(expression){
    const tokens = [];
    let currentNumber = "";
    for (let i = 0; i < expression.length; i++){
        const character = expression[i];
        if(
            (character >= "0" && character <= "9") ||
            character === "."
        ){
            currentNumber += character;
        }else if ("+-*/%".includes(character)){
            if (currentNumber !== ""){
                tokens.push(currentNumber);
                currentNumber = "";
            }
            tokens.push(character);
        }
    }

    // Store the last number.
    if (currentNumber !== ""){
        tokens.push(currentNumber);
    }
    return tokens;
}

// Validate individual numbers

function validateNumbers(tokens){
    for (const token of tokens){

        // Operators are skipped.
        if ("+-*/%".includes(token)){
            continue;
        }

        // Number must be valid.
        if (token === "" || token === "."){
            return false;
        }

        // A number cannot contain more than one decimal point.
        const decimalCount =
            (token.match(/\./g) || []).length;

        if (decimalCount > 1){
            return false;
        }

        // Check that it can actually be converted to a number.
        if (Number.isNaN(Number(token))){
            return false;
        }
    }
    return true;
}

// Evaluate the complete expression

function evaluateExpression(expression){
    if (!isValidExpression(expression)){
        throw new Error("Invalid characters");
    }
    const tokens = tokenize(expression);
    if (tokens.length === 0){
        throw new Error("Empty expression");
    }

    // Expression must start and end with a number.
    if(
        "+-*/%".includes(tokens[0]) ||
        "+-*/%".includes(tokens[tokens.length - 1])
    ){
        throw new Error("Invalid expression");
    }

    // Check for consecutive operators.
    for (let i = 0; i < tokens.length - 1; i++){
        if(
            "+-*/%".includes(tokens[i]) &&
            "+-*/%".includes(tokens[i + 1])
        ){
            throw new Error("Consecutive operators");
        }
    }

    // Validate numbers.
    if (!validateNumbers(tokens)){
        throw new Error("Invalid number");
    }
    const firstPass = [];
    let currentValue = Number(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2){
        const operator = tokens[i];
        const nextValue = Number(tokens[i + 1]);
        if (operator === "*"){
            currentValue=multiply(currentValue, nextValue);
        }else if (operator === "/"){
            currentValue=divide(currentValue, nextValue);
        }else if (operator === "%"){
            currentValue=modulus(currentValue, nextValue);
        }else{
            firstPass.push(currentValue);
            firstPass.push(operator);
            currentValue = nextValue;
        }
    }

    // Add the final value.
    firstPass.push(currentValue);

    // Second pass: + and -

    let result = Number(firstPass[0]);
    for (let i = 1; i < firstPass.length; i += 2){
        const operator = firstPass[i];
        const nextValue = Number(firstPass[i + 1]);
        if (operator === "+"){
            result=add(result, nextValue);
        }else if (operator === "-"){
            result=subtract(result, nextValue);
        }
    }
    return result;
}

// Display result

function calculateResult(){
    const expression = display.value.trim();
    if (expression === "") {
        return;
    }
    try{
        const result=evaluateExpression(expression);

        // Prevent Infinity and NaN from being displayed

        if (!Number.isFinite(result)){
            throw new Error("Invalid result");
        }
        display.value=result;
    }catch (error){
        alert(error.message);
    }
}
calculatorButtons.forEach(function (button){
    button.addEventListener("click", function (){
        const value = button.dataset.value;
        // If the button contains a number,decimal point or operator, add it to display.
        if(value !== undefined){
            display.value += value;
        }
    });
});

// Clear Button

clearButton.addEventListener("click", function(){
    display.value = "";
});

// Delete / Backspace Button

deleteButton.addEventListener("click", function(){
    display.value=display.value.slice(0, -1);
});

// Equal Button

equalsButton.addEventListener("click", function(){
    calculateResult();
});

// Keyboard Event Handling

document.addEventListener("keydown", function (event){
    const key = event.key;

    // Allowed number keys

    if(
        (key >= "0" && key <= "9") ||
        key === "."
    ){
        event.preventDefault();
        display.value += key;
        return;
    }

    // Allowed operators

    if ("+-*/%".includes(key)){
        event.preventDefault();
        display.value += key;
        return;
    }

    // Backspace

    if (key === "Backspace"){
        event.preventDefault();
        display.value=display.value.slice(0, -1);
        return;
    }

    // Enter / = key

    if (key === "Enter" || key === "="){
        event.preventDefault();
        calculateResult();
        return;
    }

    // Escape clears the calculator

    if(key === "Escape"){
        event.preventDefault();
        display.value = "";
        return;
    }

    // Any other key is invalid

    event.preventDefault();
    alert("Invalid key! Please use numbers, +, -, *, /, %, Backspace or Enter.");
});