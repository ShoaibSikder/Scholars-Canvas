import { CreditCard, FileText, Loader2, MessageSquare, ChevronRight, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { fetchAILab } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackAILab = {
  documentTitle: "Neural_Networks.pdf",
  documentCourse: "Machine Learning - Chapter 5",
  summary: [
    { section: "Introduction", content: "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers." },
    { section: "Key Concepts", content: "Forward propagation, backpropagation, activation functions (ReLU, Sigmoid, Tanh), and gradient descent are fundamental to neural network training." },
    { section: "Applications", content: "Image recognition, natural language processing, speech recognition, autonomous vehicles, and game playing (AlphaGo)." },
  ],
  chat: [
    { role: "user", message: "What is backpropagation?" },
    { role: "assistant", message: "Backpropagation is an algorithm used to train neural networks. It calculates the gradient of the loss function with respect to each weight by the chain rule, computing the gradient one layer at a time, iterating backward from the output layer." },
    { role: "user", message: "Can you explain it with an example?" },
    { role: "assistant", message: "Sure! Imagine a simple network predicting house prices. If the prediction is too high, backpropagation adjusts the weights to reduce the error. It starts from the output layer and works backward, updating each weight based on how much it contributed to the error." },
  ],
  flashcards: [
    { id: 1, question: "What is a neural network?", answer: "A computing system inspired by biological neural networks, consisting of interconnected nodes organized in layers." },
    { id: 2, question: "What is backpropagation?", answer: "An algorithm used to train neural networks by calculating gradients and updating weights to minimize error." },
    { id: 3, question: "Name three activation functions", answer: "ReLU (Rectified Linear Unit), Sigmoid, and Tanh (Hyperbolic Tangent)." },
  ],
};

const primaryBtn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 font-bold text-white shadow-lg shadow-blue-500/25";

export default function AILabPage() {
  const { data } = useApiData(fetchAILab, fallbackAILab);
  const [activeTab, setActiveTab] = useState("summary");
  const [chatInput, setChatInput] = useState("");
  const [isLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);

  const tabs = useMemo(() => [
    { id: "summary", label: "Summary", icon: Sparkles },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "flashcards", label: "Flashcards", icon: CreditCard },
  ], []);

  const toggleCard = (id) => setFlippedCards((current) => (current.includes(id) ? current.filter((cardId) => cardId !== id) : [...current, id]));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"><FileText size={20} /></div>
            <div><h2 className="font-black text-slate-950 dark:text-white">{data.documentTitle}</h2><p className="text-sm font-bold text-slate-500 dark:text-slate-400">{data.documentCourse}</p></div>
          </div>
          <div className="flex gap-2"><button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 dark:border-slate-700 dark:text-slate-300">Zoom In</button><button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 dark:border-slate-700 dark:text-slate-300">Zoom Out</button></div>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-auto bg-slate-100 p-6 dark:bg-slate-950/60">
          <div className="mx-auto min-h-[720px] max-w-3xl rounded-xl bg-white p-10 shadow-2xl shadow-slate-900/10 dark:bg-slate-100 dark:text-slate-950">
            <h1 className="text-3xl font-black">Chapter 5: Neural Networks</h1>
            <div className="mt-8 grid gap-5 leading-7 text-slate-700">
              <h2 className="text-xl font-black text-slate-950">5.1 Introduction</h2>
              <p>Neural networks are computing systems vaguely inspired by the biological neural networks that constitute animal brains. Such systems learn to perform tasks by considering examples, generally without being programmed with task-specific rules.</p>
              <p>An artificial neural network is based on a collection of connected units or nodes called artificial neurons, which loosely model the neurons in a biological brain. Each connection can transmit a signal to other neurons.</p>
              <h2 className="text-xl font-black text-slate-950">5.2 Network Architecture</h2>
              <p>A typical neural network consists of three types of layers: input layer, hidden layers, and output layer. The input layer receives the initial data, hidden layers perform intermediate computations, and the output layer produces the final result.</p>
              <div className="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-4"><p className="font-black text-blue-900">Key Concept:</p><p>Deep learning refers to neural networks with multiple hidden layers, allowing the network to learn hierarchical representations of data.</p></div>
              <h2 className="text-xl font-black text-slate-950">5.3 Training Process</h2>
              <p>Training a neural network involves two main processes: forward propagation and backpropagation. During forward propagation, input data flows through the network to produce an output. Backpropagation then adjusts the weights based on the error between predicted and actual outputs.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="grid grid-cols-3 border-b border-slate-200 p-2 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black transition ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}><Icon size={16} /><span>{tab.label}</span></button>;
          })}
        </div>

        <div className="p-5">
          {activeTab === "summary" ? (
            <div className="grid gap-4">
              <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300"><Sparkles size={16} /><span>AI-generated summary</span></div>
              {data.summary.map((item) => <article key={item.section} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50"><h3 className="font-black text-slate-950 dark:text-white">{item.section}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.content}</p></article>)}
              <button type="button" className={primaryBtn}><Sparkles size={18} /><span>Regenerate Summary</span></button>
            </div>
          ) : null}

          {activeTab === "chat" ? (
            <div className="grid gap-4">
              <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
                {data.chat.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}><p>{msg.message}</p></div>
                  </div>
                ))}
                {isLoading ? <div className="flex justify-start"><div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 dark:bg-slate-800"><Loader2 size={14} className="animate-spin" /><span>AI is thinking...</span></div></div> : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} rows={2} placeholder="Ask about this document..." className="w-full resize-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500" />
                <div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-500">Tip: Highlight text in the PDF for context-aware questions</p><button type="button" className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white"><Send size={16} /></button></div>
              </div>
            </div>
          ) : null}

          {activeTab === "flashcards" ? (
            <div className="grid gap-4">
              <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600 dark:text-slate-300"><CreditCard size={16} /><span>Auto-generated flashcards</span></div>
              {data.flashcards.map((card) => {
                const isFlipped = flippedCards.includes(card.id);
                return (
                  <div key={card.id} className="h-40 cursor-pointer [perspective:1000px]" onClick={() => toggleCard(card.id)}>
                    <div className={`relative h-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
                      <div className="absolute inset-0 grid place-items-center rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center [backface-visibility:hidden] dark:border-blue-500/30 dark:bg-blue-500/15"><div><p className="font-black text-blue-950 dark:text-blue-100">{card.question}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-300">Click to reveal <ChevronRight size={14} /></span></div></div>
                      <div className="absolute inset-0 grid place-items-center rounded-2xl border border-violet-200 bg-violet-50 p-5 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-violet-500/30 dark:bg-violet-500/15"><p className="font-bold leading-6 text-violet-950 dark:text-violet-100">{card.answer}</p></div>
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
