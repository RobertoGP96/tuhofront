import sys

# Import the models directly
from .procedure import SecretaryDocProcedure
from .seguimiento import SeguimientoTramite
from .documento import Documento

# For backward compatibility
Tramite = SecretaryDocProcedure

# Define __all__ to explicitly export the models
__all__ = [
    'SecretaryDocProcedure',
    'SeguimientoTramite',
    'Documento',
    'Tramite'  # Backward compatibility
]
