from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class AILabView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "documentTitle": "Neural_Networks.pdf",
                "documentCourse": "Machine Learning - Chapter 5",
                "summary": [
                    {
                        "section": "Introduction",
                        "content": "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers.",
                    },
                    {
                        "section": "Key Concepts",
                        "content": "Forward propagation, backpropagation, activation functions (ReLU, Sigmoid, Tanh), and gradient descent are fundamental to neural network training.",
                    },
                    {
                        "section": "Applications",
                        "content": "Image recognition, natural language processing, speech recognition, autonomous vehicles, and game playing (AlphaGo).",
                    },
                ],
                "chat": [
                    {"role": "user", "message": "What is backpropagation?"},
                    {
                        "role": "assistant",
                        "message": "Backpropagation is an algorithm used to train neural networks. It calculates the gradient of the loss function with respect to each weight by the chain rule, computing the gradient one layer at a time, iterating backward from the output layer.",
                    },
                    {"role": "user", "message": "Can you explain it with an example?"},
                    {
                        "role": "assistant",
                        "message": "Sure! Imagine a simple network predicting house prices. If the prediction is too high, backpropagation adjusts the weights to reduce the error. It starts from the output layer and works backward, updating each weight based on how much it contributed to the error.",
                    },
                ],
                "flashcards": [
                    {
                        "id": 1,
                        "question": "What is a neural network?",
                        "answer": "A computing system inspired by biological neural networks, consisting of interconnected nodes organized in layers.",
                    },
                    {
                        "id": 2,
                        "question": "What is backpropagation?",
                        "answer": "An algorithm used to train neural networks by calculating gradients and updating weights to minimize error.",
                    },
                    {
                        "id": 3,
                        "question": "Name three activation functions",
                        "answer": "ReLU (Rectified Linear Unit), Sigmoid, and Tanh (Hyperbolic Tangent).",
                    },
                ],
            }
        )
