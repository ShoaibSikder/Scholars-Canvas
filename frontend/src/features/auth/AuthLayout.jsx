import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Brain, Target, Sparkles, Clock, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__grid">
        <div className="auth-shell__left">
          <div className="auth-shell__glow auth-shell__glow--pink" />
          <div className="auth-shell__glow auth-shell__glow--purple" />
          <div className="auth-shell__glow auth-shell__glow--blue" />

          <div className="auth-shell__content">
            <div className="auth-shell__header">
              <div className="auth-shell__logo">
                <GraduationCap className="auth-shell__logoIcon" />
              </div>
              <h1>StudentAssistant</h1>
              <p>Your Academic Command Center</p>
            </div>

            <div className="auth-shell__illustration">
              <div className="auth-shell__phone">
                <div className="auth-shell__screen">
                  <div className="auth-shell__screenHead">
                    <div className="auth-shell__brain">
                      <Brain className="auth-shell__brainIcon" />
                    </div>
                    <div className="auth-shell__screenLines">
                      <span />
                      <span />
                    </div>
                  </div>

                  <div className="auth-shell__tile auth-shell__tile--blue">
                    <BookOpen className="auth-shell__tileIcon" />
                  </div>
                  <div className="auth-shell__tile auth-shell__tile--pink">
                    <Target className="auth-shell__tileIcon" />
                  </div>
                  <div className="auth-shell__tile auth-shell__tile--indigo">
                    <TrendingUp className="auth-shell__tileIcon" />
                  </div>
                </div>
              </div>

              <motion.div
                className="auth-shell__float auth-shell__float--book"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              >
                <BookOpen className="auth-shell__floatIcon" />
              </motion.div>
              <motion.div
                className="auth-shell__float auth-shell__float--brain"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              >
                <Brain className="auth-shell__floatIcon" />
              </motion.div>
              <motion.div
                className="auth-shell__float auth-shell__float--spark"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Sparkles className="auth-shell__floatIcon" />
              </motion.div>
              <motion.div
                className="auth-shell__float auth-shell__float--clock"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Clock className="auth-shell__floatIcon" />
              </motion.div>

              <motion.div
                className="auth-shell__student"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                <div className="auth-shell__studentHead" />
                <div className="auth-shell__studentBody" />
              </motion.div>
            </div>

          </div>
        </div>

        <div className="auth-shell__right">{children}</div>
      </div>
    </div>
  );
}

