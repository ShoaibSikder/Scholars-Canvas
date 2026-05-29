import { FolderOpen, FileText, Link as LinkIcon, MessageSquare, Plus, Presentation, Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { fetchResources } from "../../services/appService";
import { useApiData } from "../../hooks/useApiData";

const fallbackVault = {
  courses: [
    {
      semester: 3,
      courses: [
        {
          id: 1,
          name: "Data Structures & Algorithms",
          code: "CS301",
          files: [
            { id: 1, name: "Binary_Trees.pdf", type: "pdf", size: "2.4 MB", uploaded: "2 days ago" },
            { id: 2, name: "Sorting_Algorithms.pdf", type: "pdf", size: "1.8 MB", uploaded: "5 days ago" },
            { id: 3, name: "Lecture_Notes.pptx", type: "pptx", size: "5.2 MB", uploaded: "1 week ago" },
          ],
        },
        {
          id: 2,
          name: "Database Management Systems",
          code: "CS302",
          files: [
            { id: 4, name: "SQL_Basics.pdf", type: "pdf", size: "3.1 MB", uploaded: "3 days ago" },
            { id: 5, name: "ER_Diagrams.pdf", type: "pdf", size: "1.5 MB", uploaded: "1 week ago" },
          ],
        },
      ],
    },
    {
      semester: 4,
      courses: [
        {
          id: 3,
          name: "Machine Learning",
          code: "CS401",
          files: [
            { id: 6, name: "Neural_Networks.pdf", type: "pdf", size: "4.7 MB", uploaded: "1 day ago" },
            { id: 7, name: "Regression_Analysis.pdf", type: "pdf", size: "2.2 MB", uploaded: "4 days ago" },
            { id: 8, name: "ML_Resources.link", type: "link", size: "-", uploaded: "1 week ago" },
          ],
        },
      ],
    },
  ],
};

function getFileIcon(type) {
  switch (type) {
    case "pdf":
      return <FileText className="is-red" />;
    case "pptx":
      return <Presentation className="is-orange" />;
    case "link":
      return <LinkIcon className="is-blue" />;
    default:
      return <FileText className="is-muted" />;
  }
}

export default function VaultPage() {
  const { data } = useApiData(fetchResources, fallbackVault);
  const [hoveredFile, setHoveredFile] = useState(null);

  return (
    <div className="sa-page">
      <div className="sa-page__topRow">
        <div>
          <h1 className="sa-page__title">Resource Vault</h1>
          <p className="sa-page__subtitle">Organize your academic materials by semester and course</p>
        </div>

        <button type="button" className="sa-primaryBtn sa-primaryBtn--small">
          <Plus size={18} />
          <span>Add Course</span>
        </button>
      </div>

      <div className="sa-vault">
        {data.courses.map((semesterData) => (
          <section key={semesterData.semester} className="sa-vault__section">
            <div className="sa-vault__semesterHeader">Semester {semesterData.semester}</div>

            {semesterData.courses.map((course) => (
              <motion.article key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sa-vault__course">
                <div className="sa-vault__courseHeader">
                  <div className="sa-vault__courseMeta">
                    <div className="sa-vault__courseIcon">
                      <FolderOpen size={22} />
                    </div>
                    <div>
                      <h3>{course.name}</h3>
                      <p>{course.code}</p>
                    </div>
                  </div>

                  <button type="button" className="sa-primaryBtn sa-primaryBtn--tiny">
                    <Plus size={14} />
                    <span>Add File</span>
                  </button>
                </div>

                <div className="sa-vault__files">
                  {course.files.map((file) => (
                    <div
                      key={file.id}
                      className="sa-vault__fileRow"
                      onMouseEnter={() => setHoveredFile(file.id)}
                      onMouseLeave={() => setHoveredFile(null)}
                    >
                      <div className="sa-vault__fileInfo">
                        <div className="sa-vault__fileIcon">{getFileIcon(file.type)}</div>
                        <div>
                          <p>{file.name}</p>
                          <div>
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{file.uploaded}</span>
                          </div>
                        </div>
                      </div>

                      {hoveredFile === file.id ? (
                        <div className="sa-vault__actions">
                          <button type="button" className="sa-vault__action is-blue">
                            <Sparkles size={14} />
                            <span>Summarize</span>
                          </button>
                          <button type="button" className="sa-vault__action is-purple">
                            <MessageSquare size={14} />
                            <span>Quiz</span>
                          </button>
                          <button type="button" className="sa-vault__action is-green">
                            <Share2 size={14} />
                            <span>Share</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
