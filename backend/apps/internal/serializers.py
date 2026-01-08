from rest_framework import serializers
from .models import (
    Guest, FeedingDays, FeedingProcedure, AccommodationProcedure,
    TransportProcedureType, TransportProcedure, MaintanceProcedureType,
    MaintancePriority, MaintanceProcedure
)
from apps.platform.models import Department, Area, Note

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = '__all__'

class FeedingDaysSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedingDays
        fields = '__all__'
        
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'
        
class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'
        
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'

class FeedingProcedureSerializer(serializers.ModelSerializer):
    feeding_days = FeedingDaysSerializer(many=True)  # Relación ManyToMany
    username = serializers.CharField(source='user.username', read_only=True)  # Obtener el nombre del usuario
    notes = NoteSerializer(many=True, required=False)

    class Meta:
        model = FeedingProcedure
        fields = '__all__'
        extra_fields = ['username']

    def create(self, validated_data):
        feeding_days_data = validated_data.pop('feeding_days', [])
        feeding_procedure = FeedingProcedure.objects.create(**validated_data)
        for day_data in feeding_days_data:
            day, created = FeedingDays.objects.get_or_create(**day_data)
            feeding_procedure.feeding_days.add(day)
        return feeding_procedure

    def update(self, instance, validated_data):
        # Manejar los datos de feeding_days
        feeding_days_data = validated_data.pop('feeding_days', [])
        if feeding_days_data:
            instance.feeding_days.clear()
            for day_data in feeding_days_data:
                day, created = FeedingDays.objects.get_or_create(**day_data)
                instance.feeding_days.add(day)

        # Manejar los datos de notes
        notes_data = validated_data.pop('notes', [])
        if notes_data:
            for note_data in notes_data:
                note = Note.objects.create(**note_data)
                instance.notes.add(note)

        # Actualizar los campos restantes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class AccommodationProcedureSerializer(serializers.ModelSerializer):
    guests = GuestSerializer(many=True)  # Relación ManyToMany
    feeding_days = FeedingDaysSerializer(many=True)  # Relación ManyToMany
    username = serializers.CharField(source='user.username', read_only=True)
    notes = NoteSerializer(many=True, required=False)

    class Meta:
        model = AccommodationProcedure
        fields = '__all__'
        extra_fields = ['username']

    def create(self, validated_data):
        guests_data = validated_data.pop('guests', [])
        feeding_days_data = validated_data.pop('feeding_days', [])
        accommodation_procedure = AccommodationProcedure.objects.create(**validated_data)
        for guest_data in guests_data:
            guest, created = Guest.objects.get_or_create(**guest_data)
            accommodation_procedure.guests.add(guest)
        for day_data in feeding_days_data:
            day, created = FeedingDays.objects.get_or_create(**day_data)
            accommodation_procedure.feeding_days.add(day)
        return accommodation_procedure

    def update(self, instance, validated_data):
        guests_data = validated_data.pop('guests', [])
        feeding_days_data = validated_data.pop('feeding_days', [])
        if guests_data:
            instance.guests.clear()
            for guest_data in guests_data:
                guest, created = Guest.objects.get_or_create(**guest_data)
                instance.guests.add(guest)
        if feeding_days_data:
            instance.feeding_days.clear()
            for day_data in feeding_days_data:
                day, created = FeedingDays.objects.get_or_create(**day_data)
                instance.feeding_days.add(day)
                
        # Manejar los datos de notes
        notes_data = validated_data.pop('notes', [])
        if notes_data:
            for note_data in notes_data:
                note = Note.objects.create(**note_data)
                instance.notes.add(note)
                
        # Actualizar los campos restantes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
                
        return instance

class TransportProcedureTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportProcedureType
        fields = '__all__'

class TransportProcedureSerializer(serializers.ModelSerializer):
    procedure_type = serializers.PrimaryKeyRelatedField(queryset=TransportProcedureType.objects.all())  # Relación ForeignKey
    username = serializers.CharField(source='user.username', read_only=True)  # Obtener el nombre del usuario
    notes = NoteSerializer(many=True, required=False)

    class Meta:
        model = TransportProcedure
        fields = '__all__'
        extra_fields = ['username']
        
    def update(self, instance, validated_data):
        # Manejar los datos de notes
        notes_data = validated_data.pop('notes', [])
        if notes_data:
            for note_data in notes_data:
                note = Note.objects.create(**note_data)
                instance.notes.add(note)
                
        # Actualizar los campos restantes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
                
        return instance

class MaintanceProcedureTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintanceProcedureType
        fields = '__all__'

class MaintancePrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintancePriority
        fields = '__all__'

class MaintanceProcedureSerializer(serializers.ModelSerializer):
    procedure_type = serializers.PrimaryKeyRelatedField(queryset=MaintanceProcedureType.objects.all())  # Relación ForeignKey
    priority = serializers.PrimaryKeyRelatedField(queryset=MaintancePriority.objects.all())  # Relación ForeignKey
    username = serializers.CharField(source='user.username', read_only=True)  # Obtener el nombre del usuario
    notes = NoteSerializer(many=True, required=False)

    class Meta:
        model = MaintanceProcedure
        fields = '__all__'
        extra_fields = ['username']
        
    def update(self, instance, validated_data):
        # Manejar los datos de notes
        notes_data = validated_data.pop('notes', [])
        if notes_data:
            for note_data in notes_data:
                note = Note.objects.create(**note_data)
                instance.notes.add(note)
                
        # Actualizar los campos restantes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
                
        return instance
