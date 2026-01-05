from rest_framework import serializers
from django.utils import timezone
from models.news import News


class NewsListSerializer(serializers.ModelSerializer):
    """
    Serializer for news list view.
    Provides summary information for listing pages.
    """
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    tag_list = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()
    read_time = serializers.SerializerMethodField()
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'header_image',
            'summary',
            'author_name',
            'publication_date',
            'featured',
            'tag_list',
            'is_new',
            'read_time',
            'created_at',
        ]
        read_only_fields = ['slug', 'created_at']
    
    def get_tag_list(self, obj):
        """Returns parsed tag list"""
        return obj.get_tag_list()
    
    def get_is_new(self, obj):
        """Checks if news is recent (less than 7 days old)"""
        if not obj.publication_date:
            return False
        days_diff = (timezone.now() - obj.publication_date).days
        return days_diff <= 7
    
    def get_read_time(self, obj):
        """Estimates reading time in minutes"""
        words = len(obj.body.split())
        # Average reading speed: 200 words per minute
        minutes = max(1, round(words / 200))
        return minutes


class NewsDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for news detail view.
    Includes all information and related news.
    """
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    tag_list = serializers.SerializerMethodField()
    related_news = serializers.SerializerMethodField()
    read_time = serializers.SerializerMethodField()
    absolute_url = serializers.CharField(source='get_absolute_url', read_only=True)
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'header_image',
            'summary',
            'body',
            'author_name',
            'author_email',
            'publication_date',
            'featured',
            'tag_list',
            'related_news',
            'read_time',
            'absolute_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_tag_list(self, obj):
        """Returns parsed tag list"""
        return obj.get_tag_list()
    
    def get_related_news(self, obj):
        """Returns related news"""
        related = obj.get_related_news(limit=4)
        return NewsListSerializer(related, many=True, context=self.context).data
    
    def get_read_time(self, obj):
        """Estimates reading time in minutes"""
        words = len(obj.body.split())
        minutes = max(1, round(words / 200))
        return minutes


class NewsCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating news.
    Includes validation logic.
    """
    
    class Meta:
        model = News
        fields = [
            'title',
            'category',
            'header_image',
            'summary',
            'body',
            'is_published',
            'publication_date',
            'featured',
            'tags',
        ]
    
    def validate_title(self, value):
        """Validate title is not empty and unique"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        
        # Check uniqueness for new instances or when title changes
        instance = self.instance
        if instance:
            if News.objects.filter(title=value).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError("A news item with this title already exists")
        else:
            if News.objects.filter(title=value).exists():
                raise serializers.ValidationError("A news item with this title already exists")
        
        return value.strip()
    
    def validate_body(self, value):
        """Validate body has minimum content"""
        if not value or len(value.strip()) < 50:
            raise serializers.ValidationError("Body must have at least 50 characters")
        return value.strip()
    
    def validate_summary(self, value):
        """Validate summary length"""
        if value and len(value) > 300:
            raise serializers.ValidationError("Summary cannot exceed 300 characters")
        return value.strip() if value else value
    
    def validate_tags(self, value):
        """Validate and clean tags"""
        if value:
            tags = [tag.strip() for tag in value.split(',') if tag.strip()]
            if len(tags) > 10:
                raise serializers.ValidationError("Maximum 10 tags allowed")
            return ', '.join(tags)
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        # If publishing, ensure required fields are present
        if attrs.get('is_published', False):
            if not attrs.get('summary'):
                raise serializers.ValidationError({
                    'summary': 'Summary is required for published news'
                })
            
            # Set publication date if not provided
            if not attrs.get('publication_date'):
                attrs['publication_date'] = timezone.now()
        
        return attrs
    
    def create(self, validated_data):
        """Create news and set author"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)

