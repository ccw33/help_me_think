from typing import Optional, Dict, Any
import os
from openai import OpenAI
from langgraph.graph import Graph

class LLMService:
    def __init__(self):
        self.client = self._init_client()
        self.model = os.getenv("LLM_MODEL", "deepseek-chat")
        
    def _init_client(self):
        """Initialize OpenAI-compatible client"""
        base_url = os.getenv("LLM_API_BASE", "https://api.deepseek.com/v1")
        api_key = os.getenv("LLM_API_KEY", "")
        return OpenAI(base_url=base_url, api_key=api_key)
    
    async def generate_response(
        self, 
        messages: list[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """Generate LLM response with OpenAI-compatible API"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"LLM调用失败: {str(e)}")
    
    def get_available_models(self) -> list[str]:
        """Get available LLM models"""
        return ["deepseek-chat", "gpt-4", "gpt-3.5-turbo", "claude-3"]