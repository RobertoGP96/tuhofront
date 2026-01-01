from django.core.mail import EmailMultiAlternatives
from django.urls import reverse

def email_tramite_pregrado_nacional(tramite):
    # Datos del correo
    asunto = "Confirmación de Solicitud de Trámite" 
    # Contenido del correo en HTML Pregrado Nacional
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{asunto}</title>
    </head>
    <body>
        <p> Estimado usuario </p>
        <p> Nos complace informarle que su trámite ha sido creado exitosamente en nuestro sistema.</p>
        
            <p> Número de Seguimiento: <strong>{tramite.numero_seguimiento}</strong> </p>
            <p> Este número de seguimiento es único y le permitirá realizar un seguimiento de su trámite a través de nuestro portal. 
                Por favor, guárdelo para futuras consultas de su trámite.
            </p>
            <p> Nombre del Solicitante: <strong>{tramite.nombre}</strong> </p>
            <p> Correo Electrónico de Contacto: <strong>{tramite.email} </strong> </p>
            <p> Carnet de Identidad: <strong>{tramite.ci}</strong> </p>
            <p> Número de Móvil: <strong>{tramite.telefono}</strong> </p>

            <p> Detalles del Trámite</p>
            <p> Tipo de Trámite: <strong>{tramite.tipo_pren or tramite.legalizacion}</strong> </p>
            <p> Tipo de Estudio: <strong>{tramite.tipo_estudio}</strong> </p>
            <p> Uso: <strong>{tramite.uso}</strong> </p>
            <p> Organismo: <strong>{tramite.organismo }</strong> </p>
            <p> Motivo: <strong>{tramite.motivo}</strong> </p>
            <p> Funcionario: <strong>{tramite.funcionario}</strong> </p>
            <p> Carrera: <strong>{tramite.carrera}</strong> </p>
            <p> Año: <strong>{tramite.year}</strong> </p>
            <p> Fecha de Creación: <strong>{tramite.fecha.strftime('%d %B, %Y')}</strong> </p>
            <p> Estado del Trámite: <strong>{tramite.estado}</strong> </p>
        
        <p> Le agradecemos su preferencia y confianza en nuestros servicios. Nuestro equipo procesará su solicitud lo más pronto posible. 
            Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarnos.</p>
        <p> Atentamente,<br>
        El equipo de Secretaría Docente<br>
        Universidad de Holguín  </p>
    </body>
    </html>
    """

    # Configuración del correo
    from_email = 'secretariadocenteuho@gmail.com'
    to = [tramite.email]  # Asumiendo que tienes un campo para el correo electrónico del usuario

    # Envío del correo
    msg = EmailMultiAlternatives(asunto, '', from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def email_tramite_pregrado_internacional(tramite):
    # Datos del correo
    asunto = "Confirmación de Solicitud de Trámite" 
    # Contenido del correo en HTML Pregrado Nacional
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{asunto}</title>
    </head>
    <body>
        <p> Estimado usuario </p>
        <p> Nos complace informarle que su trámite ha sido creado exitosamente en nuestro sistema. </p>
        
            <p> Número de Seguimiento: <strong>{tramite.numero_seguimiento}</strong> </p>
            <p> Este número de seguimiento es único y le permitirá realizar un seguimiento de su trámite a través de nuestro portal. 
                Por favor, guárdelo para futuras consultas de su trámite.
            </p>
            <p> Nombre del Solicitante: <strong>{tramite.nombre}</strong> </p>
            <p> Correo Electrónico de Contacto: <strong>{tramite.email}</strong> </p>
            <p> Carnet de Identidad: <strong>{tramite.ci}</strong> </p>
            <p> Número de Móvil: <strong>{tramite.telefono}</strong> </p>
            
            <p> Detalles del Trámite</p>
            <p> Tipo de Trámite: <strong>{tramite.tipo_prei or tramite.legalizacion}</strong> </p>
            <p> Tipo de Estudio: <strong>{tramite.tipo_estudio}</strong> </p>
            <p> Uso: <strong>{tramite.uso_i}</strong> </p>
            <p> Intereses: <strong>{tramite.intereses}</strong> </p>
            <p> Fecha de Creación: <strong>{tramite.fecha.strftime('%d %B, %Y')}</strong> </p>
            <p> Estado del Trámite: <strong>{tramite.estado}</strong> </p>

        <p> Para más información sobre el trámite le recomendamos que revise la plataforma </p>
        
        <p> Le agradecemos su preferencia y confianza en nuestros servicios. Nuestro equipo procesará su solicitud lo más pronto posible. 
            Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarnos. </p>
        <p> Atentamente,<br>
        El equipo de Secretaría Docente<br>
        Universidad de Holguín </p>
    </body>
    </html>
    """

    # Configuración del correo
    from_email = 'secretariadocenteuho@gmail.com'
    to = [tramite.email]  # Asumiendo que tienes un campo para el correo electrónico del usuario

    # Envío del correo
    msg = EmailMultiAlternatives(asunto, '', from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()



def email_tramite_posgrado_nacional(tramite):
    # Datos del correo
    asunto = "Confirmación de Solicitud de Trámite"
    
    # Contenido del correo en HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{asunto}</title>
    </head>
    <body>
        <p> Estimado usuario </p>
        <p> Nos complace informarle que su trámite ha sido creado exitosamente en nuestro sistema. </p>
        
            <p> Número de Seguimiento: <strong>{tramite.numero_seguimiento}</strong></p>
            
            <p> Este número de seguimiento es único y le permitirá realizar un seguimiento de su trámite a través de nuestro portal. 
                <br>
            Por favor, guárdelo para futuras consultas. </p>

            <p> Nombre del Solicitante: <strong>{tramite.nombre}</strong></p>
            <p> Correo Electrónico de Contacto: <strong>{tramite.email}</strong></p>
            <p> Carnet de Identidad: <strong>{tramite.ci}</strong></p>
            <p> Número de Móvil: <strong>{tramite.telefono}</strong></p>
            
            <p> Detalles del Trámite</p>
            <p> Tipo de Trámite: <strong>{tramite.tipo_posn or tramite.legalizacion}</strong></p>
            <p> Tipo de Estudio: <strong>{tramite.tipo_est}</strong></p>
            <p> Uso: <strong>{tramite.uso}</strong></p>
            <p> Organismo: <strong>{tramite.organismo}</strong></p>
            <p> Motivo: <strong>{tramite.motivo}</strong></p>
            <p> Funcionario: <strong>{tramite.funcionario}</strong></p>
            <p> Año: <strong>{tramite.year}</strong> </p>
            <p> Programa Académico: <strong>{tramite.programa_academico}</strong></p>
            <p> Nombre del Programa: <strong>{tramite.nombre_programa}</strong></p>

            <p> Fecha de Creación: <strong>{ tramite.fecha.strftime('%d %B, %Y') }</strong></p>
            <p> Estado del Trámite: <strong>{ tramite.estado }</strong> </p>
        <p> Para más información sobre el trámite le recomendamos que revise la plataforma</p>

        <p> Le agradecemos su preferencia y confianza en nuestros servicios. Nuestro equipo procesará su solicitud lo más pronto posible. 
            Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarnos.</p>
        <p> Atentamente,<br>
        El equipo de Secretaría Docente<br>
        Universidad de Holguín  </p>
    </body>
    </html>
    """

    # Configuración del correo
    from_email = 'secretariadocenteuho@gmail.com'
    to = [tramite.email]  # Asumiendo que tienes un campo para el correo electrónico del usuario

    # Envío del correo
    msg = EmailMultiAlternatives(asunto, '', from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
 

def email_tramite_posgrado_internacional(tramite):
    # Datos del correo
    asunto = "Confirmación de Solicitud de Trámite"
    
    # Contenido del correo en HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{asunto}</title>
    </head>
    <body>
        <p> Estimado usuario </p>
        <p> Nos complace informarle que su trámite ha sido creado exitosamente en nuestro sistema.</p>
        
            <p> Número de Seguimiento: <strong>{tramite.numero_seguimiento}</strong> </p>
            <p> <i> Este número de seguimiento es único y le permitirá realizar un seguimiento de su trámite a través de nuestro portal. 
                <br>
                Por favor, guárdelo para futuras consultas. </i> </p>
            <p> Nombre del Solicitante: <strong>{tramite.nombre}</strong> </p>
            <p> Correo Electrónico de Contacto: <strong>{tramite.email}</strong> </p>
            <p> Carnet de Identidad: <strong>{tramite.ci}</strong> </p>
            <p> Número de Móvil: <strong>{tramite.telefono}</strong> </p>
            
            <p> Detalles del Trámite</p>
            <p> Tipo de Trámite: <strong>{tramite.tipo_posi or tramite.legalizacion}</strong> </p>
            <p> Tipo de Estudio: <strong>{tramite.tipo_est}</strong> </p>
            <p> Uso: <strong>{tramite.uso_i }</strong> </p>
            <p> Intereses: <strong>{tramite.intereses}</strong> </p>

            <p> Funcionario: <strong>{tramite.funcionario}</strong> </p>
            <p> Año: <strong>{tramite.year}</strong> </p>
            <p> Programa Académico: <strong>{tramite.programa_academico}</strong> </p>
            <p> Nombre del Programa: <strong>{tramite.nombre_programa}</strong> </p>

            <p> Fecha de Creación: <strong>{tramite.fecha.strftime('%d %B, %Y')}</strong> </p>
            <p> Estado del Trámite: <strong>{tramite.estado}</strong> </p>

        <p> Para más información sobre el trámite le recomendamos que revise la plataforma</p>

        <p> Le agradecemos su preferencia y confianza en nuestros servicios. Nuestro equipo procesará su solicitud lo más pronto posible. 
            Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarnos.</p>
        <p> Atentamente,<br>
        El equipo de Secretaría Docente<br>
        Universidad de Holguín</p>
    </body>
    </html>
    """

    # Configuración del correo
    from_email = 'secretariadocenteuho@gmail.com'
    to = [tramite.email]  # Asumiendo que tienes un campo para el correo electrónico del usuario

    # Envío del correo
    msg = EmailMultiAlternatives(asunto, '', from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()

 
 #Cambios de Estados de los Trámites
 
def enviar_correo_cambio_estado(tramite):
    # Configuración del correo
    asunto = f"Cambio de Estado de su Trámite"
    
    # Contenido del correo en HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{asunto}</title>
    </head>
    <body>
        <p> Estimado/a {tramite.nombre},  </p>
        <p> Queremos informarle que su trámite con número de seguimiento {tramite.numero_seguimiento} ha cambiado de estado a {tramite.estado}. </p>

        <p> Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarnos. </p>
        <p> Atentamente, </p>
        <p> El equipo de Secretaría Docente </p>
        <p> Universidad de Holguín </p>
    </body>
    </html>
    """
    
    # Configuración del correo
    from_email = 'secretariadocenteuho@gmail.com'
    to = [tramite.email]
    
    # Envío del correo
    msg = EmailMultiAlternatives(asunto, '', from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()


#Correo de eliminacion de tramite 

def correo_eliminacion_tramite(tramite, request):
    # Configuración del correo
    asunto = "Solicitud de Eliminación de Trámite"
    
    # Contenido del correo en HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{asunto}</title>
    </head>
    <body>
        <p> Estimado/a {tramite.nombre}, </p>
        <p> Hemos recibido su solicitud para eliminar el trámite con número de seguimiento <strong>{tramite.numero_seguimiento}</strong>. </p>
        <p> Su trámite ha sido eliminado exitosamente </p>
        <p> Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarnos. </p>
        <p> Atentamente, </p>
        <p> El equipo de Secretaría Docente<br>
        Universidad de Holguín </p>
    </body>
    </html>
    """

    # Configuración del correo
    from_email = 'secretariadocenteuho@gmail.com'
    to = [tramite.email]

    # Envío del correo
    msg = EmailMultiAlternatives(asunto, '', from_email, to)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
