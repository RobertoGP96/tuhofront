# Context Processors
from usuarios.models import Usuario
def groups_processor(request) -> dict:
    if request.user.is_authenticated:
        grupos = Usuario.objects.get(id=request.user.id).groups.all()
        return { 'grupos': [e.name for e in grupos] }
    return {}

