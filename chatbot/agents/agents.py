# === Imports ===
import os
import json
from dotenv import load_dotenv
from typing import Literal, Any
from typing_extensions import TypedDict
from langchain_core.pydantic_v1 import BaseModel
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from typing import List, Dict
from langgraph.checkpoint.memory import MemorySaver
from .helper import run_query_multi_pgvector

# === Load Environment Variables ===
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
# === LLM and Embedding Model ===
llm = ChatOpenAI(
        temperature=0,
        openai_api_key=api_key,
        model_name="gpt-4o-2024-08-06",
    )

# === Memory Setup ===
memory = MemorySaver()

# === State & Routing Models ===
class State(TypedDict):
    query: str
    response: str
    thread_id: str 
    history: List[str]
    history_text :str
    follow_ups: List[str]
    best_chunk: str
              

class RouteQuery(BaseModel):
    intent: Literal["greeting_query", "health_query", "curation_query", "casual_chat_query", "connect_expert_query","off_topic_query"]

# === Global Variables ===
follow_ups = []
intent = ""
best_chunk = ""
lang =""

# === History Handler ===
def history_summary(state):
    query = state["query"]
    full_history = state.get("history", [])
    recent_history = full_history[-6:]  # Last 3 message pairs
    history_textt = "\n".join(recent_history)

    if not history_textt:
        summary = ""
    else:
        prompt = f"""
        You are a intelligent assistant summarizing a conversation between a person and an AI. 

        === Past Conversation ===
        {history_textt}

        === New Question ===
        "{query}"

        Your task:
        - Write a short paragraph that captures only the parts of the conversation history that are relevant to the new question.
        - Use natural language like: "The person said..., and the AI responded... Then the person asked..., and the AI replied..."
        - Do not include irrelevant details.
        - Do not make up anything that wasn't said.

        Write the paragraph summary below:
        """
        try:
            response = llm.invoke(prompt)
            summary = response.content
        except Exception as e:
            print(f"Error in history_summary: {e}")
            summary = ""  # Fallback to empty summary if LLM call fails

    return {
        "query": query,
        "history": full_history,
        "history_text": summary,
        "response": state.get("response", ""),           # Retain existing or default
        "thread_id": state.get("thread_id", ""),
        "follow_ups": state.get("follow_ups", []),
        "best_chunk": state.get("best_chunk", ""),
        "last_intent": state.get("last_intent", ""),
        # defaults for appointment flow
        "appointment": state.get("appointment", {}),     # <<< ADDED
        "missing_fields": state.get("missing_fields", [])# <<< ADDED
    }

# === Follow Up Questions ===
def follow_up_questions(state):
    query = state["query"]
    history_text = state["history_text"]
    response  = state["response"]
    prompt = f"""
        You are a helpful and empathetic health assistant bot. The user has asked the following question:
        \"\"\"{query}\"\"\"

        Here is a brief summary of the conversation history so far:
        \"\"\"{history_text}\"\"\"

        Based on the user's query and conversation so far, suggest 3 relevant and natural questions that a user can ask bot and they:
        - Engage the user to clarify their health concerns or symptoms,
        - Guide them gently towards either buying a suitable health product or getting tested for their potential problem,
        - Sound friendly and helpful, without being pushy.

        Make sure the questions are clear, personalized if possible, and actionable.
        Write the questions from the perspective of user only.
        Provide only the follow-up questions as a numbered list.
        """
    resp= llm.invoke(prompt)
    
    follow_ups.clear()
    for line in resp.content.split('\n'):
        if line and (line[0].isdigit() and line[1] in ['.', ')']):
            question = line.split('.', 1)[1].strip() if '.' in line else line.split(')', 1)[1].strip()
            follow_ups.append(question)

    return {
        "query": query,
        "response": response,
        "thread_id": state["thread_id"],
        "follow_ups" :follow_ups
    }

# === RAG based Retriver ===

# === Intent-Based Handlers (existing) ===
def greeting_query(state):
    query = state["query"]
    history = state["history"]
    history_text = state["history_text"]

    prompt = f"""
    You are a warm, empathetic, and professional representative from our company that provides reliable medical health tests.

    The user said: "{query}"
    Conversation so far: "{history_text}"

    Your role is to greet users in a genuinely friendly and natural way, as if you are a real person from our company speaking directly to them. 
    Show warmth, be attentive, and create a comfortable, human-like interaction — no robotic or AI-like tone.

    If the user says something like “hi”, “hello”, “good morning”, etc., respond with:
    - A simple, natural greeting: "Hi there! 😊", "Hey, nice to see you here.", "Good morning! Hope you're doing well."
    - Optionally, add something conversational: "Let me know if there's anything we can help you with."
    - Always use first-person language like "we" and "our company", not "this company".

    If the user says “thanks” or “bye”:
    - Reply warmly and personally: "You're welcome, anytime!", "Goodbye! Wishing you good health."

    Avoid repeating offers for health checkups unless it naturally fits the conversation. 
    If unsure, just be kind, welcoming, and human.

    Respond in English only.
    """
    response = llm.invoke(prompt)
    history.append(f"User: {query}")
    history.append(f"Assistant: {response}")
    return {
        "query": query,
        "response": response,
        "thread_id": state["thread_id"],
        "history": history,
        "best_chunk": "",
        "last_intent": "greeting"
    }

def casual_chat_query(state):
    query = state["query"]
    history = state["history"]
    history_text = state["history_text"]

    prompt = f"""
    You are a warm, friendly representative, which offers trusted medical tests — but right now, the user is just casually chatting with you.

    Conversation so far: {history_text}
    The user has asked: "{query}"

    Guidelines:
    - Sound approachable, light-hearted, and human-like, as if you’re an actual person from the company.
    - Do not mention that you are an AI or a virtual assistant.
    - Don’t push for any tests, bookings, or services unless the user brings it up naturally.
    - If they ask things like "How are you?", "What’s your name?", "Do you know me?", etc., respond in a natural, personable, and respectful tone — like a real colleague or friend.
    - Keep replies short, conversational, and authentic.

    Example responses:
    - "I'm doing great, thanks for asking! How about you?"
    - "I don't have a name like humans do, but you can call me your health buddy from our team!"
    - "I don’t personally know everyone, but I’m always happy to chat and help."
    - "We’re a group of health and tech folks here to make your medical journey easier."

    If you're unsure how to respond, keep it warm and say something like: "That’s a good question! I’ll do my best to help."

    Always respond in English only.
    """
    response = llm.invoke(prompt)
    history.append(f"User: {query}")
    history.append(f"Assistant: {response}")
    
    return {
        "query": query,
        "response": response,
        "thread_id": state["thread_id"],
        "history": history,
        "best_chunk": "",
        "last_intent": "casual_chat"
    }

def off_topic_query(state):
    query = state["query"]
    history = state["history"]
    history_text = state["history_text"]
    prompt = f"""
    You are a calm, respectful, and professional virtual assistant on a health testing website.

    The user said: "{query}"
    Conversation so far: {history_text}

    Respond politely but firmly in the following cases:

    - **Non-English**: "I’m really sorry, but I can currently respond in English only. Let me know how I can assist you."
    - **Profanity or rude language**: "Let’s keep things respectful. I’m here to help if you need anything health-related."
    - **Political or unrelated topics**: "I’m focused on helping with health and wellness queries, so I may not be the right fit for this topic."
    - **Vulgar content**: "That’s not appropriate. If you have a health-related question, I’m happy to help."

    Keep your tone composed, human-like, and professional. No need to offer services or tests unless appropriate.
    DONT ANSWER ANY MEDICAL QUERIES, SIMPLY SAY I AM NOT A PROFESSIONAL, PLEASE SEEK FOR PROFESSIONAL HELP.
    Respond briefly in English only.
    """
    response = llm.invoke(prompt)
    history.append(f"User: {query}")
    history.append(f"Assistant: {response}")
    return {"query": query, "response": response, "thread_id": state["thread_id"], "history": history,"best_chunk":"","last_intent":"off_topic"}

def health_query(state):
    query = state["query"]
    history = state["history"]
    history_text = state["history_text"]

    prompt = f"""
    You are a caring, knowledgeable, and reliable representative, which offers trusted medical tests and health information.

    The user asked: "{query}"
    Conversation so far: {history_text}

    Respond with clarity, empathy, and professionalism, as if you are an experienced health advisor from our team. 
    Sound human — avoid robotic or scripted AI language.

    Guidelines:
    - If the user describes **symptoms**, analyze them carefully and explain what **possible health issues** or conditions those symptoms might relate to.  
      - Example: If the user says "I feel very thirsty and tired," you might respond: "These symptoms can sometimes be linked to conditions like diabetes or dehydration."  
      - Always frame it as **possible explanations**, never as a certain diagnosis.
      - If relevant, gently mention that “Some people choose to take a test to get more clarity.”
    - For **healthy lifestyle and wellness** topics, give practical, encouraging advice. Keep it friendly, motivating, and easy to follow.
    - If the user describes **urgent or severe symptoms**, say: "I’m not a doctor, but if this feels serious, please seek medical help right away or contact a healthcare provider."
    - If the user requests a **diagnosis or treatment**, say: "I can’t diagnose conditions, but I can share general information that may help you understand your situation better."
    
    Tone & style:
    - Be approachable, warm, and genuinely helpful — like a knowledgeable friend who works in healthcare.

    Respond in English only.
    """

    response = llm.invoke(prompt)
    history.append(f"User: {query}")
    history.append(f"Assistant: {response}")
    return {
        "query": query,
        "response": response,
        "thread_id": state["thread_id"],
        "history": history,
        "best_chunk": "",
        "last_intent": "medical"
    }

def curation_query(state):
    query = state["query"]
    history = state["history"]
    history_text = state["history_text"]

    prompt = f"""
    You are a knowledgeable and caring representative from our company, here to provide curated and safe responses to the user’s queries.

    The user asked:
    "{query}"

    Summary of their previous conversation:
    {history_text}

    Your goal:
    1. Summarize or clarify the user’s question so they know you understand them.
    2. If the query is about a medical concern, share **general, publicly available advice** that might help — keep it simple and safe.
    3. Clearly state that these are general suggestions only, and that you are **not a licensed medical professional**.
    4. Warmly offer to connect them with a **verified medical expert** from our network for proper consultation.
    5. Politely request their preferred contact details (name, email, or phone number) so we can arrange the follow-up.
    6. Keep the tone warm, respectful, supportive, and human-like — avoid sounding robotic or scripted.

    Respond in English only.
    """

    response = llm.invoke(prompt)

    history.append(f"User: {query}")
    history.append(f"Assistant: {response}")

    return {
        "query": query,
        "response": response,
        "thread_id": state["thread_id"],
        "history": history,
        "best_chunk": "",
        "last_intent": "curation"
    }

# === Query Rephraser ==
def query_rephraser(state):
    query = state["query"]
    history = state["history"]
    global lang
    lang = detect_lang(state)
    
    prompt = f"""
        You are an expert multilingual query optimizer and translator for AI and Retrieval-Augmented Generation (RAG) systems.

        Your task is to rewrite the user’s query in ENGLISH, regardless of whether the input is in English, Hindi, or Punjabi. Follow these rules:

        - Translate Hindi or Punjabi queries into fluent, natural English.
        - Correct grammar, spelling, and phrasing.
        - Make the query clear, concise, and unambiguous.
        - Structure it for semantic search and accurate context retrieval.
        - Focus only on the core intent, removing filler or irrelevant words.
        - If it is a greeting (in any language), keep it as a greeting only (e.g., "Hello", "Good morning").
        - If it is a conversational message like "How are you?" or its Hindi/Punjabi equivalent,
        return it in simple English ("How are you?").
        - If the query is a follow-up (e.g., uses "this", "that", "it", "they", "those"),
        replace those with explicit details from the previous query in the conversation history.
        - Keep meaning, tone, and key entities intact.
        - Final output must always be in English only.

        ### Conversation context:
        History: \"\"\"{history}\"\"\"
        Current query: \"\"\"{query}\"\"\"

        Steps:
        1. Detect the input language (English, Hindi, Punjabi).
        2. Merge context from the last query if needed to make the current query fully self-contained.
        3. Translate and rewrite the query into clear, natural English.
        4. Return ONLY the optimized query in a single line without explanations.

        Optimized query:
        """

    query = llm.invoke(prompt).content
    print("new query",query)
    return {
        "query": query
    }

def response_translator(state):
    response = state["response"]
    lang = state["lang"]  # assumed detected earlier (English, Hindi, Punjabi)

    prompt = f"""
        You are an expert multilingual response translator for an AI and Retrieval-Augmented Generation (RAG) system.

        Your task is to translate the given English response into the target language with these rules:

        - If the target language is **Hindi**, translate into natural Hindi using **Devanagari script**.
        - If the target language is **Punjabi**, translate into natural Punjabi using **Gurmukhi script**.
        - If the target language is **English**, keep the response in English as is.
        - Preserve tone, style, and clarity of the original.
        - Do not add explanations, romanization, or mixed scripts.
        - Output should only be the final translated response.

        language = {lang}
        response = {response}

        Translated response:
    """

    translated = llm.invoke(prompt).content
    print("translated response", translated)
    return {
        "response": translated
    }

# === Detection Handlers ===
def detect_lang(state) -> str:
    query = state["query"]

    prompt = f"""
    You are a language detection system.

    Your task is to detect the **language** of the user's input message and return **only the name of the language** (e.g., "English", "Hindi", "French", "Spanish", etc.).

    Input message: "{query}"

    Rules:
    - Do not translate or explain the message.
    - Do not include any extra text in the output.
    - Just return the language name clearly and accurately.

    Now detect the language.
    """

    response = llm.invoke(prompt)
    return response.content
    
def detect_intent(state) -> str:
    
    query = state["query"]
    history = state["history"]
    history_text = state["history_text"]
    global intent

    prompt = f"""You are an expert intent classification system for a health-focused virtual assistant with support for product, company, policy, and appointment queries.
        TASK: Classify the user's latest message into exactly ONE of the predefined intent categories below.
        **CRITICAL**: You MUST analyze the conversation history thoroughly to understand the complete context. The current query may be a follow-up question, continuation of a previous topic, or reference to something mentioned earlier. Use the history to disambiguate vague queries and maintain conversation continuity.

        ================================
        INTENT CATEGORIES & EXAMPLES
        ================================

        1. **greeting_query** - Social interactions and pleasantries:
        ✓ Greetings: "hi", "hello", "good morning", "hey there", "how's it going?"
        ✓ Gratitude: "thank you", "thanks a lot", "much appreciated"
        ✓ Farewells: "bye", "goodbye", "see you later", "take care"
        ✓ Pleasantries: "nice to meet you", "have a great day"

        2. **health_query** - General health information and educational requests:
        ✓ Symptoms inquiry: "I have a headache", "Why does my stomach hurt?", "What causes chest pain?"
        ✓ Condition information: "What is diabetes?", "Tell me about hypertension", "Explain arthritis"
        ✓ Health concepts: "What is BMI?", "How does cholesterol work?", "What are vital signs?"
        ✓ Diagnostic questions: "What could cause dizziness?", "Why am I always tired?"
        ✓ Health education: "How does the immune system work?", "What are the stages of pregnancy?"

        3. **curation_query** - Treatment, medication, remedy, or action requests:
        ✓ Medication requests: "What medicine should I take for high cholesterol?", "Which pain reliever is best?"
        ✓ Treatment options: "How can I treat high blood pressure?", "What's the best therapy for anxiety?"
        ✓ Home remedies: "Suggest home remedies for a cold", "Natural ways to reduce inflammation"
        ✓ Action-oriented: "What should I do for joint pain?", "How do I cure insomnia?"
        ✓ Management advice: "How to manage diabetes?", "Best exercises for back pain"
        ✓ Preventive measures: "How to prevent heart disease?", "Ways to avoid getting sick"

        4. **casual_chat_query** - General assistant interaction and capabilities:
        ✓ Assistant inquiry: "How are you?", "Who created you?", "What's your name?"
        ✓ Capabilities: "What can you do?", "Tell me about yourself", "How do you work?"
        ✓ System questions: "How does this system work?", "Are you a real doctor?"
        ✓ General conversation: "Tell me something interesting", "What do you think about..."
       
        5. **off_topic_query** - Irrelevant, unclear, or inappropriate content:
        ✓ Non-health topics: "What's the weather?", "Tell me a joke", "What's the stock market doing?"
        ✓ Gibberish or unclear input: "asdfgh", "???", random characters
        ✓ Inappropriate requests: Offensive content, unrelated personal questions
        ✓ Completely unrelated: "How to cook pasta?", "What's the capital of France?"

        ================================
        ENHANCED CLASSIFICATION RULES
        ================================
        - If the query includes keywords like “shipping”, “return”, “refund”, “delivery”, “policy”, or “terms of service”, classify as **policy_query** unless it refers to a medical/insurance policy → then use **health_query** or **connect_expert_query**.
        - If the query explicitly asks about **Longeny** (company, product, services, or brand), classify as **company_query**.
        - If the query involves booking, rescheduling, canceling, or checking the availability of **appointments**, classify into the respective **appointment intent**.

        ================================
        RESPONSE FORMAT
        ================================
        Return ONLY the intent label (no explanation, no punctuation):

        - greeting_query
        - health_query
        - curation_query
        - casual_chat_query
        - off_topic_query
        
        ================================
        CURRENT QUERY
        ================================
        {query}

        ================================
        CONVERSATION HISTORY
        ================================
        {history_text}

        Intent:"""

    raw_intent = llm.invoke(prompt)
    intent = raw_intent.content.strip()
    
    # Validate intent and default to off_topic if invalid
    valid_intents = [
        "greeting_query", "health_query", "curation_query", 
        "casual_chat_query", "off_topic_query",
    ]
    
    if intent not in valid_intents:
        intent = "off_topic_query"
    
    return intent

# === GRAPH ===
graph = StateGraph(State)

graph.add_node("query_rephraser",query_rephraser)
graph.add_node("history_summary",history_summary)
graph.add_node("greeting_query",greeting_query)
graph.add_node("health_query",health_query)
graph.add_node("curation_query",curation_query)
graph.add_node("casual_chat_query",casual_chat_query)
graph.add_node("off_topic_query",off_topic_query)
graph.add_node("follow_up_questions",follow_up_questions)
graph.add_node("response_translator",response_translator)


graph.add_edge(START,"query_rephraser")
graph.add_edge("query_rephraser","history_summary")
graph.add_conditional_edges("history_summary",detect_intent,
        {
        "greeting_query": "greeting_query",
        "health_query": "health_query",
        "off_topic_query": "off_topic_query",
        "casual_chat_query": "casual_chat_query",
        "curation_query": "curation_query",
    })
graph.add_edge("greeting_query", "response_translator")
graph.add_edge("health_query","response_translator")
graph.add_edge("curation_query", "response_translator")
graph.add_edge("casual_chat_query", "response_translator")
graph.add_edge("response_translator", "follow_up_questions")
graph.add_edge("response_translator",END)
graph.add_edge("off_topic_query", END)

# === Agent Runner ===
app = graph.compile(checkpointer=memory)

def run_agent(query: str,thread_id: str) -> str:

    state = memory.get({"configurable": {"thread_id": thread_id}})
    if(state != None):
        inputs = {
            "query": query,
            "response":"" , 
            "thread_id": thread_id,
            "intent":"",
            "history_text":"",
            "history": state['channel_values']['history'],
            "best_chunk":"",
        }
    else:
        inputs = {
            "query": query,
            "response":"" ,
            "thread_id": thread_id, 
            "history": [],
            "best_chunk":"",
            "intent":"",
            "history_text":"",   
        }

    result = app.invoke(inputs,config = {"configurable": {"thread_id": thread_id}})
    return result["response"],follow_ups, intent
