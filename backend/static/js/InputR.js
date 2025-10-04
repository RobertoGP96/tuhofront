var username = document.getElementById("username");
var password1 = document.getElementById("password1");
var password2 = document.getElementById("password2");
var email = document.getElementById("email");
var boton =  document.getElementById("boton");

const errorContainer = document.querySelector("#error-container")
        const createMessage = (message) => {
            return `
            <div style="height:40px; position: absolute; right: 20px; top:10px; display: flex; align-items: center; padding-right: 0rem;margin-left:20px"
            class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
                <button style="font-size: 10px; border-bottom: none; position: relative; box-shadow: none;" type="button"
                    class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </button>
            </div>
            `
        }
        const validate_space_trim = () => {
            username.value = username.value.trim();
            email.value = email.value.trim();
            password1.value = password1.value.trim();
            password2.value = password2.value.trim();
          }

const c = (e)=>{
        let validador = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
        if(username.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Nombre' inválido")
            e.preventDefault()
        }
        if(email.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Email' inválido")
            e.preventDefault()
        }
        if (!validador.test(email.value)) {
          errorContainer.innerHTML = createMessage("No es un correo válido")
          e.preventDefault()   
        }
        if(password1.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Contraseña' inválido")
            e.preventDefault()
        }
        if(username.value == "" || email.value == "" || password1.value == "" || password2.value ==""){
            errorContainer.innerHTML = createMessage("Campos  inválidos")
            e.preventDefault()
        }
        }
        username.addEventListener("input",validate_space_trim);
        email.addEventListener("input",validate_space_trim);
        password1.addEventListener("input",validate_space_trim);
        password2.addEventListener("input",validate_space_trim);
        boton.addEventListener("click", c, false)
           




