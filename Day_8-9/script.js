
// 1. VARIABLES


function showVariables() {

    let studentName = "Rahul";
    let age = 20;

    const college = "GCOE";

    document.getElementById("variableOutput").innerHTML =
        "Name: " + studentName +
        "<br>Age: " + age +
        "<br>College: " + college;
}




// 2. DATA TYPES

function showDataTypes() {

    let name = "Rahul";              
    let age = 20;                      
    let isStudent = true;            

    let subjects = [
        "JavaScript",
        "HTML",
        "CSS"
    ];                               

    let student = {
        name: "Rahul",
        age: 20
    };                              


    document.getElementById("dataTypeOutput").innerHTML =

        "String: " + name +

        "<br>Number: " + age +

        "<br>Boolean: " + isStudent +

        "<br>Array: " + subjects +

        "<br>Object Name: " + student.name;
}




// 3. OPERATORS


function showOperators() {

    let a = 10;
    let b = 5;


    // Arithmetic Operators

    let addition = a + b;
    let subtraction = a - b;
    let multiplication = a * b;
    let division = a / b;
    let remainder = a % b;


    // Comparison Operator

    let greater = a > b;


    // Logical Operator

    let logical = a > 5 && b < 10;


    document.getElementById("operatorOutput").innerHTML =

        "Addition: " + addition +

        "<br>Subtraction: " + subtraction +

        "<br>Multiplication: " + multiplication +

        "<br>Division: " + division +

        "<br>Remainder: " + remainder +

        "<br>10 > 5: " + greater +

        "<br>Logical AND: " + logical;
}




// 4. CONDITIONS


function checkResult() {

    let marks =
        Number(document.getElementById("marks").value);


    if (marks >= 90) {

        document.getElementById("conditionOutput").innerHTML =
            "Grade A+";

    }

    else if (marks >= 75) {

        document.getElementById("conditionOutput").innerHTML =
            "Grade A";

    }

    else if (marks >= 60) {

        document.getElementById("conditionOutput").innerHTML =
            "Grade B";

    }

    else if (marks >= 40) {

        document.getElementById("conditionOutput").innerHTML =
            "Pass";

    }

    else {

        document.getElementById("conditionOutput").innerHTML =
            "Fail";

    }
}




// 5. LOOPS


function showLoop() {

    let result = "";


    // For Loop

    for (let i = 1; i <= 5; i++) {

        result += "Number: " + i + "<br>";

    }


    document.getElementById("loopOutput").innerHTML =
        result;
}




// 6. FUNCTIONS


function addNumbers() {

    let num1 =
        Number(document.getElementById("num1").value);

    let num2 =
        Number(document.getElementById("num2").value);


    let result = calculateSum(num1, num2);


    document.getElementById("functionOutput").innerHTML =
        "Result: " + result;
}



// Function with parameters

function calculateSum(a, b) {

    return a + b;

}