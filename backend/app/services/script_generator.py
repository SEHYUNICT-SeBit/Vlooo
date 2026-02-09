"""
OpenAI API를 사용한 AI 스크립트 생성 서비스
IT 전문가 페르소나로 자연스러운 나레이션 생성
"""

import os
from typing import List, Dict, Any, Optional
from openai import OpenAI

# IT 전문가 페르소나 프롬프트
IT_EXPERT_SYSTEM_PROMPT = """당신은 경험 많은 IT 기술과 비즈니스 전략 전문가입니다.
- 기술적으로 정확하면서도 비기술자도 이해할 수 있게 설명해주세요
- 실무 예시와 현실적인 조언을 포함하세요
- 전문적이면서도 친근한 톤으로 말씀해주세요
- 각 슬라이드는 대략 30-60초 분량의 음성 스크립트가 되도록 작성해주세요
- 한국어로 자연스럽고 대화체로 작성해주세요"""

SCENARIO_TEMPLATES = {
    "professional": "이것은 전문적인 비즈니스 프레젠테이션입니다. 확신 있고 전문적인 톤을 유지해주세요.",
    "friendly": "이것은 친근한 교육 프레젠테이션입니다. 따뜻하고 이해하기 쉬운 톤을 사용해주세요.",
    "casual": "이것은 캐주얼한 프레젠테이션입니다. 편하고 자연스러운 톤으로 진행해주세요.",
}


class OpenAIScriptGenerator:
    """OpenAI를 사용한 스크립트 생성"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
    
    def generate_script(
        self,
        slides: List[Dict[str, Any]],
        tone: str = "professional",
        language: str = "ko",
    ) -> List[Dict[str, str]]:
        """
        슬라이드별 스크립트 생성
        
        Args:
            slides: 슬라이드 정보 리스트
            tone: 톤 설정 (professional, friendly, casual)
            language: 언어 (ko, en)
        
        Returns:
            슬라이드별 생성된 스크립트
        """
        scripts = []
        
        for slide in slides:
            script = self._generate_slide_script(
                slide_number=slide.get("slideNumber", 1),
                title=slide.get("title", ""),
                content=slide.get("content", ""),
                tone=tone,
                language=language,
            )
            
            scripts.append({
                "slideId": slide.get("slideId"),
                "slideNumber": slide.get("slideNumber"),
                "scriptText": script,
                "duration": self._estimate_duration(script),
                "keywords": self._extract_keywords(script),
            })
        
        return scripts
    
    def _generate_slide_script(
        self,
        slide_number: int,
        title: str,
        content: str,
        tone: str,
        language: str,
    ) -> str:
        """특정 슬라이드의 스크립트 생성"""
        
        scenario = SCENARIO_TEMPLATES.get(tone, SCENARIO_TEMPLATES["professional"])
        
        prompt = f"""다음 슬라이드 정보를 바탕으로 나레이션 스크립트를 작성해주세요.

슬라이드 번호: {slide_number}
슬라이드 제목: {title}
슬라이드 내용: {content}

요구사항:
{scenario}
- 약 30-60초 분량의 음성 스크립트를 작성해주세요
- {language.upper()} 언어로 작성해주세요
- 시작과 끝을 자연스럽게 이어지도록 해주세요
- 일인칭이나 이인칭 호칭 없이 객관적으로 설명해주세요

스크립트만 작성해주세요. 다른 설명은 하지 마세요."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": IT_EXPERT_SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.7,
                max_tokens=500,
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            print(f"OpenAI API 오류: {e}")
            # 폴백: 기본 스크립트 생성
            return f"{title}. {content}"
    
    def _estimate_duration(self, script: str) -> int:
        """
        스크립트의 예상 음성 시간 계산
        평균 음성 속도: 150 단어/분 ≈ 2.5 단어/초
        한국어: 약 120-150 자/분 ≈ 2-2.5 자/초
        """
        # 한국어 기준: 1글자 ≈ 0.5초
        char_count = len(script.replace(" ", "").replace("\n", ""))
        duration = max(int(char_count * 0.5), 5)  # 최소 5초
        return min(duration, 120)  # 최대 120초
    
    def _extract_keywords(self, script: str) -> List[str]:
        """
        스크립트에서 주요 키워드 추출 (간단한 구현)
        실제 환경에서는 NLP 라이브러리 사용 권장
        """
        # 명사 같은 단어들 추출 (임시 구현)
        words = script.split()
        keywords = [w for w in words if len(w) > 2][:5]
        return keywords


def generate_scripts(
    slides: List[Dict[str, Any]],
    tone: str = "professional",
    language: str = "ko",
) -> List[Dict[str, Any]]:
    """
    슬라이드별 스크립트 생성
    """
    generator = OpenAIScriptGenerator()
    return generator.generate_script(slides, tone, language)
