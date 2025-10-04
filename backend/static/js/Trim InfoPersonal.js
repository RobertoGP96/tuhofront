var apellido = document.getElementById("inputLastName");
var ci = document.getElementById("inputCi");
var nombre = document.getElementById("inputName");
var tel = document.getElementById("inputNt");
var email = document.getElementById("inputEmail");
var text = document.getElementById("inputText")
var boton =  document.getElementById("boton");




  const validate_space_trim = () => {
    nombre.value = nombre.value.trim();
    email.value = email.value.trim();
    ci.value = ci.value.trim();
    tel.value = tel.value.trim();
  }
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
        if(nombre.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Nombre' inválido")
          e.preventDefault()
        }
        if(apellido.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Apellidos' inválido")
          e.preventDefault()
        }
        if (!validador.test(email.value)) {
          errorContainer.innerHTML = createMessage("No es un correo válido")
          e.preventDefault()   
        }
        if(email.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Email' inválido")
          e.preventDefault()
        }
        if(ci.value.length != 11 || isNaN(ci.value)){
          errorContainer.innerHTML = createMessage("No es un número carnet válido")
          e.preventDefault()
        }
        if(ci.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Número de Carnet' inválido")
          e.preventDefault()
        }
        if(tel.value.length != 8 || isNaN(tel.value)){
          errorContainer.innerHTML = createMessage("No es un número de teléfono válido")
          e.preventDefault()
        }
        if(tel.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Teléfono' inválido")
          e.preventDefault()
        }
        if(text.value == ""){
          errorContainer.innerHTML = createMessage("Campo 'Dirección' inválido")
          e.preventDefault()
        }
        if(nombre.value == "" || apellido.value == "" || email.value == "" || ci.value == "" || tel.value == "" || text.value == ""){
          errorContainer.innerHTML = createMessage("Campos inválido")
          e.preventDefault()
        }
        }
nombre.addEventListener("input",validate_space_trim);
email.addEventListener("input",validate_space_trim);
ci.addEventListener("input",validate_space_trim);
tel.addEventListener("input",validate_space_trim);
boton.addEventListener("click", c, false)