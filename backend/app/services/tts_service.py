"""
ElevenLabs API를 사용한 TTS (Text-to-Speech) 서비스
"""

import os
import requests
from typing import List, Dict, Any, Optional
import io


class ElevenLabsTTSService:
    """ElevenLabs TTS 음성 생성 서비스"""
    
    # 한국어 지원 음성 목록
    VOICE_OPTIONS = {
        "male_professional_kr": {
            "voice_id": "professional-male-korean",
            "name": "Professional Male (한국어)",
            "gender": "male",
            "accent": "korean",
        },
        "female_professional_kr": {
            "voice_id": "professional-female-korean",
            "name": "Professional Female (한국어)",
            "gender": "female",
            "accent": "korean",
        },
        "male_friendly_kr": {
            "voice_id": "friendly-male-korean",
            "name": "Friendly Male (한국어)",
            "gender": "male",
            "accent": "korean",
        },
        "female_friendly_kr": {
            "voice_id": "friendly-female-korean",
            "name": "Friendly Female (한국어)",
            "gender": "female",
            "accent": "korean",
        },
    }
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        self.base_url = "https://api.elevenlabs.io/v1"
        
        if not self.api_key:
            raise ValueError("ElevenLabs API 키가 설정되지 않았습니다")
    
    def synthesize_speech(
        self,
        text: str,
        voice_id: str = "professional-male-korean",
        speed: float = 1.0,
    ) -> Optional[bytes]:
        """
        텍스트를 음성으로 변환
        
        Args:
            text: 변환할 텍스트
            voice_id: 음성 ID
            speed: 음성 속도 (0.5 ~ 2.0)
        
        Returns:
            생성된 음성 바이너리 데이터 또는 None
        """
        
        if not text or not text.strip():
            return None
        
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            }
        }
        
        try:
            # 음성 생성 요청
            response = requests.post(
                f"{self.base_url}/text-to-speech/{voice_id}",
                headers=headers,
                json=payload,
                timeout=60,
            )
            
            if response.status_code != 200:
                print(f"ElevenLabs API 오류: {response.status_code} - {response.text}")
                return None
            
            return response.content
        
        except Exception as e:
            print(f"TTS 생성 실패: {e}")
            return None
    
    def estimate_duration(self, text: str) -> float:
        """
        예상 음성 길이 추정 (초 단위)
        한국어: 약 120-150자/분 ≈ 2-2.5자/초
        """
        char_count = len(text.replace(" ", "").replace("\n", ""))
        # 1글자 ≈ 0.5초
        duration = max(char_count * 0.5, 1.0)
        return duration
    
    @staticmethod
    def get_voice_options() -> Dict[str, Dict[str, str]]:
        """사용 가능한 음성 옵션 반환"""
        return ElevenLabsTTSService.VOICE_OPTIONS


def synthesize(
    scripts: List[Dict[str, Any]],
    voice_id: str = "professional-male-korean",
    speed: float = 1.0,
) -> List[Dict[str, Any]]:
    """
    여러 스크립트를 음성으로 변환
    """
    service = ElevenLabsTTSService()
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
