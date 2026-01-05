from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q

from platform.models.news import News
from platform.serializers.news import (
    NewsListSerializer,
    NewsDetailSerializer,
    NewsCreateUpdateSerializer
)


class NewsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for News model with CRUD operations and custom actions.
    
    List: GET /api/news/
    Retrieve: GET /api/news/{slug}/
    Create: POST /api/news/
    Update: PUT/PATCH /api/news/{slug}/
    Delete: DELETE /api/news/{slug}/
    
    Custom actions:
    - featured: GET /api/news/featured/
    - by_category: GET /api/news/by_category/?category=GENERAL
    - by_tag: GET /api/news/by_tag/?tag=important
    - publish: POST /api/news/{slug}/publish/
    - unpublish: POST /api/news/{slug}/unpublish/
    - search: GET /api/news/search/?q=query
    """
    
    queryset = News.objects.select_related('author').all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'featured', 'is_published']
    search_fields = ['title', 'summary', 'body', 'tags']
    ordering_fields = ['publication_date', 'created_at', 'title']
    ordering = ['-publication_date']
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions.
        Non-authenticated users only see published news.
        """
        queryset = super().get_queryset()
        
        # If user is not authenticated or not staff, show only published news
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = News.published.all()
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return NewsListSerializer
        elif self.action == 'retrieve':
            return NewsDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return NewsCreateUpdateSerializer
        return NewsDetailSerializer
    
    def perform_create(self, serializer):
        """Set author when creating news"""
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def featured(self, request):
        """
        Get featured published news.
        GET /api/news/featured/?limit=5
        """
        limit = int(request.query_params.get('limit', 5))
        featured_news = News.get_featured(limit=limit)
        serializer = NewsListSerializer(featured_news, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def by_category(self, request):
        """
        Get news by category.
        GET /api/news/by_category/?category=GENERAL
        """
        category = request.query_params.get('category')
        if not category:
            return Response(
                {'error': 'Category parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        news = News.search_by_category(category)
        
        # Pagination
        page = self.paginate_queryset(news)
        if page is not None:
            serializer = NewsListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = NewsListSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def by_tag(self, request):
        """
        Get news by tag.
        GET /api/news/by_tag/?tag=important
        """
        tag = request.query_params.get('tag')
        if not tag:
            return Response(
                {'error': 'Tag parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        news = News.search_by_tag(tag)
        
        # Pagination
        page = self.paginate_queryset(news)
        if page is not None:
            serializer = NewsListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = NewsListSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request, slug=None):
        """
        Publish a news item.
        POST /api/news/{slug}/publish/
        """
        news = self.get_object()
        
        if not news.can_be_published:
            return Response(
                {'error': 'News cannot be published. Ensure title and body are filled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        news.is_published = True
        if not news.publication_date:
            news.publication_date = timezone.now()
        news.save()
        
        serializer = NewsDetailSerializer(news, context={'request': request})
        return Response({
            'message': 'News published successfully',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unpublish(self, request, slug=None):
        """
        Unpublish a news item.
        POST /api/news/{slug}/unpublish/
        """
        news = self.get_object()
        news.is_published = False
        news.save()
        
        serializer = NewsDetailSerializer(news, context={'request': request})
        return Response({
            'message': 'News unpublished successfully',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[])
    def search(self, request):
        """
        Advanced search for news.
        GET /api/news/search/?q=query&category=GENERAL&from_date=2024-01-01
        """
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        # Start with published news
        news = News.published.all()
        
        # Apply text search
        if query:
            news = news.filter(
                Q(title__icontains=query) |
                Q(summary__icontains=query) |
                Q(body__icontains=query) |
                Q(tags__icontains=query)
            )
        
        # Apply category filter
        if category:
            news = news.filter(category=category)
        
        # Apply date filters
        if from_date:
            news = news.filter(publication_date__gte=from_date)
        if to_date:
            news = news.filter(publication_date__lte=to_date)
        
        # Order by relevance (most recent first)
        news = news.order_by('-publication_date')
        
        # Pagination
        page = self.paginate_queryset(news)
        if page is not None:
            serializer = NewsListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = NewsListSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)