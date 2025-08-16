import asyncio
import json
import logging
import os
from typing import Dict, Any, List, Optional
import google.generativeai as genai

logger = logging.getLogger(__name__)

class AgentService:
    """Service for interacting with the MCP agent to generate kanban cards"""
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GOOGLE_API_KEY")
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None
            logger.warning("No Gemini API key found, will use fallback generation")
    
    async def generate_cards_from_prompt(self, prompt: str) -> List[Dict[str, Any]]:
        """
        Generate kanban cards from a user prompt using Gemini AI or fallback logic
        
        Args:
            prompt: User's project description
            
        Returns:
            List of card dictionaries ready for creation
        """
        if self.model and self.gemini_api_key:
            try:
                return await self._generate_cards_with_gemini(prompt)
            except Exception as e:
                logger.error(f"Gemini generation failed: {e}")
                # Fall back to basic generation
                return self._generate_fallback_cards(prompt)
        else:
            return self._generate_fallback_cards(prompt)
    
    async def _generate_cards_with_gemini(self, prompt: str) -> List[Dict[str, Any]]:
        """Generate cards using Gemini AI"""
        gemini_prompt = f"""You are a kanban board task generator. Given a user's project description, generate a list of kanban cards (tasks) in JSON format.

Each card should have:
- title: A clear, concise task title
- description: A detailed description of what needs to be done
- status: One of "research", "in-progress", "done", "blocked", or "planned"
- order: Sequential number starting from 1
- tags: Array of relevant tags (3-5 tags per card)

Generate 5-8 relevant tasks based on the user's input. Return ONLY a valid JSON array of cards, no additional text.

User input: {prompt}

Return JSON array:"""
        
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                gemini_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=2048,
                    response_mime_type="application/json"
                )
            )
            
            if response.text:
                cards_data = json.loads(response.text)
                return self._format_cards(cards_data)
            else:
                logger.warning("Empty response from Gemini")
                return self._generate_fallback_cards(prompt)
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response: {e}")
            return self._generate_fallback_cards(prompt)
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._generate_fallback_cards(prompt)
    
    def _generate_fallback_cards(self, prompt: str) -> List[Dict[str, Any]]:
        """Generate cards using fallback logic based on keywords"""
        keywords = prompt.lower()
        cards = []
        
        if any(word in keywords for word in ['web', 'app', 'website', 'application', 'mobile', 'frontend', 'backend']):
            cards.extend([
                {
                    "title": "Set up project repository",
                    "description": "Initialize version control system with Git, set up project structure with appropriate folders (src, docs, tests), create README.md with project overview, and configure .gitignore for the chosen technology stack.",
                    "status": "planned",
                    "order": len(cards) + 1,
                    "tags": ["setup", "git", "foundation"]
                },
                {
                    "title": "Design system architecture",
                    "description": "Create comprehensive system design including database schema, API endpoints, user flow diagrams, technology stack selection, and security considerations. Document architectural decisions and create wireframes for key user interfaces.",
                    "status": "research",
                    "order": len(cards) + 2,
                    "tags": ["architecture", "planning", "design"]
                },
                {
                    "title": "Develop user interface",
                    "description": "Build responsive frontend components using modern frameworks, implement user authentication flows, create interactive dashboards, and ensure cross-browser compatibility. Include accessibility features and mobile-responsive design.",
                    "status": "planned",
                    "order": len(cards) + 3,
                    "tags": ["frontend", "ui", "development"]
                },
                {
                    "title": "Build backend services",
                    "description": "Develop RESTful API endpoints, implement database models and migrations, set up authentication and authorization systems, create data validation layers, and implement error handling and logging mechanisms.",
                    "status": "planned",
                    "order": len(cards) + 4,
                    "tags": ["backend", "api", "development"]
                },
                {
                    "title": "Testing and deployment",
                    "description": "Write comprehensive unit and integration tests, set up continuous integration pipeline, configure production environment, implement monitoring and alerting systems, and create deployment documentation.",
                    "status": "planned",
                    "order": len(cards) + 5,
                    "tags": ["testing", "deployment", "devops"]
                }
            ])
        
        if any(word in keywords for word in ['marketing', 'campaign', 'promotion', 'social', 'brand']):
            cards.extend([
                {
                    "title": "Research target audience",
                    "description": "Conduct comprehensive market research to identify primary and secondary target demographics, create detailed user personas with pain points and motivations, analyze competitor strategies, and define unique value propositions.",
                    "status": "research",
                    "order": len(cards) + 1,
                    "tags": ["research", "audience", "strategy"]
                },
                {
                    "title": "Develop content strategy",
                    "description": "Create a comprehensive content calendar spanning 3 months, design brand guidelines and visual identity, plan social media campaigns across multiple platforms, and establish key performance indicators for success measurement.",
                    "status": "planned",
                    "order": len(cards) + 2,
                    "tags": ["content", "planning", "branding"]
                },
                {
                    "title": "Launch marketing campaigns",
                    "description": "Execute multi-channel marketing campaigns including social media advertising, email marketing sequences, content marketing initiatives, and partnership collaborations. Monitor performance metrics and optimize campaigns based on data.",
                    "status": "planned",
                    "order": len(cards) + 3,
                    "tags": ["execution", "campaigns", "optimization"]
                }
            ])
        
        # Add specific context-based tasks if we don't have enough
        generic_tasks = [
            {
                "title": "Project planning and requirements",
                "description": f"Define detailed project scope, gather stakeholder requirements, create timeline and milestones for: {prompt}. Establish success criteria and risk assessment.",
                "status": "research",
                "order": len(cards) + 1,
                "tags": ["planning", "requirements", "strategy"]
            },
            {
                "title": "Research and analysis",
                "description": f"Conduct thorough research on best practices, industry standards, and innovative solutions relevant to: {prompt}. Analyze market trends and competitive landscape.",
                "status": "research", 
                "order": len(cards) + 2,
                "tags": ["research", "analysis", "discovery"]
            },
            {
                "title": "Design and prototyping",
                "description": f"Create initial designs, wireframes, and prototypes for key components of: {prompt}. Focus on user experience and technical feasibility.",
                "status": "planned",
                "order": len(cards) + 3,
                "tags": ["design", "prototyping", "ux"]
            },
            {
                "title": "Implementation and development",
                "description": f"Execute the main development work for: {prompt}. Build core functionality, integrate necessary services, and ensure code quality standards.",
                "status": "planned",
                "order": len(cards) + 4,
                "tags": ["development", "implementation", "coding"]
            },
            {
                "title": "Testing and refinement",
                "description": f"Thoroughly test all aspects of: {prompt}. Perform quality assurance, gather feedback, iterate on improvements, and prepare for deployment.",
                "status": "planned",
                "order": len(cards) + 5,
                "tags": ["testing", "qa", "optimization"]
            }
        ]
        
        # Add only the cards we need to reach 5 total
        needed_cards = max(0, 5 - len(cards))
        cards.extend(generic_tasks[:needed_cards])
        
        return cards
    
    def _format_cards(self, cards_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format cards data to ensure required fields"""
        formatted_cards = []
        
        for i, card in enumerate(cards_data, 1):
            formatted_card = {
                "title": card.get("title", f"Task {i}"),
                "description": card.get("description", ""),
                "status": card.get("status", "planned"),
                "order": card.get("order", i),
                "tags": card.get("tags", [])
            }
            
            # Validate status
            valid_statuses = ["research", "in-progress", "done", "blocked", "planned"]
            if formatted_card["status"] not in valid_statuses:
                formatted_card["status"] = "planned"
            
            # Ensure tags is a list
            if not isinstance(formatted_card["tags"], list):
                formatted_card["tags"] = []
            
            formatted_cards.append(formatted_card)
        
        return formatted_cards