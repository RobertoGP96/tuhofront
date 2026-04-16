from rest_framework import serializers

from .models import OfficialDocument


class OfficialDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    issued_to_name = serializers.SerializerMethodField()

    class Meta:
        model = OfficialDocument
        fields = (
            'id', 'title', 'doc_type', 'verification_code',
            'resource_type', 'resource_id',
            'file', 'file_url',
            'issued_by', 'issued_by_name', 'issued_to', 'issued_to_name',
            'created_at', 'expires_at', 'revoked', 'revoked_reason', 'revoked_at',
            'metadata',
        )
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def get_issued_by_name(self, obj):
        return obj.issued_by.get_full_name() if obj.issued_by else None

    def get_issued_to_name(self, obj):
        return obj.issued_to.get_full_name() if obj.issued_to else None
