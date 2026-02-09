"""
Cloudflare R2 스토리지 서비스
"""

import io
import os
from typing import Optional, Tuple
import boto3
from botocore.exceptions import ClientError


class R2StorageService:
    """Cloudflare R2 스토리지 관리"""
    
    def __init__(
        self,
        endpoint: str,
        access_key_id: str,
        secret_access_key: str,
        bucket_name: str,
    ):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name="auto",
        )
    
    def upload_file(
        self,
        file_content: bytes,
        file_key: str,
        content_type: str = "application/octet-stream",
    ) -> Optional[str]:
        """파일을 R2에 업로드"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content,
                ContentType=content_type,
            )
            
            # 공개된 URL 반환
            return f"https://{self.bucket_name}.cdn.r2.io/{file_key}"
        except ClientError as e:
            print(f"R2 업로드 실패: {e}")
            return None
    
    def upload_image(
        self,
        image_content: bytes,
        project_id: str,
        slide_number: int,
        image_index: int = 0,
    ) -> Optional[str]:
        """이미지 파일 업로드"""
        file_key = f"projects/{project_id}/slides/{slide_number}/image_{image_index}.png"
        return self.upload_file(image_content, file_key, "image/png")
    
    def upload_ppt_file(
        self,
        file_content: bytes,
        file_key: str,
    ) -> Optional[str]:
        """PPT 파일 업로드"""
        return self.upload_file(
            file_content,
            file_key,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )


# 싱글톤 인스턴스
_r2_service: Optional[R2StorageService] = None


def get_r2_service() -> R2StorageService:
    """R2 서비스 인스턴스 반환 (없으면 생성)"""
    global _r2_service
    
    if _r2_service is None:
        endpoint = os.getenv("CLOUDFLARE_R2_ENDPOINT")
        access_key = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
        secret_key = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
        bucket = os.getenv("CLOUDFLARE_R2_BUCKET_NAME", "vlooo-uploads")
        
        if not all([endpoint, access_key, secret_key]):
            raise ValueError("R2 인증 정보가 누락되었습니다")
        
        _r2_service = R2StorageService(endpoint, access_key, secret_key, bucket)
    
    return _r2_service
