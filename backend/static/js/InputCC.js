var password1 = document.getElementById("password1");
var password2 = document.getElementById("password2");
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
          password1.value = password1.value.trim();
          password2.value = password2.value.trim();
        }

const c = (e)=>{
        if(password1.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Contraseña' inválido")
            e.preventDefault()
        }
        if(password2.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Repetir Contraseña' inválido")
            e.preventDefault()
        }
        if(password1.value == "" || password2.value == ""   ){
            errorContainer.innerHTML = createMessage("Campos inválidos")
            e.preventDefault()
        }
        }
        
        password1.addEventListener("input",validate_space_trim);
        password2.addEventListener("input",validate_space_trim);
        boton.addEventListener("click", c, false)
           




