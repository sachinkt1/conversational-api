from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Define a class to handle model operations
class ModelHandler:
    def __init__(self):
        self.model_name = None
        self.tokenizer = None
        self.model = None
        self.context = []

    def load_model(self, model_name):
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        print(f"Loaded model: {model_name}")

    def add_to_context(self, user_query, model_response):
        self.context.append(f"User: {user_query}")
        self.context.append(f"Model: {model_response}")

    def generate_response(self, prompt, max_length=100):
        # Combine context and prompt
        combined_prompt = "\n".join(self.context) + f"\nUser: {prompt}\nModel:"
        inputs = self.tokenizer(combined_prompt, return_tensors="pt", truncation=True, padding=True)
        
        outputs = self.model.generate(
            inputs.input_ids,
            max_length=max_length,
            pad_token_id=self.tokenizer.eos_token_id,
            attention_mask=inputs.attention_mask
        )
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response.split("Model:")[-1].strip()

def main():
    model_handler = ModelHandler()

    # User selects a model
    model_name = input("Select model (Llama2/mistral): ").strip()
    if model_name.lower() == 'llama2':
        model_name = "meta-llama/Llama-2-7b"  # Example model name
    elif model_name.lower() == 'mistral':
        model_name = "mistral/Mistral-7b"  # Example model name
    else:
        print("Invalid model selection.")
        return

    model_handler.load_model(model_name)

    print("Model loaded. You can start chatting now. Type 'exit' to end the conversation.")
    
    while True:
        user_query = input("You: ")
        if user_query.lower() == 'exit':
            break

        # Generate response
        model_response = model_handler.generate_response(user_query)
        print(f"Model: {model_response}")

        # Maintain context
        model_handler.add_to_context(user_query, model_response)

if __name__ == "__main__":
    main()
