import { CreditCard, FileText, Loader2, MessageSquare, ChevronRight, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { fetchAILab } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackAILab = {
  documentTitle: "Neural_Networks.pdf",
  documentCourse: "Machine Learning - Chapter 5",
  summary: [
    {
      section: "Introduction",
      content:
        "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers.",
    },
    {
      section: "Key Concepts",
      content:
        "Forward propagation, backpropagation, activation functions (ReLU, Sigmoid, Tanh), and gradient descent are fundamental to neural network training.",
    },
    {
      section: "Applications",
      content:
        "Image recognition, natural language processing, speech recognition, autonomous vehicles, and game playing (AlphaGo).",
    },
  ],
  chat: [
    { role: "user", message: "What is backpropagation?" },
    {
      role: "assistant",
      message:
        "Backpropagation is an algorithm used to train neural networks. It calculates the gradient of the loss function with respect to each weight by the chain rule, computing the gradient one layer at a time, iterating backward from the output layer.",
    },
    { role: "user", message: "Can you explain it with an example?" },
    {
      role: "assistant",
      message:
        "Sure! Imagine a simple network predicting house prices. If the prediction is too high, backpropagation adjusts the weights to reduce the error. It starts from the output layer and works backward, updating each weight based on how much it contributed to the error.",
    },
  ],
  flashcards: [
    {
      id: 1,
      question: "What is a neural network?",
      answer:
        "A computing system inspired by biological neural networks, consisting of interconnected nodes organized in layers.",
    },
    {
      id: 2,
      question: "What is backpropagation?",
      answer:
        "An algorithm used to train neural networks by calculating gradients and updating weights to minimize error.",
    },
    {
      id: 3,
      question: "Name three activation functions",
      answer: "ReLU (Rectified Linear Unit), Sigmoid, and Tanh (Hyperbolic Tangent).",
    },
  ],
};

export default function AILabPage() {
  const { data } = useApiData(fetchAILab, fallbackAILab);
  const [activeTab, setActiveTab] = useState("summary");
  const [chatInput, setChatInput] = useState("");
  const [isLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);

  const tabs = useMemo(
    () => [
      { id: "summary", label: "Summary", icon: Sparkles },
      { id: "chat", label: "Chat", icon: MessageSquare },
      { id: "flashcards", label: "Flashcards", icon: CreditCard },
    ],
    []
  );

  const toggleCard = (id) => {
    setFlippedCards((current) => (current.includes(id) ? current.filter((cardId) => cardId !== id) : [...current, id]));
  };

  return (
    <div className="sa-ailab">
      <section className="sa-ailab__viewer">
        <div className="sa-ailab__viewerHeader">
          <div className="sa-ailab__docMeta">
            <div className="sa-ailab__docIcon">
              <FileText size={20} />
            </div>
            <div>
              <h2>{data.documentTitle}</h2>
              <p>{data.documentCourse}</p>
            </div>
          </div>

          <div className="sa-ailab__viewerActions">
            <button type="button">Zoom In</button>
            <button type="button">Zoom Out</button>
          </div>
        </div>

        <div className="sa-ailab__pdf">
          <div className="sa-ailab__paper">
            <h1>Chapter 5: Neural Networks</h1>

            <div className="sa-ailab__paperText">
              <h2>5.1 Introduction</h2>
              <p>
                Neural networks are computing systems vaguely inspired by the biological neural networks that constitute animal brains. Such systems
                learn to perform tasks by considering examples, generally without being programmed with task-specific rules.
              </p>

              <p>
                An artificial neural network is based on a collection of connected units or nodes called artificial neurons, which loosely model the
                neurons in a biological brain. Each connection can transmit a signal to other neurons.
              </p>

              <h2>5.2 Network Architecture</h2>
              <p>
                A typical neural network consists of three types of layers: input layer, hidden layers, and output layer. The input layer receives the
                initial data, hidden layers perform intermediate computations, and the output layer produces the final result.
              </p>

              <div className="sa-ailab__callout">
                <p className="is-title">Key Concept:</p>
                <p>
                  Deep learning refers to neural networks with multiple hidden layers, allowing the network to learn hierarchical representations of
                  data.
                </p>
              </div>

              <h2>5.3 Training Process</h2>
              <p>
                Training a neural network involves two main processes: forward propagation and backpropagation. During forward propagation, input data
                flows through the network to produce an output. Backpropagation then adjusts the weights based on the error between predicted and
                actual outputs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sa-ailab__assistant">
        <div className="sa-ailab__tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sa-ailab__tab ${activeTab === tab.id ? "is-active" : ""}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sa-ailab__tabBody">
          {activeTab === "summary" ? (
            <div className="sa-ailab__summary">
              <div className="sa-ailab__smallHeader">
                <Sparkles size={16} />
                <span>AI-generated summary</span>
              </div>

              {data.summary.map((item) => (
                <article key={item.section} className="sa-ailab__summaryCard">
                  <h3>{item.section}</h3>
                  <p>{item.content}</p>
                </article>
              ))}

              <button type="button" className="sa-primaryBtn">
                <Sparkles size={18} />
                <span>Regenerate Summary</span>
              </button>
            </div>
          ) : null}

          {activeTab === "chat" ? (
            <div className="sa-ailab__chat">
              <div className="sa-ailab__messages">
                {data.chat.map((msg, index) => (
                  <div key={index} className={`sa-ailab__bubbleWrap ${msg.role === "user" ? "is-user" : "is-assistant"}`}>
                    <div className={`sa-ailab__bubble ${msg.role === "user" ? "is-user" : "is-assistant"}`}>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="sa-ailab__bubbleWrap is-assistant">
                    <div className="sa-ailab__loading">
                      <Loader2 size={14} className="is-spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="sa-ailab__composer">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  rows={2}
                  placeholder="Ask about this document... (use @page-12 to reference specific pages)"
                />
                <button type="button" className="sa-primaryBtn sa-primaryBtn--tiny">
                  <Send size={16} />
                </button>
                <p>Tip: Highlight text in the PDF for context-aware questions</p>
              </div>
            </div>
          ) : null}

          {activeTab === "flashcards" ? (
            <div className="sa-ailab__flashcards">
              <div className="sa-ailab__smallHeader">
                <CreditCard size={16} />
                <span>Auto-generated flashcards</span>
              </div>

              {data.flashcards.map((card) => {
                const isFlipped = flippedCards.includes(card.id);

                return (
                  <div key={card.id} className="sa-ailab__flipScene" onClick={() => toggleCard(card.id)}>
                    <div className={`sa-ailab__flipCard ${isFlipped ? "is-flipped" : ""}`}>
                      <div className="sa-ailab__flipFace sa-ailab__flipFace--front">
                        <p>{card.question}</p>
                        <span>
                          Click to reveal
                          <ChevronRight size={14} />
                        </span>
                      </div>
                      <div className="sa-ailab__flipFace sa-ailab__flipFace--back">
                        <p>{card.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
