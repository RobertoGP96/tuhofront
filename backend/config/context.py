# Context Processors
from apps.platform.models.user import User
def groups_processor(request) -> dict:
    if request.user.is_authenticated:
        grupos = User.objects.get(id=request.user.id).groups.all()
        return { 'grupos': [e.name for e in grupos] }
    return {}

