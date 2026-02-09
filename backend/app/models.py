"""
API 모델 정의 (Pydantic)
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class SlideModel(BaseModel):
    """슬라이드 모델"""
    slideId: str
    slideNumber: int
    title: Optional[str] = None
    content: str
    imageUrls: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class MetadataModel(BaseModel):
    """메타데이터 모델"""
    pptTitle: Optional[str] = None
    pptAuthor: Optional[str] = None
    createdAt: Optional[str] = None


class ParsePptResponse(BaseModel):
    """PPT 파싱 응답"""
    projectId: str
    totalSlides: int
    slides: List[SlideModel]
    extractedText: str
    metadata: MetadataModel


class HealthCheckResponse(BaseModel):
    """헬스 체크 응답"""
    status: str
    message: str
