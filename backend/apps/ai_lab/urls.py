from django.urls import path

from .views import AIStudyChatView, AIStudyDocumentCollectionView, AIStudyDocumentDetailView, AIStudyDocumentPreviewView, AIStudyMultipleChoiceQuizView, AIStudyQuizView, AIStudySummaryView, AIStudyVaultImportView

urlpatterns = [
    path("", AIStudyDocumentCollectionView.as_view(), name="ai-lab-documents"),
    path("from-vault/", AIStudyVaultImportView.as_view(), name="ai-lab-from-vault"),
    path("documents/<int:pk>/", AIStudyDocumentDetailView.as_view(), name="ai-lab-document-detail"),
    path("documents/<int:pk>/preview/", AIStudyDocumentPreviewView.as_view(), name="ai-lab-document-preview"),
    path("documents/<int:pk>/summarize/", AIStudySummaryView.as_view(), name="ai-lab-document-summary"),
    path("documents/<int:pk>/quiz/", AIStudyQuizView.as_view(), name="ai-lab-document-quiz"),
    path("documents/<int:pk>/mcq/", AIStudyMultipleChoiceQuizView.as_view(), name="ai-lab-document-mcq"),
    path("documents/<int:pk>/chat/", AIStudyChatView.as_view(), name="ai-lab-document-chat"),
]
