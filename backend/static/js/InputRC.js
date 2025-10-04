
var email = document.getElementById("email");
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
          email.value = email.value.trim();
        }

const c = (e)=>{
        let validador = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
        if(email.value == ""){
            errorContainer.innerHTML = createMessage("Campo 'Email' inválido")
            e.preventDefault()
        }
        if (!validador.test(email.value)) {
            errorContainer.innerHTML = createMessage("No es un correo válido")
            e.preventDefault()   
          }
        }
        
        email.addEventListener("input",validate_space_trim);
        boton.addEventListener("click", c, false)
           




