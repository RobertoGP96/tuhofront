var username = document.getElementById("username");
var password1 = document.getElementById("password1");
var password2 = document.getElementById("password2");
var email = document.getElementById("email");
var boton =  document.getElementById("boton");


  const validate_space_trim = () => {
    username.value = username.value.trim();
    password1.value = password1.value.trim();
    password2.value = password2.value.trim();
    email.value = email.value.trim();
  }

username.addEventListener("input",validate_space_trim);
password1.addEventListener("input",validate_space_trim);
password2.addEventListener("input",validate_space_trim);
email.addEventListener("input",validate_space_trim);
boton.addEventListener("click", c, false)