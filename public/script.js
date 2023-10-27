


    //function to check the username//
        function validateUserName() {
            var usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{3,20}$/
            // var usernamePattern=/^[a-zA-Z](?:[a-zA-Z0-9_ ]{3,20}[a-zA-Z0-9_])?$/
            var name = document.getElementById("name").value;
            var msg = document.getElementById("nameCheck");
            if (usernamePattern.test(name)) {
            msg.innerHTML = "";
            } else {
            msg.innerHTML = "Username must be 3-20 characters starts with a letter and only letters, digits, spaces inside and underscore permitted";
            }
            }

    //function to check the email address//
        function validateUserEmail() {
            var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            var email = document.getElementById("email").value;
            var msg = document.getElementById("emailCheck");
            if (emailPattern.test(email)) {
                msg.innerHTML = "";
            } else {
                msg.innerHTML = "Invalid email address";
            }
            }
        
    // Function to validate the password
        function validatePassword() {
            var msg=document.getElementById("messagePwd")
            var password = document.getElementById("password").value;
            var regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@*&!#^%])[A-Za-z\d@*&!#^%]{8,}$/ // This regex allows only letters,numbers, '@', and underscores and requires at least 8 characters.
            if (regex.test(password)) {
                msg.innerHTML=""            
            } else {
                msg.innerHTML="Password is invalid. It should contain at least 8 character and must consist  of atleast one letters,numbers,and special character"
            }
            }

    //function to check the passwords are equal//
        function checkPasswordMatch() {
            var password = document.getElementById("password").value;
            var confirmPassword = document.getElementById("confirmPassword").value;
            var msg = document.getElementById("messagePwdMatch");           
            if (password === confirmPassword) {
            msg.innerHTML = "" // Clear the error message           
            } else {
            msg.innerHTML = "Passwords do not match. Please try again."            
            }
            }
    //function to validate brand name        
            // function validateBrandName() {
            //     // var usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{1,20}$/
            //     var usernamePattern=/^[a-zA-Z](?:[a-zA-Z0-9_ ]{1,20}[a-zA-Z0-9_])?$/
            //     var name = document.getElementById("name").value;
            //     var msg = document.getElementById("nameCheck");
            //     if (usernamePattern.test(name)) {
            //     msg.innerHTML = "";
            //     } else {
            //     msg.innerHTML = "Brand name must be 1-20 characters starts with a letter and only letters, digits, spaces inside and underscore permitted";
            //     }
            //     }

 