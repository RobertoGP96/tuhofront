var username = document.getElementById("username");
var password = document.getElementById("password");
var boton =  document.getElementById("boton");

const errorContainer = document.querySelector("#error-container")
        const createMessage = (message) => {
            return `
            <div style="height:40px; position: absolute; right: 20px; top: 40px; display: flex; align-items: center; padding-right: 0rem;"
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
          password.value = password.value.trim();
        }

const c = (e)=>{
        if(username.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Nombre' inválido")
            e.preventDefault()
        }
        if(password.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Contraseña' inválido")
            e.preventDefault()
        }
        
        if(username.value == "" || password.value == ""   ){
            errorContainer.innerHTML = createMessage("Campos  inválidos")
            e.preventDefault()
        }
        }
        
        username.addEventListener("input",validate_space_trim);
        password.addEventListener("input",validate_space_trim);
        boton.addEventListener("click", c, false)
           




