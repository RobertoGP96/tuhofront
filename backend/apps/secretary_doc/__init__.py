from .apps import SecretaryDocConfig


default_app_config = 'apps.secretary_doc.apps.SecretaryDocConfig'

# Use lazy imports to avoid circular imports
import sys
import types

# Create a module-level __getattr__ function for lazy loading
# This will be called when an attribute is not found in the module
def __getattr__(name):
    if name in ['SecretaryDocProcedure', 'SeguimientoTramite', 'Documento', 'Tramite']:
        from .models import (
            SecretaryDocProcedure,
            SeguimientoTramite,
            Documento
        )
        
        # Add the imported names to the module's globals
        globals()['SecretaryDocProcedure'] = SecretaryDocProcedure
        globals()['SeguimientoTramite'] = SeguimientoTramite
        globals()['Documento'] = Documento
        globals()['Tramite'] = SecretaryDocProcedure  # For backward compatibility
        
        return globals()[name]
    
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")