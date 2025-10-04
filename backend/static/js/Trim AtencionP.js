var asunto = document.getElementById("asunto");
var text = document.getElementById("inputText")
var boton =  document.getElementById("boton");

const errorContainer = document.querySelector("#error-container")
        const createMessage = (message) => {
            return `
            <div class="alert alert-danger alert-dismissible fade show" role="alert"
            style="height:40px; position: fixed; right: 20px; top: 50px; display: flex; align-items: center; padding-right: 0rem;">
            ${message}
            <button style="font-size: 10px; border-bottom: none; position: relative; box-shadow: none;" type="button"
            class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </button>
            </div>
            `
        }
        
const c = (e)=>{
        let validador = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
        if(asunto.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Asunto' inválido")
          e.preventDefault()
        }
        if(text.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Dirección' inválido")
          e.preventDefault()
        }
        if(asunto.value == "" || text.value == ""){
          errorContainer.innerHTML = createMessage("Campos inválido")
          e.preventDefault()
        }
        }
boton.addEventListener("click", c, false)