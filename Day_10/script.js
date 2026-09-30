// 1. OBJECTS

function showObject() {

    let student = {

        name: "Rahul",

        age: 20,

        course: "JavaScript",

        city: "Nanded"

    };


    document.getElementById("objectOutput").innerHTML =

        "Name: " + student.name +

        "<br>Age: " + student.age +

        "<br>Course: " + student.course +

        "<br>City: " + student.city;
}



// 2. OBJECT METHODS

let person = {

    name: "Rahul",

    age: 20,

    greet: function() {

        return "Hello " + this.name;

    }

};


function showMethod() {

    let message = person.greet();

    document.getElementById("methodOutput").innerHTML =
        message;
}



// 3. CLASS

class Student {

    constructor(name, age, course) {

        this.name = name;

        this.age = age;

        this.course = course;

    }


    introduce() {

        return (
            "My name is " +
            this.name +
            ". I am " +
            this.age +
            " years old and I am learning " +
            this.course
        );

    }

}


function showClass() {

    let student1 =
        new Student(
            "Amit",
            21,
            "JavaScript"
        );


    document.getElementById("classOutput").innerHTML =
        student1.introduce();

}



// 4. ARRAY METHODS

function showArrayMethods() {

    let numbers = [10, 20, 30, 40];


    

    numbers.push(50);


  

    numbers.pop();


    

    let doubled = numbers.map(
        function(number) {

            return number * 2;

        }
    );


    

    let greaterThan20 =
        numbers.filter(
            function(number) {

                return number > 20;

            }
        );


    document.getElementById("arrayOutput").innerHTML =

        "Original Array: " +
        numbers +

        "<br>Doubled: " +
        doubled +

        "<br>Greater than 20: " +
        greaterThan20;

}



// 5. STRING METHODS

function showStringMethods() {

    let text = "JavaScript";


    let upper =
        text.toUpperCase();


    let lower =
        text.toLowerCase();


    let length =
        text.length;


    let part =
        text.slice(0, 4);


    document.getElementById("stringOutput").innerHTML =

        "Original: " + text +

        "<br>Uppercase: " + upper +

        "<br>Lowercase: " + lower +

        "<br>Length: " + length +

        "<br>First 4 characters: " + part;

}



// 6. DOM MANIPULATION

function changeText() {

    document.getElementById("domText").innerText =
        "Hello JavaScript!";

}


function changeColor() {

    document.getElementById("domText").style.color =
        "red";

}




// 7. CLICK EVENT


document
    .getElementById("eventButton")
    .addEventListener(
        "click",

        function() {

            document.getElementById(
                "eventOutput"
            ).innerText =
                "Button was clicked!";

        }
    );




// 8. MOUSE EVENTS


let box =
    document.getElementById("box");


box.addEventListener(
    "mouseover",

    function() {

        document.getElementById(
            "mouseOutput"
        ).innerText =
            "Mouse entered the box.";

    }
);


box.addEventListener(
    "mouseout",

    function() {

        document.getElementById(
            "mouseOutput"
        ).innerText =
            "Mouse left the box.";

    }
);




// 9. KEYBOARD EVENT


document
    .getElementById("keyboardInput")
    .addEventListener(
        "keyup",

        function() {

            let value =
                this.value;

            document.getElementById(
                "keyboardOutput"
            ).innerText =
                "You typed: " + value;

        }
    );




// 10. FORM EVENT


document
    .getElementById("myForm")
    .addEventListener(
        "submit",

        function(event) {

          

            event.preventDefault();


            let name =
                document.getElementById(
                    "studentName"
                ).value;


            document.getElementById(
                "formOutput"
            ).innerText =
                "Welcome " + name;

        }
    );




// 11. LOCAL STORAGE


function saveData() {

    let data =
        document.getElementById(
            "storageInput"
        ).value;


    localStorage.setItem(
        "studentData",
        data
    );


    document.getElementById(
        "storageOutput"
    ).innerText =
        "Data saved successfully.";

}


function getData() {

    let data =
        localStorage.getItem(
            "studentData"
        );


    document.getElementById(
        "storageOutput"
    ).innerText =
        "Stored Data: " + data;

}


function removeData() {

    localStorage.removeItem(
        "studentData"
    );


    document.getElementById(
        "storageOutput"
    ).innerText =
        "Data removed.";

}