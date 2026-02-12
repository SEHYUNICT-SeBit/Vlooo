"""
Google Text-to-Speech (gTTS)를 사용한 TTS (Text-to-Speech) 서비스
"""

import os
from typing import List, Dict, Any, Optional
from gtts import gTTS
import io


class GoogleTTSService:
    """Google TTS 음성 생성 서비스 (무료)"""
    
    # 한국어 지원 음성 목록
    VOICE_OPTIONS = {
        "male_professional_kr": {
            "voice_id": "ko-male-professional",
            "name": "Professional Male (한국어)",
            "gender": "male",
            "accent": "korean",
            "lang": "ko",
        },
        "female_professional_kr": {
            "voice_id": "ko-female-professional",
            "name": "Professional Female (한국어)",
            "gender": "female",
            "accent": "korean",
            "lang": "ko",
        },
        "male_friendly_kr": {
            "voice_id": "ko-male-friendly",
            "name": "Friendly Male (한국어)",
            "gender": "male",
            "accent": "korean",
            "lang": "ko",
        },
        "female_friendly_kr": {
            "voice_id": "ko-female-friendly",
            "name": "Friendly Female (한국어)",
            "gender": "female",
            "accent": "korean",
            "lang": "ko",
        },
    }
    
    def __init__(self):
        # Google TTS는 API 키 불필요 (무료)
        pass
    
    @staticmethod
    def get_voice_options() -> Dict[str, Any]:
        """사용 가능한 음성 옵션 반환"""
        return GoogleTTSService.VOICE_OPTIONS
    
    def synthesize_speech(
        self,
        text: str,
        voice_id: str = "ko-male-professional",
        speed: float = 1.0,
    ) -> Optional[bytes]:
        """
        텍스트를 음성으로 변환
        
        Args:
            text: 변환할 텍스트
            voice_id: 음성 ID (gTTS는 무시, 언어만 사용)
            speed: 음성 속도 (0.5 ~ 2.0, gTTS는 지원 안 함)
        
        Returns:
            생성된 음성 바이너리 데이터 (MP3) 또는 None
        """
        
        if not text or not text.strip():
            return None
        
        try:
            # gTTS 객체 생성 (한국어 고정)
            tts = gTTS(text=text, lang='ko', slow=False)
            
            # 음성을 바이트 스트림으로 저장
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            
            return audio_buffer.getvalue()
        
        except Exception as e:
            print(f"Google TTS 생성 실패: {e}")
            return None
    
    def estimate_duration(self, text: str) -> float:
        """
        텍스트 기반 음성 길이 추정 (한국어 기준: 1초당 약 5-7글자)
        
        Args:
            text: 추정할 텍스트
        
        Returns:
            추정 시간 (초)
        """
        # 한국어는 약 1초당 7글자 기준
        char_count = len(text)
        estimated_seconds = max(1.0, char_count / 7.0)
        return round(estimated_seconds, 1)


def synthesize(
    scripts: List[Dict[str, Any]],
    voice_id: str = "ko-male-professional",
    speed: float = 1.0,
) -> List[Dict[str, Any]]:
    """
    여러 스크립트를 음성으로 변환
    """
    service = GoogleTTSService()
    results = []
    
    for script in scripts:
        audio_data = service.synthesize_speech(
            text=script.get("scriptText", ""),
            voice_id=voice_id,
            speed=speed,
        )
        
        duration = service.estimate_duration(script.get("scriptText", ""))
        
        results.append({
            "slideId": script.get("slideId"),
            "slideNumber": script.get("slideNumber"),
            "audioData": audio_data,
            "duration": duration,
        })
    
    return results
