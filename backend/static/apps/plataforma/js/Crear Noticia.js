var titulo = document.getElementById("inputTitulo")
var resumen = document.getElementById("inputResumen")
var contenido = document.getElementById("inputText")
var boton =  document.getElementById("boton");

const errorContainer = document.querySelector("#error-container")
        const createMessage = (message) => {
            return `
            <div style="position: absolute; right: 20px; top: 40px; display: flex; align-items: center; padding-right: 0rem; z-index: 2000"
            class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button style="font-size: 10px; border-bottom: none; position: relative; box-shadow: none;" type="button"
                class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </button>
            </div>
            `
        }
        const c = (e)=>{
            let mensaje = ""
            if(titulo.value == ""){
                titulo.style = "border:solid 2px red;"
                mensaje += `Campo 'Título' en blanco <br>`
                e.preventDefault()
            }else{ 
                titulo.style = "border:solid 2px green;"
            }
            if(resumen.value == ""){
                resumen.style = "border:solid 2px red;"
                mensaje += `Campo 'Resumen' en blanco <br>`
                e.preventDefault()
            }else{
                resumen.style = "border:solid 2px green;"
            }
            if(contenido.value == ""){
                contenido.style = "border:solid 2px red;"
                mensaje += `Campo 'Contenido' en blanco <br>`
                e.preventDefault()
            }else{
                contenido.style = "border:solid 2px green;"
            }
            if (mensaje) {
                errorContainer.innerHTML += createMessage(mensaje)
            }
        
            }
        
    boton.addEventListener("click", c, false)