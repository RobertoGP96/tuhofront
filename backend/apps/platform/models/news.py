import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.db.models import Q
from django.urls import reverse

from apps.platform.enums import NewsCategoryEnum
from apps.platform.validators import validate_file_size
from apps.platform.models.base_models import StatusMixin
from .base_models import TimeStampedModel


def get_news_upload_path(instance, filename):
    """
    Generates upload path for news images.
    Format: news/YYYYMMDD_HHMMSS_slug.ext
    """
    import os
    from datetime import datetime

    ext = os.path.splitext(filename)[1]
    slug_part = slugify(instance.title) if instance.title else "news"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"news/{timestamp}_{slug_part}{ext}"


class PublishedNewsManager(models.Manager):
    """Manager for published and active news only"""

    def get_queryset(self):
        from django.utils import timezone

        return (
            super()
            .get_queryset()
            .filter(
                is_published=True, is_active=True, publication_date__lte=timezone.now()
            )
        )

    def featured(self):
        """Returns only featured published news"""
        return self.get_queryset().filter(featured=True)


class News(TimeStampedModel, StatusMixin):
    """
    Improved model for university system news.

    Manages news and announcements published on the platform,
    with support for images, categorization, and scheduled publishing.
    """

    title = models.CharField(
        max_length=255,
        verbose_name=_("Title"),
        help_text=_("News title (maximum 255 characters)"),
    )

    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        verbose_name=_("Friendly URL"),
        help_text=_("Friendly URL automatically generated from title"),
    )

    category = models.CharField(
        max_length=20,
        choices=[
            ("GENERAL", _("General")),
            ("ACADEMIC", _("Académica")),
            ("MANAGEMENT", _("Administrativa")),
            ("STUDENT", _("Estudiantil")),
            ("CULTURAL", _("Cultural")),
            ("SPORTS", _("Deportiva")),
            ("RESEARCH", _("Investigación")),
            ("EXTENSION", _("Extensión Universitaria")),
        ],
        default="GENERAL",
        verbose_name=_("Category"),
        help_text=_("News category"),
    )

    header_image = models.ImageField(
        upload_to=get_news_upload_path,
        blank=True,
        null=True,
        validators=[validate_file_size],
        verbose_name=_("Header image"),
        help_text=_("Main news image (optional)"),
    )

    summary = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        verbose_name=_("Summary"),
        help_text=_("Brief news summary (maximum 300 characters)"),
    )

    body = models.TextField(verbose_name=_("Content"), help_text=_("Full news content"))

    author = models.ForeignKey(
        "platform.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_news",
        verbose_name=_("Author"),
        help_text=_("User who created the news"),
    )

    is_published = models.BooleanField(
        default=False,
        verbose_name=_("Published"),
        help_text=_("Indicates if the news is published"),
    )

    publication_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Publication date"),
        help_text=_("Scheduled date to publish the news"),
    )

    featured = models.BooleanField(
        default=False,
        verbose_name=_("Featured"),
        help_text=_("Indicates if the news should appear as featured"),
    )

    tags = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Tags"),
        help_text=_("Comma-separated tags to facilitate searches"),
    )

    # Managers
    objects = models.Manager()
    published = PublishedNewsManager()

    class Meta:
        verbose_name = _("News")
        verbose_name_plural = _("News")
        ordering = ["-publication_date", "-created_at"]
        indexes = [
            models.Index(fields=["is_published", "publication_date", "featured"]),
            models.Index(fields=["category", "is_published"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["author"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(title__isnull=False) & ~Q(title=""), name="news_title_not_empty"
            ),
            models.CheckConstraint(
                check=Q(body__isnull=False) & ~Q(body=""), name="news_body_not_empty"
            ),
        ]

    def clean(self):
        """Custom validations"""
        super().clean()

        # Validate that if published, it has a publication date
        if self.is_published and not self.publication_date:
            from django.utils import timezone

            self.publication_date = timezone.now()

        # Validate publication date is not too old
        if self.publication_date:
            from django.utils import timezone
            from datetime import timedelta

            five_years_ago = timezone.now() - timedelta(days=365 * 5)
            if self.publication_date < five_years_ago:
                raise ValidationError(
                    {
                        "publication_date": _(
                            "Publication date cannot be more than 5 years in the past"
                        )
                    }
                )

        # Validate summary length if provided
        if self.summary and len(self.summary) > 300:
            raise ValidationError(
                {"summary": _("Summary cannot exceed 300 characters")}
            )

    def save(self, *args, **kwargs):
        """Override save for custom logic"""
        # Auto-generate slug if it doesn't exist
        if not self.slug:
            base_slug = slugify(self.title)[:200]  # Leave space for suffixes
            slug = base_slug

            # If slug exists, add unique suffix
            if News.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"

            self.slug = slug

        # Run validations
        self.full_clean()

        # Set publication date if marked as published
        if self.is_published and not self.publication_date:
            from django.utils import timezone

            self.publication_date = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        """String representation"""
        status = "📰" if self.is_published else "📝"
        featured = "⭐" if self.featured else ""
        return f"{status}{featured} {self.title}"

    def get_absolute_url(self):
        """Returns the URL for this news item"""
        return reverse("news:detail", kwargs={"slug": self.slug})

    @property
    def is_publicly_visible(self):
        """Checks if the news is published and active"""
        from django.utils import timezone

        return (
            self.is_published
            and self.is_active
            and self.publication_date
            and self.publication_date <= timezone.now()
        )

    @property
    def can_be_published(self):
        """Checks if the news can be published"""
        return bool(self.title and self.body and self.is_active)

    def get_tag_list(self):
        """Returns list of clean tags"""
        if not self.tags:
            return []
        return [tag.strip() for tag in self.tags.split(",") if tag.strip()]

    @classmethod
    def search_by_tag(cls, tag):
        """Search news by tag"""
        return cls.published.filter(tags__icontains=tag)

    @classmethod
    def search_by_category(cls, category):
        """Search published news by category"""
        return cls.published.filter(category=category)

    @classmethod
    def get_featured(cls, limit=5):
        """Get featured published news"""
        return cls.published.featured()[:limit]

    def get_related_news(self, limit=5):
        """Get related news based on category and tags"""
        related = News.published.filter(category=self.category).exclude(pk=self.pk)

        # If has tags, prioritize news with similar tags
        if self.tags:
            tag_list = self.get_tag_list()
            for tag in tag_list:
                related = related.filter(tags__icontains=tag)

        return related[:limit]
